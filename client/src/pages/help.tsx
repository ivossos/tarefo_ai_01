import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, FileText, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Document = {
  name: string;
  path: string;
  downloadPath: string;
  pdfPath: string;
};

export default function HelpPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/docs");
        if (!response.ok) {
          throw new Error("Erro ao carregar documentos");
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os documentos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [toast]);

  const handleViewDocument = (path: string, name: string) => {
    window.open(path, "_blank");
  };

  const handleDownloadDocument = (downloadPath: string) => {
    window.location.href = downloadPath;
  };

  const handleDownloadPdf = (pdfPath: string) => {
    window.location.href = pdfPath;
  };

  const formatDocName = (name: string) => {
    return name
      .replace(".md", "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Central de Ajuda TarefoAI
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          Encontre documentação detalhada e guias para aproveitar ao máximo o assistente TarefoAI
        </p>

        <div className="grid gap-6 my-8">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o TarefoAI</CardTitle>
              <CardDescription>
                O TarefoAI é um assistente pessoal inteligente projetado para ajudar no gerenciamento de tarefas,
                calendário e comunicações, especialmente para pessoas com TDAH.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Desenvolvido com tecnologia de ponta em Inteligência Artificial, o TarefoAI utiliza um sistema
                multi-agente para entender suas necessidades e oferecer assistência personalizada.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Documentação Disponível</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : documents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((doc) => (
                <Card key={doc.name}>
                  <CardHeader>
                    <CardTitle>{formatDocName(doc.name)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Documentação detalhada sobre {formatDocName(doc.name)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewDocument(doc.path, doc.name)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDownloadDocument(doc.downloadPath)}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Baixar MD
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDownloadPdf(doc.pdfPath)}
                    >
                      <FileType className="mr-2 h-4 w-4" />
                      Baixar PDF
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum documento disponível no momento.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Precisa de Ajuda Adicional?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Se você não encontrou o que procura ou precisa de assistência adicional, entre em contato
                com nossa equipe de suporte:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Email: suporte@tarefoai.com</li>
                <li>Telefone: (11) 1234-5678</li>
                <li>Horário de atendimento: Seg-Sex, 9h às 18h</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}