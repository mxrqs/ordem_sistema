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
  Image,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import CompleteOS from "@/components/CompleteOS";
import { useState, useEffect } from "react";

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

      {/* Lightbox */}
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

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: !!user && !authLoading,
  });
  const [activeTab, setActiveTab] = useState<"OS" | "OC">("OS");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoriaFilter, setCategoriaFilter] = useState<string>("");
  const [completeOSOpen, setCompleteOSOpen] = useState(false);
  const [selectedOrderForCompletion, setSelectedOrderForCompletion] = useState<{ id: number; title: string } | null>(null);
  const ITEMS_PER_PAGE = 10;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
    }
  }, [authLoading, user, setLocation]);

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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

  // Filter orders by type, status, and categoria
  let filteredOrders = orders?.filter((order) => order.type === activeTab) || [];
  
  // Apply status filters
  if (statusFilters.length > 0) {
    filteredOrders = filteredOrders.filter((order) => statusFilters.includes(order.status));
  }
  
  // Apply categoria filter for OS
  if (activeTab === "OS" && categoriaFilter) {
    filteredOrders = filteredOrders.filter((order) => order.categoria === categoriaFilter);
  }
  
  // Sort by creation date (newest first)
  filteredOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const osCount = orders?.filter((o) => o.type === "OS").length || 0;
  const ocCount = orders?.filter((o) => o.type === "OC").length || 0;

  // Paginate orders
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-border">
          <div className="w-full px-4 sm:px-6 md:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Minhas Solicitações</h1>
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
        <div className="w-full px-4 sm:px-6 md:px-8 py-8">
          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-border">
            <div className="flex flex-wrap gap-6 items-start">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Filtrar por Status:</label>
                <div className="flex gap-3">
                  {["not_started", "in_process", "completed"].map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statusFilters.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStatusFilters([...statusFilters, status]);
                          } else {
                            setStatusFilters(statusFilters.filter((s) => s !== status));
                          }
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">
                        {status === "not_started" ? "Não Iniciadas" : status === "in_process" ? "Em Processo" : "Concluídas"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {activeTab === "OS" && (
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">Filtrar por Categoria:</label>
                  <select
                    value={categoriaFilter}
                    onChange={(e) => {
                      setCategoriaFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="">Todas as categorias</option>
                    <option value="Preventiva">Preventiva</option>
                    <option value="Corretiva">Corretiva</option>
                    <option value="Reforma">Reforma</option>
                  </select>
                </div>
              )}
            </div>
          </div>

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
            <>
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
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

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Número</p>
                        <p className="text-sm font-bold text-primary">#{order.osNumber || order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Data</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
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
                    </div>

                    {order.description && (
                      <p className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3 mb-4">
                        {order.description}
                      </p>
                    )}

                    {/* Photo Gallery */}
                    <PhotoGallery orderId={order.id} />
                  </div>

                  {/* Actions Section */}
                  <div className="bg-gray-50 border-t border-border px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">
                          Documento PDF
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                            Aguardando envio
                          </span>
                        )}
                        {order.type === "OS" && order.status !== "completed" && (
                          <Button
                            onClick={() => {
                              setSelectedOrderForCompletion({ id: order.id, title: order.title || `OS #${order.id}` });
                              setCompleteOSOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Finalizar OS
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="px-3"
                >
                  Anterior
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      className="px-3"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="px-3"
                >
                  Próximo
                </Button>
              </div>
            )}
            </>
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

      {/* CompleteOS Modal */}
      {selectedOrderForCompletion && (
        <CompleteOS
          orderId={selectedOrderForCompletion.id}
          orderTitle={selectedOrderForCompletion.title}
          isOpen={completeOSOpen}
          onClose={() => {
            setCompleteOSOpen(false);
            setSelectedOrderForCompletion(null);
          }}
          onSuccess={() => {
            // Refetch orders after completion
            window.location.reload();
          }}
        />
      )}
    </MainLayout>
  );
}
