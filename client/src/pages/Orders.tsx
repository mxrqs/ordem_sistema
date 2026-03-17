import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Plus } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useState } from "react";
import OrderForm from "@/components/OrderForm";

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<"OS" | "OC" | null>(null);

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
    setLocation("/");
    return null;
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-8 py-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Solicitações de Ordens</h1>
                <p className="text-muted-foreground">Acompanhe suas solicitações de Ordem de Serviço e Compra</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 h-fit"
              >
                <Plus className="w-4 h-4" />
                Nova Ordem
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-8 py-8">
          {showForm ? (
            <div className="mb-8">
              <OrderForm
                orderType={selectedOrderType}
                onClose={() => {
                  setShowForm(false);
                  setSelectedOrderType(null);
                }}
                onTypeSelect={(type) => setSelectedOrderType(type)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
}
