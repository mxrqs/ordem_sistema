import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import VehicleChecklistStep, { VehicleChecklistData } from "@/components/VehicleChecklistStep";
import { useLocation } from "wouter";

export default function ChecklistVehicle() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [checklistData, setChecklistData] = useState<VehicleChecklistData>({
    contrato: "",
    veiculo: "",
    placa: "",
    motorista: "",
    data: new Date().toISOString().split("T")[0],
    kmInicial: "",
    luzes: "",
    freios: "",
    pneus: "",
    oleo: "",
    aguaRadiador: "",
    observacoes: "",
    fotos: {},
  });

  const createChecklistMutation = trpc.checklists.createVehicleChecklist.useMutation();

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await createChecklistMutation.mutateAsync({
        data: checklistData,
      });
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting checklist:", error);
      alert("Erro ao enviar checklist. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (isCompleted) {
    return (
      <MainLayout>
        <div className="bg-background text-foreground">
          <div className="container py-12 max-w-2xl">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Checklist Concluído!</h1>
                <p className="text-muted-foreground text-lg">
                  Seu checklist de veículo foi enviado com sucesso.
                </p>
              </div>
              <div className="pt-6 space-y-3">
                <Button
                  onClick={() => setLocation("/checklist")}
                  className="w-full bg-accent text-accent-foreground px-6 py-3 font-semibold border border-accent hover:opacity-90"
                >
                  Voltar para Checklist
                </Button>
                <Button
                  onClick={() => {
                    setIsCompleted(false);
                    setChecklistData({
                      contrato: "",
                      veiculo: "",
                      placa: "",
                      motorista: "",
                      data: new Date().toISOString().split("T")[0],
                      kmInicial: "",
                      luzes: "",
                      freios: "",
                      pneus: "",
                      oleo: "",
                      aguaRadiador: "",
                      observacoes: "",
                      fotos: {},
                    });
                  }}
                  variant="outline"
                  className="w-full px-6 py-3 font-semibold border border-foreground"
                >
                  Criar Novo Checklist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-background text-foreground">
        <div className="container py-8 max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => setLocation("/checklist")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center mb-2">
                <div className="accent-square"></div>
                <span className="text-caption font-semibold tracking-wide">CHECKLIST</span>
              </div>
              <h1 className="text-headline">Inspeção de Veículo</h1>
            </div>
          </div>

          {/* Checklist Component */}
          <VehicleChecklistStep
            data={checklistData}
            onDataChange={setChecklistData}
            onComplete={handleComplete}
          />

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="p-8 border divider-line">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="font-semibold">Enviando checklist...</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
