import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, Clock3, Plus, ReceiptText, Wallet, XCircle } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useServices, useWallet } from "@/hooks/useAuth";
import { SERVICE_META, SERVICE_ORDER, type ServiceCode } from "@/lib/services";
import { formatDate, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useProfile(user);
  const { data: wallet } = useWallet(user);
  const { data: services } = useServices();

  const { data: stats } = useQuery({
    queryKey: ["tx-stats", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_transactions")
        .select("status")
        .eq("user_id", user.id);
      if (error) throw error;
      const count = (s: string[]) => data.filter((t) => s.includes(t.status)).length;
      return {
        total: data.length,
        success: count(["SUCCESS"]),
        failed: count(["FAILED"]),
        pending: count(["PENDING", "PROCESSING", "INITIATED"]),
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-tx", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_transactions")
        .select("id, service_type, product_name, amount, status, customer_reference, transaction_reference, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: announcements } = useQuery({
    queryKey: ["announcements", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, created_at")
        .eq("user_id", user.id)
        .eq("type", "announcement")
        .order("created_at", { ascending: false })
        .limit(1);
      return data ?? [];
    },
  });

  const firstName = (profile?.full_name || "").split(" ")[0];

  return (
    <UserLayout user={user} title="Dashboard">
      {/* Wallet hero */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-surface p-6 shadow-elevated sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Wallet balance
            </p>
            <p className="mt-1 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              {wallet ? formatNaira(wallet.balance) : "₦ ——"}
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full", wallet?.status === "active" ? "bg-success" : "bg-warning")} />
              Wallet {wallet?.status ?? "loading"} · {wallet?.currency ?? "NGN"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="hero" size="lg">
              <Link to="/wallet">
                <Plus /> Fund wallet
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/transactions">
                <ReceiptText /> History
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total transactions" value={stats?.total ?? 0} icon={ReceiptText} />
        <StatCard label="Successful" value={stats?.success ?? 0} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock3} tone="warning" />
        <StatCard label="Failed" value={stats?.failed ?? 0} icon={XCircle} tone="destructive" />
      </section>

      {announcements && announcements[0] && (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-gradient-brand-soft p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-glow">Announcement</p>
          <p className="mt-1 font-semibold">{announcements[0].title}</p>
          <p className="text-sm text-muted-foreground">{announcements[0].message}</p>
        </div>
      )}

      {/* Quick services */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Quick services</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICE_ORDER.map((code) => {
            const meta = SERVICE_META[code];
            const svc = services?.find((s) => s.code === code);
            const enabled = svc?.enabled ?? true;
            return (
              <Link
                key={code}
                to={meta.path}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow",
                  !enabled && "opacity-60",
                )}
              >
                <div className="mb-3 inline-flex rounded-xl bg-gradient-brand-soft p-2.5 text-primary-glow ring-1 ring-primary/20">
                  <meta.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold">{meta.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {enabled ? "Available" : "Unavailable"}
                </p>
                <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent transactions</h2>
          <Link to="/transactions" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {recent && recent.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
            <ul className="divide-y divide-border/70">
              {recent.map((t) => {
                const meta = SERVICE_META[t.service_type as ServiceCode];
                return (
                  <li key={t.id} className="flex items-center gap-4 px-4 py-3.5">
                    <div className="rounded-lg bg-secondary p-2 text-primary-glow">
                      <meta.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{t.product_name ?? meta.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.customer_reference} · {formatDate(t.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatNaira(t.amount)}</p>
                      <StatusBadge status={t.status} className="mt-1" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <EmptyState
            title="No transactions yet"
            description="Fund your wallet and buy your first airtime or data bundle — it shows up here instantly."
            action={
              <Button asChild variant="hero">
                <Link to="/wallet">
                  <Wallet /> Fund wallet
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </UserLayout>
  );
}
