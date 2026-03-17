import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Loader2,
  FileText,
  Clock,
  CheckCircle2,
  Download,
  PlayCircle,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_process":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_started":
        return <Clock className="w-4 h-4" />;
      case "in_process":
        return <PlayCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started":
        return "Não Iniciada";
      case "in_process":
        return "Em Processo";
      case "completed":
        return "Concluída";
      default:
        return status;
    }
  };

  // Filter orders by type
  const filteredOrders = orders?.filter((order) => order.type === activeTab) || [];
  const osCount = orders?.filter((o) => o.type === "OS").length || 0;
  const ocCount = orders?.filter((o) => o.type === "OC").length || 0;

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Minhas Solicitações</h1>
                <p className="text-muted-foreground">
                  Acompanhe o status das suas solicitações de Ordem de Serviço e Compra
                </p>
              </div>
              <Button
                onClick={() => setLocation(activeTab === "OS" ? "/form/os" : "/form/oc")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Solicitação
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-8 py-8">
          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("OS")}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "OS"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              Ordens de Serviço
              <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {osCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("OC")}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "OC"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              Ordens de Compra
              <span className="ml-1 bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {ocCount}
              </span>
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            order.type === "OS"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {order.type === "OS" ? "Ordem de Serviço" : "Ordem de Compra"} #{order.id}
                          </h3>
                          <p className="text-sm text-muted-foreground">{order.title || "Sem título"}</p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                      {order.type === "OC" && order.totalValue && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-green-600">R$ {order.totalValue}</span>
                        </div>
                      )}
                    </div>

                    {order.description && (
                      <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3 mb-4">
                        {order.description}
                      </p>
                    )}
                  </div>

                  {/* PDF Section */}
                  <div className="bg-gray-50 border-t border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">
                          Documento PDF
                        </span>
                      </div>
                      {order.pdfUrl ? (
                        <a
                          href={order.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Baixar PDF
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                          <Clock className="w-4 h-4" />
                          Aguardando envio pelo administrador
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground mb-2">
                Nenhuma {activeTab === "OS" ? "Ordem de Serviço" : "Ordem de Compra"} encontrada
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Crie sua primeira solicitação clicando no botão abaixo
              </p>
              <Button
                onClick={() => setLocation(activeTab === "OS" ? "/form/os" : "/form/oc")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Criar {activeTab === "OS" ? "Ordem de Serviço" : "Ordem de Compra"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
