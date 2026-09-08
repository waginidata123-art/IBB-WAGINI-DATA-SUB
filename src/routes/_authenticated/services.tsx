import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useServices } from "@/hooks/useAuth";
import { SERVICE_META, SERVICE_ORDER } from "@/lib/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/services")({
  component: ServicesPage,
});

function ServicesPage() {
  const { user } = Route.useRouteContext();
  const { data: services } = useServices();

  return (
    <UserLayout user={user} title="Services">
      <PageHeader title="All services" description="Everything you can pay for on IBB Wagini Data Sub." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SERVICE_ORDER.map((code) => {
          const meta = SERVICE_META[code];
          const svc = services?.find((s) => s.code === code);
          const enabled = svc?.enabled ?? true;
          return (
            <Link
              key={code}
              to={meta.path}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow",
                !enabled && "opacity-60",
              )}
            >
              <div className="mb-3 inline-flex rounded-xl bg-gradient-brand-soft p-2.5 text-primary ring-1 ring-primary/20">
                <meta.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold">{meta.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{meta.tagline}</p>
              <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </UserLayout>
  );
}
