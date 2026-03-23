import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CompleteOSProps {
  orderId: number;
  orderTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface OrderItem {
  description: string;
  quantity: number;
}

export default function CompleteOS({ orderId, orderTitle, isOpen, onClose, onSuccess }: CompleteOSProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    description: "",
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOSMutation = trpc.orders.completeOS.useMutation();

  const addItem = () => {
    if (!currentItem.description.trim()) {
      toast.error("Descreva o item");
      return;
    }
    if (currentItem.quantity <= 0) {
      toast.error("Quantidade deve ser maior que 0");
      return;
    }

    setItems([...items, { ...currentItem }]);
    setCurrentItem({
      description: "",
      quantity: 1,
    });
    toast.success("Item adicionado");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Items are now optional - allow finalization without items

    setIsSubmitting(true);
    try {
      await completeOSMutation.mutateAsync({
        orderId,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitValue: "0" // Keep for backward compatibility
        })),
      });
      toast.success("OS finalizada com sucesso!");
      setItems([]);
      setCurrentItem({
        description: "",
        quantity: 1,
      });
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
          {/* Add Item Section */}
          <Card className="bg-gray-50 border border-border p-4">
            <h3 className="font-semibold text-foreground mb-4">Adicionar Itens Gastos</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Descrição do Item
                </label>
                <input
                  type="text"
                  value={currentItem.description}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, description: e.target.value })
                  }
                  placeholder="Ex: Peça de reposição, mão de obra, óleo, etc"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={addItem}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Items List */}
          {items.length > 0 && (
            <Card className="border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4">Itens Adicionados</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
