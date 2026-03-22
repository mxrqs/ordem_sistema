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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445611591/kYpwHKpJafrLckpe6FrLBC/marqs-icon-new-3XhsZT5cmqSUQVmb8pxSAQ.webp"
            alt="Marqs Systems"
            className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 animate-pulse"
          />
          <p className="text-muted-foreground text-sm sm:text-base">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-3 sm:px-4 md:px-8 py-8 sm:py-12">
      {/* Main Container */}
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445611591/kYpwHKpJafrLckpe6FrLBC/marqs-icon-new-3XhsZT5cmqSUQVmb8pxSAQ.webp"
              alt="Marqs Systems"
              className="w-10 sm:w-14 h-10 sm:h-14"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 px-2">
            <span className="text-blue-600">Marqs Systems</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            Controle de Serviços e Manutenção
          </p>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Bem-vindo de volta
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-md mx-auto px-2">
            Acesse o sistema para gerenciar suas ordens de serviço e compra.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 sm:py-3 bg-green-50 border border-green-200 rounded-lg max-w-xs mx-auto">
          <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-green-700">Manter conectado</span>
        </div>

        {/* Login Button */}
        <div className="mb-6 sm:mb-8">
          <a href="/login" className="block">
            <Button className="w-full bg-blue-600 text-white py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 rounded-xl">
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Entrar no Sistema
            </Button>
          </a>
        </div>

        {/* Info Text */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground px-2">
          Ao entrar, você será redirecionado para autenticação segura.
        </p>

        {/* Footer */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground px-2">
            © 2026 Marqs Systems. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
