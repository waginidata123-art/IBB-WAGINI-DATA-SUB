import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pill } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useAuth";
import { SERVICE_META, type ServiceCode } from "@/lib/services";
import { logAdminAction } from "@/lib/audit";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: AdminServices,
});

function AdminServices() {
  const { data: services } = useServices();
  return (
    <>
      <PageHeader title="Services" description="Enable, disable and configure each service module independently. Changes apply to users immediately." />
      <div className="grid gap-4 md:grid-cols-2">
        {services?.map((s) => <ServiceCard key={s.id} service={s} />)}
      </div>
    </>
  );
}

function ServiceCard({ service: s }: { service: Tables<"services"> }) {
  const { user: admin } = Route.useRouteContext();
  const qc = useQueryClient();
  const meta = SERVICE_META[s.code as ServiceCode];
  const [form, setForm] = useState({
    min_amount: String(s.min_amount), max_amount: String(s.max_amount), service_charge: String(s.service_charge),
    provider: s.provider, maintenance_message: s.maintenance_message ?? "",
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<Tables<"services">>) => {
      const { error } = await supabase.from("services").update(patch).eq("id", s.id);
      if (error) throw error;
      await logAdminAction(admin.id, "service.updated", "services", s.id, { code: s.code, ...patch });
    },
    onSuccess: () => { toast.success(`${s.name} updated`); qc.invalidateQueries({ queryKey: ["services"] }); },
    onError: () => toast.error("Update failed"),
  });

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-brand-soft p-2.5 text-primary-glow ring-1 ring-primary/20"><meta.icon className="h-5 w-5" /></div>
          <div><p className="font-display font-bold">{s.name}</p><p className="text-xs text-muted-foreground">{s.description}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={s.enabled ? "success" : "destructive"}>{s.enabled ? "Enabled" : "Disabled"}</Pill>
          <Switch checked={s.enabled} onCheckedChange={(v) => update.mutate({ enabled: v })} aria-label={`Toggle ${s.name}`} />
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); update.mutate({ min_amount: Number(form.min_amount), max_amount: Number(form.max_amount), service_charge: Number(form.service_charge), provider: form.provider, maintenance_message: form.maintenance_message || null }); }}
        className="mt-5 grid gap-3 sm:grid-cols-2">
        <F label="Min amount (₦)"><Input type="number" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} /></F>
        <F label="Max amount (₦)"><Input type="number" value={form.max_amount} onChange={(e) => setForm({ ...form, max_amount: e.target.value })} /></F>
        <F label="Service charge (₦)"><Input type="number" value={form.service_charge} onChange={(e) => setForm({ ...form, service_charge: e.target.value })} /></F>
        <F label="Provider"><Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} /></F>
        <div className="sm:col-span-2"><F label="Maintenance message (shown when disabled)"><Input value={form.maintenance_message} onChange={(e) => setForm({ ...form, maintenance_message: e.target.value })} placeholder="Data service is temporarily unavailable…" /></F></div>
        <div className="sm:col-span-2"><Button type="submit" size="sm" disabled={update.isPending}>Save configuration</Button></div>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
