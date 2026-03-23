import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface Alert {
  id: number;
  description: string;
  createdAt: Date;
}

interface PendingAlertsHeaderProps {
  alerts: Alert[];
  isLoading: boolean;
}

export function PendingAlertsHeader({ alerts, isLoading }: PendingAlertsHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading || !alerts || alerts.length === 0) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed top-4 right-4 z-40 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 shadow-lg"
      >
        <AlertCircle className="w-4 h-4" />
        <span className="font-semibold">{alerts.length} pendência{alerts.length !== 1 ? "s" : ""}</span>
      </button>
    );
  }

  return (
    <div className="bg-red-50 border-l-4 border-l-red-600 p-4 mx-4 mt-4 rounded-r-lg shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">
              ⚠️ Pendências do Veículo
            </h3>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="text-sm text-red-800 bg-white p-2 rounded border border-red-200">
                  <p className="font-medium">• {alert.description}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Desde {new Date(alert.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-700 mt-3 italic">
              Verifique essas pendências durante esta manutenção
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-100 rounded transition flex-shrink-0"
          title="Minimizar alertas"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
