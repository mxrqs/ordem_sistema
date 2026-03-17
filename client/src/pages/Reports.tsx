import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, FileText, BarChart3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Reports() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: allOrders } = trpc.orders.all.useQuery();

  const downloadReport = async (type: "OS" | "OC", format: "pdf" | "excel") => {
    setIsDownloading(true);
    try {
      const orders = allOrders?.filter(o => o.type === type) || [];
      
      if (format === "excel") {
        // Criar CSV
        const headers = ["ID", "Usuário", "Contrato", "Placa", "KM", "Status", "Data Criação"];
        const rows = orders.map(o => [
          o.id,
          o.userName || "N/A",
          o.contrato || "N/A",
          o.placa || "N/A",
          o.km || "N/A",
          o.status,
          new Date(o.createdAt).toLocaleDateString("pt-BR"),
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_${type}_${new Date().toISOString().split("T")[0]}.csv`);
        link.click();
        toast.success(`Relatório de ${type} exportado com sucesso!`);
      } else {
        // PDF - usar biblioteca simples
        const pdfContent = generatePDF(orders, type);
        const blob = new Blob([pdfContent], { type: "application/pdf" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_${type}_${new Date().toISOString().split("T")[0]}.pdf`);
        link.click();
        toast.success(`Relatório de ${type} exportado com sucesso!`);
      }
    } catch (error) {
      toast.error("Erro ao baixar relatório");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDF = (orders: any[], type: string) => {
    // Placeholder para PDF - em produção usar biblioteca como jsPDF
    return `Relatório de ${type}\n\n` + 
      orders.map(o => `ID: ${o.id}, Contrato: ${o.contrato}, Placa: ${o.placa}, Status: ${o.status}`).join("\n");
  };

  const osCount = allOrders?.filter(o => o.type === "OS").length || 0;
  const ocCount = allOrders?.filter(o => o.type === "OC").length || 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Relatórios</h1>
            <p className="text-gray-600">Baixe relatórios de Ordens de Serviço e Compra</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 border-0 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de OS</p>
                  <p className="text-3xl font-bold text-gray-900">{osCount}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </Card>
            
            <Card className="p-6 border-0 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de OC</p>
                  <p className="text-3xl font-bold text-gray-900">{ocCount}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Solicitações</p>
                  <p className="text-3xl font-bold text-gray-900">{osCount + ocCount}</p>
                </div>
                <FileText className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </Card>
          </div>

          {/* Download Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ordens de Serviço */}
            <Card className="p-8 border-0 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ordens de Serviço</h2>
                  <p className="text-sm text-gray-600">{osCount} registros</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => downloadReport("OS", "excel")}
                  disabled={isDownloading || osCount === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar em Excel
                </Button>
                <Button
                  onClick={() => downloadReport("OS", "pdf")}
                  disabled={isDownloading || osCount === 0}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar em PDF
                </Button>
              </div>
            </Card>

            {/* Ordens de Compra */}
            <Card className="p-8 border-0 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ordens de Compra</h2>
                  <p className="text-sm text-gray-600">{ocCount} registros</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => downloadReport("OC", "excel")}
                  disabled={isDownloading || ocCount === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar em Excel
                </Button>
                <Button
                  onClick={() => downloadReport("OC", "pdf")}
                  disabled={isDownloading || ocCount === 0}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar em PDF
                </Button>
              </div>
            </Card>
          </div>

          {/* Info */}
          <Card className="mt-8 p-6 border-0 shadow-sm bg-blue-50">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">ℹ️ Informação:</span> Os relatórios incluem todas as solicitações com informações de contrato, placa, KM, status e data de criação. Os dados são exportados em tempo real.
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
