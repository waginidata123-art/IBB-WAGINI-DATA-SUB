import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/audit";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

type Settings = Record<string, Json>;

function AdminSettings() {
  const { user: admin } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_settings").select("*");
      if (error) throw error;
      return Object.fromEntries(data.map((s) => [s.key, s.value])) as Settings;
    },
  });
  const [s, setS] = useState<Settings>({});
  useEffect(() => { if (data) setS(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = Object.entries(s).map(([key, value]) => ({ key, value }));
      for (const row of rows) {
        const { error } = await supabase.from("platform_settings").update({ value: row.value }).eq("key", row.key);
        if (error) throw error;
      }
      await logAdminAction(admin.id, "settings.updated", "platform_settings", null, { keys: Object.keys(s) });
    },
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); qc.invalidateQueries({ queryKey: ["public-settings"] }); },
    onError: () => toast.error("Could not save settings"),
  });

  const str = (k: string) => String(s[k] ?? "");
  const set = (k: string, v: Json) => setS((p) => ({ ...p, [k]: v }));
  const notif = (s["notifications"] as { email?: boolean; sms?: boolean; in_app?: boolean } | undefined) ?? {};
  const maintenance = s["maintenance_mode"] === true;

  return (
    <>
      <PageHeader title="Settings" description="Platform-wide configuration. No code changes needed." actions={<Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Save all</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Platform identity">
          <F label="Platform name"><Input value={str("platform_name")} onChange={(e) => set("platform_name", e.target.value)} /></F>
          <F label="Support email"><Input value={str("support_email")} onChange={(e) => set("support_email", e.target.value)} /></F>
          <F label="Support phone"><Input value={str("support_phone")} onChange={(e) => set("support_phone", e.target.value)} /></F>
        </Card>
        <Card title="Wallet limits">
          <F label="Minimum funding (₦)"><Input type="number" value={str("min_wallet_funding")} onChange={(e) => set("min_wallet_funding", Number(e.target.value))} /></F>
          <F label="Maximum funding (₦)"><Input type="number" value={str("max_wallet_funding")} onChange={(e) => set("max_wallet_funding", Number(e.target.value))} /></F>
        </Card>
        <Card title="Notification channels">
          {(["in_app", "email", "sms"] as const).map((c) => (
            <div key={c} className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
              <div><p className="text-sm font-semibold capitalize">{c.replace("_", "-")}</p><p className="text-xs text-muted-foreground">{c === "sms" ? "Via Termii (requires TERMII_API_KEY)" : c === "email" ? "Transactional emails" : "Dashboard notifications"}</p></div>
              <Switch checked={!!notif[c]} onCheckedChange={(v) => set("notifications", { ...notif, [c]: v })} />
            </div>
          ))}
        </Card>
        <Card title="Maintenance mode">
          <div className={"flex items-center justify-between rounded-xl border px-4 py-3 " + (maintenance ? "border-destructive/40 bg-destructive/10" : "border-border/70")}>
            <div className="flex items-center gap-3">
              <AlertTriangle className={"h-5 w-5 " + (maintenance ? "text-destructive" : "text-muted-foreground")} />
              <div><p className="text-sm font-semibold">Global maintenance</p><p className="text-xs text-muted-foreground">Blocks all purchases platform-wide. Per-service maintenance lives under Services.</p></div>
            </div>
            <Switch checked={maintenance} onCheckedChange={(v) => set("maintenance_mode", v)} />
          </div>
        </Card>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card"><p className="mb-4 font-display font-bold">{title}</p><div className="space-y-3">{children}</div></div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
