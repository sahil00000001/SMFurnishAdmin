import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: "fas fa-chart-bar",
  },
  {
    path: "/orders",
    label: "Orders",
    icon: "fas fa-receipt",
  },
  {
    path: "/products",
    label: "Products",
    icon: "fas fa-box",
  },
  {
    path: "/categories",
    label: "Categories",
    icon: "fas fa-tags",
  },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left px-3 py-2 text-sm font-medium transition-colors",
                location === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => setLocation(item.path)}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <i className={`${item.icon} mr-3`}></i>
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
