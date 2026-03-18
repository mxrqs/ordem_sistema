import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
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
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";

function PhotoGallery({ orderId }: { orderId: number }) {
  const { data: photos, isLoading } = trpc.orders.getPhotos.useQuery({ orderId });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  if (isLoading) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  if (!photos || photos.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Image className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Fotos ({photos.length})
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => { setCurrentPhoto(i); setLightboxOpen(true); }}
            className="relative group"
          >
            <img
              src={photo.url}
              alt={photo.label || `Foto ${i + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
            />
            {photo.label && (
              <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/60 text-white px-1 py-0.5 rounded">
                {photo.label}
              </span>
            )}
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[currentPhoto]?.url}
              alt={photos[currentPhoto]?.label || "Foto"}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhoto((currentPhoto - 1 + photos.length) % photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPhoto((currentPhoto + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {currentPhoto + 1} / {photos.length}
              {photos[currentPhoto]?.label && ` — ${photos[currentPhoto].label}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"OS" | "OC">("OS");
  const [uploadingOrderId, setUploadingOrderId] = useState<number | null>(null);
  const [deleteConfirmOrderId, setDeleteConfirmOrderId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

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
  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      utils.orders.all.invalidate();
      setDeleteConfirmOrderId(null);
      toast.success("Solicitacao deletada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao deletar solicitacao");
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
    return null;
  }

  // Filter orders by type and sort by creation date (newest first)
  let filteredOrders = allOrders?.filter((order) => order.type === activeTab) || [];
  filteredOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Paginate orders
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const handleDeleteOrder = async (orderId: number) => {
    await deleteOrderMutation.mutateAsync({ orderId });
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
               {paginatedOrders.map((order) => (
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Solicitante</p>
                        <p className="text-sm font-semibold text-foreground">
                          {(order as any).userName || "Desconhecido"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Data</p>
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      {order.placa && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Placa</p>
                          <p className="text-sm font-bold text-foreground">{order.placa}</p>
                        </div>
                      )}
                      {order.km && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">KM/Horímetro</p>
                          <p className="text-sm font-semibold text-foreground">{order.km}</p>
                        </div>
                      )}
                      {order.contrato && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Contrato</p>
                          <p className="text-sm font-semibold text-foreground">{order.contrato}</p>
                        </div>
                      )}
                      {order.type === "OS" && order.categoria && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Categoria</p>
                          <p className="text-sm font-semibold text-foreground">{order.categoria}</p>
                        </div>
                      )}
                      {order.type === "OC" && order.totalValue && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Valor</p>
                          <p className="text-sm font-bold text-green-600">R$ {order.totalValue}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">PDF</p>
                        <p className="text-sm font-semibold">
                          {order.pdfUrl ? (
                            <span className="text-green-600">Anexado</span>
                          ) : (
                            <span className="text-yellow-600">Pendente</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {order.description && (
                      <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3 mb-4">
                        {order.description}
                      </p>
                    )}

                    {/* Photo Gallery */}
                    <PhotoGallery orderId={order.id} />
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

                      {/* OS Number */}
                      {order.type === "OS" && order.osNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">OS:</span>
                          <span className="text-sm font-medium text-foreground">{order.osNumber}</span>
                        </div>
                      )}
                      {order.type === "OS" && !order.osNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">OS:</span>
                          <span className="text-sm text-yellow-600">Não informado</span>
                        </div>
                      )}

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

                      {/* Delete Button */}
                      <div className="ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmOrderId(order.id)}
                          disabled={deleteOrderMutation.isPending}
                          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          {deleteOrderMutation.isPending && deleteConfirmOrderId === order.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deletando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Deletar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 2);
                      return startPage + i;
                    }).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                Nenhuma {activeTab === "OS" ? "Ordem de Servico" : "Ordem de Compra"} encontrada
              </p>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmOrderId !== null && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className="bg-white rounded-lg p-6 max-w-sm w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Deletar Solicitacao</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Tem certeza que deseja deletar esta solicitacao? Esta acao nao pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmOrderId(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleDeleteOrder(deleteConfirmOrderId)}
                    disabled={deleteOrderMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteOrderMutation.isPending ? "Deletando..." : "Deletar"}
                  </Button>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
