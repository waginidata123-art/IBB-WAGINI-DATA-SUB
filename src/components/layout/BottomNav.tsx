import { Link, useRouterState } from "@tanstack/react-router";
import { Grid2x2, History, Home, UserRound, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Wallet", to: "/wallet", icon: Wallet },
  { label: "Services", to: "/services", icon: Grid2x2 },
  { label: "History", to: "/transactions", icon: History },
  { label: "Profile", to: "/profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border glass pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-primary")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
