import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface OrderFormProps {
  orderType: "OS" | "OC" | null;
  onClose: () => void;
  onTypeSelect: (type: "OS" | "OC") => void;
}

export default function OrderForm({ orderType, onClose, onTypeSelect }: OrderFormProps) {
  const createOrderMutation = trpc.orders.create.useMutation();
  const [step, setStep] = useState(orderType ? 1 : 0);
  const [images, setImages] = useState<File[]>([]);
  const [budgetFile, setBudgetFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    type: orderType || ("OS" as "OS" | "OC"),
    categoria: "",
    contrato: "",
    placa: "",
    km: "",
    informe: "",
    orcamento: "",
    title: "",
    description: "",
    totalValue: "",
  });

  const handleTypeSelect = (type: "OS" | "OC") => {
    setFormData({ ...formData, type });
    onTypeSelect(type);
    setStep(1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleBudgetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBudgetFile(e.target.files[0]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (formData.type === "OS") {
      if (step === 1 && !formData.categoria) return;
      if (step === 2 && !formData.contrato) return;
      if (step === 3 && !formData.placa) return;
      if (step === 4 && images.length === 0) return;
      if (step === 5 && !formData.km) return;
      if (step === 6 && !formData.informe) return;
    } else {
      if (step === 1 && !formData.contrato) return;
      if (step === 2 && !formData.placa) return;
      if (step === 3 && images.length === 0) return;
      if (step === 4 && !formData.km) return;
      if (step === 5 && !formData.informe) return;
      if (step === 6 && !formData.orcamento && !budgetFile) return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      await createOrderMutation.mutateAsync({
        type: formData.type,
        title: formData.title || `${formData.type} - ${formData.placa}`,
        description: formData.description || formData.informe,
        totalValue: formData.totalValue,
        items: [],
      });
      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const osSteps = [
    { title: "Categoria", desc: "Escolha a categoria" },
    { title: "Contrato", desc: "Informe o contrato" },
    { title: "Placa", desc: "Placa do veículo" },
    { title: "Fotos", desc: "Envie as fotos" },
    { title: "KM/Horímetro", desc: "Informe o KM" },
    { title: "Informe", desc: "Descrição técnica" },
    { title: "Resumo", desc: "Revise e confirme" },
  ];

  const ocSteps = [
    { title: "Contrato", desc: "Informe o contrato" },
    { title: "Placa", desc: "Placa do veículo" },
    { title: "Fotos", desc: "Envie as fotos" },
    { title: "KM/Horímetro", desc: "Informe o KM" },
    { title: "Informe", desc: "Descrição técnica" },
    { title: "Orçamento", desc: "Envie o orçamento" },
    { title: "Resumo", desc: "Revise e confirme" },
  ];

  const steps = formData.type === "OS" ? osSteps : ocSteps;
  const isLastStep = step === steps.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    i < step ? "bg-primary" : "bg-muted"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">{steps[step]?.title}</h2>
          <p className="text-muted-foreground">{steps[step]?.desc}</p>
        </div>
      </div>

      {/* Form Content */}
      <Card className="bg-white border border-border rounded-lg p-8 mb-8">
        {/* Step 0: Type Selection - Only show if no orderType provided */}
        {step === 0 && !orderType && (
          <div className="space-y-4">
            <p className="text-foreground mb-6">Selecione o tipo de ordem que deseja criar:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeSelect("OS")}
                className="p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
              >
                <div className="text-2xl font-bold text-primary mb-2">OS</div>
                <div className="font-semibold text-foreground">Ordem de Serviço</div>
                <div className="text-sm text-muted-foreground">Manutenção e reparos</div>
              </button>
              <button
                onClick={() => handleTypeSelect("OC")}
                className="p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
              >
                <div className="text-2xl font-bold text-primary mb-2">OC</div>
                <div className="font-semibold text-foreground">Ordem de Compra</div>
                <div className="text-sm text-muted-foreground">Aquisição de produtos</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Categoria (OS) or Contrato (OC) */}
        {step === 1 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <>
                <label className="block">
                  <span className="text-sm font-semibold text-foreground mb-2 block">Tipo de OS</span>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Preventiva">Preventiva</option>
                    <option value="Corretiva">Corretiva</option>
                    <option value="Reforma">Reforma</option>
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="text-sm font-semibold text-foreground mb-2 block">Contrato</span>
                  <input
                    type="text"
                    value={formData.contrato}
                    onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Informe o contrato"
                  />
                </label>
              </>
            )}
          </div>
        )}

        {/* Step 2: Contrato (OS) or Placa (OC) */}
        {step === 2 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">Contrato</span>
                <input
                  type="text"
                  value={formData.contrato}
                  onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Informe o contrato"
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">Placa/Matrícula</span>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: ABC-1234"
                />
              </label>
            )}
          </div>
        )}

        {/* Step 3: Placa (OS) or Fotos (OC) */}
        {step === 3 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">Placa/Matrícula</span>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: ABC-1234"
                />
              </label>
            ) : (
              <div>
                <span className="text-sm font-semibold text-foreground mb-2 block">Envie as fotos/evidências</span>
                <label className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para enviar fotos</p>
                  </div>
                </label>
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative bg-muted rounded p-2">
                        <div className="text-xs text-muted-foreground truncate">{img.name}</div>
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Fotos (OS) or KM (OC) */}
        {step === 4 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <div>
                <span className="text-sm font-semibold text-foreground mb-2 block">Envie as fotos (frontal + KM/Horímetro)</span>
                <label className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para enviar fotos</p>
                  </div>
                </label>
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative bg-muted rounded p-2">
                        <div className="text-xs text-muted-foreground truncate">{img.name}</div>
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">KM/Horímetro</span>
                <input
                  type="number"
                  value={formData.km}
                  onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: 12345"
                />
              </label>
            )}
          </div>
        )}

        {/* Step 5: KM (OS) or Informe (OC) */}
        {step === 5 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">KM/Horímetro</span>
                <input
                  type="number"
                  value={formData.km}
                  onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: 12345"
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">Informe Técnico</span>
                <textarea
                  value={formData.informe}
                  onChange={(e) => setFormData({ ...formData, informe: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
                  placeholder="Descreva o motivo, avaria, sintoma e observações"
                />
              </label>
            )}
          </div>
        )}

        {/* Step 6: Informe (OS) or Orçamento (OC) */}
        {step === 6 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">Informe Técnico Obrigatório</span>
                <textarea
                  value={formData.informe}
                  onChange={(e) => setFormData({ ...formData, informe: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
                  placeholder="- Motivo:\n- Avaria (Sim/Não):\n- Sintoma/Observação:\n- Veículo está parado? (Sim/Não):"
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold text-foreground mb-2 block">Orçamento (Foto/PDF)</span>
                  <label className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleBudgetUpload}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para enviar orçamento</p>
                    </div>
                  </label>
                  {budgetFile && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      ✓ {budgetFile.name}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground mb-2 block">Ou descreva o orçamento em texto</span>
                  <textarea
                    value={formData.orcamento}
                    onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-24"
                    placeholder="Empresa, CNPJ, forma de pagamento, prazo, dados bancários..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Resumo */}
        {step === 7 && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <span className="font-semibold">{formData.type === "OS" ? "Ordem de Serviço" : "Ordem de Compra"}</span>
              </div>
              {formData.type === "OS" && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categoria:</span>
                  <span className="font-semibold">{formData.categoria}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Contrato:</span>
                <span className="font-semibold">{formData.contrato}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Placa:</span>
                <span className="font-semibold">{formData.placa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">KM/Horímetro:</span>
                <span className="font-semibold">{formData.km}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fotos:</span>
                <span className="font-semibold">{images.length}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancelar
        </Button>

        <div className="flex gap-4">
          {step > 0 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
          )}

          {!isLastStep ? (
            <Button
              onClick={handleNext}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
