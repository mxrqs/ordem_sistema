import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  Home,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Wrench,
  ShoppingCart,
  ClipboardList,
  FileText,
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-primary text-primary-foreground p-2 rounded-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-border transition-all duration-300 z-40 overflow-y-auto flex flex-col ${
          sidebarOpen ? "w-64" : "w-0 md:w-64"
        } md:w-64`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              OC
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Order Control</h1>
              <p className="text-xs text-muted-foreground">Solicitações e checklist</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Usuário
          </p>
          <p className="text-sm font-semibold text-foreground truncate">{user?.name || "Usuário"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <div className="mt-3 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
            {user?.role === "admin" ? "Administrador" : "Padrão"}
          </div>
        </div>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Dashboard */}
          <button
            onClick={() => {
              setLocation(user?.role === "admin" ? "/admin/dashboard" : "/my-orders");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive(user?.role === "admin" ? "/admin/dashboard" : "/my-orders")
                ? "bg-blue-50 text-primary"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          {/* Solicitações Section */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
              Solicitações
            </p>

            {/* Ordem de Serviço */}
            <button
              onClick={() => {
                setLocation("/form/os");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/form/os")
                  ? "bg-blue-50 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Wrench className="w-5 h-5 text-blue-500" />
              <span>Ordem de Serviço</span>
            </button>

            {/* Ordem de Compra */}
            <button
              onClick={() => {
                setLocation("/form/oc");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/form/oc")
                  ? "bg-blue-50 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <ShoppingCart className="w-5 h-5 text-purple-500" />
              <span>Ordem de Compra</span>
            </button>

            {/* Minhas Solicitações */}
            <button
              onClick={() => {
                setLocation("/my-orders");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/my-orders")
                  ? "bg-blue-50 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <ClipboardList className="w-5 h-5 text-green-500" />
              <span>Minhas Solicitações</span>
            </button>
          </div>

          {/* Gestão Section */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
              Gestão
            </p>

            {/* Checklist */}
            <button
              onClick={() => {
                setLocation("/checklist");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/checklist")
                  ? "bg-blue-50 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span>Checklist</span>
            </button>

            {/* Usuários */}
            <button
              onClick={() => {
                setLocation("/users");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/users")
                  ? "bg-blue-50 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Users className="w-5 h-5 text-orange-500" />
              <span>Usuários</span>
            </button>
          </div>

          {/* Administração Section - Only for Admins */}
          {user?.role === "admin" && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
                Administração
              </p>

              {/* Dashboard Admin */}
              <button
                onClick={() => {
                  setLocation("/admin/dashboard");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin/dashboard")
                    ? "bg-blue-50 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <span>Dashboard</span>
              </button>

              {/* Gerenciar Ordens */}
              <button
                onClick={() => {
                  setLocation("/admin/orders");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin/orders")
                    ? "bg-blue-50 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <FileText className="w-5 h-5 text-red-500" />
                <span>Gerenciar Ordens</span>
              </button>

              {/* Relatórios */}
              <button
                onClick={() => {
                  setLocation("/admin/reports");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin/reports")
                    ? "bg-blue-50 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <BarChart3 className="w-5 h-5 text-teal-500" />
                <span>Relatórios</span>
              </button>

              {/* Configurações */}
              <button
                onClick={() => {
                  setLocation("/admin/settings");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin/settings")
                    ? "bg-blue-50 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Configurações</span>
              </button>
            </div>
          )}
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-t border-border bg-white flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted text-foreground font-semibold hover:bg-red-100 hover:text-red-600 transition-colors rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}
