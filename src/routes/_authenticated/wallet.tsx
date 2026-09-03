import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Building2, CreditCard, Landmark } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader, EmptyState } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/hooks/useAuth";
import { formatDate, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/wallet")({
  component: WalletPage,
});

function WalletPage() {
  const { user } = Route.useRouteContext();
  const { data: wallet } = useWallet(user);

  const { data: ledger } = useQuery({
    queryKey: ["ledger", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: funding } = useQuery({
    queryKey: ["funding", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const gateways = [
    { name: "Monnify", icon: Landmark, desc: "Bank transfer, card & USSD" },
    { name: "Flutterwave", icon: CreditCard, desc: "Card, transfer & mobile money" },
    { name: "PalmPay", icon: Building2, desc: "Where available" },
  ];

  return (
    <UserLayout user={user} title="Wallet">
      <PageHeader title="Wallet" description="Fund your wallet and track every credit, debit and refund." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-primary/25 bg-gradient-surface p-6 shadow-elevated lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Available balance</p>
          <p className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {wallet ? formatNaira(wallet.balance) : "₦ ——"}
          </p>
          <p className="mt-6 text-sm font-semibold">Fund with</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {gateways.map((g) => (
              <button
                key={g.name}
                type="button"
                disabled
                className="rounded-2xl border border-border/70 bg-card p-4 text-left opacity-80 transition-all hover:border-primary/40 disabled:cursor-not-allowed"
              >
                <g.icon className="h-5 w-5 text-primary-glow" />
                <p className="mt-2 font-semibold">{g.name}</p>
                <p className="text-xs text-muted-foreground">{g.desc}</p>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Payment gateways are activated in Phase 2 once live credentials are configured by the admin.
            Wallet credits happen only after server-side payment verification.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
          <p className="font-display font-bold">Funding history</p>
          {funding && funding.length > 0 ? (
            <ul className="mt-3 divide-y divide-border/70">
              {funding.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-semibold capitalize">{f.gateway}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(f.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNaira(f.amount)}</p>
                    <StatusBadge status={f.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No funding yet.</p>
          )}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold">Wallet ledger</h2>
        {ledger && ledger.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Balance after</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {ledger.map((l) => {
                  const debit = l.type === "DEBIT";
                  return (
                    <tr key={l.id}>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1.5 font-semibold", debit ? "text-destructive" : "text-success")}>
                          {debit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                          {l.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{l.description}</td>
                      <td className={cn("px-4 py-3 text-right font-bold", debit ? "text-destructive" : "text-success")}>
                        {debit ? "-" : "+"}
                        {formatNaira(l.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">{formatNaira(l.new_balance)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.reference}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(l.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Your ledger is empty"
            description="Every credit, debit, refund and reversal will be recorded here with its balance snapshot."
            action={<Button variant="hero" disabled>Fund wallet</Button>}
          />
        )}
      </section>
    </UserLayout>
  );
}
