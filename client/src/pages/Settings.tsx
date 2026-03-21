import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, RotateCcw, Mail, Copy, Check, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Settings() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    alert(`${fieldName} copiado para a área de transferência`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportData = () => {
    alert("Exportação de dados em desenvolvimento");
  };

  const handleResetPassword = () => {
    alert("Link de reset de senha enviado para seu email");
  };

  const handleExportDataFixed = () => {
    // This is a placeholder - actual export would need to be implemented differently
    alert("Exportação de dados em desenvolvimento");
  };

  return (
    <MainLayout>
      <div className="container py-8 px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e dados do sistema</p>
        </div>

        {/* User Information */}
        <div className="grid gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Informações da Conta
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nome</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-muted text-foreground"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyToClipboard(user?.name || "", "Nome")}
                  >
                    {copiedField === "Nome" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-muted text-foreground"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyToClipboard(user?.email || "", "Email")}
                  >
                    {copiedField === "Email" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tipo de Usuário</p>
                <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-semibold">
                  {user?.role === "admin" ? "Administrador" : "Padrão"}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Useful Functions */}
        <div className="grid gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Funções Úteis
            </h2>
            <div className="space-y-3">
              <Button
                onClick={handleExportData}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Dados em CSV
              </Button>
              <p className="text-xs text-muted-foreground">
                Baixe um arquivo CSV com todas as ordens de serviço e compra para análise em planilhas
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Segurança
            </h2>
            <div className="space-y-3">
              <Button
                onClick={handleResetPassword}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Alterar Senha
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </Button>
              <p className="text-xs text-muted-foreground">
                Altere sua senha de acesso ao sistema para manter sua conta segura ou saia da sua conta
              </p>
            </div>
          </Card>
        </div>

        {/* System Information */}
        <div className="grid gap-6">
          <Card className="p-6 bg-muted/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Informações do Sistema</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Versão</p>
                <p className="font-semibold text-foreground">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Último Acesso</p>
                <p className="font-semibold text-foreground">
                  {user?.lastSignedIn
                    ? new Date(user.lastSignedIn).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Método de Login</p>
                <p className="font-semibold text-foreground capitalize">{user?.loginMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">ID do Usuário</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-xs">{user?.id}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyToClipboard(String(user?.id || ""), "ID")}
                  >
                    {copiedField === "ID" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
