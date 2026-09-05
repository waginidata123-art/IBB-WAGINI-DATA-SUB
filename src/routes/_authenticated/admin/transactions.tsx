import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_META, SERVICE_ORDER, type ServiceCode } from "@/lib/services";
import { formatDate, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/transactions")({
  component: AdminTransactions,
});

const PAGE = 25;
const STATUSES = ["ALL", "SUCCESS", "PENDING", "FAILED", "REVERSED", "REFUNDED"];

function AdminTransactions() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [service, setService] = useState<"ALL" | ServiceCode>("ALL");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Tables<"service_transactions"> | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-tx", q, status, service, page],
    queryFn: async () => {
      let query = supabase.from("service_transactions").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
      if (status === "PENDING") query = query.in("status", ["PENDING", "PROCESSING", "INITIATED"]);
      else if (status !== "ALL") query = query.eq("status", status as never);
      if (service !== "ALL") query = query.eq("service_type", service);
      if (q.trim()) query = query.or(`transaction_reference.ilike.%${q.trim()}%,customer_reference.ilike.%${q.trim()}%,provider_reference.ilike.%${q.trim()}%`);
      const { data, error, count } = await query;
      if (error) throw error;
      const ids = Array.from(new Set(data.map((t) => t.user_id)));
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids);
      return { count: count ?? 0, rows: data.map((t) => ({ ...t, profile: profiles?.find((p) => p.user_id === t.user_id) })) };
    },
  });
  const pages = Math.ceil((data?.count ?? 0) / PAGE);

  return (
    <>
      <PageHeader title="Transactions" description="Search, filter and inspect every service transaction. Reconciliation and refund actions arrive with the transaction engine." />
      <div className="mb-3 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Transaction ref, provider ref, phone, meter…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => { setStatus(s); setPage(0); }} className={cn("rounded-full px-3 py-1 text-xs font-bold ring-1", status === s ? "bg-primary text-primary-foreground ring-primary" : "bg-secondary text-muted-foreground ring-border")}>{s}</button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["ALL", ...SERVICE_ORDER] as const).map((c) => (
          <button key={c} type="button" onClick={() => { setService(c); setPage(0); }} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold ring-1", service === c ? "bg-secondary text-foreground ring-primary/50" : "text-muted-foreground ring-border")}>{c === "ALL" ? "All services" : SERVICE_META[c].label}</button>
        ))}
      </div>

      {data && data.rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-card">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Profit</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {data.rows.map((t) => {
                const meta = SERVICE_META[t.service_type as ServiceCode];
                return (
                  <tr key={t.id} className="cursor-pointer hover:bg-secondary/30" onClick={() => setSelected(t)}>
                    <td className="px-4 py-3 font-mono text-xs">{t.transaction_reference}</td>
                    <td className="px-4 py-3"><p className="font-semibold">{t.profile?.full_name || "—"}</p><p className="text-xs text-muted-foreground">{t.profile?.email}</p></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><meta.icon className="h-4 w-4 text-primary-glow" />{t.product_name ?? meta.label}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{t.customer_reference}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatNaira(t.amount)}</td>
                    <td className="px-4 py-3 text-right text-success">{formatNaira(t.profit)}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(t.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No transactions match" description="Transactions will appear here as soon as users start purchasing." />
      )}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page + 1} of {pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Transaction details</DialogTitle></DialogHeader>
          {selected && (
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              {[
                ["Reference", selected.transaction_reference],
                ["Provider ref", selected.provider_reference ?? "—"],
                ["Provider", selected.provider],
                ["Service", selected.service_type],
                ["Product", selected.product_name ?? "—"],
                ["Customer", selected.customer_reference ?? "—"],
                ["Amount", formatNaira(selected.amount)],
                ["Cost", formatNaira(selected.cost)],
                ["Profit", formatNaira(selected.profit)],
                ["Failure reason", selected.failure_reason ?? "—"],
                ["Created", formatDate(selected.created_at)],
                ["Updated", formatDate(selected.updated_at)],
              ].map(([k, v]) => (
                <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="col-span-2 break-all font-medium">{v}</dd></div>
              ))}
              <div className="contents"><dt className="text-muted-foreground">Status</dt><dd className="col-span-2"><StatusBadge status={selected.status} /></dd></div>
            </dl>
          )}
          <p className="text-xs text-muted-foreground">Raw provider responses are kept server-side and are not shown here.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
