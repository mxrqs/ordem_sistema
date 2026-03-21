import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, Camera, X } from "lucide-react";

export interface VehicleChecklistData {
  // Informações do Veículo
  contrato: string;
  veiculo: string;
  placa: string;
  motorista: string;
  data: string;
  kmInicial: string;

  // Inspeção (Sim/Não/Igual)
  luzes: "sim" | "nao" | "igual" | "";
  freios: "sim" | "nao" | "igual" | "";
  pneus: "sim" | "nao" | "igual" | "";
  oleo: "sim" | "nao" | "igual" | "";
  aguaRadiador: "sim" | "nao" | "igual" | "";

  // Documentação
  observacoes: string;
  fotos: {
    km?: string;
    frente?: string;
    traseira?: string;
    lateralDireito?: string;
    lateralEsquerdo?: string;
  };
  assinatura?: string;
}

interface VehicleChecklistStepProps {
  data: VehicleChecklistData;
  onDataChange: (data: VehicleChecklistData) => void;
  onComplete?: () => void;
}

const STEPS = [
  { id: 1, title: "Informações do Veículo", icon: "🚗" },
  { id: 2, title: "Inspeção Visual", icon: "🔍" },
  { id: 3, title: "Fotos", icon: "📸" },
  { id: 4, title: "Observações", icon: "📝" },
  { id: 5, title: "Assinatura", icon: "✍️" },
];

export default function VehicleChecklistStep({
  data,
  onDataChange,
  onComplete,
}: VehicleChecklistStepProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhotoField, setCurrentPhotoField] = useState<keyof typeof data.fotos | null>(null);

  // Inicializar canvas para assinatura
  useEffect(() => {
    if (currentStep === 5 && canvasRef.current && !data.assinatura) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
      }
    }
  }, [currentStep, data.assinatura]);

  const handleInputChange = (field: string, value: string) => {
    onDataChange({
      ...data,
      [field]: value,
    });
  };

  const handleInspectionChange = (field: string, value: string) => {
    onDataChange({
      ...data,
      [field]: value,
    });
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof data.fotos) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onDataChange({
          ...data,
          fotos: {
            ...data.fotos,
            [field]: base64,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL();
      onDataChange({
        ...data,
        assinatura: signature,
      });
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      onDataChange({
        ...data,
        assinatura: undefined,
      });
    }
  };

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 bg-white p-4 rounded-lg">
            <div>
              <label className="block text-sm font-semibold mb-2">Contrato</label>
              <input
                type="text"
                value={data.contrato}
                onChange={(e) => handleInputChange("contrato", e.target.value)}
                className="input-minimal w-full"
                placeholder="Digite o contrato"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Veículo</label>
              <input
                type="text"
                value={data.veiculo}
                onChange={(e) => handleInputChange("veiculo", e.target.value)}
                className="input-minimal w-full"
                placeholder="Digite o veículo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Placa</label>
              <input
                type="text"
                value={data.placa}
                onChange={(e) => handleInputChange("placa", e.target.value)}
                className="input-minimal w-full"
                placeholder="Digite a placa"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Motorista</label>
              <input
                type="text"
                value={data.motorista}
                onChange={(e) => handleInputChange("motorista", e.target.value)}
                className="input-minimal w-full"
                placeholder="Digite o motorista"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Data</label>
              <input
                type="date"
                value={data.data}
                onChange={(e) => handleInputChange("data", e.target.value)}
                className="input-minimal w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">KM Inicial</label>
              <input
                type="number"
                value={data.kmInicial}
                onChange={(e) => handleInputChange("kmInicial", e.target.value)}
                className="input-minimal w-full"
                placeholder="Digite o KM inicial"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 bg-white p-4 rounded-lg">
            <div>
              <label className="block text-sm font-semibold mb-3">Luzes</label>
              <div className="flex gap-2">
                {["sim", "nao", "igual"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInspectionChange("luzes", option)}
                    className={`flex-1 py-2 px-3 rounded border font-semibold transition-colors ${
                      data.luzes === option
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {option === "sim" ? "✓ Sim" : option === "nao" ? "✗ Não" : "= Igual"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Freios</label>
              <div className="flex gap-2">
                {["sim", "nao", "igual"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInspectionChange("freios", option)}
                    className={`flex-1 py-2 px-3 rounded border font-semibold transition-colors ${
                      data.freios === option
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {option === "sim" ? "✓ Sim" : option === "nao" ? "✗ Não" : "= Igual"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Pneus</label>
              <div className="flex gap-2">
                {["sim", "nao", "igual"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInspectionChange("pneus", option)}
                    className={`flex-1 py-2 px-3 rounded border font-semibold transition-colors ${
                      data.pneus === option
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {option === "sim" ? "✓ Sim" : option === "nao" ? "✗ Não" : "= Igual"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Óleo</label>
              <div className="flex gap-2">
                {["sim", "nao", "igual"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInspectionChange("oleo", option)}
                    className={`flex-1 py-2 px-3 rounded border font-semibold transition-colors ${
                      data.oleo === option
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {option === "sim" ? "✓ Sim" : option === "nao" ? "✗ Não" : "= Igual"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Água do Radiador</label>
              <div className="flex gap-2">
                {["sim", "nao", "igual"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInspectionChange("aguaRadiador", option)}
                    className={`flex-1 py-2 px-3 rounded border font-semibold transition-colors ${
                      data.aguaRadiador === option
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {option === "sim" ? "✓ Sim" : option === "nao" ? "✗ Não" : "= Igual"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 bg-white p-4 rounded-lg">
            {[
              { key: "km", label: "Foto KM" },
              { key: "frente", label: "Foto Frente" },
              { key: "traseira", label: "Foto Traseira" },
              { key: "lateralDireito", label: "Foto Lateral Direito" },
              { key: "lateralEsquerdo", label: "Foto Lateral Esquerdo" },
            ].map((photo) => (
              <div key={photo.key}>
                <label className="block text-sm font-semibold mb-2">{photo.label}</label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {data.fotos[photo.key as keyof typeof data.fotos] ? (
                    <div className="space-y-2">
                      <img
                        src={data.fotos[photo.key as keyof typeof data.fotos]}
                        alt={photo.label}
                        className="w-full h-40 object-cover rounded"
                      />
                      <button
                        onClick={() => {
                          onDataChange({
                            ...data,
                            fotos: {
                              ...data.fotos,
                              [photo.key]: undefined,
                            },
                          });
                        }}
                        className="w-full py-2 px-3 bg-red-500 text-white rounded font-semibold hover:bg-red-600"
                      >
                        Remover Foto
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-semibold text-center">Clique para adicionar foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handlePhotoCapture(e, photo.key as keyof typeof data.fotos)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 bg-white p-4 rounded-lg">
            <div>
              <label className="block text-sm font-semibold mb-2">Observações</label>
              <textarea
                value={data.observacoes}
                onChange={(e) => handleInputChange("observacoes", e.target.value)}
                className="input-minimal w-full min-h-32"
                placeholder="Digite suas observações aqui..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 bg-white p-4 rounded-lg">
            <div>
              <label className="block text-sm font-semibold mb-2">Assinatura</label>
              <div className="border-2 border-border rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className="w-full bg-white cursor-crosshair"
                />
              </div>
              {data.assinatura && (
                <button
                  onClick={clearSignature}
                  className="w-full mt-2 py-2 px-3 bg-red-500 text-white rounded font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar Assinatura
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${step.id <= currentStep ? "opacity-100" : "opacity-40"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mb-2 transition-colors ${
                  step.id === currentStep
                    ? "bg-accent text-accent-foreground"
                    : step.id < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span className="text-xs font-semibold text-center hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 mb-8 border divider-line">
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">{STEPS[currentStep - 1].icon}</span>
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Etapa {currentStep} de {STEPS.length}
          </p>
        </div>

        {renderStepContent()}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between">
        <Button
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          variant="outline"
          className="flex-1 py-3 font-semibold border border-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNextStep}
            className="flex-1 py-3 font-semibold bg-accent text-accent-foreground border border-accent hover:opacity-90 flex items-center justify-center gap-2"
          >
            Avançar
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            className="flex-1 py-3 font-semibold bg-green-500 text-white border border-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}
