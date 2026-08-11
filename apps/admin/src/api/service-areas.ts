import { apiRequest } from './client'

export type ServiceAreaListItem = {
  id: string
  nome: string
  descricao: string | null
  scope: 'GLOBAL' | 'CAMPUS'
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
    campus: {
      id: string
      nome: string
    }
  }>
  memberships: Array<{
    id: string
    role: 'GENERAL_LEADER' | 'CAMPUS_LEADER' | 'TEAM_LEADER' | 'MEMBER'
    inicio: string
    person: {
      id: string
      nome: string
      telefone: string | null
      email: string | null
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

export function listServiceAreas(accessToken: string) {
  return apiRequest<ServiceAreaListItem[]>('/service-areas', { accessToken })
}

export function getServiceArea(accessToken: string, id: string) {
  return apiRequest<ServiceAreaDetail>(`/service-areas/${id}`, { accessToken })
}

export function createServiceTeam(accessToken: string, areaId: string, input: { nome: string; descricao?: string; campusId: string }) {
  return apiRequest<ServiceAreaDetail['teams'][number]>(`/service-areas/${areaId}/teams`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function addServiceAreaMember(accessToken: string, areaId: string, input: { personId: string; role: ServiceMembershipRole; campusId?: string; teamId?: string }) {
  return apiRequest<unknown>(`/service-areas/${areaId}/members`, {
    method: 'POST',
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
