import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface ItemsUsedTabProps {
  orderId: number;
  isRequester: boolean;
}

export function ItemsUsedTab({ orderId, isRequester }: ItemsUsedTabProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("un");

  const { data: items, isLoading, refetch } = trpc.itemsAndAlerts.items.list.useQuery({ orderId });
  const addItemMutation = trpc.itemsAndAlerts.items.add.useMutation();
  const deleteItemMutation = trpc.itemsAndAlerts.items.delete.useMutation();

  const handleAddItem = async () => {
    if (!itemName.trim()) return;

    try {
      await addItemMutation.mutateAsync({
        orderId,
        itemName: itemName.trim(),
        quantity: parseInt(quantity) || 1,
        unit: unit || "un",
      });
      setItemName("");
      setQuantity("1");
      setUnit("un");
      refetch();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItemMutation.mutateAsync({ itemId, orderId });
      refetch();
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  };

  return (
    <div className="space-y-6">
      {isRequester && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Adicionar Itens Utilizados</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Item *
              </label>
              <Input
                type="text"
                placeholder="Ex: Óleo do motor, Filtro de ar, Pastilha de freio"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="un">Unidade (un)</option>
                  <option value="l">Litro (l)</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="m">Metro (m)</option>
                  <option value="caixa">Caixa</option>
                  <option value="pct">Pacote</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleAddItem}
              disabled={!itemName.trim() || addItemMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addItemMutation.isPending ? "Adicionando..." : "Adicionar Item"}
            </Button>
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Itens Utilizados</h3>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando itens...</div>
        ) : !items || items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum item adicionado ainda
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <Card key={item.id} className="p-4 flex items-center justify-between hover:shadow-md transition">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.itemName}</p>
                  <p className="text-sm text-gray-600">
                    Quantidade: {item.quantity} {item.unit}
                  </p>
                </div>
                {isRequester && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleteItemMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
