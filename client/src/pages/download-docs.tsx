import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileDown, FileType } from "lucide-react";

export default function DownloadDocsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Documentação TarefoAI</CardTitle>
          <p className="text-muted-foreground mt-2">
            Faça o download da documentação nos formatos disponíveis
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Guia de Usuário Avançado */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-2">Guia de Usuário Avançado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Documentação detalhada sobre funcionalidades avançadas do TarefoAI
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/api/docs/guia_usuario_avancado/download"}
                className="flex-1"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Markdown
              </Button>
              <Button 
                onClick={() => window.location.href = "/api/docs/guia_usuario_avancado/pdf"}
                className="flex-1"
              >
                <FileType className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          {/* Configuração LLM Local */}
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-2">Configurar LLM Local</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Instruções para configurar e usar modelos de linguagem locais
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/api/docs/CONFIGURAR_LLM_LOCAL/download"}
                className="flex-1"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Markdown
              </Button>
              <Button 
                onClick={() => window.location.href = "/api/docs/CONFIGURAR_LLM_LOCAL/pdf"}
                className="flex-1"
              >
                <FileType className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-4">
            Se tiver problemas para baixar, acesse diretamente as URLs:
          </p>
          <div className="bg-muted p-2 rounded text-xs overflow-auto">
            <p className="mb-1">/api/docs/guia_usuario_avancado/download</p>
            <p className="mb-1">/api/docs/guia_usuario_avancado/pdf</p>
            <p className="mb-1">/api/docs/CONFIGURAR_LLM_LOCAL/download</p>
            <p>/api/docs/CONFIGURAR_LLM_LOCAL/pdf</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}