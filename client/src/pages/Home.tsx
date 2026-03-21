import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      setLocation(user.role === "admin" ? "/admin/dashboard" : "/my-orders");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl mx-auto mb-4 animate-pulse">
            OC
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-12">
      {/* Main Container */}
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
              OC
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
            Controle de Serviços
          </h1>
          <p className="text-lg text-muted-foreground">
            Solicitações e checklist
          </p>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Bem-vindo de volta
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Acesse o sistema para gerenciar suas ordens de serviço e compra.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 mb-8 px-4 py-3 bg-green-50 border border-green-200 rounded-lg max-w-xs mx-auto">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">Manter conectado</span>
        </div>

        {/* Login Button */}
        <div className="mb-8">
          <a href={getLoginUrl()} className="block">
            <Button className="w-full bg-primary text-primary-foreground py-6 text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Entrar no Sistema
            </Button>
          </a>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-muted-foreground">
          Ao entrar, você será redirecionado para autenticação segura.
        </p>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Marqs Systems. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
