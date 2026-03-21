import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronLeft, ChevronRight, Upload, X, Camera, Check, Image } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface OrderFormProps {
  orderType: "OS" | "OC" | null;
  onClose: () => void;
  onTypeSelect: (type: "OS" | "OC") => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Compress image for mobile uploads
async function compressImage(file: File): Promise<File> {
  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window.Image as any)();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 1280;
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.7
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function OrderForm({ orderType, onClose, onTypeSelect }: OrderFormProps) {
  const createOrderMutation = trpc.orders.create.useMutation();
  const uploadPhotoMutation = trpc.orders.uploadPhoto.useMutation();
  const [step, setStep] = useState(orderType ? 1 : 0);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [budgetFile, setBudgetFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    fornecedorNome: "",
    fornecedorCNPJ: "",
    formaPagamento: "",
    banco: "",
    agencia: "",
    conta: "",
    titularidade: "",
    osNumber: "",
  });

  const handleTypeSelect = (type: "OS" | "OC") => {
    setFormData({ ...formData, type });
    onTypeSelect(type);
    setStep(1);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const compressedFiles = await Promise.all(newFiles.map(compressImage));
      setImages([...images, ...compressedFiles]);
      // Create previews
      compressedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleBudgetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      
      if (!acceptedTypes.includes(file.type)) {
        toast.error('Apenas arquivos de mídia (JPG, PNG, GIF, WebP) e PDF são aceitos');
        return;
      }
      
      setBudgetFile(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (formData.type === "OS") {
      if (step === 1 && !formData.categoria) { toast.error("Selecione uma categoria"); return; }
      if (step === 2 && !formData.contrato) { toast.error("Informe o contrato"); return; }
      if (step === 3 && !formData.placa) { toast.error("Informe a placa"); return; }
      if (step === 4 && images.length === 0) { toast.error("Envie pelo menos uma foto"); return; }
      if (step === 5 && !formData.km) { toast.error("Informe o KM/Horímetro"); return; }
      if (step === 6 && !formData.informe) { toast.error("Preencha o informe técnico"); return; }
    } else {
      if (step === 1 && !formData.contrato) { toast.error("Informe o contrato"); return; }
      if (step === 2 && !formData.placa) { toast.error("Informe a placa"); return; }
      if (step === 3 && images.length === 0) { toast.error("Envie pelo menos uma foto"); return; }
      if (step === 4 && !formData.km) { toast.error("Informe o KM/Horímetro"); return; }
      if (step === 5 && !formData.informe) { toast.error("Preencha o informe técnico"); return; }
      if (step === 6 && formData.type === "OC") {
        if (!formData.orcamento && !budgetFile) { toast.error("Envie o orçamento"); return; }
        if (!formData.fornecedorNome) { toast.error("Informe o nome do fornecedor"); return; }
        if (!formData.fornecedorCNPJ) { toast.error("Informe o CNPJ"); return; }
        if (!formData.formaPagamento) { toast.error("Selecione a forma de pagamento"); return; }
        if (formData.formaPagamento === "transferencia") {
          if (!formData.banco) { toast.error("Informe o banco"); return; }
          if (!formData.agencia) { toast.error("Informe a agência"); return; }
          if (!formData.conta) { toast.error("Informe a conta"); return; }
          if (!formData.titularidade) { toast.error("Informe a titularidade"); return; }
        }
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create the order
      const result = await createOrderMutation.mutateAsync({
        type: formData.type,
        title: `${formData.type} - ${formData.placa}`,
        description: formData.informe,
        totalValue: formData.type === "OC" ? formData.totalValue : undefined,
        placa: formData.placa || undefined,
        km: formData.km || undefined,
        contrato: formData.contrato || undefined,
        categoria: formData.type === "OS" ? formData.categoria || undefined : undefined,
        items: [],
      });

      const orderId = result.id;

      // 2. Upload photos
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const base64 = await fileToBase64(file);
        await uploadPhotoMutation.mutateAsync({
          orderId,
          photoBase64: base64,
          fileName: file.name,
          label: i === 0 ? "frontal" : i === 1 ? "km" : `foto-${i + 1}`,
        });
      }

      // 3. Upload budget file as photo if exists (for OC)
      if (budgetFile) {
        const base64 = await fileToBase64(budgetFile);
        await uploadPhotoMutation.mutateAsync({
          orderId,
          photoBase64: base64,
          fileName: budgetFile.name,
          label: "orcamento",
        });
      }

      toast.success("Solicitação criada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Erro ao criar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const osSteps = [
    { title: "Categoria", desc: "Escolha a categoria da OS" },
    { title: "Contrato", desc: "Informe o número do contrato" },
    { title: "Placa", desc: "Placa/matrícula do veículo" },
    { title: "Fotos", desc: "Envie fotos (frontal + KM)" },
    { title: "KM/Horímetro", desc: "Informe a quilometragem" },
    { title: "Informe Técnico", desc: "Descrição técnica obrigatória" },
    { title: "Resumo", desc: "Revise e confirme sua solicitação" },
  ];

  const ocSteps = [
    { title: "Contrato", desc: "Informe o número do contrato" },
    { title: "Placa", desc: "Placa/matrícula do veículo" },
    { title: "Fotos", desc: "Envie fotos/evidências" },
    { title: "KM/Horímetro", desc: "Informe a quilometragem" },
    { title: "Informe Técnico", desc: "Descrição técnica" },
    { title: "Pagamento", desc: "Informações de pagamento do fornecedor" },
    { title: "Resumo", desc: "Revise e confirme sua solicitação" },
  ];

  const steps = formData.type === "OS" ? osSteps : ocSteps;
  const totalSteps = steps.length;
  const isLastStep = step === totalSteps;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Progress Bar */}
      {step >= 1 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Passo {step} de {totalSteps}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {steps[step - 1]?.title}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Title */}
      {step >= 1 && step <= totalSteps && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{steps[step - 1]?.title}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{steps[step - 1]?.desc}</p>
        </div>
      )}

      {/* Form Content */}
      <Card className="bg-white border border-border rounded-xl p-4 sm:p-6 md:p-8 mb-6">
        {/* Step 0: Type Selection */}
        {step === 0 && !orderType && (
          <div className="space-y-4">
            <p className="text-foreground mb-6">Selecione o tipo de ordem:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeSelect("OS")}
                className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-blue-50 transition-all"
              >
                <div className="text-2xl font-bold text-primary mb-2">OS</div>
                <div className="font-semibold text-foreground">Ordem de Serviço</div>
                <div className="text-sm text-muted-foreground">Manutenção e reparos</div>
              </button>
              <button
                onClick={() => handleTypeSelect("OC")}
                className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-blue-50 transition-all"
              >
                <div className="text-2xl font-bold text-primary mb-2">OC</div>
                <div className="font-semibold text-foreground">Ordem de Compra</div>
                <div className="text-sm text-muted-foreground">Aquisição de produtos</div>
              </button>
            </div>
          </div>
        )}

        {/* OS Step 1: Categoria | OC Step 1: Contrato */}
        {step === 1 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <label className="block">
                <span className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">Tipo de OS</span>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {["Preventiva", "Corretiva", "Reforma"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, categoria: cat })}
                      className={`p-2 sm:p-4 border-2 rounded-lg sm:rounded-xl text-xs sm:text-sm text-center transition-all ${
                        formData.categoria === cat
                          ? "border-primary bg-blue-50 text-primary font-semibold"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </label>
            ) : (
              <label className="block">
                <span className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">Contrato</span>
                <input
                  type="text"
                  value={formData.contrato}
                  onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Informe o número do contrato"
                />
              </label>
            )}
          </div>
        )}

        {/* OS Step 2: Contrato | OC Step 2: Placa */}
        {step === 2 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <>
              <label className="block">
                <span className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">Contrato</span>
                <input
                  type="text"
                  value={formData.contrato}
                  onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Informe o número do contrato"
                />
              </label>

              </>
            ) : (
              <label className="block">
                <span className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">Placa/Matrícula</span>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                  placeholder="Ex: ABC-1234"
                />
              </label>
            )}
          </div>
        )}

        {/* OS Step 3: Placa | OC Step 3: Fotos */}
        {step === 3 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <label className="block">
                <span className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">Placa/Matrícula</span>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                  placeholder="Ex: ABC-1234"
                />
              </label>
            ) : (
              <div>
                <span className="text-xs sm:text-sm font-semibold text-foreground mb-3 block">Envie as fotos/evidências</span>
                <label className="border-2 border-dashed border-border rounded-lg sm:rounded-xl p-4 sm:p-8 cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Camera className="w-10 h-10 text-muted-foreground mb-3" />
                  <span className="text-sm font-semibold text-foreground">Clique para enviar fotos</span>
                  <span className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF</span>
                </label>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={preview}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                          {i === 0 ? "Frontal" : i === 1 ? "KM" : `Foto ${i + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* OS Step 4: Fotos | OC Step 4: KM */}
        {step === 4 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <div>
                <span className="text-sm font-semibold text-foreground mb-3 block">
                  Envie as fotos (frontal do veículo + KM/Horímetro)
                </span>
                <label className="border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Camera className="w-10 h-10 text-muted-foreground mb-3" />
                  <span className="text-sm font-semibold text-foreground">Clique para enviar fotos</span>
                  <span className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF</span>
                </label>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={preview}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-border"
                        />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                          {i === 0 ? "Frontal" : i === 1 ? "KM" : `Foto ${i + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">KM/Horímetro</span>
                <input
                  type="text"
                  value={formData.km}
                  onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Informe o KM ou Horímetro atual"
                />
              </label>
            )}
          </div>
        )}

        {/* OS Step 5: KM | OC Step 5: Informe */}
        {step === 5 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">KM/Horímetro</span>
                <input
                  type="text"
                  value={formData.km}
                  onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Informe o KM ou Horímetro atual"
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">Informe Técnico</span>
                <textarea
                  value={formData.informe}
                  onChange={(e) => setFormData({ ...formData, informe: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[150px] resize-none"
                  placeholder="Descreva detalhadamente o motivo da solicitação..."
                />
              </label>
            )}
          </div>
        )}

        {/* OS Step 6: Informe | OC Step 6: Pagamento */}
        {step === 6 && (
          <div className="space-y-4">
            {formData.type === "OS" ? (
              <label className="block">
                <span className="text-sm font-semibold text-foreground mb-2 block">Informe Técnico</span>
                <textarea
                  value={formData.informe}
                  onChange={(e) => setFormData({ ...formData, informe: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[150px] resize-none"
                  placeholder="Descreva detalhadamente o motivo da solicitação e o serviço necessário..."
                />
              </label>
            ) : (
              <div className="space-y-6">
                {/* Orçamento Section */}
                <div className="pb-6 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span>💰 Informações do Orçamento</span>
                  </h3>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-foreground mb-2 block">Valor Total do Orçamento</span>
                      <input
                        type="text"
                        value={formData.totalValue}
                        onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="R$ 0,00"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-foreground mb-2 block">Descrição do Orçamento</span>
                      <textarea
                        value={formData.orcamento}
                        onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-none"
                        placeholder="Descreva os itens do orçamento ou cole o texto aqui..."
                      />
                    </label>
                    <div>
                      <span className="text-sm font-semibold text-foreground mb-2 block">Ou envie o arquivo do orçamento</span>
                      <label className="border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp,.pdf"
                          onChange={handleBudgetUpload}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-foreground">
                          {budgetFile ? budgetFile.name : "Clique para enviar"}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">PDF ou imagem</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Supplier Payment Information Section */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span>💳 Informações de Pagamento do Fornecedor</span>
                  </h3>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-foreground mb-2 block">🏢 Nome da Empresa ou Prestador *</span>
                      <input
                        type="text"
                        value={formData.fornecedorNome}
                        onChange={(e) => setFormData({ ...formData, fornecedorNome: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Nome completo da empresa"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-foreground mb-2 block">🪪 CNPJ *</span>
                      <input
                        type="text"
                        value={formData.fornecedorCNPJ}
                        onChange={(e) => setFormData({ ...formData, fornecedorCNPJ: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="XX.XXX.XXX/0001-XX"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-foreground mb-2 block">💳 Forma de Pagamento *</span>
                      <select
                        value={formData.formaPagamento}
                        onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="boleto">Boleto</option>
                        <option value="transferencia">Transferência Bancária</option>
                        <option value="cartao">Cartão de Crédito</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </label>

                    {/* Conditional Fields for Bank Transfer */}
                    {formData.formaPagamento === "transferencia" && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-4">
                        <p className="text-sm text-blue-900 font-semibold">Dados Bancários para Transferência</p>
                        <label className="block">
                          <span className="text-sm font-semibold text-foreground mb-2 block">🏦 Banco *</span>
                          <input
                            type="text"
                            value={formData.banco}
                            onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Ex: Banco do Brasil, Caixa, etc."
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-foreground mb-2 block">🏛️ Agência *</span>
                          <input
                            type="text"
                            value={formData.agencia}
                            onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Número da agência"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-foreground mb-2 block">💰 Conta *</span>
                          <input
                            type="text"
                            value={formData.conta}
                            onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Número da conta"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-foreground mb-2 block">👤 Titularidade *</span>
                          <input
                            type="text"
                            value={formData.titularidade}
                            onChange={(e) => setFormData({ ...formData, titularidade: e.target.value })}
                            className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Nome do titular da conta"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 7 (OS) / Step 7 (OC): Resumo */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-foreground">Resumo da Solicitação</h3>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Tipo</span>
                  <p className="font-semibold text-foreground mt-1">
                    {formData.type === "OS" ? "Ordem de Serviço" : "Ordem de Compra"}
                  </p>
                </div>
                {formData.type === "OS" && (
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Categoria</span>
                    <p className="font-semibold text-foreground mt-1">{formData.categoria}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Contrato</span>
                  <p className="font-semibold text-foreground mt-1">{formData.contrato}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Placa</span>
                  <p className="font-semibold text-foreground mt-1">{formData.placa}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">KM/Horímetro</span>
                  <p className="font-semibold text-foreground mt-1">{formData.km}</p>
                </div>
                {formData.type === "OC" && formData.totalValue && (
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Valor Total</span>
                    <p className="font-semibold text-foreground mt-1">{formData.totalValue}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Informe Técnico</span>
                <p className="text-foreground mt-1">{formData.informe}</p>
              </div>

              {formData.type === "OC" && formData.orcamento && (
                <div className="border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Orçamento</span>
                  <p className="text-foreground mt-1">{formData.orcamento}</p>
                </div>
              )}

              {formData.type === "OC" && (
                <div className="border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Informações de Pagamento</span>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Fornecedor:</span> {formData.fornecedorNome}</p>
                    <p><span className="font-semibold">CNPJ:</span> {formData.fornecedorCNPJ}</p>
                    <p><span className="font-semibold">Forma de Pagamento:</span> {formData.formaPagamento}</p>
                    {formData.formaPagamento === "transferencia" && (
                      <>
                        <p><span className="font-semibold">Banco:</span> {formData.banco}</p>
                        <p><span className="font-semibold">Agência:</span> {formData.agencia}</p>
                        <p><span className="font-semibold">Conta:</span> {formData.conta}</p>
                        <p><span className="font-semibold">Titularidade:</span> {formData.titularidade}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div className="border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Fotos ({images.length})
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {imagePreviews.map((preview, i) => (
                      <img
                        key={i}
                        src={preview}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-16 object-cover rounded-lg border border-border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {budgetFile && (
                <div className="border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Arquivo do Orçamento</span>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {budgetFile.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      {step >= 1 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1 && orderType) {
                onClose();
              } else {
                setStep(step - 1);
              }
            }}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>

          {step === 7 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirmar Solicitação
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-primary text-primary-foreground flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
