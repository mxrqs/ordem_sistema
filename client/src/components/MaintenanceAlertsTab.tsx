import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Trash2, Plus } from "lucide-react";

interface MaintenanceAlertsTabProps {
  orderId: number;
  placa: string;
}

export function MaintenanceAlertsTab({ orderId, placa }: MaintenanceAlertsTabProps) {
  const [description, setDescription] = useState("");

  const { data: alerts, isLoading, refetch } = trpc.itemsAndAlerts.alerts.getByOrder.useQuery({ orderId });
  const createAlertMutation = trpc.itemsAndAlerts.alerts.create.useMutation();
  const resolveAlertMutation = trpc.itemsAndAlerts.alerts.resolve.useMutation();
  const deleteAlertMutation = trpc.itemsAndAlerts.alerts.delete.useMutation();

  const handleCreateAlert = async () => {
    if (!description.trim()) return;

    try {
      await createAlertMutation.mutateAsync({
        orderId,
        placa,
        description: description.trim(),
      });
      setDescription("");
      refetch();
    } catch (error) {
      console.error("Erro ao criar alerta:", error);
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await resolveAlertMutation.mutateAsync({ alertId });
      refetch();
    } catch (error) {
      console.error("Erro ao resolver alerta:", error);
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await deleteAlertMutation.mutateAsync({ alertId });
      refetch();
    } catch (error) {
      console.error("Erro ao deletar alerta:", error);
    }
  };

  const pendingAlerts = alerts?.filter((a) => a.status === "pending") || [];
  const resolvedAlerts = alerts?.filter((a) => a.status === "resolved") || [];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Adicionar Observação para Próxima Manutenção
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Registre recomendações e pendências que devem ser verificadas na próxima manutenção deste veículo.
        </p>
        <div className="space-y-4">
          <Textarea
            placeholder="Ex: Trocar pastilha de freio, Verificar suspensão dianteira, Programar troca da correia dentada"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />

          <Button
            onClick={handleCreateAlert}
            disabled={!description.trim() || createAlertMutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createAlertMutation.isPending ? "Adicionando..." : "Adicionar Observação"}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Carregando observações...</div>
      ) : (
        <>
          {/* Pending Alerts */}
          {pendingAlerts.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-900 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                Pendências Ativas ({pendingAlerts.length})
              </h4>
              <div className="space-y-2">
                {pendingAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4 border-l-4 border-l-red-600 bg-red-50">
                    <div className="flex items-start justify-between">
                      <p className="text-gray-900 font-medium flex-1">{alert.description}</p>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                          disabled={resolveAlertMutation.isPending}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Marcar como resolvido"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                          disabled={deleteAlertMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          title="Deletar observação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Criado em {new Date(alert.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Resolved Alerts */}
          {resolvedAlerts.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Resolvidas ({resolvedAlerts.length})
              </h4>
              <div className="space-y-2">
                {resolvedAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4 border-l-4 border-l-green-600 bg-green-50 opacity-75">
                    <div className="flex items-start justify-between">
                      <p className="text-gray-700 line-through">{alert.description}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                        disabled={deleteAlertMutation.isPending}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Resolvido em {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleDateString("pt-BR") : ""}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!pendingAlerts.length && !resolvedAlerts.length && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma observação registrada para este veículo
            </div>
          )}
        </>
      )}
    </div>
  );
}
