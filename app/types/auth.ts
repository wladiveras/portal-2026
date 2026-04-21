export type UserRole = 'admin' | 'editor' | 'viewer'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  disabled: boolean
  created_at: string
  updated_at: string
}

export type CanAction =
  | 'manage_users'
  | 'manage_projects'
  | 'edit_leads'
  | 'delete_leads'
  | 'view_dashboard'
