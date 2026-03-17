import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, BarChart3, Users, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MainLayout from "@/components/MainLayout";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
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
    ? Object.entries(stats.byMonth).map(([month, count]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        quantidade: count,
      }))
    : [];

  return (
    <MainLayout>
      <div className="bg-background text-foreground">
        <div className="container py-8">
        {/* Header */}
        <div className="mb-12 border-b divider-line pb-8">
          <div className="flex items-center mb-4">
            <div className="accent-square"></div>
            <span className="text-caption font-semibold tracking-wide">ADMINISTRAÇÃO</span>
          </div>
          <h1 className="text-headline">Dashboard Administrativo</h1>
          <p className="text-body text-muted-foreground mt-2">
            Visão geral de todas as solicitações de ordens de compra e serviço
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Total Orders */}
          <Card className="p-6 border divider-line">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-caption text-muted-foreground font-semibold mb-2">TOTAL DE SOLICITAÇÕES</p>
                <p className="text-5xl font-bold text-accent">{stats?.totalOrders || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-caption text-muted-foreground">
              Todas as ordens do sistema
            </p>
          </Card>

          {/* Top User */}
          <Card className="p-6 border divider-line">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-caption text-muted-foreground font-semibold mb-2">USUÁRIO COM MAIS SOLICITAÇÕES</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.topUser?.user?.name || "—"}
                </p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-caption text-muted-foreground">
              {stats?.topUser?.orderCount || 0} solicitações
            </p>
          </Card>

          {/* Average */}
          <Card className="p-6 border divider-line">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-caption text-muted-foreground font-semibold mb-2">MÉDIA POR MÊS</p>
                <p className="text-5xl font-bold text-accent">
                  {chartData.length > 0
                    ? Math.round(
                        (stats?.totalOrders || 0) / chartData.length
                      )
                    : 0}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-caption text-muted-foreground">
              Solicitações por mês
            </p>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-8 border divider-line mb-12">
          <div className="mb-6">
            <h2 className="text-headline">Comparação Mensal</h2>
            <p className="text-body text-muted-foreground">Quantidade de solicitações por mês</p>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="quantidade" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Sem dados disponíveis
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 border divider-line">
            <h3 className="text-title font-semibold mb-4">Gerenciar Ordens</h3>
            <p className="text-body text-muted-foreground mb-6">
              Visualize, atualize status e faça upload de PDFs para todas as solicitações.
            </p>
            <button
              onClick={() => setLocation("/admin/orders")}
              className="bg-accent text-accent-foreground px-6 py-3 font-semibold border border-accent hover:opacity-90 w-full"
            >
              Ir para Ordens
            </button>
          </Card>

          <Card className="p-6 border divider-line">
            <h3 className="text-title font-semibold mb-4">Relatórios</h3>
            <p className="text-body text-muted-foreground mb-6">
              Gere relatórios detalhados sobre as solicitações e atividades do sistema.
            </p>
            <button
              disabled
              className="bg-muted text-muted-foreground px-6 py-3 font-semibold border border-border w-full opacity-50 cursor-not-allowed"
            >
              Em Breve
            </button>
          </Card>
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
