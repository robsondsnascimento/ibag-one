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
  inicio: string
  fim: string
  status: 'REQUESTED' | 'APPROVED' | string
  type: string
  campus: {
    nome: string
  }
  cell: {
    id: string
    nome: string
  } | null
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
}

export function createAgendaEvent(accessToken: string, input: CreateAgendaEventInput) {
  return apiRequest<AgendaEvent>('/events', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1))
  return result
}
