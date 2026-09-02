import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Layers,
  Package,
  ReceiptText,
  Plug,
  Settings,
  ScrollText,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { useProfile } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", {
      _user_id: context.user.id,
      _role: "admin",
    });
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

const nav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Services", to: "/admin/services", icon: Layers },
  { label: "Products & Pricing", to: "/admin/products", icon: Package },
  { label: "Transactions", to: "/admin/transactions", icon: ReceiptText },
  { label: "Wallets & Payments", to: "/admin/wallets", icon: Wallet },
  { label: "API Providers", to: "/admin/providers", icon: Plug },
  { label: "Settings", to: "/admin/settings", icon: Settings },
  { label: "Audit Logs", to: "/admin/audit", icon: ScrollText },
];

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useProfile(user);
  return (
    <AppShell
      nav={nav}
      title="Admin Console"
      variant="admin"
      userName={profile?.full_name || ""}
      userEmail={user.email ?? ""}
    >
      <Outlet />
    </AppShell>
  );
}
