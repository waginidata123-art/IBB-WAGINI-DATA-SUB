import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Menu, ShieldCheck, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/format";
import { ThemeToggle } from "@/components/theme/theme";
import { BottomNav } from "@/components/layout/BottomNav";

export type NavItem = { label: string; to: string; icon: LucideIcon; badge?: number | undefined };

export function AppShell({
  nav,
  children,
  title,
  userName,
  userEmail,
  isAdmin,
  walletBalance,
  unread = 0,
  variant = "user",
}: {
  nav: NavItem[];
  children: React.ReactNode;
  title: string;
  userName: string;
  userEmail: string;
  isAdmin?: boolean | undefined;
  walletBalance?: number | undefined;
  unread?: number | undefined;
  variant?: "user" | "admin" | undefined;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const initials =
    userName
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo size="sm" />
        </Link>
      </div>
      {variant === "admin" && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-gradient-brand-soft px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-glow ring-1 ring-primary/30">
          <ShieldCheck className="h-3.5 w-3.5" /> Super Admin
        </div>
      )}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active =
            pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to + "/"));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--primary)]"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon
                className={cn("h-4.5 w-4.5", active ? "text-primary-glow" : "text-muted-foreground group-hover:text-foreground")}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        {isAdmin && variant === "user" && (
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="mb-2 flex items-center gap-2 rounded-lg bg-gradient-brand px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            <ShieldCheck className="h-4 w-4" /> Open Admin Console
          </Link>
        )}
        {variant === "admin" && (
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="mb-2 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            Back to user dashboard
          </Link>
        )}
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-9 w-9 ring-1 ring-primary/30">
            <AvatarFallback className="bg-gradient-brand text-xs font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{userName || "Account"}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        {Sidebar}
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 glass px-4 sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {Sidebar}
            </SheetContent>
          </Sheet>
          <h2 className="font-display text-base font-bold text-foreground sm:text-lg">{title}</h2>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            {walletBalance !== undefined && (
              <Link
                to="/wallet"
                className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-semibold sm:flex"
              >
                <span className="h-2 w-2 rounded-full bg-success" />
                {formatNaira(walletBalance)}
              </Link>
            )}
            <Link
              to="/notifications"
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
              )}
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>
      {variant === "user" && <BottomNav />}
    </div>
  );
}
