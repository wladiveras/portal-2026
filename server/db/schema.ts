import { boolean, date, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const taskStatusEnum = pgEnum('task_status', ['todo', 'doing', 'review', 'done'])
export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost'
])
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer'])

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
})

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  ownerId: uuid('owner_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  color: text('color'),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
})

export const projectLanding = pgTable('project_landing', {
  projectId: uuid('project_id').primaryKey(),
  slug: text('slug').notNull(),
  status: text('status').notNull().default('draft'),
  draftJson: jsonb('draft_json').notNull().default({}),
  publishedJson: jsonb('published_json'),
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
})

export const sprints = pgTable('sprints', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull(),
  name: text('name').notNull(),
  startsAt: date('starts_at', { mode: 'string' }).notNull(),
  endsAt: date('ends_at', { mode: 'string' }).notNull(),
  goal: text('goal'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
})

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull(),
  sprintId: uuid('sprint_id'),
  storyId: uuid('story_id'),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('todo'),
  points: integer('points'),
  assigneeId: uuid('assignee_id'),
  position: integer('position').notNull().default(0),
  doneAt: timestamp('done_at', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
})

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id'),
  status: leadStatusEnum('status').notNull().default('new'),
  source: text('source'),
  displayName: text('display_name'),
  contactValue: text('contact_value'),
  notes: text('notes'),
  firstSeen: timestamp('first_seen', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  lastSeen: timestamp('last_seen', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
})

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  role: userRoleEnum('role').notNull().default('viewer'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  disabled: boolean('disabled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
})

export const auditLog = pgTable('audit_log', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  actorId: uuid('actor_id'),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id'),
  meta: jsonb('meta').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow()
})
