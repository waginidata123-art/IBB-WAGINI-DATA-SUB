import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/shared/PageHeader";
import { Pill } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatNaira } from "@/lib/format";
import { logAdminAction } from "@/lib/audit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

const PAGE = 25;

function AdminUsers() {
  const { user: admin } = Route.useRouteContext();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [page, setPage] = useState(0);

  const { data } = useQuery({
    queryKey: ["admin-users", q, status, page],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
      if (status !== "all") query = query.eq("status", status);
      if (q.trim()) query = query.or(`full_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%,phone.ilike.%${q.trim()}%`);
      const { data: profiles, error, count } = await query;
      if (error) throw error;
      const ids = profiles.map((p) => p.user_id);
      const [wallets, roles] = await Promise.all([
        supabase.from("wallets").select("user_id, balance").in("user_id", ids),
        supabase.from("user_roles").select("user_id, role").in("user_id", ids),
      ]);
      return {
        count: count ?? 0,
        rows: profiles.map((p) => ({
          ...p,
          balance: Number(wallets.data?.find((w) => w.user_id === p.user_id)?.balance ?? 0),
          roles: (roles.data ?? []).filter((r) => r.user_id === p.user_id).map((r) => r.role),
        })),
      };
    },
  });

  const toggle = useMutation({
    mutationFn: async (p: { user_id: string; status: string; email: string }) => {
      const next = p.status === "active" ? "suspended" : "active";
      const { error } = await supabase.from("profiles").update({ status: next }).eq("user_id", p.user_id);
      if (error) throw error;
      await logAdminAction(admin.id, next === "suspended" ? "user.suspended" : "user.activated", "profiles", p.user_id, { email: p.email });
      return next;
    },
    onSuccess: (next) => { toast.success(`User ${next}`); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: () => toast.error("Could not update user"),
  });

  const pages = Math.ceil((data?.count ?? 0) / PAGE);

  return (
    <>
      <PageHeader title="Users" description={`${data?.count ?? 0} registered accounts`} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search name, email or phone" className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "suspended"] as const).map((s) => (
            <button key={s} type="button" onClick={() => { setStatus(s); setPage(0); }} className={cn("rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1", status === s ? "bg-primary text-primary-foreground ring-primary" : "bg-secondary text-muted-foreground ring-border")}>{s}</button>
          ))}
        </div>
      </div>

      {data && data.rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">KYC</th><th className="px-4 py-3 text-right">Wallet</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {data.rows.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3"><p className="font-semibold">{p.full_name || "—"}</p><p className="text-xs text-muted-foreground">{p.email}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">{p.roles.map((r) => <Pill key={r} tone={r === "admin" ? "info" : "muted"} className="mr-1">{r}</Pill>)}</td>
                  <td className="px-4 py-3"><Pill tone={p.kyc_status === "verified" ? "success" : "muted"}>{p.kyc_status.replace("_", " ")}</Pill></td>
                  <td className="px-4 py-3 text-right font-bold">{formatNaira(p.balance)}</td>
                  <td className="px-4 py-3"><Pill tone={p.status === "active" ? "success" : "destructive"}>{p.status}</Pill></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {p.user_id !== admin.id && (
                      <Button size="sm" variant={p.status === "active" ? "outline" : "success"} onClick={() => toggle.mutate(p)} disabled={toggle.isPending}>
                        {p.status === "active" ? <><ShieldBan /> Suspend</> : <><ShieldCheck /> Activate</>}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No users found" />
      )}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page + 1} of {pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </>
  );
}
