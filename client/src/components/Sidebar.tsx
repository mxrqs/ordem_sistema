import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  ChevronDown,
  Home,
  FileText,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  children?: MenuItemProps[];
  expanded?: boolean;
  onToggle?: () => void;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    orders: false,
    admin: false,
  });

  const toggleMenu = (key: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const menuItems: MenuItemProps[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      href: user?.role === "admin" ? "/admin/dashboard" : "/orders",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Ordens",
      children: [
        { icon: <FileText className="w-4 h-4" />, label: "Minhas Solicitações", href: "/orders" },
        ...(user?.role === "admin"
          ? [{ icon: <FileText className="w-4 h-4" />, label: "Todas as Ordens", href: "/admin/orders" }]
          : []),
      ],
    },
    {
      icon: <CheckSquare className="w-5 h-5" />,
      label: "Checklist",
      href: "/checklist",
    },
    ...(user?.role === "admin"
      ? [
          {
            icon: <BarChart3 className="w-5 h-5" />,
            label: "Administração",
            children: [
              { icon: <BarChart3 className="w-4 h-4" />, label: "Dashboard", href: "/admin/dashboard" },
              { icon: <Users className="w-4 h-4" />, label: "Gerenciar Ordens", href: "/admin/orders" },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-accent text-accent-foreground p-2 rounded"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-background border-r divider-line transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0 md:w-64"
        } overflow-hidden md:w-64`}
      >
        <div className="p-6 border-b divider-line">
          <div className="flex items-center gap-3">
            <div className="accent-square"></div>
            <div>
              <h1 className="text-title font-bold">Ordens</h1>
              <p className="text-caption text-muted-foreground">Sistema</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b divider-line">
          <p className="text-caption text-muted-foreground font-semibold">USUÁRIO</p>
          <p className="text-body font-semibold truncate">{user?.name || "Usuário"}</p>
          <p className="text-caption text-muted-foreground">{user?.email}</p>
          <div className="mt-2 inline-block bg-muted px-2 py-1 rounded text-xs font-semibold">
            {user?.role === "admin" ? "Administrador" : "Padrão"}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.href ? (
                <button
                  onClick={() => {
                    setLocation(item.href!);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-body font-semibold text-foreground hover:bg-muted transition-colors rounded"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.label.toLowerCase())}
                    className="w-full flex items-center justify-between px-4 py-3 text-body font-semibold text-foreground hover:bg-muted transition-colors rounded"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedMenus[item.label.toLowerCase()] ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Submenu */}
                  {expandedMenus[item.label.toLowerCase()] && item.children && (
                    <div className="mt-2 ml-4 space-y-1 border-l-2 border-border pl-4">
                      {item.children.map((child, childIndex) => (
                        <button
                          key={childIndex}
                          onClick={() => {
                            setLocation(child.href!);
                            setSidebarOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-caption font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded"
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t divider-line">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted text-foreground font-semibold hover:bg-accent hover:text-accent-foreground transition-colors rounded"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}
