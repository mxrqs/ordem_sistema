import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Wrench, ShoppingCart, ClipboardList, LogIn, Eye, EyeOff } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [rememberMe, setRememberMe] = useState(false);

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
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 lg:px-16 py-12 bg-white">
        {/* Logo */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
              OC
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order Control</h1>
              <p className="text-xs text-muted-foreground">Solicitações e checklist</p>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Bem-vindo de volta</h2>
          <p className="text-muted-foreground">
            Acesse o sistema para gerenciar suas ordens de serviço e compra.
          </p>
        </div>

        {/* Login Card */}
        <div className="space-y-6">
          {/* Remember Me */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                rememberMe
                  ? "bg-primary border-primary"
                  : "border-gray-300 hover:border-primary"
              }`}
              onClick={() => setRememberMe(!rememberMe)}
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-foreground">Manter conectado</span>
          </label>

          {/* Login Button */}
          <a href={getLoginUrl()} className="block">
            <Button className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Entrar no Sistema
            </Button>
          </a>

          <p className="text-xs text-center text-muted-foreground">
            Ao entrar, você será redirecionado para autenticação segura.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-12">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Order Control. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-50 items-center justify-center p-16">
        <div className="max-w-lg">
          <h3 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            Gerencie suas Ordens de Forma Simples
          </h3>
          <p className="text-lg text-muted-foreground mb-12">
            Solicitações de compra e serviço, checklist integrado e acompanhamento em tempo real.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Ordens de Serviço</h4>
                <p className="text-sm text-muted-foreground">Solicite e acompanhe suas OS com facilidade</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Ordens de Compra</h4>
                <p className="text-sm text-muted-foreground">Gerencie suas solicitações de compra</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Checklist</h4>
                <p className="text-sm text-muted-foreground">Organize suas tarefas com checklist integrado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
