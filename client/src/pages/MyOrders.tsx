import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, FileText, Clock, CheckCircle2, Download } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useState } from "react";

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery();
  const [activeTab, setActiveTab] = useState<"OS" | "OC">("OS");

  if (authLoading || isLoading) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started":
        return "bg-yellow-100 text-yellow-800";
      case "in_process":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_started":
        return <Clock className="w-4 h-4" />;
      case "in_process":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started":
        return "Não iniciada";
      case "in_process":
        return "Em processo";
      case "completed":
        return "Concluída";
      default:
        return status;
    }
  };

  // Filter orders by type
  const filteredOrders = orders?.filter((order) => order.type === activeTab) || [];

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-8 py-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Minhas Solicitações</h1>
              <p className="text-muted-foreground">Acompanhe todas as suas solicitações de Ordem de Serviço e Compra</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("OS")}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === "OS"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Ordens de Serviço (OS)
            </button>
            <button
              onClick={() => setActiveTab("OC")}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === "OC"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Ordens de Compra (OC)
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-primary flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {order.type === "OS" ? "Ordem de Serviço" : "Ordem de Compra"} #{order.id}
                          </h3>
                          <p className="text-sm text-muted-foreground">{order.title || "Sem título"}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Tipo</p>
                      <p className="text-sm font-semibold text-foreground">{order.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Valor</p>
                      <p className="text-sm font-semibold text-foreground">{order.totalValue || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Data</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">PDF</p>
                      {order.pdfUrl ? (
                        <a
                          href={order.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="w-4 h-4" />
                          Baixar
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aguardando</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                Nenhuma {activeTab === "OS" ? "Ordem de Serviço" : "Ordem de Compra"} encontrada
              </p>
              <Button
                onClick={() => setLocation(activeTab === "OS" ? "/form/os" : "/form/oc")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Criar {activeTab === "OS" ? "Ordem de Serviço" : "Ordem de Compra"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
