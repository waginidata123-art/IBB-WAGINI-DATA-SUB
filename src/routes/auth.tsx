import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, LOGO_URL } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register" | "forgot";

const searchSchema = z.object({ mode: z.enum(["login", "register", "forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — IBB Wagini Data Sub" },
      { name: "description", content: "Sign in or create your IBB Wagini Data Sub account to buy airtime, data, and pay bills instantly." },
      { property: "og:title", content: "Sign in — IBB Wagini Data Sub" },
      { property: "og:description", content: "Access your wallet and buy airtime, data, electricity, cable TV and exam PINs." },
    ],
  }),
  component: AuthPage,
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().regex(/^0[789][01]\d{8}$/, "Enter a valid 11-digit Nigerian number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});
const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initialMode ?? "login");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
          },
        });
        if (error) { toast.error(friendly(error.message)); return; }
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else setSent(parsed.data.email);
      } else if (mode === "login") {
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) { toast.error(friendly(error.message)); return; }
        navigate({ to: "/dashboard", replace: true });
      } else {
        const email = z.string().email().safeParse(form.email.trim());
        if (!email.success) { toast.error("Enter a valid email"); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) { toast.error(friendly(error.message)); return; }
        toast.success("If that email exists, a reset link is on its way.");
        setMode("login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
      <div className="pointer-events-none absolute inset-0 grid-pattern" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <Link to="/">
            <Logo size="lg" />
          </Link>
          <div>
            <div className="relative mx-auto mb-10 w-72 animate-float">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" />
              <img
                src={LOGO_URL}
                alt="IBB Wagini Data Sub"
                className="relative w-full rounded-3xl shadow-elevated ring-1 ring-primary/20"
              />
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
              Nigeria's fast lane for <span className="text-gradient-brand">airtime, data & bills</span>
            </h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              One secure wallet. Every network, every DisCo, every decoder. Instant delivery and
              digital receipts for every transaction.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" /> Bank-grade encryption · Verified
            payments only
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-elevated backdrop-blur sm:p-8">
              {sent ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success ring-1 ring-success/30">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Confirm your email</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We sent a verification link to <strong className="text-foreground">{sent}</strong>.
                    Click it to activate your account and wallet.
                  </p>
                  <Button variant="outline" className="mt-6 w-full" onClick={() => { setSent(null); setMode("login"); }}>
                    Back to sign in
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold">
                    {(["login", "register"] as Mode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={
                          "rounded-lg py-2 transition-all " +
                          (mode === m || (mode === "forgot" && m === "login")
                            ? "bg-card text-foreground shadow-card"
                            : "text-muted-foreground hover:text-foreground")
                        }
                      >
                        {m === "login" ? "Sign in" : "Create account"}
                      </button>
                    ))}
                  </div>
                  <h2 className="font-display text-2xl font-bold">
                    {mode === "login" && "Welcome back"}
                    {mode === "register" && "Create your account"}
                    {mode === "forgot" && "Reset password"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mode === "login" && "Sign in to your wallet and services."}
                    {mode === "register" && "Get a wallet and start transacting in minutes."}
                    {mode === "forgot" && "We'll email you a secure reset link."}
                  </p>
                  <form onSubmit={submit} className="mt-6 space-y-4">
                    {mode === "register" && (
                      <>
                        <Field label="Full name">
                          <Input value={form.fullName} onChange={set("fullName")} placeholder="Ibrahim Wagini" autoComplete="name" />
                        </Field>
                        <Field label="Phone number">
                          <Input value={form.phone} onChange={set("phone")} placeholder="08012345678" inputMode="numeric" autoComplete="tel" />
                        </Field>
                      </>
                    )}
                    <Field label="Email address">
                      <Input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
                    </Field>
                    {mode !== "forgot" && (
                      <Field
                        label="Password"
                        trailing={
                          mode === "login" && (
                            <button type="button" onClick={() => setMode("forgot")} className="text-xs font-semibold text-primary hover:underline">
                              Forgot?
                            </button>
                          )
                        }
                      >
                        <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
                      </Field>
                    )}
                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : null}
                      {mode === "login" && "Sign in"}
                      {mode === "register" && "Create account"}
                      {mode === "forgot" && "Send reset link"}
                      {!loading && <ArrowRight />}
                    </Button>
                  </form>
                  {mode === "forgot" && (
                    <button type="button" onClick={() => setMode("login")} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground">
                      Back to sign in
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, trailing }: { label: string; children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function friendly(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "Incorrect email or password.";
  if (/already registered/i.test(msg)) return "An account with this email already exists.";
  if (/email not confirmed/i.test(msg)) return "Please confirm your email before signing in.";
  if (/rate limit/i.test(msg)) return "Too many attempts. Please wait a moment and try again.";
  return "We couldn't complete that request. Please try again.";
}
