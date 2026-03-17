import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Loader2, FileUp, CheckCircle, Clock } from "lucide-react";
import MainLayout from "@/components/MainLayout";

export default function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [filterType, setFilterType] = useState<"all" | "OS" | "OC">("all");
  const [uploadingOrderId, setUploadingOrderId] = useState<number | null>(null);

  const { data: allOrders, isLoading } = trpc.orders.all.useQuery();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();
  const uploadPdfMutation = trpc.orders.uploadPdf.useMutation();

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const filteredOrders = allOrders?.filter(order => 
    filterType === "all" ? true : order.type === filterType
  ) || [];

  const handleStatusChange = async (orderId: number, newStatus: "not_started" | "in_process" | "completed") => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handlePdfUpload = async (orderId: number, file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        await uploadPdfMutation.mutateAsync({
          orderId,
          pdfBase64: base64,
          fileName: file.name,
        });
        setUploadingOrderId(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading PDF:", error);
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

  return (
    <MainLayout>
      <div className="bg-background text-foreground">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-12 border-b divider-line pb-8">
          <div className="flex items-center mb-4">
            <div className="accent-square"></div>
            <span className="text-caption font-semibold tracking-wide">GERENCIAMENTO</span>
          </div>
          <h1 className="text-headline">Todas as Ordens</h1>
          <p className="text-body text-muted-foreground mt-2">
            Gerencie, atualize status e faça upload de PDFs para as solicitações
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 border-b divider-line pb-4">
          {["all", "OS", "OC"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`text-title font-semibold pb-2 border-b-2 transition-colors ${
                filterType === type
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {type === "all" ? "Todas" : type === "OS" ? "Ordens de Serviço" : "Ordens de Compra"}
            </button>
          ))}
          <div className="ml-auto text-caption text-muted-foreground pt-2">
            {filteredOrders.length} ordem{filteredOrders.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6 border divider-line">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-caption text-muted-foreground font-semibold mb-1">TIPO</p>
                    <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-1">
                      {order.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground font-semibold mb-1">TÍTULO</p>
                    <p className="text-body font-semibold">{order.title}</p>
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground font-semibold mb-1">STATUS</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <div>
                    <p className="text-caption text-muted-foreground font-semibold mb-1">DATA</p>
                    <p className="text-body">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {order.description && (
                  <p className="text-body text-muted-foreground mb-4">{order.description}</p>
                )}

                {order.totalValue && (
                  <p className="text-body font-semibold mb-4">
                    Valor: <span className="text-accent">R$ {order.totalValue}</span>
                  </p>
                )}

                {/* Actions */}
                <div className="border-t divider-line pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Update */}
                    <div>
                      <p className="text-caption text-muted-foreground font-semibold mb-2">ATUALIZAR STATUS</p>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as "not_started" | "in_process" | "completed"
                          )
                        }
                        disabled={updateStatusMutation.isPending}
                        className="input-minimal w-full text-sm"
                      >
                        <option value="not_started">Não Iniciada</option>
                        <option value="in_process">Em Processo</option>
                        <option value="completed">Concluída</option>
                      </select>
                    </div>

                    {/* PDF Upload */}
                    <div>
                      <p className="text-caption text-muted-foreground font-semibold mb-2">UPLOAD PDF</p>
                      {uploadingOrderId === order.id ? (
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handlePdfUpload(order.id, e.target.files[0]);
                            }
                          }}
                          className="input-minimal w-full text-sm"
                        />
                      ) : (
                        <button
                          onClick={() => setUploadingOrderId(order.id)}
                          className="w-full bg-muted text-muted-foreground px-4 py-2 font-semibold border border-border hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors flex items-center justify-center gap-2"
                        >
                          <FileUp className="w-4 h-4" />
                          {order.pdfUrl ? "Substituir PDF" : "Enviar PDF"}
                        </button>
                      )}
                    </div>

                    {/* PDF Link */}
                    <div>
                      <p className="text-caption text-muted-foreground font-semibold mb-2">DOCUMENTO</p>
                      {order.pdfUrl ? (
                        <a
                          href={order.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-accent text-accent-foreground px-4 py-2 font-semibold border border-accent hover:opacity-90 transition-opacity block text-center"
                        >
                          Baixar PDF
                        </a>
                      ) : (
                        <div className="w-full bg-muted text-muted-foreground px-4 py-2 text-center text-sm">
                          Sem PDF
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma ordem encontrada</p>
          </div>
        )}
      </div>
    </div>
    </MainLayout>
  );
}
