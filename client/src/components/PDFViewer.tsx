import { useState } from "react";
import { Download, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose?: () => void;
}

export function PDFViewer({ fileUrl, fileName, onClose }: PDFViewerProps) {
  const [activeTab, setActiveTab] = useState<"view" | "download">("view");

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("view")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "view"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Eye className="w-4 h-4" />
            Visualizar
          </button>
          <button
            onClick={() => setActiveTab("download")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "download"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {activeTab === "view" ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full h-full">
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full border-none rounded-lg"
                title="PDF Viewer"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {fileName}
              </h3>
              <p className="text-gray-600 mb-6">
                Clique no botão abaixo para baixar o arquivo PDF
              </p>
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 mx-auto"
              >
                <Download className="w-5 h-5" />
                Baixar PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
