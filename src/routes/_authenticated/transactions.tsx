import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader, EmptyState } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_META, SERVICE_ORDER, type ServiceCode } from "@/lib/services";
import { formatDate, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
});

const PAGE = 20;
const STATUSES = ["ALL", "SUCCESS", "PENDING", "FAILED", "REVERSED", "REFUNDED"];

function TransactionsPage() {
  const { user } = Route.useRouteContext();
  const [status, setStatus] = useState("ALL");
  const [service, setService] = useState<"ALL" | ServiceCode>("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", user.id, status, service, q, page],
    queryFn: async () => {
      let query = supabase
        .from("service_transactions")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(page * PAGE, page * PAGE + PAGE - 1);
      if (status !== "ALL") {
        query = status === "PENDING" ? query.in("status", ["PENDING", "PROCESSING", "INITIATED"]) : query.eq("status", status as never);
      }
      if (service !== "ALL") query = query.eq("service_type", service);
      if (q.trim()) query = query.or(`transaction_reference.ilike.%${q.trim()}%,customer_reference.ilike.%${q.trim()}%`);
      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });

  const pages = Math.ceil((data?.count ?? 0) / PAGE);

  return (
    <UserLayout user={user} title="Transactions">
      <PageHeader title="Transactions" description="Search and filter every service purchase you've made." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search reference or phone / meter / smartcard" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => { setStatus(s); setPage(0); }}
              className={cn("rounded-full px-3 py-1 text-xs font-bold ring-1 transition-colors", status === s ? "bg-primary text-primary-foreground ring-primary" : "bg-secondary text-muted-foreground ring-border hover:text-foreground")}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip active={service === "ALL"} onClick={() => setService("ALL")}>All services</FilterChip>
        {SERVICE_ORDER.map((c) => (
          <FilterChip key={c} active={service === c} onClick={() => { setService(c); setPage(0); }}>{SERVICE_META[c].label}</FilterChip>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-card" />
      ) : data && data.rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {data.rows.map((t) => {
                  const meta = SERVICE_META[t.service_type as ServiceCode];
                  return (
                    <tr key={t.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-semibold"><meta.icon className="h-4 w-4 text-primary-glow" />{meta.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.product_name}</p>
                        <p className="text-xs text-muted-foreground">{t.customer_reference}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.transaction_reference}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatNaira(t.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(t.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {page + 1} of {pages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState title="No transactions found" description="Try a different filter, or make your first purchase." />
      )}
    </UserLayout>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition-colors", active ? "bg-secondary text-foreground ring-primary/50" : "text-muted-foreground ring-border hover:text-foreground")}>
      {children}
    </button>
  );
}
