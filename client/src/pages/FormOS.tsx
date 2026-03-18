import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import OrderForm from "@/components/OrderForm";

export default function FormOS() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Nova Ordem de Serviço</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Preencha os dados abaixo para solicitar uma Ordem de Serviço</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <OrderForm
            orderType="OS"
            onClose={() => setLocation("/orders")}
            onTypeSelect={() => {}}
          />
        </div>
      </div>
    </MainLayout>
  );
}
