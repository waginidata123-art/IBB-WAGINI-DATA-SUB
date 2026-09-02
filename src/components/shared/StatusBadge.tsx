import { cn } from "@/lib/utils";
import { statusTone } from "@/lib/format";

const tones: Record<string, string> = {
  success: "bg-success/15 text-success ring-success/30",
  destructive: "bg-destructive/15 text-destructive ring-destructive/30",
  warning: "bg-warning/15 text-warning ring-warning/30",
  info: "bg-info/15 text-info ring-info/30",
  muted: "bg-muted text-muted-foreground ring-border",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1",
        tones[statusTone(status)],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Pill({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
