import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/orders");
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="section-spacing border-b divider-line">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-8">
                <div className="accent-square"></div>
                <span className="text-caption font-semibold tracking-wide">SISTEMA DE ORDENS</span>
              </div>
              <h1 className="text-display mb-6">
                Gerenciamento de Ordens de Compra e Serviço
              </h1>
              <p className="text-body text-muted-foreground mb-8 max-w-lg">
                Plataforma integrada para solicitação, acompanhamento e gerenciamento de ordens de compra e serviço com controle administrativo completo.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setLocation("/login")}
                  className="bg-accent text-accent-foreground px-8 py-3 font-semibold border border-accent hover:opacity-90"
                >
                  Entrar
                </Button>
                <Button 
                  variant="outline"
                  className="px-8 py-3 font-semibold border border-foreground"
                >
                  Saiba Mais
                </Button>
              </div>
            </div>
            <div className="bg-muted p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="text-6xl font-bold text-accent mb-4">📋</div>
                <p className="text-muted-foreground">Interface limpa e intuitiva</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="section-spacing">
        <div className="container">
          <div className="mb-16">
            <div className="flex items-center mb-4">
              <div className="accent-square"></div>
              <span className="text-caption font-semibold tracking-wide">FUNCIONALIDADES</span>
            </div>
            <h2 className="text-headline">Recursos Principais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="border-t divider-line pt-8">
              <h3 className="text-title mb-4">Solicitações Simplificadas</h3>
              <p className="text-body text-muted-foreground">
                Crie ordens de compra e serviço com formulários intuitivos e acompanhe o status em tempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border-t divider-line pt-8">
              <h3 className="text-title mb-4">Painel Administrativo</h3>
              <p className="text-body text-muted-foreground">
                Dashboard completo com métricas, gráficos comparativos e controle total sobre todas as solicitações.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border-t divider-line pt-8">
              <h3 className="text-title mb-4">Documentação Segura</h3>
              <p className="text-body text-muted-foreground">
                Upload e armazenamento seguro de PDFs em S3 com notificações automáticas por email.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="section-spacing bg-muted border-t divider-line">
        <div className="container text-center">
          <h2 className="text-headline mb-6">Pronto para começar?</h2>
          <p className="text-body text-muted-foreground mb-8 max-w-2xl mx-auto">
            Acesse o sistema para gerenciar suas ordens de compra e serviço de forma eficiente e organizada.
          </p>
          <Button 
            onClick={() => setLocation("/login")}
            className="bg-accent text-accent-foreground px-8 py-3 font-semibold border border-accent hover:opacity-90"
          >
            Acessar Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
