/**
 * Rotas de Documentação - TarefoAI
 * 
 * Este módulo fornece rotas para acessar e baixar
 * documentação em vários formatos (markdown, PDF)
 */

import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import markdownpdf from 'markdown-pdf';
import { promisify } from 'util';

export const docsRouter = Router();

// Converte o método markdown-pdf para Promises
const markdownToPdf = promisify(markdownpdf);

// Lista todos os documentos disponíveis
docsRouter.get('/', (req: Request, res: Response) => {
  try {
    const docsPath = path.join(process.cwd(), 'docs');
    const files = fs.readdirSync(docsPath)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        return {
          name: file,
          path: `/api/docs/${encodeURIComponent(file.replace('.md', ''))}`,
          downloadPath: `/api/docs/${encodeURIComponent(file.replace('.md', ''))}/download`,
          pdfPath: `/api/docs/${encodeURIComponent(file.replace('.md', ''))}/pdf`
        };
      });

    res.json(files);
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({ message: 'Erro ao listar documentos' });
  }
});

// Obter conteúdo de um documento específico (formato markdown)
docsRouter.get('/:docName', (req: Request, res: Response) => {
  try {
    const docName = req.params.docName;
    const filePath = path.join(process.cwd(), 'docs', `${docName}.md`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    console.error('Erro ao obter documento:', error);
    res.status(500).json({ message: 'Erro ao obter documento' });
  }
});

// Download do documento em formato markdown
docsRouter.get('/:docName/download', (req: Request, res: Response) => {
  try {
    const docName = req.params.docName;
    const filePath = path.join(process.cwd(), 'docs', `${docName}.md`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    res.setHeader('Content-disposition', `attachment; filename=${docName}.md`);
    res.setHeader('Content-type', 'text/markdown');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erro ao baixar documento:', error);
    res.status(500).json({ message: 'Erro ao baixar documento' });
  }
});

// Converte e baixa o documento em formato PDF
docsRouter.get('/:docName/pdf', async (req: Request, res: Response) => {
  try {
    const docName = req.params.docName;
    const filePath = path.join(process.cwd(), 'docs', `${docName}.md`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    const pdfOptions = {
      cssPath: path.join(process.cwd(), 'docs', 'pdf-style.css'),
      remarkable: {
        html: true,
        breaks: true,
        plugins: [],
        syntax: ['footnote', 'sup', 'sub']
      }
    };

    // Verifica se o arquivo CSS existe, caso contrário usa o padrão
    if (!fs.existsSync(pdfOptions.cssPath)) {
      delete pdfOptions.cssPath;
    }

    res.setHeader('Content-disposition', `attachment; filename=${docName}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    // Converte markdown para PDF e envia diretamente para o response
    const pdfStream = markdownpdf(pdfOptions);
    fs.createReadStream(filePath).pipe(pdfStream).pipe(res);
  } catch (error) {
    console.error('Erro ao converter para PDF:', error);
    res.status(500).json({ message: 'Erro ao converter para PDF' });
  }
});