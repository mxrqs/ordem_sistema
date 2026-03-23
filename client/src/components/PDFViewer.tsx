import { useState, useEffect } from "react";
import { Download, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePDFThumbnail } from "@/lib/pdfThumbnail";

interface PDF {
  url: string;
  name: string;
}

interface PDFViewerProps {
  pdfs: PDF[];
  onClose?: () => void;
}

export function PDFViewer({ pdfs, onClose }: PDFViewerProps) {
  const [activeTab, setActiveTab] = useState<"view" | "download">("view");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(true);

  // Generate thumbnails on mount
  useEffect(() => {
    const generateThumbnails = async () => {
      setLoadingThumbnails(true);
      const thumbs: string[] = [];
      for (const pdf of pdfs) {
        try {
          const thumb = await generatePDFThumbnail(pdf.url, 100, 140);
          thumbs.push(thumb);
        } catch (error) {
          console.error(`Failed to generate thumbnail for ${pdf.name}:`, error);
          thumbs.push("");
        }
      }
      setThumbnails(thumbs);
      setLoadingThumbnails(false);
    };

    if (pdfs.length > 0) {
      generateThumbnails();
    }
  }, [pdfs]);

  if (!pdfs || pdfs.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Nenhum PDF disponível</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentPDF = pdfs[currentIndex];

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentPDF.url;
    link.download = currentPDF.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? pdfs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === pdfs.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with Tabs and Navigation */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
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

        {/* PDF Navigation and Info */}
        {pdfs.length > 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                disabled={pdfs.length <= 1}
                title="PDF anterior"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>

              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {currentPDF.name}
                </p>
                <p className="text-xs text-gray-600">
                  {currentIndex + 1} de {pdfs.length}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                disabled={pdfs.length <= 1}
                title="Próximo PDF"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            {!loadingThumbnails && thumbnails.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-gray-200 overflow-x-auto">
                <div className="flex gap-2 pb-2">
                  {pdfs.map((pdf, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition ${
                        idx === currentIndex
                          ? "border-blue-600 shadow-lg"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      title={pdf.name}
                    >
                      {thumbnails[idx] ? (
                        <img
                          src={thumbnails[idx]}
                          alt={pdf.name}
                          className="w-20 h-28 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-28 bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">PDF</span>
                        </div>
                      )}
                      {idx === currentIndex && (
                        <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Single PDF Info */}
        {pdfs.length === 1 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{currentPDF.name}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {activeTab === "view" ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl w-full h-full">
              <iframe
                key={currentIndex}
                src={`${currentPDF.url}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full border-none rounded-lg"
                title={`PDF Viewer - ${currentPDF.name}`}
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
                {currentPDF.name}
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

              {/* Additional PDFs Info with Thumbnails */}
              {pdfs.length > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    Outros arquivos disponíveis:
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {pdfs.map((pdf, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`flex flex-col items-center gap-2 p-2 rounded-lg transition ${
                          idx === currentIndex
                            ? "bg-blue-100 border-2 border-blue-600"
                            : "bg-gray-100 border-2 border-gray-300 hover:border-gray-400"
                        }`}
                        title={pdf.name}
                      >
                        {!loadingThumbnails && thumbnails[idx] ? (
                          <img
                            src={thumbnails[idx]}
                            alt={pdf.name}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-300 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-600">PDF</span>
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-700 text-center truncate max-w-16">
                          {pdf.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
