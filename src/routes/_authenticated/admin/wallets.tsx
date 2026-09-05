import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Wallet, ArrowDownToLine, Landmark } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/wallets")({
  component: AdminWallets,
});

function AdminWallets() {
  const [tab, setTab] = useState<"ledger" | "payments">("ledger");
  const { data } = useQuery({
    queryKey: ["admin-wallets"],
    queryFn: async () => {
      const [wallets, ledger, payments] = await Promise.all([
        supabase.from("wallets").select("balance"),
        supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("payment_transactions").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      const ids = Array.from(new Set([...(ledger.data ?? []).map((l) => l.user_id), ...(payments.data ?? []).map((p) => p.user_id)]));
      const { data: profiles } = ids.length ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids) : { data: [] };
      const who = (id: string) => profiles?.find((p) => p.user_id === id);
      return {
        totalBalance: (wallets.data ?? []).reduce((a, w) => a + Number(w.balance), 0),
        walletCount: wallets.data?.length ?? 0,
        fundingTotal: (payments.data ?? []).filter((p) => p.status === "SUCCESS").reduce((a, p) => a + Number(p.amount), 0),
        ledger: (ledger.data ?? []).map((l) => ({ ...l, who: who(l.user_id) })),
        payments: (payments.data ?? []).map((p) => ({ ...p, who: who(p.user_id) })),
      };
    },
  });

  return (
    <>
      <PageHeader title="Wallets & Payments" description="Platform liability, wallet ledger and gateway funding records." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total wallet balance" value={formatNaira(data?.totalBalance ?? 0)} icon={Wallet} hint={`${data?.walletCount ?? 0} wallets`} />
        <StatCard label="Verified funding" value={formatNaira(data?.fundingTotal ?? 0)} icon={ArrowDownToLine} tone="success" />
        <StatCard label="Gateways" value="Monnify · Flutterwave" icon={Landmark} tone="info" hint="Configure under API Providers" />
      </div>
      <div className="mt-6 mb-3 flex gap-1.5">
        {(["ledger", "payments"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ring-1", tab === t ? "bg-secondary text-foreground ring-primary/50" : "text-muted-foreground ring-border")}>{t === "ledger" ? "Wallet ledger" : "Gateway payments"}</button>
        ))}
      </div>
      {tab === "ledger" ? (
        data && data.ledger.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-card">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Before</th><th className="px-4 py-3 text-right">After</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Date</th></tr></thead>
              <tbody className="divide-y divide-border/70">
                {data.ledger.map((l) => (
                  <tr key={l.id}><td className="px-4 py-3"><p className="font-semibold">{l.who?.full_name || "—"}</p><p className="text-xs text-muted-foreground">{l.who?.email}</p></td><td className={cn("px-4 py-3 font-semibold", l.type === "DEBIT" ? "text-destructive" : "text-success")}>{l.type}</td><td className="px-4 py-3 text-right font-bold">{formatNaira(l.amount)}</td><td className="px-4 py-3 text-right text-muted-foreground">{formatNaira(l.previous_balance)}</td><td className="px-4 py-3 text-right">{formatNaira(l.new_balance)}</td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.reference}</td><td className="px-4 py-3 text-muted-foreground">{formatDate(l.created_at)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No wallet movements yet" />
      ) : data && data.payments.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Gateway</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Payment ref</th><th className="px-4 py-3">Gateway ref</th><th className="px-4 py-3">Credited</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr></thead>
            <tbody className="divide-y divide-border/70">
              {data.payments.map((p) => (
                <tr key={p.id}><td className="px-4 py-3"><p className="font-semibold">{p.who?.full_name || "—"}</p><p className="text-xs text-muted-foreground">{p.who?.email}</p></td><td className="px-4 py-3 capitalize">{p.gateway}</td><td className="px-4 py-3 text-right font-bold">{formatNaira(p.amount)}</td><td className="px-4 py-3 font-mono text-xs">{p.payment_reference}</td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.gateway_reference ?? "—"}</td><td className="px-4 py-3">{p.credited ? "Yes" : "No"}</td><td className="px-4 py-3"><StatusBadge status={p.status} /></td><td className="px-4 py-3 text-muted-foreground">{formatDate(p.created_at)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="No gateway payments yet" description="Funding records appear once a payment gateway is connected." />}
    </>
  );
}
