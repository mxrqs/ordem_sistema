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
  unitValue: string;
}

export default function CompleteOS({ orderId, orderTitle, isOpen, onClose, onSuccess }: CompleteOSProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    description: "",
    quantity: 1,
    unitValue: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOSMutation = trpc.orders.completeOS.useMutation();

  const addItem = () => {
    if (!currentItem.description.trim()) {
      toast.error("Descreva o item");
      return;
    }
    if (!currentItem.unitValue || parseFloat(currentItem.unitValue) <= 0) {
      toast.error("Informe um valor válido");
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
      unitValue: "",
    });
    toast.success("Item adicionado");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.unitValue || "0");
    }, 0);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOSMutation.mutateAsync({
        orderId,
        items,
      });
      toast.success("OS finalizada com sucesso!");
      setItems([]);
      setCurrentItem({
        description: "",
        quantity: 1,
        unitValue: "",
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
                  placeholder="Ex: Peça de reposição, mão de obra, etc"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
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

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Valor Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentItem.unitValue}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, unitValue: e.target.value })
                    }
                    placeholder="0.00"
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
                        {item.quantity}x R$ {parseFloat(item.unitValue).toFixed(2)} = R${" "}
                        {(item.quantity * parseFloat(item.unitValue)).toFixed(2)}
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

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </div>
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
              disabled={items.length === 0 || isSubmitting}
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
