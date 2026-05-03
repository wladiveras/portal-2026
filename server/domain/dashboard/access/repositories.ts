import type { Database } from '~/types/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Invite = Database['public']['Tables']['invites']['Row']
export type AuditLog = Database['public']['Tables']['audit_log']['Row']
export type UserRole = Database['public']['Enums']['user_role']

export interface AccessRepositoryPort {
  listProfiles(): Promise<Array<Profile & { email: string | null; last_sign_in_at: string | null }>>
  uploadAvatar(input: {
    userId: string
    bytes: Uint8Array
    mimeType: string
    filename: string
  }): Promise<Pick<Profile, 'id' | 'avatar_url'>>
  updateProfile(input: {
    profileId: string
    patch: {
      role?: UserRole
      disabled?: boolean
      full_name?: string | null
    }
    actorId: string
  }): Promise<Profile>
  listInvites(): Promise<Invite[]>
  createInvite(input: { email: string; role: UserRole; actorId: string; redirectTo?: string }): Promise<{ invite: Invite; warning?: string }>
  revokeInvite(input: { token: string; actorId: string }): Promise<void>
  listAudit(limit?: number): Promise<AuditLog[]>
}
