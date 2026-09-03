import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { KeyRound, Loader2, UserRound } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pill } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useAuth";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^0[789][01]\d{8}$/, "Enter a valid 11-digit number"),
  address: z.string().trim().max(200).optional(),
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: profile } = useProfile(user);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name, phone: profile.phone ?? "", address: profile.address ?? "" });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = profileSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const { error } = await supabase.from("profiles").update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        address: parsed.data.address ?? null,
      }).eq("user_id", user.id);
      if (error) throw new Error("Could not save profile");
    },
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["profile", user.id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const changePw = useMutation({
    mutationFn: async () => {
      if (pw.next.length < 8) throw new Error("New password must be at least 8 characters");
      if (pw.next !== pw.confirm) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.updateUser({ password: pw.next, current_password: pw.current } as never);
      if (error) throw new Error(/current password/i.test(error.message) ? "Current password is incorrect" : "Could not change password");
    },
    onSuccess: () => { toast.success("Password changed"); setPw({ current: "", next: "", confirm: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const kycTone = { verified: "success", pending: "warning", rejected: "destructive", not_started: "muted" } as const;

  return (
    <UserLayout user={user} title="Profile">
      <PageHeader title="Profile" description="Manage your personal details and account security." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2 font-display font-bold"><UserRound className="h-4 w-4 text-primary-glow" /> Personal information</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="numeric" /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input value={user.email ?? ""} disabled /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Optional" /></div>
            </div>
            <Button type="submit" className="mt-5" disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Save changes</Button>
          </form>

          <form onSubmit={(e) => { e.preventDefault(); changePw.mutate(); }} className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <div className="mb-5 flex items-center gap-2 font-display font-bold"><KeyRound className="h-4 w-4 text-primary-glow" /> Change password</div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label>Current</Label><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></div>
              <div className="space-y-1.5"><Label>New</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></div>
              <div className="space-y-1.5"><Label>Confirm</Label><Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" /></div>
            </div>
            <Button type="submit" variant="outline" className="mt-5" disabled={changePw.isPending}>{changePw.isPending && <Loader2 className="animate-spin" />} Update password</Button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account status</p>
            <div className="mt-2 flex items-center gap-2">
              <Pill tone={profile?.status === "active" ? "success" : "destructive"}>{profile?.status ?? "—"}</Pill>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">KYC</p>
            <div className="mt-2"><Pill tone={kycTone[profile?.kyc_status ?? "not_started"]}>{(profile?.kyc_status ?? "not_started").replace("_", " ")}</Pill></div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member since</p>
            <p className="mt-1 text-sm">{profile ? formatDate(profile.created_at) : "—"}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5 text-sm shadow-card">
            <p className="font-bold">Account activity</p>
            <p className="mt-1 text-muted-foreground">Last sign-in: {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "—"}</p>
            <p className="text-muted-foreground">Email verified: {user.email_confirmed_at ? "Yes" : "Pending"}</p>
          </div>
        </aside>
      </div>
    </UserLayout>
  );
}
