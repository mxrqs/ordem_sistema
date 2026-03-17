import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  Loader2,
  Users,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: allUsers, isLoading } = trpc.users.list.useQuery();

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Permissão atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar permissão");
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      setConfirmDelete(null);
      toast.success("Usuário removido com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover usuário");
    },
  });

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const filteredUsers = allUsers?.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  }) || [];

  const adminCount = allUsers?.filter((u) => u.role === "admin").length || 0;
  const userCount = allUsers?.filter((u) => u.role === "user").length || 0;

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="border-b border-border">
          <div className="px-8 py-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Administre os usuários do sistema e suas permissões
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-3xl font-bold text-foreground">{allUsers?.length || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                  <p className="text-3xl font-bold text-foreground">{adminCount}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Padrão</p>
                  <p className="text-3xl font-bold text-foreground">{userCount}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Users Table */}
          <Card className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Permissão
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Último Acesso
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      {/* User Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{u.name || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{u.email || "—"}</p>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              userId: u.id,
                              role: e.target.value as "user" | "admin",
                            })
                          }
                          disabled={u.id === user.id || updateRoleMutation.isPending}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          } ${u.id === user.id ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <option value="user">Padrão</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </td>

                      {/* Last Signed In */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(u.lastSignedIn).toLocaleDateString("pt-BR")}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {u.id === user.id ? (
                          <span className="text-xs text-muted-foreground italic">Você</span>
                        ) : confirmDelete === u.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-red-600 font-semibold">Confirmar?</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() =>
                                deleteUserMutation.mutate({ userId: u.id })
                              }
                              disabled={deleteUserMutation.isPending}
                            >
                              {deleteUserMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Sim"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Não
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setConfirmDelete(u.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-semibold">Nenhum usuário encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? "Tente outro termo de busca" : "Nenhum usuário cadastrado"}
                </p>
              </div>
            )}
          </Card>

          {/* Info Note */}
          <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Nota Importante</p>
              <p className="text-sm text-amber-700 mt-1">
                Novos usuários são criados automaticamente quando fazem login pela primeira vez no sistema.
                Aqui você pode gerenciar suas permissões e remover usuários quando necessário.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
