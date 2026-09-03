import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, CheckCheck } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader, EmptyState } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const markAll = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", user.id] });
      qc.invalidateQueries({ queryKey: ["unread", user.id] });
    },
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", user.id] });
      qc.invalidateQueries({ queryKey: ["unread", user.id] });
    },
  });

  return (
    <UserLayout user={user} title="Notifications">
      <PageHeader
        title="Notifications"
        description="Transaction updates, wallet activity and announcements."
        actions={
          <Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={!data?.some((n) => !n.read)}>
            <CheckCheck /> Mark all read
          </Button>
        }
      />
      {data && data.length > 0 ? (
        <ul className="space-y-2">
          {data.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => !n.read && markOne.mutate(n.id)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors",
                  n.read ? "border-border/60 bg-card/60" : "border-primary/30 bg-card shadow-card",
                )}
              >
                <div className={cn("rounded-xl p-2.5", n.read ? "bg-secondary text-muted-foreground" : "bg-gradient-brand-soft text-primary-glow")}>
                  <BellRing className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{formatDate(n.created_at)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="You're all caught up" description="Notifications about your transactions and wallet will appear here." />
      )}
    </UserLayout>
  );
}
