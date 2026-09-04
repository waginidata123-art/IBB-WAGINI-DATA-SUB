import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, BadgeDollarSign, CheckCircle2, Clock3, TrendingUp, Users, Wallet, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatNaira, formatNumber } from "@/lib/format";
import { SERVICE_META, SERVICE_ORDER, type ServiceCode } from "@/lib/services";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      const [users, active, tx, payments, recent] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("service_transactions").select("status, amount, profit, service_type, created_at").gte("created_at", since),
        supabase.from("payment_transactions").select("amount").eq("status", "SUCCESS").gte("created_at", since),
        supabase.from("service_transactions").select("id, service_type, product_name, amount, status, created_at, customer_reference").order("created_at", { ascending: false }).limit(8),
      ]);
      const rows = tx.data ?? [];
      const sum = (arr: { amount: number }[]) => arr.reduce((a, b) => a + Number(b.amount), 0);
      const success = rows.filter((r) => r.status === "SUCCESS");
      const perDay: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) perDay[new Date(Date.now() - i * 864e5).toISOString().slice(5, 10)] = 0;
      success.forEach((r) => { const k = r.created_at.slice(5, 10); if (k in perDay) perDay[k] = (perDay[k] ?? 0) + Number(r.amount); });
      const usage = SERVICE_ORDER.map((c) => ({ code: c, count: rows.filter((r) => r.service_type === c).length }));
      return {
        users: users.count ?? 0,
        active: active.count ?? 0,
        total: rows.length,
        success: success.length,
        failed: rows.filter((r) => r.status === "FAILED").length,
        pending: rows.filter((r) => ["PENDING", "PROCESSING", "INITIATED"].includes(r.status)).length,
        sales: sum(success),
        profit: success.reduce((a, b) => a + Number(b.profit), 0),
        funding: sum(payments.data ?? []),
        today: rows.filter((r) => r.created_at >= todayStart).length,
        chart: Object.entries(perDay).map(([day, amount]) => ({ day, amount })),
        usage,
        recent: recent.data ?? [],
      };
    },
  });

  return (
    <>
      <PageHeader title="Overview" description="Platform performance for the last 30 days." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={formatNumber(data?.users ?? 0)} icon={Users} hint={`${data?.active ?? 0} active`} />
        <StatCard label="Total sales" value={formatNaira(data?.sales ?? 0)} icon={BadgeDollarSign} tone="success" />
        <StatCard label="Profit" value={formatNaira(data?.profit ?? 0)} icon={TrendingUp} tone="info" />
        <StatCard label="Wallet funding" value={formatNaira(data?.funding ?? 0)} icon={Wallet} />
        <StatCard label="Transactions" value={formatNumber(data?.total ?? 0)} icon={Activity} hint={`${data?.today ?? 0} today`} />
        <StatCard label="Successful" value={formatNumber(data?.success ?? 0)} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={formatNumber(data?.pending ?? 0)} icon={Clock3} tone="warning" />
        <StatCard label="Failed" value={formatNumber(data?.failed ?? 0)} icon={XCircle} tone="destructive" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card lg:col-span-2">
          <p className="font-display font-bold">Sales — last 14 days</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chart ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `₦${Math.round(v / 1000)}k`} />
                <Tooltip cursor={{ fill: "var(--secondary)" }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} formatter={(v) => formatNaira(Number(v))} />
                <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
          <p className="font-display font-bold">Service usage</p>
          <ul className="mt-4 space-y-3">
            {(data?.usage ?? []).map((u) => {
              const meta = SERVICE_META[u.code];
              const pct = data?.total ? Math.round((u.count / data.total) * 100) : 0;
              return (
                <li key={u.code}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium"><meta.icon className="h-4 w-4 text-primary-glow" />{meta.label}</span>
                    <span className="text-muted-foreground">{u.count} · {pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="border-b border-border/70 px-5 py-4 font-display font-bold">Latest transactions</div>
        {data && data.recent.length > 0 ? (
          <ul className="divide-y divide-border/70">
            {data.recent.map((t) => {
              const meta = SERVICE_META[t.service_type as ServiceCode];
              return (
                <li key={t.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <meta.icon className="h-4 w-4 text-primary-glow" />
                  <div className="min-w-0 flex-1"><p className="font-semibold">{t.product_name ?? meta.label}</p><p className="text-xs text-muted-foreground">{t.customer_reference} · {formatDate(t.created_at)}</p></div>
                  <span className="font-bold">{formatNaira(t.amount)}</span>
                  <StatusBadge status={t.status} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
        )}
      </div>
    </>
  );
}
