import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import NotFound from "@/pages/not-found";
import CalendarPage from "@/pages/calendar";
import RemindersPage from "@/pages/reminders";
import ChatPage from "@/pages/chat";
import FinancesPage from "@/pages/finances";
import ProfilePage from "@/pages/profile";
import SubscriptionPage from "@/pages/subscription";
import PreferencesPage from "@/pages/preferences";
import OnboardingPage from "@/pages/onboarding";
import CalendarIntegrationPage from "@/pages/calendar-integration";
import MessageIntegrationPage from "@/pages/message-integration-updated";
import WhatsAppTesterPage from "@/pages/whatsapp-tester";
import SMSTesterPage from "@/pages/sms-tester";
import TelegramTesterPage from "@/pages/telegram-tester";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import AdminLoginPage from "@/pages/admin-login";
import AdminPage from "@/pages/admin";
import TaskFormPage from "@/pages/task-form";
import BotTesterPage from "@/pages/bot-tester";
import TarefoTestPage from "@/pages/tarefo-test";
import HelpPage from "@/pages/help";
import VoiceAssistantPage from "@/pages/voice-assistant";
import DownloadDocsPage from "@/pages/download-docs";
import GoogleCallbackPage from "@/pages/google-callback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route path="/bot-tester" component={BotTesterPage} />
      <Route path="/tarefo-test" component={TarefoTestPage} />
      <Route path="/whatsapp-tester" component={WhatsAppTesterPage} />
      <Route path="/sms-tester" component={SMSTesterPage} />
      <Route path="/telegram-tester" component={TelegramTesterPage} />
      <Route path="/ajuda" component={HelpPage} />
      <Route path="/documentos" component={HelpPage} />
      <Route path="/downloads" component={DownloadDocsPage} />
      <Route path="/google-callback" component={GoogleCallbackPage} />
      
      {/* Rotas protegidas que exigem autenticação */}
      <ProtectedRoute path="/dashboard" component={CalendarPage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <ProtectedRoute path="/calendar-integration" component={CalendarIntegrationPage} />
      <ProtectedRoute path="/message-integration" component={MessageIntegrationPage} />
      <ProtectedRoute path="/reminders" component={RemindersPage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <ProtectedRoute path="/finances" component={FinancesPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/preferences" component={PreferencesPage} />
      <ProtectedRoute path="/task-form" component={TaskFormPage} />
      <ProtectedRoute path="/voice-assistant" component={VoiceAssistantPage} />
      <AdminProtectedRoute path="/admin" component={AdminPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
