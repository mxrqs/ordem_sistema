import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import {
  Loader2,
  FileUp,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  Download,
  Upload,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";

export default function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"OS" | "OC">("OS");
  const [uploadingOrderId, setUploadingOrderId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: allOrders, isLoading } = trpc.orders.all.useQuery();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.all.invalidate();
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });
  const uploadPdfMutation = trpc.orders.uploadPdf.useMutation({
    onSuccess: () => {
      utils.orders.all.invalidate();
      setUploadingOrderId(null);
      toast.success("PDF enviado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar PDF");
    },
  });

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  // Filter orders by type
  const filteredOrders = allOrders?.filter((order) => order.type === activeTab) || [];

  const handleStatusChange = async (
    orderId: number,
    newStatus: "not_started" | "in_process" | "completed"
  ) => {
    await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
  };

  const handlePdfUpload = async (orderId: number, file: File) => {
    setUploadingOrderId(orderId);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        await uploadPdfMutation.mutateAsync({
          orderId,
          pdfBase64: base64,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setUploadingOrderId(null);
    }
  };

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

  const osCount = allOrders?.filter((o) => o.type === "OS").length || 0;
  const ocCount = allOrders?.filter((o) => o.type === "OC").length || 0;

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-border">
          <div className="container mx-auto px-8 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Gerenciar Solicitações</h1>
            <p className="text-muted-foreground">
              Controle o status das solicitações e envie PDFs para os usuários
            </p>
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
                  {/* Order Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          order.type === "OS" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                        }`}>
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

                    {/* Order Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Solicitante</p>
                          <p className="text-sm font-semibold text-foreground">
                            {(order as any).userName || "Desconhecido"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Data</p>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {order.type === "OC" && order.totalValue && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Valor</p>
                            <p className="text-sm font-semibold text-green-600">
                              R$ {order.totalValue}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">PDF</p>
                          <p className="text-sm font-semibold">
                            {order.pdfUrl ? (
                              <span className="text-green-600">Anexado</span>
                            ) : (
                              <span className="text-yellow-600">Pendente</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {order.description && (
                      <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3 mb-4">
                        {order.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="bg-gray-50 border-t border-border px-6 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Status Control */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value as "not_started" | "in_process" | "completed"
                            )
                          }
                          disabled={updateStatusMutation.isPending}
                          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="not_started">Não Iniciada</option>
                          <option value="in_process">Em Processo</option>
                          <option value="completed">Concluída</option>
                        </select>
                      </div>

                      <div className="h-6 w-px bg-border" />

                      {/* PDF Upload */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".pdf"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0] && uploadingOrderId) {
                              handlePdfUpload(uploadingOrderId, e.target.files[0]);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadingOrderId(order.id);
                            // Create a temporary file input for this specific order
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".pdf";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                handlePdfUpload(order.id, file);
                              }
                            };
                            input.click();
                          }}
                          disabled={uploadPdfMutation.isPending && uploadingOrderId === order.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          {uploadPdfMutation.isPending && uploadingOrderId === order.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              {order.pdfUrl ? "Substituir PDF" : "Enviar PDF"}
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Download PDF */}
                      {order.pdfUrl && (
                        <>
                          <div className="h-6 w-px bg-border" />
                          <a
                            href={order.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                          >
                            <Download className="w-4 h-4" />
                            Baixar PDF
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                Nenhuma {activeTab === "OS" ? "Ordem de Serviço" : "Ordem de Compra"} encontrada
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
