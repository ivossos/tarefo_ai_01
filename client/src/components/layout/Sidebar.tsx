import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/use-admin";

type NavItem = {
  icon: string;
  label: string;
  href: string;
};

const mainNavItems: NavItem[] = [
  { icon: "ri-calendar-2-line", label: "Calendário", href: "/dashboard" },
  { icon: "ri-task-line", label: "Lembretes", href: "/reminders" },
  { icon: "ri-message-3-line", label: "Chat", href: "/chat" },
  { icon: "ri-wallet-3-line", label: "Finanças", href: "/finances" },
];

const accountNavItems: NavItem[] = [
  { icon: "ri-user-settings-line", label: "Perfil", href: "/profile" },
  { icon: "ri-vip-crown-line", label: "Assinatura", href: "/subscription" },
  { icon: "ri-settings-4-line", label: "Preferências", href: "/preferences" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { isAdmin } = useIsAdmin();

  return (
    <aside className="bg-white border-r border-neutral-200 w-64 flex-shrink-0 h-full hidden md:flex flex-col shadow-sm z-20">
      <div className="p-4 border-b border-neutral-200 flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
          <i className="ri-robot-fill text-xl"></i>
        </div>
        <h1 className="ml-3 text-xl font-bold text-neutral-800 font-heading truncate">TarefoAI</h1>
      </div>
      
      <nav className="p-2 flex-1 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">Principal</h2>
          {mainNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg font-medium mt-1",
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <i className={cn(item.icon, "mr-3 text-lg")}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">Conta</h2>
          {accountNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg font-medium mt-1",
                location === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <i className={cn(item.icon, "mr-3 text-lg")}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {isAdmin && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">Administração</h2>
            <Link 
              href="/admin" 
              className={cn(
                "flex items-center px-3 py-2 rounded-lg font-medium mt-1",
                location === "/admin" 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <i className="ri-dashboard-line mr-3 text-lg"></i>
              <span>Painel Admin</span>
            </Link>
          </div>
        )}
      </nav>
      
      <div className="p-3 mt-auto">
        <div className="p-3 bg-neutral-100 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center">
              <i className="ri-user-line text-neutral-700"></i>
            </div>
            <div className="ml-2 flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">Usuário</p>
              <p className="text-xs text-neutral-500 truncate">Plano Gratuito</p>
            </div>
            <button className="p-1 text-neutral-400 hover:text-neutral-600">
              <i className="ri-logout-box-r-line"></i>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
