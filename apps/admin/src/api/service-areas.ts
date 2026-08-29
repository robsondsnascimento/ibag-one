import { apiRequest } from './client'

export type ServiceAreaListItem = {
  id: string
  nome: string
  descricao: string | null
  funcoes: string[]
  scope: 'GLOBAL' | 'CAMPUS'
  ativo: boolean
  campus: {
    id: string
    nome: string
  } | null
  _count: {
    teams: number
    memberships: number
  }
}

export type ServiceAreaDetail = {
  id: string
  nome: string
  descricao: string | null
  funcoes: string[]
  scope: 'GLOBAL' | 'CAMPUS'
  ativo: boolean
  campus: {
    id: string
    nome: string
  } | null
  teams: Array<{
    id: string
    nome: string
    descricao: string | null
    ativo: boolean
    campus: {
      id: string
      nome: string
    }
  }>
  pastoralLeadership: Array<{
    role: 'PASTOR_SENIOR' | 'PASTOR'
    person: {
      id: string
      nome: string
      campus: {
        id: string
        nome: string
      }
    }
  }>
  memberships: Array<{
    id: string
    role: 'GENERAL_LEADER' | 'CAMPUS_LEADER' | 'TEAM_LEADER' | 'MEMBER'
    inicio: string
    funcoes: string[]
    serviceArea: {
      id: string
      nome: string
    }
    person: {
      id: string
      nome: string
      telefone: string | null
      email: string | null
      dataMembresia: string | null
      dataMembresiaSemDia: boolean
    }
    team: {
      id: string
      nome: string
    } | null
    campus: {
      id: string
      nome: string
    } | null
  }>
}

export type ServiceMembershipRole = 'GENERAL_LEADER' | 'CAMPUS_LEADER' | 'TEAM_LEADER' | 'MEMBER'

export type ServiceAreaEntryStage = {
  id: string
  nome: string
  descricao: string | null
  ordem: number
  obrigatoria: boolean
  ativo: boolean
}

export type ServiceAreaApplication = {
  id: string
  status: 'INTERESTED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  observacao: string | null
  createdAt: string
  person: {
    id: string
    nome: string
    telefone: string | null
    email: string | null
  }
  desiredTeam: {
    id: string
    nome: string
    campus: {
      id: string
      nome: string
    }
  } | null
  stageCompletions: Array<{
    id: string
    entryStageId: string
    completedAt: string
    entryStage: ServiceAreaEntryStage
  }>
}

export function listServiceAreas(accessToken: string, includeInactive = false) {
  return apiRequest<ServiceAreaListItem[]>(`/service-areas${includeInactive ? '?includeInactive=true' : ''}`, { accessToken })
}

export function getServiceArea(accessToken: string, id: string) {
  return apiRequest<ServiceAreaDetail>(`/service-areas/${id}`, { accessToken })
}

export function updateServiceArea(accessToken: string, areaId: string, input: { nome?: string; descricao?: string | null; ativo?: boolean }) {
  return apiRequest<ServiceAreaDetail>(`/service-areas/${areaId}`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updateServiceAreaFunctions(accessToken: string, areaId: string, funcoes: string[]) {
  return apiRequest<ServiceAreaDetail>(`/service-areas/${areaId}/functions`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ funcoes }),
  })
}

export function updateServiceTeam(accessToken: string, teamId: string, input: { nome?: string; descricao?: string | null; ativo?: boolean }) {
  return apiRequest<ServiceAreaDetail['teams'][number]>(`/service-areas/teams/${teamId}`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function createServiceTeam(accessToken: string, areaId: string, input: { nome: string; descricao?: string; campusId: string }) {
  return apiRequest<ServiceAreaDetail['teams'][number]>(`/service-areas/${areaId}/teams`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function addServiceAreaMember(accessToken: string, areaId: string, input: { personId: string; role: ServiceMembershipRole; campusId?: string; teamId?: string; funcoes?: string[] }) {
  return apiRequest<ServiceAreaDetail['memberships'][number]>(`/service-areas/${areaId}/members`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updateServiceMembershipFunctions(accessToken: string, membershipId: string, funcoes: string[]) {
  return apiRequest<ServiceAreaDetail['memberships'][number]>(`/service-areas/memberships/${membershipId}/functions`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ funcoes }),
  })
}

export function endServiceAreaMembership(accessToken: string, membershipId: string) {
  return apiRequest<void>(`/service-areas/memberships/${membershipId}/end`, {
    method: 'PATCH',
    accessToken,
  })
}

export function transferServiceAreaMembership(accessToken: string, membershipId: string, input: { serviceAreaId: string; teamId: string; funcoes?: string[] }) {
  return apiRequest<ServiceAreaDetail['memberships'][number]>(`/service-areas/memberships/${membershipId}/transfer`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function listServiceAreaEntryStages(accessToken: string, areaId: string) {
  return apiRequest<ServiceAreaEntryStage[]>(`/service-area-onboarding/areas/${areaId}/stages`, { accessToken })
}

export function createServiceAreaEntryStage(accessToken: string, areaId: string, input: { nome: string; descricao?: string; obrigatoria: boolean }) {
  return apiRequest<ServiceAreaEntryStage>(`/service-area-onboarding/areas/${areaId}/stages`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updateServiceAreaEntryStage(accessToken: string, stageId: string, input: { nome?: string; descricao?: string; obrigatoria?: boolean; ativo?: boolean }) {
  return apiRequest<ServiceAreaEntryStage>(`/service-area-onboarding/stages/${stageId}`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function reorderServiceAreaEntryStages(accessToken: string, areaId: string, stageIds: string[]) {
  return apiRequest<ServiceAreaEntryStage[]>(`/service-area-onboarding/areas/${areaId}/stages/reorder`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ stageIds }),
  })
}

export function listServiceAreaApplications(accessToken: string, areaId: string) {
  return apiRequest<ServiceAreaApplication[]>(`/service-area-onboarding/areas/${areaId}/applications`, { accessToken })
}

export function createServiceAreaApplication(accessToken: string, input: { serviceAreaId: string; personId: string; desiredTeamId?: string; observacao?: string }) {
  return apiRequest<ServiceAreaApplication>('/service-area-onboarding/applications', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function startServiceAreaApplication(accessToken: string, applicationId: string) {
  return apiRequest<ServiceAreaApplication>(`/service-area-onboarding/applications/${applicationId}/start`, {
    method: 'PATCH',
    accessToken,
  })
}

export function completeServiceAreaApplicationStage(accessToken: string, applicationId: string, stageId: string) {
  return apiRequest<unknown>(`/service-area-onboarding/applications/${applicationId}/stages/${stageId}/complete`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  })
}

export function approveServiceAreaApplication(accessToken: string, applicationId: string, teamId: string) {
  return apiRequest<ServiceAreaApplication>(`/service-area-onboarding/applications/${applicationId}/approve`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ teamId }),
  })
}

export function rejectServiceAreaApplication(accessToken: string, applicationId: string, motivo: string) {
  return apiRequest<ServiceAreaApplication>(`/service-area-onboarding/applications/${applicationId}/reject`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ motivo }),
  })
}

export function withdrawServiceAreaApplication(accessToken: string, applicationId: string, motivo?: string) {
  return apiRequest<ServiceAreaApplication>(`/service-area-onboarding/applications/${applicationId}/withdraw`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(motivo ? { motivo } : {}),
  })
}

export type ServiceScheduleStatus = 'SCHEDULED' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED'

export type ServiceAreaSchedule = {
  id: string
  data: string
  funcao: string
  observacao: string | null
  status: ServiceScheduleStatus
  person: {
    id: string
    nome: string
    telefone: string | null
    email: string | null
    operationalRoles?: Array<{
      role: 'WORSHIP_MINISTER'
      teamId: string
    }>
    serviceMemberships?: Array<{
      teamId: string | null
      funcoes: string[]
    }>
  }
  team: {
    id: string
    nome: string
    serviceArea: {
      id: string
      nome: string
    }
    campus: {
      id: string
      nome: string
    }
  }
  event: {
    id: string
    titulo: string
    inicio: string
    fim: string
  } | null
}

export function hasWorshipMinisterRole(schedule: ServiceAreaSchedule) {
  const hasLegacyOperationalRole = schedule.person.operationalRoles?.some((assignment) => assignment.role === 'WORSHIP_MINISTER' && assignment.teamId === schedule.team.id) ?? false
  const hasMinisterFunction = schedule.person.serviceMemberships?.some((membership) => membership.teamId === schedule.team.id && membership.funcoes.some((functionName) => functionName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR') === 'ministro')) ?? false
  return hasLegacyOperationalRole || hasMinisterFunction
}

export type ServiceScheduleHistory = {
  id: string
  action: 'CREATED' | 'STATUS_CHANGED' | 'SUBSTITUTED'
  previousStatus: ServiceScheduleStatus | null
  newStatus: ServiceScheduleStatus | null
  previousPersonName: string | null
  replacementPersonName: string | null
  reason: string | null
  createdAt: string
  changedByUser: {
    id: string
    loginEmail: string
  }
}

export type ServiceScheduleSwapCandidate = {
  id: string
  nome: string
  telefone: string | null
  email: string | null
}

export type ServiceScheduleSwapRequest = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason: string | null
  decisionReason: string | null
  createdAt: string
  requesterPerson: ServiceScheduleSwapCandidate
  replacementPerson: ServiceScheduleSwapCandidate
  schedule: ServiceAreaSchedule
}

export type ServiceScheduleEventCandidate = {
  id: string
  titulo: string
  inicio: string
  fim: string
  status: 'APPROVED' | string
  type: string
  campus: {
    id: string
    nome: string
  }
}

export type ServiceScheduleUnavailability = {
  id: string
  data: string
  serviceAreaId: string
  person: {
    id: string
    nome: string
  }
}

export function listServiceAreaSchedules(accessToken: string, areaId: string, filters: { start?: string; end?: string; teamId?: string; status?: ServiceScheduleStatus }) {
  const search = new URLSearchParams()
  if (filters.start) search.set('start', filters.start)
  if (filters.end) search.set('end', filters.end)
  if (filters.teamId) search.set('teamId', filters.teamId)
  if (filters.status) search.set('status', filters.status)
  const suffix = search.size ? `?${search.toString()}` : ''
  return apiRequest<ServiceAreaSchedule[]>(`/service-areas/${areaId}/schedules${suffix}`, { accessToken })
}

export function listServiceScheduleUnavailabilities(accessToken: string, areaId: string, filters: { start?: string; end?: string }) {
  const search = new URLSearchParams()
  if (filters.start) search.set('start', filters.start)
  if (filters.end) search.set('end', filters.end)
  const suffix = search.size ? `?${search.toString()}` : ''
  return apiRequest<ServiceScheduleUnavailability[]>(`/service-areas/${areaId}/unavailabilities${suffix}`, { accessToken })
}

export function createServiceScheduleUnavailability(accessToken: string, areaId: string, data: string) {
  return apiRequest<ServiceScheduleUnavailability>(`/service-areas/${areaId}/unavailabilities`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data }),
  })
}

export function deleteServiceScheduleUnavailability(accessToken: string, areaId: string, unavailabilityId: string) {
  return apiRequest<{ id: string }>(`/service-areas/${areaId}/unavailabilities/${unavailabilityId}`, {
    method: 'DELETE',
    accessToken,
  })
}

export function createServiceSchedule(accessToken: string, teamId: string, input: { personId: string; data: string; funcao: string; observacao?: string; eventId?: string }) {
  return apiRequest<ServiceAreaSchedule>(`/service-areas/teams/${teamId}/schedules`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function createServiceScheduleBatch(accessToken: string, teamId: string, input: { schedules: Array<{ personId: string; data: string; funcao: string; observacao?: string; eventId?: string }> }) {
  return apiRequest<ServiceAreaSchedule[]>(`/service-areas/teams/${teamId}/schedules/batch`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function listApprovedScheduleEvents(accessToken: string, start: string, end: string) {
  const events = await apiRequest<ServiceScheduleEventCandidate[]>(`/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, { accessToken })
  return events.filter((event) => event.status === 'APPROVED' && event.type === 'WORSHIP')
}

export function updateServiceScheduleStatus(accessToken: string, scheduleId: string, input: { status: ServiceScheduleStatus; reason?: string }) {
  return apiRequest<ServiceAreaSchedule>(`/service-areas/schedules/${scheduleId}/status`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function substituteServiceSchedule(accessToken: string, scheduleId: string, input: { personId: string; reason?: string }) {
  return apiRequest<ServiceAreaSchedule>(`/service-areas/schedules/${scheduleId}/substitute`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export type ServiceScheduleNote = {
  id?: string
  data: string
  observacao: string
  serviceAreaId: string
  campusId: string
  eventId: string | null
  updatedByUserId?: string
  createdAt?: string
  updatedAt?: string
}

export function listServiceScheduleNotes(accessToken: string, areaId: string, filters: { start?: string; end?: string }) {
  const search = new URLSearchParams()
  if (filters.start) search.set('start', filters.start)
  if (filters.end) search.set('end', filters.end)
  const suffix = search.size ? `?${search.toString()}` : ''
  return apiRequest<ServiceScheduleNote[]>(`/service-areas/${areaId}/schedule-notes${suffix}`, { accessToken })
}

export function updateServiceScheduleNote(accessToken: string, areaId: string, input: { campusId: string; data: string; eventId?: string; observacao: string }) {
  return apiRequest<ServiceScheduleNote>(`/service-areas/${areaId}/schedule-notes`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deleteServiceSchedule(accessToken: string, scheduleId: string) {
  return apiRequest<{ id: string }>(`/service-areas/schedules/${scheduleId}`, {
    method: 'DELETE',
    accessToken,
  })
}

export function listServiceScheduleSwapCandidates(accessToken: string, scheduleId: string) {
  return apiRequest<ServiceScheduleSwapCandidate[]>(`/service-areas/schedules/${scheduleId}/swap-candidates`, { accessToken })
}

export function createServiceScheduleSwapRequest(accessToken: string, scheduleId: string, input: { replacementPersonId: string; reason?: string }) {
  return apiRequest<ServiceScheduleSwapRequest>(`/service-areas/schedules/${scheduleId}/swap-requests`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function listTeamServiceScheduleSwapRequests(accessToken: string, teamId: string) {
  return apiRequest<ServiceScheduleSwapRequest[]>(`/service-areas/teams/${teamId}/swap-requests`, { accessToken })
}

export function approveServiceScheduleSwapRequest(accessToken: string, requestId: string) {
  return apiRequest<ServiceScheduleSwapRequest>(`/service-areas/swap-requests/${requestId}/approve`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  })
}

export function rejectServiceScheduleSwapRequest(accessToken: string, requestId: string, reason?: string) {
  return apiRequest<ServiceScheduleSwapRequest>(`/service-areas/swap-requests/${requestId}/reject`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(reason ? { reason } : {}),
  })
}

export function listServiceScheduleHistory(accessToken: string, scheduleId: string) {
  return apiRequest<ServiceScheduleHistory[]>(`/service-areas/schedules/${scheduleId}/history`, { accessToken })
}

export function listMyServiceSchedules(accessToken: string, filters: { start?: string; end?: string } = {}) {
  const search = new URLSearchParams()
  if (filters.start) search.set('start', filters.start)
  if (filters.end) search.set('end', filters.end)
  const suffix = search.size ? `?${search.toString()}` : ''
  return apiRequest<ServiceAreaSchedule[]>(`/service-areas/schedules/me${suffix}`, { accessToken })
}

export function listEventServiceSchedules(accessToken: string, eventId: string) {
  return apiRequest<ServiceAreaSchedule[]>(`/service-areas/events/${eventId}/schedules`, { accessToken })
}

export type ServiceOperationalRole = 'WORSHIP_MINISTER'

export type ServiceOperationalRoleAssignment = {
  id: string
  role: ServiceOperationalRole
  inicio: string
  person: {
    id: string
    nome: string
    telefone: string | null
    email: string | null
  }
  serviceArea: {
    id: string
    nome: string
  }
}

export function listServiceOperationalRoles(accessToken: string, teamId: string) {
  return apiRequest<ServiceOperationalRoleAssignment[]>(`/service-areas/teams/${teamId}/operational-roles`, { accessToken })
}

export function assignServiceOperationalRole(accessToken: string, teamId: string, input: { personId: string; role: ServiceOperationalRole }) {
  return apiRequest<ServiceOperationalRoleAssignment>(`/service-areas/teams/${teamId}/operational-roles`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function endServiceOperationalRole(accessToken: string, assignmentId: string) {
  return apiRequest<ServiceOperationalRoleAssignment>(`/service-areas/operational-roles/${assignmentId}/end`, {
    method: 'PATCH',
    accessToken,
  })
}
