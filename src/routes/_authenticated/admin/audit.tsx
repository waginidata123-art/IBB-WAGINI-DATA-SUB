import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AdminAudit,
});

function AdminAudit() {
  const { data } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      const ids = Array.from(new Set(data.map((l) => l.actor_id).filter(Boolean))) as string[];
      const { data: profiles } = ids.length ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids) : { data: [] };
      return data.map((l) => ({ ...l, actor: profiles?.find((p) => p.user_id === l.actor_id) }));
    },
  });

  return (
    <>
      <PageHeader title="Audit Logs" description="Every administrative action, recorded immutably." />
      {data && data.length > 0 ? (
        <ul className="space-y-2">
          {data.map((l) => (
            <li key={l.id} className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-card">
              <div className="rounded-xl bg-secondary p-2.5 text-primary-glow"><ScrollText className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm"><span className="font-semibold">{l.actor?.full_name || l.actor?.email || "System"}</span> <span className="text-muted-foreground">performed</span> <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">{l.action}</code> <span className="text-muted-foreground">on</span> {l.resource}{l.resource_id && <span className="font-mono text-xs text-muted-foreground"> · {l.resource_id.slice(0, 8)}</span>}</p>
                {Object.keys(l.metadata as object).length > 0 && <pre className="mt-1.5 max-h-24 overflow-auto rounded-lg bg-background p-2 font-mono text-[11px] text-muted-foreground">{JSON.stringify(l.metadata)}</pre>}
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(l.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : <EmptyState title="No admin actions yet" description="Actions like price changes, service toggles and user suspensions will be listed here." />}
    </>
  );
}
