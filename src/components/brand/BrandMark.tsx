import { cn } from "@/lib/utils";

/**
 * Authentic-looking brand marks for Nigerian networks, TV and utility
 * providers. Brand colours are part of the provider identity, so they are
 * intentionally literal values rather than theme tokens.
 */
type Brand = {
  label: string;
  short: string;
  bg: string;
  fg: string;
  ring?: string;
  round?: boolean;
};

const BRANDS: Record<string, Brand> = {
  mtn: { label: "MTN", short: "MTN", bg: "#FFCC00", fg: "#000000", round: true },
  glo: { label: "Glo", short: "glo", bg: "#5FB846", fg: "#FFFFFF", round: true },
  airtel: { label: "Airtel", short: "airtel", bg: "#E40000", fg: "#FFFFFF", round: true },
  "9mobile": { label: "9mobile", short: "9", bg: "#006F44", fg: "#9FE870", round: true },
  etisalat: { label: "9mobile", short: "9", bg: "#006F44", fg: "#9FE870", round: true },
  dstv: { label: "DStv", short: "DStv", bg: "#0A2A6B", fg: "#00A9E0" },
  gotv: { label: "GOtv", short: "GOtv", bg: "#7AB800", fg: "#FFFFFF" },
  startimes: { label: "StarTimes", short: "Star", bg: "#ED1C24", fg: "#FFFFFF" },
  showmax: { label: "Showmax", short: "SMX", bg: "#111827", fg: "#E50914" },
  waec: { label: "WAEC", short: "WAEC", bg: "#0B6B3A", fg: "#FFFFFF" },
  neco: { label: "NECO", short: "NECO", bg: "#1D4ED8", fg: "#FFFFFF" },
  nabteb: { label: "NABTEB", short: "NAB", bg: "#14532D", fg: "#FDE047" },
  jamb: { label: "JAMB", short: "JAMB", bg: "#065F46", fg: "#FFFFFF" },
  nin: { label: "NIMC", short: "NIN", bg: "#0F3D2E", fg: "#22C55E" },
  ikeja: { label: "Ikeja Electric", short: "IE", bg: "#E11D48", fg: "#FFFFFF" },
  eko: { label: "Eko Disco", short: "EKO", bg: "#1E3A8A", fg: "#FACC15" },
  abuja: { label: "AEDC", short: "AEDC", bg: "#0369A1", fg: "#FFFFFF" },
  kano: { label: "KEDCO", short: "KED", bg: "#166534", fg: "#FFFFFF" },
  ibadan: { label: "IBEDC", short: "IBE", bg: "#7C2D12", fg: "#FDBA74" },
  enugu: { label: "EEDC", short: "EEDC", bg: "#B91C1C", fg: "#FFFFFF" },
  "port harcourt": { label: "PHED", short: "PHED", bg: "#1E40AF", fg: "#FFFFFF" },
  jos: { label: "JED", short: "JED", bg: "#0F766E", fg: "#FFFFFF" },
  kaduna: { label: "KAEDCO", short: "KAE", bg: "#4C1D95", fg: "#FFFFFF" },
  benin: { label: "BEDC", short: "BEDC", bg: "#065F46", fg: "#FFFFFF" },
  yola: { label: "YEDC", short: "YEDC", bg: "#9A3412", fg: "#FFFFFF" },
};

export function resolveBrand(name: string | null | undefined): Brand | null {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  if (BRANDS[key]) return BRANDS[key]!;
  const hit = Object.keys(BRANDS).find((k) => key.includes(k));
  return hit ? BRANDS[hit]! : null;
}

export function BrandMark({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const brand = resolveBrand(name);
  const dims = { sm: "h-8 w-8 text-[9px]", md: "h-10 w-10 text-[10px]", lg: "h-14 w-14 text-xs" }[size];

  if (!brand) {
    return (
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-xl bg-secondary font-extrabold uppercase text-foreground ring-1 ring-border",
          dims,
          className,
        )}
      >
        {name.slice(0, 3)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center font-extrabold leading-none tracking-tight ring-1 ring-black/10",
        brand.round ? "rounded-full" : "rounded-xl",
        dims,
        className,
      )}
      style={{ backgroundColor: brand.bg, color: brand.fg }}
      aria-label={brand.label}
      title={brand.label}
    >
      <span className="px-1 text-center">{brand.short}</span>
    </div>
  );
}

export function BrandChip({ name, className }: { name: string; className?: string }) {
  const brand = resolveBrand(name);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold shadow-card",
        className,
      )}
    >
      <BrandMark name={name} size="sm" />
      {brand?.label ?? name}
    </span>
  );
}
