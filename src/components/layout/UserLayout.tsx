import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  Bell,
  LifeBuoy,
  UserRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { AppShell, type NavItem } from "./AppShell";
import { useProfile, useRoles, useWallet } from "@/hooks/useAuth";
import { SERVICE_META, SERVICE_ORDER } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";

export function UserLayout({
  user,
  title,
  children,
}: {
  user: User;
  title: string;
  children: React.ReactNode;
}) {
  const { data: profile } = useProfile(user);
  const { data: roles } = useRoles(user);
  const { data: wallet } = useWallet(user);
  const { data: unread } = useQuery({
    queryKey: ["unread", user.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      return count ?? 0;
    },
  });

  const nav: NavItem[] = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    ...SERVICE_ORDER.map((c) => ({
      label: SERVICE_META[c].label,
      to: SERVICE_META[c].path,
      icon: SERVICE_META[c].icon,
    })),
    { label: "Wallet", to: "/wallet", icon: Wallet },
    { label: "Transactions", to: "/transactions", icon: ReceiptText },
    { label: "Notifications", to: "/notifications", icon: Bell, badge: unread || undefined },
    { label: "Support", to: "/support", icon: LifeBuoy },
    { label: "Profile", to: "/profile", icon: UserRound },
  ];

  return (
    <AppShell
      nav={nav}
      title={title}
      userName={profile?.full_name || user.user_metadata?.full_name || ""}
      userEmail={user.email ?? ""}
      isAdmin={roles?.includes("admin")}
      walletBalance={wallet ? Number(wallet.balance) : undefined}
      unread={unread ?? 0}
    >
      {children}
    </AppShell>
  );
}
