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
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445611591/kYpwHKpJafrLckpe6FrLBC/marqs-icon_02f23b01.png"
            alt="Marqs Systems"
            className="w-16 h-16 mx-auto mb-4 animate-pulse"
          />
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
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445611591/kYpwHKpJafrLckpe6FrLBC/marqs-icon_02f23b01.png"
              alt="Marqs Systems"
              className="w-14 h-14"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            <span className="text-blue-600">Marqs Systems</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Controle de Serviços e Manutenção
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
          <a href="/login" className="block">
            <Button className="w-full bg-blue-600 text-white py-6 text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 rounded-xl">
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
