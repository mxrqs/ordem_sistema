import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Plus, FileText, Clock, CheckCircle } from "lucide-react";

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"my-orders" | "create">("my-orders");

  const { data: myOrders, isLoading: ordersLoading } = trpc.orders.myOrders.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  const [formData, setFormData] = useState({
    type: "OS" as "OS" | "OC",
    title: "",
    description: "",
    totalValue: "",
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrderMutation.mutateAsync({
        ...formData,
        items: [],
      });
      setFormData({ type: "OS", title: "", description: "", totalValue: "" });
      setActiveTab("my-orders");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
      not_started: { label: "Não Iniciada", icon: <Clock className="w-4 h-4" />, color: "bg-yellow-50 text-yellow-900 border-yellow-200" },
      in_process: { label: "Em Processo", icon: <Loader2 className="w-4 h-4 animate-spin" />, color: "bg-blue-50 text-blue-900 border-blue-200" },
      completed: { label: "Concluída", icon: <CheckCircle className="w-4 h-4" />, color: "bg-green-50 text-green-900 border-green-200" },
    };

    const statusInfo = statusMap[status] || statusMap.not_started;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold border rounded ${statusInfo.color}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-12 border-b divider-line pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <div className="accent-square"></div>
                <span className="text-caption font-semibold tracking-wide">MINHAS ORDENS</span>
              </div>
              <h1 className="text-headline">Solicitações de Ordens</h1>
            </div>
            <Button
              onClick={() => setActiveTab("create")}
              className="bg-accent text-accent-foreground px-6 py-3 font-semibold border border-accent hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Ordem
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b divider-line pb-4">
          <button
            onClick={() => setActiveTab("my-orders")}
            className={`text-title font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === "my-orders"
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Minhas Solicitações
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`text-title font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === "create"
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Criar Nova
          </button>
        </div>

        {/* Content */}
        {activeTab === "my-orders" ? (
          <div>
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : myOrders && myOrders.length > 0 ? (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <Card key={order.id} className="p-6 border divider-line">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-1">
                            {order.type}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <h3 className="text-title font-semibold">{order.title}</h3>
                      </div>
                      <span className="text-caption text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {order.description && (
                      <p className="text-body text-muted-foreground mb-4">{order.description}</p>
                    )}

                    {order.totalValue && (
                      <p className="text-body font-semibold mb-4">
                        Valor: <span className="text-accent">R$ {order.totalValue}</span>
                      </p>
                    )}

                    {order.pdfUrl && (
                      <div className="bg-muted p-4 rounded border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-caption font-semibold">PDF Disponível</span>
                        </div>
                        <a
                          href={order.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent font-semibold hover:underline"
                        >
                          Baixar Documento
                        </a>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhuma solicitação encontrada</p>
                <Button
                  onClick={() => setActiveTab("create")}
                  className="bg-accent text-accent-foreground px-6 py-3 font-semibold border border-accent hover:opacity-90"
                >
                  Criar Primeira Ordem
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateOrder} className="max-w-2xl">
            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="text-title font-semibold block mb-3">Tipo de Ordem</label>
                <div className="flex gap-4">
                  {["OS", "OC"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type as "OS" | "OC" })}
                      className={`px-6 py-3 font-semibold border transition-colors ${
                        formData.type === type
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background text-foreground border-border"
                      }`}
                    >
                      {type === "OS" ? "Ordem de Serviço" : "Ordem de Compra"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-title font-semibold block mb-2">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-minimal w-full"
                  placeholder="Digite o título da ordem"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-title font-semibold block mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-minimal w-full min-h-32"
                  placeholder="Descreva os detalhes da ordem"
                />
              </div>

              {/* Total Value */}
              <div>
                <label className="text-title font-semibold block mb-2">Valor Total (opcional)</label>
                <input
                  type="text"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                  className="input-minimal w-full"
                  placeholder="R$ 0,00"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="bg-accent text-accent-foreground px-8 py-3 font-semibold border border-accent hover:opacity-90 disabled:opacity-50"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Criando...
                    </>
                  ) : (
                    "Criar Ordem"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("my-orders")}
                  variant="outline"
                  className="px-8 py-3 font-semibold border border-foreground"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
