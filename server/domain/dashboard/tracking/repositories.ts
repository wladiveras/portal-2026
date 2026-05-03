export interface TrackingBeaconInput {
  anonId: string
  type: string
  target?: string | null
  path?: string | null
  meta?: Record<string, unknown>
  utm?: Partial<{
    utm_source: string
    utm_medium: string
    utm_campaign: string
    utm_content: string
    utm_term: string
  }>
  userAgent?: string
  language?: string
  referrer?: string
}

export interface TrackingLandingLeadInput {
  anonId: string
  source: string
  displayName?: string | null
  contactValue?: string | null
  /** When set (e.g. project landing capture), links the lead to `projects.id`. */
  projectId?: string | null
  utm?: Partial<{
    utm_source: string
    utm_medium: string
    utm_campaign: string
    utm_content: string
    utm_term: string
  }>
}

export interface TrackingRepositoryPort {
  recordBeaconEvent(input: TrackingBeaconInput): Promise<void>
  recordLandingLead(input: TrackingLandingLeadInput): Promise<{ leadId: string }>
}
