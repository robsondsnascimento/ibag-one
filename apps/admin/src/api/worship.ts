import { apiDownload, apiRequest } from './client'
import type { AgendaEvent } from './dashboard'

export type WorshipOrderItem = {
  id: string
  sequencia: number
  titulo: string
  horario: string | null
  observacoes: string | null
  responsiblePerson: {
    id: string
    nome: string
  } | null
  serviceArea: {
    id: string
    nome: string
  } | null
  materials: Array<{
    id: string
    type: string
    titulo: string
    referencia: string | null
  }>
  demands: Array<{
    id: string
    descricao: string
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
    dueAt: string | null
    serviceArea: {
      id: string
      nome: string
    }
    responsiblePerson: {
      id: string
      nome: string
    } | null
  }>
}

export type WorshipOrder = {
  id: string
  status: 'DRAFT' | 'PUBLISHED'
  event: AgendaEvent & {
    schedules: Array<{
      id: string
      data: string
      funcao: string
      status: 'SCHEDULED' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED'
      person: {
        id: string
        nome: string
      }
      team: {
        id: string
        nome: string
        serviceArea: {
          id: string
          nome: string
        }
      }
    }>
  }
  template: {
    id: string
    nome: string
    padrao: boolean
  } | null
  items: WorshipOrderItem[]
}

export type WorshipOrderTemplate = {
  id: string
  nome: string
  ativo: boolean
  padrao: boolean
  items: Array<{
    id: string
    sequencia: number
    titulo: string
    horario: string | null
    serviceArea: {
      id: string
      nome: string
    } | null
  }>
}

export function listApprovedWorshipEvents(accessToken: string) {
  const start = new Date()
  start.setDate(start.getDate() - 30)
  const end = new Date()
  end.setFullYear(end.getFullYear() + 1)
  return apiRequest<AgendaEvent[]>(`/events?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`, { accessToken })
    .then((events) => events.filter((event) => event.type === 'WORSHIP' && event.status === 'APPROVED'))
}

export function listWorshipOrderTemplates(accessToken: string) {
  return apiRequest<WorshipOrderTemplate[]>('/worship-order-templates', { accessToken })
}

export function getWorshipOrderByEvent(accessToken: string, eventId: string) {
  return apiRequest<WorshipOrder>(`/worship-orders/event/${eventId}`, { accessToken })
}

export function createWorshipOrder(accessToken: string, eventId: string) {
  return apiRequest<WorshipOrder>('/worship-orders', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ eventId }),
  })
}

export function createWorshipOrderFromTemplate(accessToken: string, eventId: string, templateId?: string) {
  return apiRequest<WorshipOrder>('/worship-orders/from-template', {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ eventId, ...(templateId ? { templateId } : {}) }),
  })
}

export function addWorshipOrderItem(accessToken: string, orderId: string, input: { sequencia: number; titulo: string; horario?: string; responsiblePersonId?: string; serviceAreaId?: string; observacoes?: string }) {
  return apiRequest<WorshipOrderItem>(`/worship-orders/${orderId}/items`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function publishWorshipOrder(accessToken: string, orderId: string) {
  return apiRequest<WorshipOrder>(`/worship-orders/${orderId}/publish`, {
    method: 'PATCH',
    accessToken,
  })
}

export function updateWorshipOrderItem(accessToken: string, itemId: string, input: { titulo?: string; horario?: string; responsiblePersonId?: string; serviceAreaId?: string; observacoes?: string }) {
  return apiRequest<WorshipOrderItem>(`/worship-orders/items/${itemId}`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deleteWorshipOrderItem(accessToken: string, itemId: string) {
  return apiRequest<unknown>(`/worship-orders/items/${itemId}`, { method: 'DELETE', accessToken })
}

export function reorderWorshipOrderItems(accessToken: string, orderId: string, items: Array<{ id: string; sequencia: number }>) {
  return apiRequest<WorshipOrder>(`/worship-orders/${orderId}/items/order`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items }),
  })
}

export function addWorshipOrderMaterial(accessToken: string, itemId: string, input: { type: string; titulo: string; referencia?: string }) {
  return apiRequest<WorshipOrderItem['materials'][number]>(`/worship-orders/items/${itemId}/materials`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function addWorshipOrderDemand(accessToken: string, itemId: string, input: { descricao: string; serviceAreaId: string; responsiblePersonId?: string; dueAt?: string }) {
  return apiRequest<WorshipOrderItem['demands'][number]>(`/worship-orders/items/${itemId}/demands`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function completeWorshipOrderDemand(accessToken: string, demandId: string) {
  return apiRequest<WorshipOrderItem['demands'][number]>(`/worship-orders/demands/${demandId}/complete`, {
    method: 'PATCH',
    accessToken,
  })
}

export function cancelWorshipOrderDemand(accessToken: string, demandId: string) {
  return apiRequest<WorshipOrderItem['demands'][number]>(`/worship-orders/demands/${demandId}/cancel`, {
    method: 'PATCH',
    accessToken,
  })
}

export function sendWorshipOrderAlert(accessToken: string, orderId: string, input: { titulo: string; mensagem: string }) {
  return apiRequest<unknown>(`/worship-orders/${orderId}/alert`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function downloadWorshipOrderPdf(accessToken: string, orderId: string) {
  return apiDownload(`/worship-orders/${orderId}/pdf`, accessToken)
}

export function createWorshipOrderTemplate(accessToken: string, input: { nome: string; padrao?: boolean; items: Array<{ sequencia: number; titulo: string; horario?: string; serviceAreaId?: string }> }) {
  return apiRequest<WorshipOrderTemplate>('/worship-order-templates', { method: 'POST', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
}

export function updateWorshipOrderTemplate(accessToken: string, templateId: string, input: { nome?: string; ativo?: boolean; padrao?: boolean }) {
  return apiRequest<WorshipOrderTemplate>(`/worship-order-templates/${templateId}`, { method: 'PATCH', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
}

export function addWorshipOrderTemplateItem(accessToken: string, templateId: string, input: { sequencia: number; titulo: string; horario?: string; serviceAreaId?: string }) {
  return apiRequest<WorshipOrderTemplate['items'][number]>(`/worship-order-templates/${templateId}/items`, { method: 'POST', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
}

export function updateWorshipOrderTemplateItem(accessToken: string, itemId: string, input: { titulo?: string; horario?: string; serviceAreaId?: string | null }) {
  return apiRequest<WorshipOrderTemplate['items'][number]>(`/worship-order-templates/items/${itemId}`, { method: 'PATCH', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
}

export function deleteWorshipOrderTemplateItem(accessToken: string, itemId: string) {
  return apiRequest<unknown>(`/worship-order-templates/items/${itemId}`, { method: 'DELETE', accessToken })
}

export function reorderWorshipOrderTemplateItems(accessToken: string, templateId: string, items: Array<{ id: string; sequencia: number }>) {
  return apiRequest<WorshipOrderTemplate>(`/worship-order-templates/${templateId}/items/order`, { method: 'PATCH', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items }) })
}
