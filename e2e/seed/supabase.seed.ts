import { createClient } from '@supabase/supabase-js'

type Role = 'admin' | 'editor' | 'viewer'

interface SeedUser {
  email: string
  password: string
  role: Role
  fullName: string
}

const USERS: SeedUser[] = [
  {
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL ?? 'e2e-admin@portal.local',
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? 'Admin@123456',
    role: 'admin',
    fullName: 'E2E Admin'
  },
  {
    email: process.env.PLAYWRIGHT_EDITOR_EMAIL ?? 'e2e-editor@portal.local',
    password: process.env.PLAYWRIGHT_EDITOR_PASSWORD ?? 'Editor@123456',
    role: 'editor',
    fullName: 'E2E Editor'
  },
  {
    email: process.env.PLAYWRIGHT_VIEWER_EMAIL ?? 'e2e-viewer@portal.local',
    password: process.env.PLAYWRIGHT_VIEWER_PASSWORD ?? 'Viewer@123456',
    role: 'viewer',
    fullName: 'E2E Viewer'
  }
]

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`missing env: ${name}`)
  return value
}

async function ensureUser(
  admin: ReturnType<typeof createClient>,
  user: SeedUser
): Promise<{ id: string; role: Role }> {
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listed.error) throw listed.error
  const existing = listed.data.users.find((entry) => entry.email?.toLowerCase() === user.email.toLowerCase())

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName }
    })
    if (error) throw error
    return { id: existing.id, role: user.role }
  }

  const created = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.fullName }
  })
  if (created.error || !created.data.user) throw created.error ?? new Error('failed to create user')

  return { id: created.data.user.id, role: user.role }
}

export async function seedE2EData(): Promise<void> {
  const url = requiredEnv('PLAYWRIGHT_SUPABASE_URL')
  const serviceKey = requiredEnv('PLAYWRIGHT_SUPABASE_SERVICE_KEY')
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const ensured = await Promise.all(USERS.map((user) => ensureUser(admin, user)))
  const adminUser = ensured.find((entry) => entry.role === 'admin')
  const editorUser = ensured.find((entry) => entry.role === 'editor')
  const viewerUser = ensured.find((entry) => entry.role === 'viewer')
  if (!adminUser || !editorUser || !viewerUser) throw new Error('seed user roles missing')

  const profileRows = ensured.map((entry, index) => ({
    id: entry.id,
    role: entry.role,
    disabled: false,
    full_name: USERS[index].fullName
  }))
  const profiles = await admin.from('profiles').upsert(profileRows, { onConflict: 'id' })
  if (profiles.error) throw profiles.error

  const slug = process.env.PLAYWRIGHT_PROJECT_SLUG ?? 'e2e-project'
  const projectName = process.env.PLAYWRIGHT_PROJECT_NAME ?? 'E2E Project'

  const defaultOrg = await admin.from('organizations').select('id').eq('slug', 'default').maybeSingle()
  if (defaultOrg.error || !defaultOrg.data?.id) {
    throw defaultOrg.error ?? new Error('organizations.slug=default missing — apply migration 0008_organizations.sql')
  }

  const project = await admin
    .from('projects')
    .upsert(
      {
        slug,
        name: projectName,
        description: 'Deterministic project for Playwright authenticated tests',
        organization_id: defaultOrg.data.id,
        owner_id: adminUser.id,
        archived: false,
        color: '#4e85bf'
      },
      { onConflict: 'slug' }
    )
    .select('id')
    .single()
  if (project.error || !project.data) throw project.error ?? new Error('failed to seed project')

  const projectId = project.data.id

  const members = await admin
    .from('project_members')
    .upsert(
      [
        { project_id: projectId, user_id: editorUser.id },
        { project_id: projectId, user_id: viewerUser.id }
      ],
      { onConflict: 'project_id,user_id' }
    )
  if (members.error) throw members.error

  const sprintLookup = await admin
    .from('sprints')
    .select('id')
    .eq('project_id', projectId)
    .eq('name', 'E2E Sprint')
    .maybeSingle()
  if (sprintLookup.error) throw sprintLookup.error

  const sprint = sprintLookup.data
    ? await admin
        .from('sprints')
        .update({
          starts_at: '2026-01-01',
          ends_at: '2026-01-14',
          goal: 'Keep dashboard flows deterministic'
        })
        .eq('id', sprintLookup.data.id)
        .select('id')
        .single()
    : await admin
        .from('sprints')
        .insert({
          project_id: projectId,
          name: 'E2E Sprint',
          starts_at: '2026-01-01',
          ends_at: '2026-01-14',
          goal: 'Keep dashboard flows deterministic'
        })
        .select('id')
        .single()
  if (sprint.error || !sprint.data) throw sprint.error ?? new Error('failed to seed sprint')

  const taskLookup = await admin
    .from('tasks')
    .select('id')
    .eq('project_id', projectId)
    .eq('title', 'E2E Task')
    .maybeSingle()
  if (taskLookup.error) throw taskLookup.error

  const task = taskLookup.data
    ? await admin
        .from('tasks')
        .update({
          sprint_id: sprint.data.id,
          status: 'todo',
          position: 1024
        })
        .eq('id', taskLookup.data.id)
    : await admin.from('tasks').insert({
        project_id: projectId,
        sprint_id: sprint.data.id,
        title: 'E2E Task',
        status: 'todo',
        position: 1024
      })
  if (task.error) throw task.error

  const leadLookup = await admin
    .from('leads')
    .select('id')
    .eq('contact_value', 'lead-e2e@example.com')
    .maybeSingle()
  if (leadLookup.error) throw leadLookup.error

  const lead = leadLookup.data
    ? await admin
        .from('leads')
        .update({
          source: 'e2e',
          display_name: 'Lead E2E',
          status: 'new',
          utm_campaign: 'e2e-seed'
        })
        .eq('id', leadLookup.data.id)
    : await admin.from('leads').insert({
        source: 'e2e',
        display_name: 'Lead E2E',
        contact_value: 'lead-e2e@example.com',
        status: 'new',
        utm_campaign: 'e2e-seed'
      })
  if (lead.error) throw lead.error
}
