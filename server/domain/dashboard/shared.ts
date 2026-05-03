import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export type Service = SupabaseClient<Database>
export type H3Event = Parameters<typeof serverSupabaseServiceRole>[0]

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type Sprint = Database['public']['Tables']['sprints']['Row']
export type SprintUpdate = Database['public']['Tables']['sprints']['Update']
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type TaskStatus = Database['public']['Enums']['task_status']

export function sanitizeSlug(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseISODate(value?: string): string | null {
  if (!value) return null
  const normalized = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null
  return normalized
}
