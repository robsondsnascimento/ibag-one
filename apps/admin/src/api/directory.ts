import { apiRequest } from './client'

export type Paginated<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CellListItem = {
  id: string
  nome: string
  descricao: string | null
  ativo: boolean
  status: string
  meetingDay: string | null
  meetingTime: string | null
  campus: {
    id: string
    nome: string
  }
  network?: {
    id: string
    nome: string
  } | null
  motherCell: {
    id: string
    nome: string
  } | null
}

export type PersonListItem = {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  ativo: boolean
  campus: {
    id: string
    nome: string
  }
  campusMemberships?: Array<{
    campusId: string
    campus: {
      id: string
      nome: string
    }
  }>
  serviceMemberships?: Array<{
    id: string
    role: 'GENERAL_LEADER' | 'CAMPUS_LEADER' | 'TEAM_LEADER' | 'MEMBER'
    inicio: string
    funcoes: string[]
    serviceArea: {
      id: string
      nome: string
    }
    team: {
      id: string
      nome: string
    } | null
  }>
}

export type CampusListItem = {
  id: string
  nome: string
}

export type CellNetworkListItem = {
  id: string
  nome: string
  descricao: string | null
  ativo: boolean
  campus: CampusListItem
  cells: Array<{
    id: string
    nome: string
  }>
  _count: {
    cells: number
  }
}

export type CellCampusCoordination = {
  id: string
  ativo: boolean
  inicio: string
  fim: string | null
  person: CellPersonReference
  campus: CampusListItem
}

export type CellNetworkSupervision = {
  id: string
  ativo: boolean
  inicio: string
  fim: string | null
  person: CellPersonReference
  network: CellNetworkListItem
}

export type CreateCellInput = {
  nome: string
  descricao?: string
  campusId: string
  meetingDay?: string
  meetingTime?: string
}

export type CreatePersonInput = {
  nome: string
  telefone?: string
  email?: string
  campusId: string
  campusIds?: string[]
  organizationId: string
}

export type UpdateCellInput = {
  nome?: string
  descricao?: string | null
  campusId?: string
  meetingDay?: string | null
  meetingTime?: string | null
  ativo?: boolean
}

export type UpdatePersonInput = {
  nome?: string
  telefone?: string | null
  email?: string | null
  campusId?: string
  campusIds?: string[]
}

export type CellPersonReference = {
  id: string
  nome: string
  telefone: string | null
  email: string | null
}

export type CellOverview = {
  cell: CellListItem
  leaderships: Array<{
    id: string
    inicio: string
    person: CellPersonReference
  }>
  supportRoles: Array<{
    id: string
    role: 'LEADER_IN_TRAINING' | 'HOST'
    inicio: string
    person: CellPersonReference
  }>
  memberships: Array<{
    id: string
    inicio: string
    person: CellPersonReference
  }>
  meetings: Array<{
    id: string
    data: string
    tema: string | null
    observacoes: string | null
    visitantes: number
    registroConcluidoEm: string | null
    _count: {
      attendances: number
      visitors: number
    }
  }>
  multiplications: Array<{
    id: string
    data: string
    observacao: string | null
    newCell: {
      id: string
      nome: string
    }
  }>
  coordinations: Array<{
    id: string
    inicio: string
    person: CellPersonReference
  }>
  supervisions: Array<{
    id: string
    inicio: string
    person: CellPersonReference
  }>
  summary: {
    activeMembers: number
    activeLeaderships: number
    multiplicationCount: number
    lastMultiplicationAt: string | null
    currentWeekMeetingAvailable: boolean
    meetingScheduleConfigured: boolean
  }
}

export function listCells(accessToken: string) {
  return apiRequest<Paginated<CellListItem>>('/cells?limit=100', { accessToken })
}

export function listPeople(accessToken: string) {
  return apiRequest<Paginated<PersonListItem>>('/persons?limit=100', { accessToken })
}

export function listCampuses(accessToken: string) {
  return apiRequest<CampusListItem[]>('/campuses', { accessToken })
}

export function listCellNetworks(accessToken: string) {
  return apiRequest<CellNetworkListItem[]>('/cell-networks', { accessToken })
}

export function createCellNetwork(accessToken: string, input: { nome: string; descricao?: string; campusId: string }) {
  return apiRequest<CellNetworkListItem>('/cell-networks', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function assignCellToNetwork(accessToken: string, networkId: string, cellId: string) {
  return apiRequest<CellListItem>(`/cell-networks/${networkId}/cells/${cellId}`, {
    method: 'PATCH',
    accessToken,
  })
}

export function unassignCellFromNetwork(accessToken: string, networkId: string, cellId: string) {
  return apiRequest<CellListItem>(`/cell-networks/${networkId}/cells/${cellId}`, {
    method: 'DELETE',
    accessToken,
  })
}

export function listCellCampusCoordinations(accessToken: string) {
  return apiRequest<CellCampusCoordination[]>('/cell-campus-coordinations', { accessToken })
}

export function createCellCampusCoordination(accessToken: string, input: { personId: string; campusId: string }) {
  return apiRequest<CellCampusCoordination>('/cell-campus-coordinations', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function endCellCampusCoordination(accessToken: string, id: string) {
  return apiRequest<CellCampusCoordination>(`/cell-campus-coordinations/${id}/end`, {
    method: 'PATCH',
    accessToken,
  })
}

export function listCellNetworkSupervisions(accessToken: string) {
  return apiRequest<CellNetworkSupervision[]>('/cell-network-supervisions', { accessToken })
}

export function createCellNetworkSupervision(accessToken: string, input: { personId: string; networkId: string }) {
  return apiRequest<CellNetworkSupervision>('/cell-network-supervisions', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function endCellNetworkSupervision(accessToken: string, id: string) {
  return apiRequest<CellNetworkSupervision>(`/cell-network-supervisions/${id}/end`, {
    method: 'PATCH',
    accessToken,
  })
}

export function createCell(accessToken: string, input: CreateCellInput) {
  return apiRequest<CellListItem>('/cells', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function createPerson(accessToken: string, input: CreatePersonInput) {
  return apiRequest<PersonListItem>('/persons', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function getCell(accessToken: string, id: string) {
  return apiRequest<CellListItem>(`/cells/${id}`, { accessToken })
}

export function getCellOverview(accessToken: string, id: string) {
  return apiRequest<CellOverview>(`/cells/${id}/overview`, { accessToken })
}

export function updateCell(accessToken: string, id: string, input: UpdateCellInput) {
  return apiRequest<CellListItem>(`/cells/${id}`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function getPerson(accessToken: string, id: string) {
  return apiRequest<PersonListItem>(`/persons/${id}`, { accessToken })
}

export function updatePerson(accessToken: string, id: string, input: UpdatePersonInput) {
  return apiRequest<PersonListItem>(`/persons/${id}`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function createCellMembership(accessToken: string, input: { cellId: string; personId: string; confirmTransfer?: boolean }) {
  return apiRequest<{ id: string }>('/cell-memberships', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function endCellMembership(accessToken: string, id: string) {
  return apiRequest<{ id: string }>(`/cell-memberships/${id}/end`, {
    method: 'PATCH',
    accessToken,
  })
}

export function createCellLeadership(accessToken: string, input: { cellId: string; personId: string }) {
  return apiRequest<{ id: string }>('/cell-leaderships', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function endCellLeadership(accessToken: string, id: string) {
  return apiRequest<{ id: string }>(`/cell-leaderships/${id}/end`, {
    method: 'PATCH',
    accessToken,
  })
}

export function createCellSupportRole(accessToken: string, input: { cellId: string; personId: string; role: 'LEADER_IN_TRAINING' | 'HOST' }) {
  return apiRequest<{ id: string }>('/cell-support-roles', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function endCellSupportRole(accessToken: string, id: string) {
  return apiRequest<{ id: string }>(`/cell-support-roles/${id}/end`, {
    method: 'PATCH',
    accessToken,
  })
}

export type CellMeetingRosterItem = {
  person: CellPersonReference
  attendance: {
    presente: boolean
    observacao: string | null
  } | null
}

export type CellMeetingVisitor = {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  observacao: string | null
  createdAt: string
  personId: string | null
  visitCount: number
  eligibleForMembership: boolean
}

type CellMeetingVisitorCreation = {
  visitor: CellMeetingVisitor
  membershipSuggestion: {
    eligible: boolean
    visits: number
    cellId: string
  }
}

export type CellMeetingVisitorConversion = {
  person: {
    id: string
    nome: string
  }
  membership: {
    id: string
    cellId: string
  }
  created: boolean
  requiresTransfer: boolean
}

export function createCellMeeting(accessToken: string, input: { cellId: string; data: string; tema?: string; observacoes?: string; visitantes?: number }) {
  return apiRequest<{ id: string }>('/cell-meetings', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function getCellMeetingRoster(accessToken: string, meetingId: string) {
  return apiRequest<CellMeetingRosterItem[]>(`/cell-meeting-attendances/meeting/${meetingId}/roster`, { accessToken })
}

export function saveCellMeetingRoster(accessToken: string, meetingId: string, attendances: Array<{ personId: string; presente: boolean }>) {
  return apiRequest<unknown>(`/cell-meeting-attendances/meeting/${meetingId}/roster`, {
    method: 'PUT',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ attendances }),
  })
}

export function closeCellMeeting(accessToken: string, meetingId: string) {
  return apiRequest<{ id: string }>(`/cell-meetings/${meetingId}/close`, {
    method: 'PATCH',
    accessToken,
  })
}

export function listCellMeetingVisitors(accessToken: string, meetingId: string) {
  return apiRequest<CellMeetingVisitor[]>(`/cell-meeting-visitors/meeting/${meetingId}`, { accessToken })
}

export function createCellMeetingVisitor(accessToken: string, input: { meetingId: string; nome: string; telefone: string; email?: string; observacao?: string }) {
  return apiRequest<CellMeetingVisitorCreation>('/cell-meeting-visitors', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function convertCellMeetingVisitorToMember(accessToken: string, visitorId: string) {
  return apiRequest<CellMeetingVisitorConversion>(`/cell-meeting-visitors/${visitorId}/convert-to-member`, {
    method: 'PATCH',
    accessToken,
  })
}
