import { apiRequest } from './client'

type Paginated<T> = {
  data: T[]
  meta: {
    total: number
  }
}

export type DashboardCell = {
  id: string
  nome: string
  ativo: boolean
  status: string
  campus: {
    nome: string
  }
}

export type AgendaEvent = {
  id: string
  titulo: string
  descricao: string | null
  inicio: string
  fim: string
  status: 'REQUESTED' | 'APPROVED' | 'CANCELLED' | string
  type: string
  campus: {
    id: string
    nome: string
  }
  cell: {
    id: string
    nome: string
  } | null
  alertEnabled: boolean
  blocksCampusAgenda: boolean
  createdByUserId: string
  spaces: Array<{
    spaceId: string
    space: EventSpace
  }>
  serviceAreas: Array<{
    serviceAreaId: string
    serviceArea: EventServiceArea
  }>
  teams: Array<{
    teamId: string
    team: EventServiceTeam
  }>
  checklist: EventChecklistItem[]
}

export type EventSpace = {
  id: string
  nome: string
  capacidade: number | null
  recursos: string | null
  campus: {
    id: string
    nome: string
  }
}

export type EventServiceArea = {
  id: string
  nome: string
}

export type EventServiceTeam = {
  id: string
  nome: string
}

export type EventChecklistItem = {
  id: string
  descricao: string
  concluido: boolean
  concluidoEm: string | null
}

export type DashboardSummary = {
  activeCells: number
  inactiveCells: number
  peopleTotal: number
  requestedEvents: number
  weekEvents: AgendaEvent[]
  cellsByCampus: Array<{
    campus: string
    total: number
  }>
}

export async function loadDashboard(accessToken: string): Promise<DashboardSummary> {
  const start = startOfWeek(new Date())
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const [cells, people, events] = await Promise.all([
    apiRequest<Paginated<DashboardCell>>('/cells?limit=100', { accessToken }),
    apiRequest<Paginated<unknown>>('/persons?limit=1', { accessToken }),
    apiRequest<AgendaEvent[]>(`/events?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`, { accessToken }),
  ])

  const activeCells = cells.data.filter((cell) => cell.ativo && cell.status === 'ACTIVE')
  const campusTotals = new Map<string, number>()
  activeCells.forEach((cell) => {
    campusTotals.set(cell.campus.nome, (campusTotals.get(cell.campus.nome) ?? 0) + 1)
  })

  return {
    activeCells: activeCells.length,
    inactiveCells: cells.data.filter((cell) => !cell.ativo || cell.status !== 'ACTIVE').length,
    peopleTotal: people.meta.total,
    requestedEvents: events.filter((event) => event.status === 'REQUESTED').length,
    weekEvents: events,
    cellsByCampus: [...campusTotals.entries()]
      .map(([campus, total]) => ({ campus, total }))
      .sort((first, second) => second.total - first.total),
  }
}

export function loadAgenda(accessToken: string, weekStart: Date) {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 7)
  return apiRequest<AgendaEvent[]>(`/events?start=${encodeURIComponent(weekStart.toISOString())}&end=${encodeURIComponent(end.toISOString())}`, { accessToken })
}

export type CreateAgendaEventInput = {
  titulo: string
  descricao?: string
  type: string
  campusId: string
  inicio: string
  fim: string
  cellId?: string
  alertEnabled?: boolean
  blocksCampusAgenda?: boolean
  spaceIds?: string[]
  serviceAreaIds?: string[]
  teamIds?: string[]
}

export function createAgendaEvent(accessToken: string, input: CreateAgendaEventInput) {
  return apiRequest<AgendaEvent>('/events', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function updateAgendaEvent(accessToken: string, eventId: string, input: Partial<CreateAgendaEventInput>) {
  return apiRequest<AgendaEvent>(`/events/${eventId}`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function approveAgendaEvent(accessToken: string, eventId: string) {
  return apiRequest<AgendaEvent>(`/events/${eventId}/approve`, {
    method: 'PATCH',
    accessToken,
  })
}

export function cancelAgendaEvent(accessToken: string, eventId: string) {
  return apiRequest<AgendaEvent>(`/events/${eventId}/cancel`, {
    method: 'PATCH',
    accessToken,
  })
}

export function listEventSpaces(accessToken: string, campusId: string) {
  return apiRequest<EventSpace[]>(`/spaces?campusId=${encodeURIComponent(campusId)}`, { accessToken })
}

export function addAgendaEventChecklist(accessToken: string, eventId: string, descricao: string) {
  return apiRequest<EventChecklistItem>(`/events/${eventId}/checklist`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ descricao }),
  })
}

export function toggleAgendaEventChecklist(accessToken: string, checklistId: string) {
  return apiRequest<EventChecklistItem>(`/events/checklist/${checklistId}/toggle`, {
    method: 'PATCH',
    accessToken,
  })
}

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1))
  return result
}
