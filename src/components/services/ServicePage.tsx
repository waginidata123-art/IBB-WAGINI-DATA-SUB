import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { AlertTriangle, Construction, ShieldCheck } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pill } from "@/components/shared/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useAuth";
import { SERVICE_META, type ServiceCode } from "@/lib/services";
import { formatNaira } from "@/lib/format";

/**
 * Phase 1 service page: reads availability, limits and the admin-managed
 * product catalogue from the database. The purchase flow (wallet debit →
 * provider adapter → reconciliation) is wired in Phase 3 via server functions.
 */
export function ServicePage({ user, code }: { user: User; code: ServiceCode }) {
  const meta = SERVICE_META[code];
  const { data: services } = useServices();
  const service = services?.find((s) => s.code === code);

  const { data: products } = useQuery({
    queryKey: ["products", service?.id],
    enabled: !!service,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_products")
        .select("id, network, category, name, selling_price, enabled")
        .eq("service_id", service!.id)
        .eq("enabled", true)
        .order("network")
        .order("selling_price");
      if (error) throw error;
      return data;
    },
  });

  const networks = Array.from(new Set((products ?? []).map((p) => p.network ?? "")));
  const unavailable = service && !service.enabled;

  return (
    <UserLayout user={user} title={meta.label}>
      <PageHeader
        title={meta.label}
        description={service?.description ?? meta.tagline}
        actions={
          service && (
            <Pill tone={service.enabled ? "success" : "destructive"}>
              {service.enabled ? "Service online" : "Unavailable"}
            </Pill>
          )
        }
      />

      {unavailable ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
          <div>
            <p className="font-semibold">{meta.label} is temporarily unavailable</p>
            <p className="text-sm text-muted-foreground">
              {service?.maintenance_message ||
                "This service is under maintenance. Other services continue to work normally. Please try again later."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-brand-soft p-3 text-primary-glow ring-1 ring-primary/20">
                  <meta.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold">Purchase {meta.label}</p>
                  <p className="text-sm text-muted-foreground">
                    Limits: {formatNaira(service?.min_amount ?? 0)} – {formatNaira(service?.max_amount ?? 0)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                <Construction className="mt-0.5 h-5 w-5 text-warning" />
                <div className="text-sm">
                  <p className="font-semibold">Purchase flow arrives in the next build phase</p>
                  <p className="text-muted-foreground">
                    The wallet, transaction engine and provider adapters are being connected. Pricing
                    below is live from the admin catalogue.
                  </p>
                </div>
              </div>

              {networks.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Available {code === "electricity" ? "providers" : code === "exams" ? "exam bodies" : "networks"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {networks.map((n) => (
                      <span key={n} className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-semibold">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {products && products.some((p) => Number(p.selling_price) > 0) && (
                <div className="mt-6 overflow-hidden rounded-xl border border-border/70">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5">Plan</th>
                        <th className="px-4 py-2.5">Network</th>
                        <th className="px-4 py-2.5 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {products
                        .filter((p) => Number(p.selling_price) > 0)
                        .map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-2.5 font-medium">{p.name}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{p.network}</td>
                            <td className="px-4 py-2.5 text-right font-bold">{formatNaira(p.selling_price)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 text-success">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-bold">Secure by design</p>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Wallet is debited only when your request is validated.</li>
                <li>Uncertain provider responses stay pending and are auto-reconciled.</li>
                <li>Failed transactions are reversed to your wallet.</li>
                <li>Every purchase gets a downloadable digital receipt.</li>
              </ul>
            </div>
            {code === "nin" && (
              <div className="rounded-2xl border border-border/70 bg-card p-5 text-sm text-muted-foreground shadow-card">
                <p className="font-bold text-foreground">Privacy notice</p>
                <p className="mt-2">
                  Identity data is processed only for verification, transmitted encrypted, never
                  logged, and stored only where legally required under the NDPR.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </UserLayout>
  );
}
