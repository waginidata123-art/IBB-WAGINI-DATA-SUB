import logoAsset from "@/assets/logo.jpg.asset.json";
import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  withText = true,
  className,
}: {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}) {
  const dims = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" }[size];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative shrink-0 overflow-hidden rounded-xl ring-1 ring-primary/30", dims)}>
        <img
          src={logoAsset.url}
          alt="IBB Wagini Data Sub logo"
          className="h-full w-full scale-[1.35] object-cover object-[50%_28%]"
          loading="eager"
        />
      </div>
      {withText && (
        <div className="leading-none">
          <div
            className={cn(
              "font-display font-extrabold tracking-tight text-foreground",
              size === "lg" ? "text-xl" : "text-base",
            )}
          >
            IBB WAGINI
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gradient-brand">
            Data Sub
          </div>
        </div>
      )}
    </div>
  );
}

export const LOGO_URL = logoAsset.url;
