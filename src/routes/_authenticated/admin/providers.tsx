import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Plug } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pill } from "@/components/shared/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { logAdminAction } from "@/lib/audit";
import { SERVICE_META, type ServiceCode } from "@/lib/services";

export const Route = createFileRoute("/_authenticated/admin/providers")({
  component: AdminProviders,
});

function AdminProviders() {
  const { user: admin } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: providers } = useQuery({
    queryKey: ["admin-providers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("api_providers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { status?: "active" | "suspended" | "pending"; mode?: string } }) => {
      const { error } = await supabase.from("api_providers").update(patch).eq("id", id);
      if (error) throw error;
      await logAdminAction(admin.id, "provider.updated", "api_providers", id, patch);
    },
    onSuccess: () => { toast.success("Provider updated"); qc.invalidateQueries({ queryKey: ["admin-providers"] }); },
    onError: () => toast.error("Update failed"),
  });

  return (
    <>
      <PageHeader title="API Providers" description="Provider status, environment and health. Secret credentials are stored as server secrets and never shown here." />
      <div className="grid gap-4 md:grid-cols-2">
        {providers?.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-brand-soft p-2.5 text-primary-glow ring-1 ring-primary/20"><Plug className="h-5 w-5" /></div>
                <div>
                  <p className="font-display font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{(p.configuration as { type?: string })?.type === "payment_gateway" ? "Payment gateway" : (p.configuration as { type?: string })?.type === "sms" ? "SMS provider" : "VTU provider"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone={p.status === "active" ? "success" : p.status === "pending" ? "warning" : "destructive"}>{p.status}</Pill>
                <Switch checked={p.status === "active"} onCheckedChange={(v) => update.mutate({ id: p.id, patch: { status: v ? "active" : "suspended" } })} />
              </div>
            </div>

            {p.service_types.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.service_types.map((s) => <Pill key={s} tone="info">{SERVICE_META[s as ServiceCode]?.label ?? s}</Pill>)}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Meta k="Environment"><span className="flex items-center gap-2">
                <Pill tone={p.mode === "live" ? "success" : "warning"}>{p.mode}</Pill>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => update.mutate({ id: p.id, patch: { mode: p.mode === "live" ? "sandbox" : "live" } })}>Switch</Button>
              </span></Meta>
              <Meta k="Errors">{p.error_count}</Meta>
              <Meta k="Last success">{p.last_success_at ? formatDate(p.last_success_at) : "—"}</Meta>
              <Meta k="Last failure">{p.last_failure_at ? formatDate(p.last_failure_at) : "—"}</Meta>
              <Meta k="Response time">{p.last_response_ms ? `${p.last_response_ms} ms` : "—"}</Meta>
            </div>

            <div className="mt-4 rounded-xl border border-border/70 bg-secondary/40 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><KeyRound className="h-3.5 w-3.5" /> Required secrets</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.secret_env_keys.map((k) => <code key={k} className="rounded bg-background px-2 py-0.5 font-mono text-[11px]">{k}</code>)}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Add these in the project's secure secrets store. Values are read only by server code.</p>
            </div>
            <Button variant="outline" size="sm" className="mt-4" disabled>Test connection (available with adapters)</Button>
          </div>
        ))}
      </div>
    </>
  );
}

function Meta({ k, children }: { k: string; children: React.ReactNode }) {
  return <div><p className="text-muted-foreground">{k}</p><p className="mt-0.5 font-semibold text-foreground">{children}</p></div>;
}
