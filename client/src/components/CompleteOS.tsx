import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface CompleteOSProps {
  orderId: number;
  orderTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CompleteOS({ orderId, orderTitle, isOpen, onClose, onSuccess }: CompleteOSProps) {
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOSMutation = trpc.orders.completeOS.useMutation();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeOSMutation.mutateAsync({
        orderId,
        items: [],
        maintenanceNotes: maintenanceNotes.trim(),
      });
      toast.success("OS finalizada com sucesso!");
      setMaintenanceNotes("");
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error("Erro ao finalizar OS");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Finalizar OS - {orderTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">Itens Utilizados</p>
              <p className="text-sm text-blue-800 mt-1">
                Use a aba "Itens Utilizados" para registrar os materiais e quantidades utilizados nesta ordem de serviço.
              </p>
            </div>
          </div>

          {/* Maintenance Notes */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground block">
              Observações para Próxima Manutenção (Opcional)
            </label>
            <textarea
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              placeholder="Ex: Verificar suspensão, trocar óleo na próxima revisão, etc."
              rows={5}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Essas observações aparecerão automaticamente nas próximas manutenções deste veículo.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-border hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Finalizando..." : "Finalizar OS"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
