import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Loader2 } from "lucide-react";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      setLocation(user.role === "admin" ? "/admin/dashboard" : "/my-orders");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          {/* Animated loading container */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-400 animate-spin"></div>
            {/* Inner pulsing ring */}
            <div className="absolute inset-2 rounded-full border-2 border-blue-200 animate-pulse"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" style={{ animationDuration: "2s" }} />
            </div>
          </div>
          <p className="text-blue-600 font-medium text-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Carregando...
          </p>
          <p className="text-blue-500 text-sm mt-2 animate-pulse" style={{ animationDelay: "0.4s" }}>
            Preparando seu acesso
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const handleMicrosoftLogin = () => {
    setLoggingIn(true);
    setActiveButton("microsoft");
    setTimeout(() => {
      window.location.href = "/api/oauth/microsoft";
    }, 300);
  };

  const handleEmailLogin = () => {
    setLoggingIn(true);
    setActiveButton("email");
    setTimeout(() => {
      window.location.href = "/api/oauth/email";
    }, 300);
  };

  const handlePhoneLogin = () => {
    setLoggingIn(true);
    setActiveButton("phone");
    setTimeout(() => {
      window.location.href = "/api/oauth/phone";
    }, 300);
  };

  const handleGoogleLogin = () => {
    setLoggingIn(true);
    setActiveButton("google");
    setTimeout(() => {
      window.location.href = "/api/oauth/google";
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-3 sm:px-4 md:px-8 py-8 sm:py-12 overflow-hidden">
      {/* Animated background elements - hidden on mobile */}
      <div className="hidden sm:block absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
      <div className="hidden sm:block absolute bottom-20 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-10 animate-float" style={{ animationDelay: "2s" }}></div>

      {/* Main Container */}
      <div className="w-full max-w-md sm:max-w-lg relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* Logo with white background and bounce animation */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="w-20 sm:w-24 h-20 sm:h-24 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce-slow">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445611591/kYpwHKpJafrLckpe6FrLBC/marqs-icon-new-3XhsZT5cmqSUQVmb8pxSAQ.webp"
                alt="Marqs Systems"
                className="w-12 sm:w-16 h-12 sm:h-16"
              />
            </div>
          </div>
          {/* Title - using subtitle as main title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 animate-fade-in px-2" style={{ animationDelay: "0.3s" }}>
            Controle de Serviços e Manutenção
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 animate-fade-in backdrop-blur-sm" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Bem-vindo de volta
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8 animate-fade-in px-2" style={{ animationDelay: "0.5s" }}>
            Acesse o sistema para gerenciar suas ordens de serviço e compra.
          </p>

          {/* Login Options */}
          <div className="space-y-3 sm:space-y-4">
            {/* Microsoft Login */}
            <button
              onClick={handleMicrosoftLogin}
              disabled={loggingIn}
              className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed animate-fade-in ${
                activeButton === "microsoft" ? "ring-2 ring-blue-300" : ""
              }`}
              style={{ animationDelay: "0.5s" }}
            >
              {activeButton === "microsoft" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                  </svg>
                  Entrar com Microsoft
                </>
              )}
            </button>

            {/* Email Login */}
            <button
              onClick={handleEmailLogin}
              disabled={loggingIn}
              className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-blue-600 text-blue-600 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 hover:bg-blue-50 hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed animate-fade-in ${
                activeButton === "email" ? "ring-2 ring-blue-300" : ""
              }`}
              style={{ animationDelay: "0.6s" }}
            >
              {activeButton === "email" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Entrar com Email
                </>
              )}
            </button>

            {/* Phone Login */}
            <button
              onClick={handlePhoneLogin}
              disabled={loggingIn}
              className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed animate-fade-in ${
                activeButton === "phone" ? "ring-2 ring-blue-300" : ""
              }`}
              style={{ animationDelay: "0.7s" }}
            >
              {activeButton === "phone" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  Entrar com Telefone
                </>
              )}
            </button>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loggingIn}
              className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-red-400 text-red-600 font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 hover:bg-red-50 hover:border-red-500 hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed animate-fade-in ${
                activeButton === "google" ? "ring-2 ring-red-300" : ""
              }`}
              style={{ animationDelay: "0.8s" }}
            >
              {activeButton === "google" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445611591/kYpwHKpJafrLckpe6FrLBC/google-login-icon-LYQ3HDjLXdJneuspHVFv9R.webp"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Entrar com Google
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-4 sm:my-6 flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.9s" }}>
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-xs sm:text-sm">ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Info Text */}
          <p className="text-center text-xs sm:text-sm text-gray-600 animate-fade-in px-2" style={{ animationDelay: "1s" }}>
            Ao entrar, você concorda com nossos
            <br />
            <a href="#" className="text-blue-600 hover:underline transition-colors">
              Termos de Serviço
            </a>
            {" e "}
            <a href="#" className="text-blue-600 hover:underline transition-colors">
              Política de Privacidade
            </a>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="text-center animate-fade-in hover:scale-110 transition-transform duration-300" style={{ animationDelay: "1.1s" }}>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2 hover:bg-blue-200 transition-colors">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Seguro</p>
          </div>
          <div className="text-center animate-fade-in hover:scale-110 transition-transform duration-300" style={{ animationDelay: "1.2s" }}>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2 hover:bg-blue-200 transition-colors">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Rápido</p>
          </div>
          <div className="text-center animate-fade-in hover:scale-110 transition-transform duration-300" style={{ animationDelay: "1.3s" }}>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2 hover:bg-blue-200 transition-colors">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Fácil</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center animate-fade-in" style={{ animationDelay: "1.4s" }}>
          <p className="text-xs text-gray-500 px-2">
            © 2026 Marqs Systems. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Global animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
