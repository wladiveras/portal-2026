import type { SupabaseClient } from '@supabase/supabase-js'

interface AuditPayload {
  action: string
  targetType: string
  targetId?: string | null
  meta?: Record<string, unknown>
}

/**
 * Writes to public.audit_log via public.log_audit().
 * Keeps endpoint handlers concise and enforces a single payload contract.
 */
export async function logAudit(
  service: SupabaseClient,
  payload: AuditPayload
): Promise<void> {
  const { error } = await service.rpc('log_audit', {
    p_action: payload.action,
    p_target_type: payload.targetType,
    p_target_id: payload.targetId ?? null,
    p_meta: payload.meta ?? {}
  })

  if (error) throw new Error(`audit failed: ${error.message}`)
}
