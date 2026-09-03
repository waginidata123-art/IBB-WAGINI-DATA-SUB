import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

/** Records an admin action. RLS guarantees only admins can insert. */
export async function logAdminAction(
  actorId: string,
  action: string,
  resource: string,
  resourceId?: string | null,
  metadata: Json = {},
) {
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    resource,
    resource_id: resourceId ?? null,
    metadata,
  });
}
