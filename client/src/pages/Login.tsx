import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Loader2 } from "lucide-react";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      setLocation(user.role === "admin" ? "/admin/dashboard" : "/my-orders");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-blue-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const handleMicrosoftLogin = () => {
    // Microsoft OAuth will be handled by backend
    window.location.href = "/api/oauth/microsoft";
  };

  const handleEmailLogin = () => {
    // Email login flow
    window.location.href = "/api/oauth/email";
  };

  const handlePhoneLogin = () => {
    // Phone login flow
    window.location.href = "/api/oauth/phone";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-12">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445611591/kYpwHKpJafrLckpe6FrLBC/marqs-icon-new-3XhsZT5cmqSUQVmb8pxSAQ.webp"
              alt="Marqs Systems"
              className="w-16 h-16"
            />
          </div>
          {/* Removed title to keep it clean */}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Bem-vindo
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Escolha uma forma de entrar no sistema
          </p>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Microsoft Login */}
            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
              </svg>
              Entrar com Microsoft
            </button>

            {/* Email Login */}
            <button
              onClick={handleEmailLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
            >
              <Mail className="w-5 h-5" />
              Entrar com Email
            </button>

            {/* Phone Login */}
            <button
              onClick={handlePhoneLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              <Phone className="w-5 h-5" />
              Entrar com Telefone
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Info Text */}
          <p className="text-center text-sm text-gray-600">
            Ao entrar, você concorda com nossos
            <br />
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Serviço
            </a>
            {" e "}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Seguro</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Rápido</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Fácil</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2026 Marqs Systems. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
