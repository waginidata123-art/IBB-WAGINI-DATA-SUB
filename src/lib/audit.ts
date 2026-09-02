import { supabase } from "@/integrations/supabase/client";

/** Records an admin action. RLS guarantees only admins can insert. */
export async function logAdminAction(
  actorId: string,
  action: string,
  resource: string,
  resourceId?: string | null,
  metadata: Record<string, unknown> = {},
) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    resource,
    resource_id: resourceId ?? null,
    metadata,
  });
}
