import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { PDFViewer } from "@/components/PDFViewer";
import { ArrowLeft, Send, Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

type HistoryEntry = {
  id: number;
  orderId: number;
  userId: number;
  type: "message" | "system_event" | "attachment";
  content: string | null;
  eventType: string | null;
  fileName: string | null;
  fileUrl: string | null;
  fileKey: string | null;
  fileType: string | null;
  fileSize: number | null;
  createdAt: Date;
  userName?: string | null;
};

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const orderId = parseInt(id || "0", 10);

  const [messageText, setMessageText] = useState("");
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string } | null>(null);
  const [showPdfCarousel, setShowPdfCarousel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch order details
  const { data: order, isLoading: orderLoading } = trpc.orders.myOrders.useQuery(undefined, {
    select: (orders) => orders.find((o) => o.id === orderId),
  });

  // Fetch history
  const { data: history = [], refetch: refetchHistory } = trpc.history.getByOrder.useQuery(
    { orderId },
    { enabled: !!orderId }
  );

  // Mutations
  const addMessageMutation = trpc.history.addMessage.useMutation();
  const uploadAttachmentMutation = trpc.history.uploadAttachment.useMutation();

  // Collect all PDFs from history
  const allPdfs = history
    .filter((entry) => entry.type === "attachment" && entry.fileType === "application/pdf")
    .map((entry) => ({
      url: entry.fileUrl || "",
      name: entry.fileName || "PDF",
    }));

  const handleOpenPdfCarousel = (pdf: { url: string; name: string }) => {
    setSelectedPdf(pdf);
    setShowPdfCarousel(true);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      await addMessageMutation.mutateAsync({
        orderId,
        content: messageText,
      });
      setMessageText("");
      await refetchHistory();
      toast.success("Mensagem enviada");
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
      console.error(error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setMessageText("");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];

        await uploadAttachmentMutation.mutateAsync({
          orderId,
          fileBase64: base64Data,
          fileName: file.name,
          fileType: file.type,
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
        await refetchHistory();
        toast.success("Arquivo enviado");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao enviar arquivo");
      console.error(error);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month} ${hours}:${minutes}`;
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="w-4 h-4" />;
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (fileType === "application/pdf") return <FileText className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getFilePreview = (entry: HistoryEntry) => {
    if (entry.fileType?.startsWith("image/")) {
      return (
        <img
          src={entry.fileUrl || ""}
          alt={entry.fileName || "Image"}
          className="max-w-xs rounded-lg max-h-64 object-cover"
        />
      );
    }
    if (entry.fileType === "application/pdf") {
      return (
        <button
          onClick={() => handleOpenPdfCarousel({ url: entry.fileUrl || "", name: entry.fileName || "document.pdf" })}
          className="flex items-center gap-2 bg-red-50 p-3 rounded-lg hover:bg-red-100 transition cursor-pointer w-full text-left"
        >
          <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-red-900 truncate">{entry.fileName}</p>
            <p className="text-xs text-red-700">Clique para visualizar</p>
          </div>
        </button>
      );
    }
    return (
      <a
        href={entry.fileUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
      >
        {getFileIcon(entry.fileType)}
        <div className="flex-1">
          <p className="font-medium text-sm">{entry.fileName}</p>
          <p className="text-xs text-gray-500">{entry.fileType}</p>
        </div>
      </a>
    );
  };

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p>Solicitação não encontrada</p>
        <Button onClick={() => setLocation("/my-orders")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/my-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg sm:text-xl">{order.title}</h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {order.type === "OS" ? "Ordem de Serviço" : "Ordem de Compra"}
              {order.osNumber && ` • ${order.osNumber}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs sm:text-sm font-medium">
            Status:{" "}
            <span
              className={
                order.status === "completed"
                  ? "text-green-600"
                  : order.status === "in_process"
                  ? "text-blue-600"
                  : "text-gray-600"
              }
            >
              {order.status === "completed"
                ? "Concluído"
                : order.status === "in_process"
                ? "Em Processo"
                : "Não Iniciado"}
            </span>
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Nenhuma mensagem ou evento ainda</p>
          </div>
        ) : (
          history.map((entry) => {
            const isCurrentUser = entry.userId === user?.id;
            const isSystemEvent = entry.type === "system_event";

            if (isSystemEvent) {
              return (
                <div key={entry.id} className="flex justify-center">
                  <div className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {entry.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={entry.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md ${
                    isCurrentUser
                      ? "bg-blue-500 text-white rounded-3xl rounded-tr-none"
                      : "bg-white text-gray-900 rounded-3xl rounded-tl-none border border-gray-200"
                  } p-3 sm:p-4`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold mb-1 opacity-75">{entry.userName}</p>
                  )}

                  {entry.type === "message" && (
                    <p className="text-sm break-words">{entry.content}</p>
                  )}

                  {entry.type === "attachment" && (
                    <div className="space-y-2">{getFilePreview(entry)}</div>
                  )}

                  <p
                    className={`text-xs mt-2 ${
                      isCurrentUser ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* PDF Viewer Carousel Modal */}
      {showPdfCarousel && allPdfs.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-4xl max-h-96 flex flex-col">
            <PDFViewer
              pdfs={allPdfs}
              onClose={() => {
                setShowPdfCarousel(false);
                setSelectedPdf(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-4 sm:p-6">
        <div className="space-y-3">


          <div className="flex gap-2 sm:gap-3">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAttachmentMutation.isPending}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-lg transition text-gray-600 disabled:opacity-50"
              title="Anexar arquivo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || addMessageMutation.isPending}
              className="p-2 sm:p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Enviar mensagem"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
