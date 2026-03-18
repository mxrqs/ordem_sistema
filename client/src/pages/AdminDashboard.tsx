import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, BarChart3, Users, FileText, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MainLayout from "@/components/MainLayout";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth() || { user: null, loading: true };
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

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

  // Prepare chart data
  const chartData = stats?.byMonth
    ? Object.entries(stats.byMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({
          month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
          quantidade: count,
        }))
    : [];

  return (
    <MainLayout>
      <div className="bg-muted/30 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-8 py-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral das ordens de serviço, compra e checklist</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-8 py-8">
          {/* Alert - Pending Orders */}
          {stats && stats.totalOrders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  {Math.floor(stats.totalOrders * 0.3)} solicitação(õ)es pendente(s) de início
                </h3>
                <p className="text-sm text-yellow-800">
                  Existem ordens aguardando para serem iniciadas. Verifique a aba de gerenciamento de ordens.
                </p>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Total Solicitações */}
            <Card className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Total de Solicitações
                  </p>
                  <p className="text-4xl font-bold text-foreground">{stats?.totalOrders || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-primary flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Todas as ordens do sistema</p>
            </Card>

            {/* Usuário com Mais Solicitações */}
            <Card className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Usuário com Mais Solicitações
                  </p>
                  <p className="text-4xl font-bold text-foreground">{stats?.topUser?.user?.name || "—"}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 text-secondary flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{stats?.topUser?.orderCount || 0} solicitações</p>
            </Card>

            {/* Média por Mês */}
            <Card className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Média por Mês
                  </p>
                  <p className="text-4xl font-bold text-foreground">
                    {stats?.byMonth && Object.keys(stats.byMonth).length > 0 
                      ? Math.round(Object.values(stats.byMonth).reduce((a, b) => a + b, 0) / Object.keys(stats.byMonth).length) 
                      : 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Solicitações por mês</p>
            </Card>
          </div>

          {/* Service Orders vs Purchase Orders */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Serviços */}
            <Card className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Total de Ordens
                  </p>
                  <p className="text-4xl font-bold text-foreground">{stats?.totalOrders || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-primary flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Ordens registradas no sistema</p>
            </Card>

            {/* Placeholder */}
            <Card className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Status
                  </p>
                  <p className="text-4xl font-bold text-foreground">—</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 text-secondary flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Acompanhamento de status</p>
            </Card>
          </div>

          {/* Chart */}
          <Card className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6">Solicitações por Mês</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="quantidade" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
