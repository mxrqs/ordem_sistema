import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, Plus, Trash2, CheckCircle2, Circle, Truck } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useLocation } from "wouter";

export default function Checklist() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const { data: checklists, isLoading } = trpc.checklists.list.useQuery();
  const createMutation = trpc.checklists.create.useMutation();
  const toggleMutation = trpc.checklists.toggle.useMutation();
  const deleteMutation = trpc.checklists.delete.useMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
      });
      setFormData({ title: "", description: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating checklist:", error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error toggling checklist:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error deleting checklist:", error);
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

  const completedCount = checklists?.filter((item) => item.completed).length || 0;
  const totalCount = checklists?.length || 0;

  return (
    <MainLayout>
      <div className="text-foreground bg-white min-h-screen">
        <div className="container py-8 px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-12 border-b divider-line pb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center mb-4">
                  <div className="accent-square"></div>
                  <span className="text-caption font-semibold tracking-wide">CHECKLIST</span>
                </div>
                <h1 className="text-headline">Minhas Tarefas</h1>
              </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setLocation("/checklist/vehicle")}
                className="bg-green-500 text-white px-6 py-3 font-semibold border border-green-500 hover:opacity-90 flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Checklist Veículo
              </Button>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-accent text-accent-foreground px-6 py-3 font-semibold border border-accent hover:opacity-90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Tarefa
              </Button>
            </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-caption font-semibold">Progresso</span>
                  <span className="text-caption text-muted-foreground">
                    {completedCount} de {totalCount}
                  </span>
                </div>
                <div className="w-full bg-muted rounded h-2">
                  <div
                    className="bg-accent h-2 rounded transition-all duration-300"
                    style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Form */}
          {showForm && (
            <Card className="p-6 mb-8 border divider-line">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-title font-semibold block mb-2">Título da Tarefa</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-minimal w-full"
                    placeholder="Digite o título da tarefa"
                  />
                </div>

                <div>
                  <label className="text-title font-semibold block mb-2">Descrição (opcional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-minimal w-full min-h-24"
                    placeholder="Descreva os detalhes da tarefa"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-accent text-accent-foreground px-6 py-3 font-semibold border border-accent hover:opacity-90 disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Criando...
                      </>
                    ) : (
                      "Criar Tarefa"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="px-6 py-3 font-semibold border border-foreground"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Checklist Items */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : checklists && checklists.length > 0 ? (
            <div className="space-y-3">
              {checklists.map((item) => (
                <Card
                  key={item.id}
                  className={`p-4 border divider-line transition-all ${
                    item.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggle(item.id)}
                      className="mt-1 flex-shrink-0 text-accent hover:opacity-70 transition-opacity"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-title font-semibold ${
                          item.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p
                          className={`text-body mt-1 ${
                            item.completed ? "text-muted-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground mb-4">Nenhuma tarefa criada</p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button
                  onClick={() => setLocation("/checklist/vehicle")}
                  className="bg-green-500 text-white px-6 py-3 font-semibold border border-green-500 hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  Checklist Veículo
                </Button>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-accent text-accent-foreground px-6 py-3 font-semibold border border-accent hover:opacity-90"
                >
                  Criar Primeira Tarefa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
