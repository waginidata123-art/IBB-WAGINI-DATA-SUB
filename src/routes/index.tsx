import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Lock,
  Receipt,
  ShieldCheck,
  Wallet,
  Zap,
  Clock3,
  Headset,
  Sparkles,
} from "lucide-react";
import { Logo, LOGO_URL } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_META, SERVICE_ORDER } from "@/lib/services";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IBB Wagini Data Sub — Airtime, Data, Bills & More" },
      { name: "description", content: "Buy cheap airtime and data, pay electricity and cable TV bills, get WAEC/NECO/JAMB PINs and verify NIN instantly. One secure wallet for every service." },
      { property: "og:title", content: "IBB Wagini Data Sub — Airtime, Data, Bills & More" },
      { property: "og:description", content: "Nigeria's fast lane for airtime, data, electricity, cable TV, exam PINs and NIN verification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "IBB Wagini Data Sub",
          description: "VTU platform for airtime, data, electricity, cable TV, exam PINs and NIN verification in Nigeria.",
        }),
      },
    ],
  }),
  component: Landing,
});

const benefits = [
  { icon: Zap, title: "Instant delivery", text: "Airtime and data land in seconds, powered by direct provider connections." },
  { icon: ShieldCheck, title: "Never lose money", text: "Wallet is debited only after validation. Failed orders are reversed automatically." },
  { icon: Receipt, title: "Digital receipts", text: "Every transaction gets a verifiable receipt you can download or share." },
  { icon: Clock3, title: "24/7 availability", text: "Buy at 2am or 2pm — the platform runs round the clock with live monitoring." },
  { icon: Wallet, title: "One wallet, all services", text: "Fund once via bank transfer or card and pay for everything from one balance." },
  { icon: Headset, title: "Real support", text: "Reach us by phone, WhatsApp or email whenever you need a hand." },
];

const steps = [
  { n: "01", title: "Create your account", text: "Register with your email and phone in under a minute. Your wallet is created instantly." },
  { n: "02", title: "Fund your wallet", text: "Top up via bank transfer or card through verified payment gateways." },
  { n: "03", title: "Buy any service", text: "Pick a service, enter the details, confirm — done. Receipt delivered instantly." },
];

const faqs = [
  { q: "How fast is delivery?", a: "Airtime and data are typically delivered within seconds. Electricity tokens and cable subscriptions are confirmed as soon as the provider responds." },
  { q: "What happens if a transaction fails?", a: "Your wallet is automatically reversed. If a provider response is delayed, the transaction stays pending and our reconciliation system resolves it — you never lose money." },
  { q: "How do I fund my wallet?", a: "Through secure payment gateways such as Monnify and Flutterwave using bank transfer, card or USSD. Your wallet is credited only after the payment is verified." },
  { q: "Is my information safe?", a: "Yes. All traffic is encrypted, sensitive operations run on secure servers, and identity data for NIN services is handled under strict data-protection rules." },
];

function Landing() {
  const { user } = useSession();
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#services" className="hover:text-foreground">Services</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#security" className="hover:text-foreground">Security</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild variant="hero"><Link to="/dashboard">Dashboard <ArrowRight /></Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/auth">Sign in</Link></Button>
                <Button asChild variant="hero"><Link to="/auth" search={{ mode: "register" }}>Get started <ArrowRight /></Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
        <div className="pointer-events-none absolute inset-0 grid-pattern" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pb-28 lg:pt-24">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-glow">
              <Sparkles className="h-3.5 w-3.5" /> Trusted VTU platform
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Airtime, data & bills.
              <br />
              <span className="text-gradient-brand">Instant. Secure. Cheaper.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              One wallet for MTN, Airtel, Glo, 9mobile, every DisCo, DStv, GOtv, Startimes, exam PINs
              and NIN verification. Built for speed, engineered for trust.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg"><Link to="/auth" search={{ mode: "register" }}>Create free account <ArrowRight /></Link></Button>
              <Button asChild variant="outline" size="lg"><a href="#services">Explore services</a></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-success" /> Verified payments only</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-success" /> Auto-reversal on failure</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-success" /> Instant receipts</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-[100px]" />
            <div className="relative animate-float">
              <img src={LOGO_URL} alt="IBB Wagini Data Sub brand mark" className="mx-auto w-full max-w-md rounded-[2rem] shadow-elevated ring-1 ring-primary/25" />
              <div className="absolute -bottom-6 -left-4 hidden rounded-2xl glass p-4 shadow-elevated sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">MTN 2GB delivered</p>
                <p className="mt-1 font-display text-lg font-bold text-success">SUCCESS · 1.8s</p>
              </div>
              <div className="absolute -right-4 -top-6 hidden rounded-2xl glass p-4 shadow-elevated sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wallet balance</p>
                <p className="mt-1 font-display text-lg font-bold">₦48,250.00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-glow">Services</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Everything you top up, in one place</h2>
          <p className="mt-3 text-muted-foreground">Each service is independently monitored — if one is under maintenance, the rest keep running.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_ORDER.map((code) => {
            const meta = SERVICE_META[code];
            const svc = services?.find((s) => s.code === code);
            const enabled = svc?.enabled ?? true;
            return (
              <Link key={code} to="/auth" className="group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-gradient-brand-soft p-3 text-primary-glow ring-1 ring-primary/20"><meta.icon className="h-6 w-6" /></div>
                  <span className={"rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 " + (enabled ? "bg-success/15 text-success ring-success/30" : "bg-muted text-muted-foreground ring-border")}>{enabled ? "Live" : "Coming soon"}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{meta.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{svc?.description ?? meta.tagline}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2">Buy now <ArrowRight className="h-4 w-4 transition-all" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-y border-border/60 bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-glow">Why IBB Wagini</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Built like a bank, fast like a chat</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
                <b.icon className="h-6 w-6 text-primary-glow" />
                <h3 className="mt-4 font-display text-lg font-bold">{b.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-glow">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Three steps. Under a minute.</h2>
            <ol className="mt-8 space-y-6">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-5">
                  <span className="font-display text-3xl font-extrabold text-gradient-brand">{s.n}</span>
                  <div><p className="font-display text-lg font-bold">{s.title}</p><p className="mt-1 text-sm text-muted-foreground">{s.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-primary/25 bg-gradient-surface p-8 shadow-elevated">
            <div className="flex items-center gap-3"><Wallet className="h-6 w-6 text-primary-glow" /><p className="font-display text-xl font-bold">Your wallet, your control</p></div>
            <p className="mt-3 text-sm text-muted-foreground">Fund via bank transfer, card or USSD through Monnify and Flutterwave. Every naira in and out is recorded in a tamper-proof ledger with balance snapshots — so you always know exactly where your money went.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Credits only after server-side payment verification", "Duplicate payments are detected and never double-credited", "Refunds and reversals appear instantly in your ledger"].map((t) => (
                <li key={t} className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="border-y border-border/60 bg-surface/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-glow">Security</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Your money and data, protected end to end</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {[
              { icon: Lock, t: "Encrypted everywhere", d: "HTTPS on every request; secrets never touch the browser." },
              { icon: ShieldCheck, t: "Server-side transactions", d: "Wallet debits and provider calls happen on secure servers with atomic operations — no double charges." },
              { icon: BadgeCheck, t: "Verified payments", d: "Webhooks are signature-checked and idempotent before a single naira is credited." },
              { icon: Receipt, t: "Full audit trail", d: "Every transaction and admin action is logged for accountability." },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
                <s.icon className="h-5 w-5 text-success" /><p className="mt-3 font-bold">{s.t}</p><p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-primary-glow">FAQ</p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold sm:text-4xl">Questions, answered</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-surface p-10 text-center shadow-elevated sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Ready to top up smarter?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Join IBB Wagini Data Sub today. Free account, instant wallet, every service in one place.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg"><Link to="/auth" search={{ mode: "register" }}>Create account <ArrowRight /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/auth">Sign in</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row">
          <Logo size="sm" />
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#services" className="hover:text-foreground">Services</a>
            <a href="#security" className="hover:text-foreground">Security</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} IBB Wagini Data Sub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
