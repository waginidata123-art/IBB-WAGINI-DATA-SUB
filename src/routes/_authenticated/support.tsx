import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/support")({
  component: SupportPage,
});

const faqs = [
  { q: "My wallet was debited but the service failed", a: "Failed transactions are automatically reversed to your wallet. If a transaction is still PENDING, our reconciliation system checks the provider status and resolves it — usually within minutes." },
  { q: "How long does data delivery take?", a: "Most airtime and data purchases deliver within seconds. During network congestion, it may take up to a few minutes." },
  { q: "How do I get my electricity token?", a: "Your token appears on the receipt and in your transaction details once the provider confirms payment." },
  { q: "Can I get a receipt?", a: "Yes. Every successful transaction has a downloadable receipt from the Transactions page." },
];

function SupportPage() {
  const { user } = Route.useRouteContext();
  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("key, value").in("key", ["support_email", "support_phone"]);
      return Object.fromEntries((data ?? []).map((s) => [s.key, s.value as string]));
    },
  });

  const email = settings?.["support_email"] || "ibbwaginidatasub@gmail.com";
  const phone = settings?.["support_phone"] || "09162624218";

  return (
    <UserLayout user={user} title="Support">
      <PageHeader title="Support" description="We're here to help with any transaction or account issue." />
      <div className="grid gap-4 sm:grid-cols-3">
        <a href={`mailto:${email}`} className="rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-colors hover:border-primary/40">
          <Mail className="h-5 w-5 text-primary-glow" /><p className="mt-3 font-semibold">Email</p><p className="text-sm text-muted-foreground">{email}</p>
        </a>
        <a href={`tel:${phone}`} className="rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-colors hover:border-primary/40">
          <Phone className="h-5 w-5 text-primary-glow" /><p className="mt-3 font-semibold">Phone</p><p className="text-sm text-muted-foreground">{phone}</p>
        </a>
        <a href={`https://wa.me/234${phone.replace(/\D/g, "").replace(/^0/, "")}`} target="_blank" rel="noreferrer" className="rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-colors hover:border-primary/40">
          <MessageCircle className="h-5 w-5 text-success" /><p className="mt-3 font-semibold">WhatsApp</p><p className="text-sm text-muted-foreground">Chat with support</p>
        </a>
      </div>
      <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-bold">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-2">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </UserLayout>
  );
}
