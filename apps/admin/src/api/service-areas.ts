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

export function listServiceAreas(accessToken: string) {
  return apiRequest<ServiceAreaListItem[]>('/service-areas', { accessToken })
}

export function getServiceArea(accessToken: string, id: string) {
  return apiRequest<ServiceAreaDetail>(`/service-areas/${id}`, { accessToken })
}
