import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/hooks/useAuth";
import { SERVICE_META, type ServiceCode } from "@/lib/services";
import { formatNaira } from "@/lib/format";
import { logAdminAction } from "@/lib/audit";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const { user: admin } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: services } = useServices();
  const [code, setCode] = useState<ServiceCode>("data");
  const service = services?.find((s) => s.code === code);

  const { data: products } = useQuery({
    queryKey: ["admin-products", service?.id],
    enabled: !!service,
    queryFn: async () => {
      const { data, error } = await supabase.from("service_products").select("*").eq("service_id", service!.id).order("network").order("selling_price");
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["products"] }); };

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Tables<"service_products">> }) => {
      const { error } = await supabase.from("service_products").update(patch).eq("id", id);
      if (error) throw error;
      await logAdminAction(admin.id, "product.updated", "service_products", id, patch as never);
    },
    onSuccess: () => { toast.success("Saved"); invalidate(); },
    onError: () => toast.error("Save failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_products").delete().eq("id", id);
      if (error) throw error;
      await logAdminAction(admin.id, "product.deleted", "service_products", id);
    },
    onSuccess: () => { toast.success("Deleted"); invalidate(); },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <>
      <PageHeader title="Products & Pricing" description="Database-driven catalogue. Set provider cost, selling price and commission per product."
        actions={service && <NewProduct serviceId={service.id} onDone={invalidate} adminId={admin.id} />} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {services?.map((s) => (
          <button key={s.id} type="button" onClick={() => setCode(s.code as ServiceCode)} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold ring-1", code === s.code ? "bg-secondary text-foreground ring-primary/50" : "text-muted-foreground ring-border hover:text-foreground")}>
            {SERVICE_META[s.code as ServiceCode].label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Network</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Commission</th><th className="px-4 py-3">Margin</th><th className="px-4 py-3">On</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {products?.map((p) => <Row key={p.id} p={p} onSave={(patch) => update.mutate({ id: p.id, patch })} onDelete={() => remove.mutate(p.id)} />)}
            {products && products.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No products yet for this service.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Row({ p, onSave, onDelete }: { p: Tables<"service_products">; onSave: (patch: Partial<Tables<"service_products">>) => void; onDelete: () => void }) {
  const [cost, setCost] = useState(String(p.provider_cost));
  const [price, setPrice] = useState(String(p.selling_price));
  const [comm, setComm] = useState(String(p.commission));
  const dirty = cost !== String(p.provider_cost) || price !== String(p.selling_price) || comm !== String(p.commission);
  const margin = Number(price) - Number(cost);
  return (
    <tr className="hover:bg-secondary/30">
      <td className="px-4 py-2 font-semibold">{p.name}<p className="font-mono text-[10px] font-normal text-muted-foreground">{p.product_code}</p></td>
      <td className="px-4 py-2 text-muted-foreground">{p.network}</td>
      <td className="px-4 py-2 text-muted-foreground">{p.category}</td>
      <td className="px-4 py-2"><Input className="h-8 w-24" type="number" value={cost} onChange={(e) => setCost(e.target.value)} /></td>
      <td className="px-4 py-2"><Input className="h-8 w-24" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></td>
      <td className="px-4 py-2"><Input className="h-8 w-20" type="number" value={comm} onChange={(e) => setComm(e.target.value)} /></td>
      <td className={cn("px-4 py-2 font-bold", margin >= 0 ? "text-success" : "text-destructive")}>{formatNaira(margin)}</td>
      <td className="px-4 py-2"><Switch checked={p.enabled} onCheckedChange={(v) => onSave({ enabled: v })} /></td>
      <td className="px-4 py-2 text-right whitespace-nowrap">
        {dirty && <Button size="sm" onClick={() => onSave({ provider_cost: Number(cost), selling_price: Number(price), commission: Number(comm) })}>Save</Button>}
        <Button size="icon" variant="ghost" className="ml-1 text-destructive" onClick={onDelete} aria-label="Delete"><Trash2 /></Button>
      </td>
    </tr>
  );
}

function NewProduct({ serviceId, onDone, adminId }: { serviceId: string; onDone: () => void; adminId: string }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", product_code: "", network: "", category: "", provider_cost: "", selling_price: "", commission: "0" });
  const create = useMutation({
    mutationFn: async () => {
      if (!f.name || !f.product_code) throw new Error("Name and code are required");
      const { data, error } = await supabase.from("service_products").insert({
        service_id: serviceId, name: f.name.trim(), product_code: f.product_code.trim(), network: f.network || null, category: f.category || null,
        provider_cost: Number(f.provider_cost || 0), selling_price: Number(f.selling_price || 0), commission: Number(f.commission || 0),
      }).select("id").single();
      if (error) throw new Error("Could not create product (duplicate code?)");
      await logAdminAction(adminId, "product.created", "service_products", data.id, { name: f.name });
    },
    onSuccess: () => { toast.success("Product added"); setOpen(false); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus /> Add product</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New product</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="grid gap-3 sm:grid-cols-2">
          {(["name", "product_code", "network", "category", "provider_cost", "selling_price", "commission"] as const).map((k) => (
            <div key={k} className={cn("space-y-1", k === "name" && "sm:col-span-2")}>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.replace("_", " ")}</Label>
              <Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} type={k.includes("cost") || k.includes("price") || k === "commission" ? "number" : "text"} />
            </div>
          ))}
          <Button type="submit" className="sm:col-span-2" disabled={create.isPending}>Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
