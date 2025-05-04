import { google, Auth, calendar_v3 } from 'googleapis';
import { Request, Response } from 'express';
import { storage } from './storage';

// Função para obter o URL de redirecionamento
function getRedirectUrl(): string {
  // Usamos o URL configurado no Google Cloud Console
  // Este URL deve estar registrado como URI de redirecionamento autorizado
  const callbackUrl = process.env.GOOGLE_REDIRECT_URL || '';
  console.log('Usando URL de redirecionamento oficial do Google Cloud Console:', callbackUrl);
  return callbackUrl;
}

// Configurações para OAuth do Google
let oauth2Client: Auth.OAuth2Client; 

// Função para obter o cliente OAuth
function getOAuth2Client(): Auth.OAuth2Client {
  // Sempre cria um novo cliente OAuth para garantir o URL correto
  const redirectUrl = getRedirectUrl();
  console.log('Inicializando OAuth2Client com redirect URL:', redirectUrl);
  
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl
  );
  
  // Atualiza o cliente global para outros usos
  oauth2Client = client;
  
  return client;
};

// Escopos para acesso ao Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
];

/**
 * Gera a URL de autorização do Google
 */
export function getAuthUrl(): string {
  const oauthClient = getOAuth2Client();
  console.log('Gerando URL de autenticação do Google com escopos:', SCOPES);
  
  const authUrl = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Força a exibição da tela de consentimento
    include_granted_scopes: true
  });
  
  console.log('URL de autenticação gerada:', authUrl);
  return authUrl;
}

/**
 * Lida com o callback do OAuth do Google e processa o código de autorização
 */
export async function handleGoogleCallback(req: Request, res: Response) {
  const code = req.query.code;
  const state = req.query.state;
  const error = req.query.error;
  
  console.log('Callback do Google recebido:');
  console.log('- Code presente:', !!code);
  console.log('- State:', state);
  console.log('- Error:', error);
  console.log('- Session:', req.session);
  console.log('- Cookies:', req.headers.cookie);
  
  // Cria uma função helper para gerar a página HTML de erro e redirecionamento
  const createErrorRedirectHtml = (reason: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro na autenticação</title>
        <script>
          // Detectar URL base da aplicação
          const baseUrl = window.location.origin;
          // Redirecionar para a página de integração com erro
          window.location.href = baseUrl + '/calendar-integration?error=true&provider=google&reason=${reason}';
        </script>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
            background-color: #f5f5f5;
          }
          .error-icon {
            color: #e74c3c;
            font-size: 50px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="error-icon">&#9888;</div>
        <h2>Erro na autenticação</h2>
        <p>Ocorreu um erro ao processar a autenticação. Redirecionando...</p>
        <p>Motivo: ${reason}</p>
      </body>
      </html>
    `;
  };

  // Se houver erro, redireciona para a página de integração com erro
  if (error) {
    console.error('Erro retornado pelo Google:', error);
    res.setHeader('Content-Type', 'text/html');
    return res.send(createErrorRedirectHtml(error as string));
  }
  
  const userId = req.session.userId;
  
  if (!code || !userId) {
    console.error('Código de autorização ou ID de usuário inválido. Code:', code, 'userId:', userId);
    
    if (!userId) {
      console.error('Sessão inválida ou expirada. Detalhes da sessão:', req.session);
      res.setHeader('Content-Type', 'text/html');
      return res.send(createErrorRedirectHtml('session_expired'));
    }
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(createErrorRedirectHtml('missing_params'));
  }

  try {
    console.log('Processando callback do Google com código de autorização');
    console.log('Code:', code);
    console.log('UserId:', userId);
    console.log('Session:', req.session);
    console.log('Headers:', req.headers);
    console.log('Host:', req.headers.host);
    
    // Obtém o cliente OAuth2 com o URL de redirecionamento correto
    const oauthClient = getOAuth2Client();
    console.log('OAuth2 client configurado. Tentando obter tokens...');
    
    // Variável para armazenar tokens
    let tokens: any;
    
    try {
      // Troca o código de autorização por tokens de acesso e refresh
      const tokenResponse = await oauthClient.getToken(code as string);
      tokens = tokenResponse.tokens;
      
      console.log('Tokens recebidos do Google:', { 
        access_token: tokens.access_token ? 'Presente' : 'Ausente',
        refresh_token: tokens.refresh_token ? 'Presente' : 'Ausente',
        expiry_date: tokens.expiry_date
      });
    } catch (tokenError) {
      console.error('Erro ao obter tokens do Google:', tokenError);
      console.error('Detalhes do erro de token:', JSON.stringify(tokenError, null, 2));
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(createErrorRedirectHtml('token_exchange_failed'));
    }
    
    // Verifica se obtivemos tokens
    if (!tokens) {
      console.error('Não foi possível obter tokens do Google');
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(createErrorRedirectHtml('no_tokens'));
    }
    
    // Atualiza o usuário com os tokens recebidos
    const user = await storage.getUserCalendarTokens(userId);
    
    if (!user) {
      console.error('Usuário não encontrado:', userId);
      res.setHeader('Content-Type', 'text/html');
      return res.send(createErrorRedirectHtml('user_not_found'));
    }
    
    // Armazena os tokens no banco de dados
    await storage.updateUserCalendarTokens(userId, {
      accessToken: tokens.access_token || null,
      refreshToken: tokens.refresh_token || null,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null
    });
    
    console.log('Tokens do Google Calendar armazenados com sucesso');
    
    // Cria uma página HTML com script de redirecionamento para o frontend
    const redirectHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecionando...</title>
        <script>
          // Detectar URL base da aplicação
          const baseUrl = window.location.origin;
          // Redirecionar para a página de integração com sucesso
          window.location.href = baseUrl + '/calendar-integration?success=true&provider=google';
        </script>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
            background-color: #f5f5f5;
          }
          .loader {
            border: 5px solid #f3f3f3;
            border-radius: 50%;
            border-top: 5px solid #3498db;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <h2>Autenticação concluída!</h2>
        <p>Redirecionando para o TarefoAI...</p>
      </body>
      </html>
    `;
    
    // Enviar HTML para garantir o redirecionamento correto
    res.setHeader('Content-Type', 'text/html');
    res.send(redirectHtml);
  } catch (error) {
    console.error('Erro ao processar callback do Google:', error);
    console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
    
    // Cria uma página HTML com script de redirecionamento para tratamento de erro
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro na autenticação</title>
        <script>
          // Detectar URL base da aplicação
          const baseUrl = window.location.origin;
          // Redirecionar para a página de integração com erro
          window.location.href = baseUrl + '/calendar-integration?error=true&provider=google';
        </script>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
            background-color: #f5f5f5;
          }
          .error-icon {
            color: #e74c3c;
            font-size: 50px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="error-icon">&#9888;</div>
        <h2>Erro na autenticação</h2>
        <p>Ocorreu um erro ao processar a autenticação. Redirecionando...</p>
      </body>
      </html>
    `;
    
    // Enviar HTML para garantir o redirecionamento correto
    res.setHeader('Content-Type', 'text/html');
    res.send(errorHtml);
  }
}

/**
 * Configura o cliente OAuth com os tokens do usuário
 */
async function setupAuthForUser(userId: number): Promise<Auth.OAuth2Client | null> {
  const tokens = await storage.getUserCalendarTokens(userId);
  
  if (!tokens || !tokens.accessToken) {
    return null;
  }
  
  // Usamos o mesmo método para garantir consistência no redirect URL
  const redirectUrl = getRedirectUrl();
  console.log('Usando redirectUrl para setupAuthForUser:', redirectUrl);
  
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl
  );
  
  auth.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate
  });
  
  return auth;
}

/**
 * Obtém os eventos do Google Calendar do usuário
 */
export async function getGoogleCalendarEvents(userId: number) {
  const auth = await setupAuthForUser(userId);
  
  if (!auth) {
    throw new Error('Usuário não autenticado no Google Calendar');
  }
  
  const calendar = google.calendar({ version: 'v3', auth });
  
  try {
    // Obtém os eventos da agenda primária do usuário
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Erro ao buscar eventos do Google Calendar:', error);
    throw error;
  }
}

/**
 * Cria um evento no Google Calendar
 */
export async function createGoogleCalendarEvent(userId: number, eventData: {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime?: Date;
}) {
  const auth = await setupAuthForUser(userId);
  
  if (!auth) {
    throw new Error('Usuário não autenticado no Google Calendar');
  }
  
  const calendar = google.calendar({ version: 'v3', auth });
  
  try {
    const event = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: (eventData.endTime || new Date(eventData.startTime.getTime() + 3600000)).toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error);
    throw error;
  }
}

/**
 * Atualiza um evento no Google Calendar
 */
export async function updateGoogleCalendarEvent(
  userId: number,
  googleEventId: string,
  eventData: {
    title?: string;
    description?: string;
    location?: string;
    startTime?: Date;
    endTime?: Date;
  }
) {
  const auth = await setupAuthForUser(userId);
  
  if (!auth) {
    throw new Error('Usuário não autenticado no Google Calendar');
  }
  
  const calendar = google.calendar({ version: 'v3', auth });
  
  try {
    // Primeiro busca o evento existente
    const currentEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId: googleEventId
    });
    
    // Prepara os dados para atualização
    const updatedEvent: any = {
      summary: eventData.title || currentEvent.data.summary,
      description: eventData.description ?? currentEvent.data.description,
      location: eventData.location ?? currentEvent.data.location,
    };
    
    if (eventData.startTime) {
      updatedEvent.start = {
        dateTime: eventData.startTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      };
    }
    
    if (eventData.endTime) {
      updatedEvent.end = {
        dateTime: eventData.endTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      };
    }
    
    // Atualiza o evento
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: googleEventId,
      requestBody: updatedEvent,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar evento no Google Calendar:', error);
    throw error;
  }
}

/**
 * Remove um evento do Google Calendar
 */
export async function deleteGoogleCalendarEvent(userId: number, googleEventId: string) {
  const auth = await setupAuthForUser(userId);
  
  if (!auth) {
    throw new Error('Usuário não autenticado no Google Calendar');
  }
  
  const calendar = google.calendar({ version: 'v3', auth });
  
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleEventId,
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir evento do Google Calendar:', error);
    throw error;
  }
}

/**
 * Verifica se o usuário tem integração com o Google Calendar
 */
export async function hasGoogleCalendarIntegration(userId: number): Promise<boolean> {
  const tokens = await storage.getUserCalendarTokens(userId);
  return !!(tokens && tokens.accessToken);
}

/**
 * Sincroniza eventos entre o Google Calendar e o Tarefo AI
 */
export async function syncGoogleCalendar(userId: number) {
  try {
    // 1. Busca eventos do Google Calendar
    const googleEvents = await getGoogleCalendarEvents(userId);
    
    // 2. Busca eventos do nosso sistema
    const ourEvents = await storage.getEventsByUserId(userId);
    
    // 3. Analisa quais eventos precisam ser sincronizados
    // (Esta é uma versão simplificada - uma implementação completa precisaria
    // rastrear alterações bidirecionais e resolver conflitos)
    
    // 4. Para cada evento do Google que não existe em nosso sistema, cria-o
    const existingGoogleEventIds = new Set(
      ourEvents
        .filter(e => e.googleEventId)
        .map(e => e.googleEventId)
    );
    
    for (const googleEvent of googleEvents) {
      if (!existingGoogleEventIds.has(googleEvent.id)) {
        // Cria o evento no nosso sistema
        const startDateTime = googleEvent.start?.dateTime 
          ? new Date(googleEvent.start.dateTime) 
          : new Date();
          
        const endDateTime = googleEvent.end?.dateTime
          ? new Date(googleEvent.end.dateTime)
          : new Date(startDateTime.getTime() + 3600000); // Adiciona 1 hora por padrão
        
        await storage.createEvent({
          userId,
          title: googleEvent.summary || 'Evento sem título',
          description: googleEvent.description || null,
          location: googleEvent.location || null,
          startTime: startDateTime,
          endTime: endDateTime,
          googleEventId: googleEvent.id,
          eventType: 'imported',
          status: 'active',
          isAllDay: false,
          reminderTime: null,
          notificationChannels: null
        });
      }
    }
    
    return { success: true, message: 'Calendário sincronizado com sucesso' };
  } catch (error) {
    console.error('Erro ao sincronizar Google Calendar:', error);
    return { success: false, message: 'Falha ao sincronizar calendário' };
  }
}

/**
 * Desconecta o Google Calendar
 */
export async function disconnectGoogleCalendar(userId: number): Promise<boolean> {
  try {
    await storage.updateUserCalendarTokens(userId, {
      accessToken: null,
      refreshToken: null,
      expiryDate: null
    });
    return true;
  } catch (error) {
    console.error('Erro ao desconectar Google Calendar:', error);
    return false;
  }
}