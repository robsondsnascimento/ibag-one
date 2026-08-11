import { apiRequest } from './client'

export type WorshipRepertoireSong = {
  id: string
  sequencia: number
  titulo: string
  tom: string | null
  artista: string | null
  referencia: string | null
  observacoes: string | null
}

export type WorshipRepertoire = {
  id: string
  status: 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'APPROVED' | 'SENT_TO_WORSHIP_ORDER' | 'COMPLETED'
  reviewComment: string | null
  submissionDeadline: string
  isLateSubmission: boolean
  serviceAreaId: string
  serviceArea: { id: string; nome: string }
  songs: WorshipRepertoireSong[]
}

export function listWorshipRepertoires(accessToken: string, eventId: string) {
  return apiRequest<WorshipRepertoire[]>(`/worship-repertoires/event/${eventId}`, { accessToken })
}

export function createWorshipRepertoire(accessToken: string, input: { eventId: string; serviceAreaId: string; songs: Array<{ sequencia: number; titulo: string; tom?: string; artista?: string; referencia?: string; observacoes?: string }> }) {
  return apiRequest<WorshipRepertoire>('/worship-repertoires', { method: 'POST', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
}

export function addWorshipRepertoireSong(accessToken: string, repertoireId: string, input: { sequencia: number; titulo: string; tom?: string; artista?: string; referencia?: string; observacoes?: string }) {
  return apiRequest<WorshipRepertoireSong>(`/worship-repertoires/${repertoireId}/songs`, { method: 'POST', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
}

export function submitWorshipRepertoire(accessToken: string, repertoireId: string) { return apiRequest<WorshipRepertoire>(`/worship-repertoires/${repertoireId}/submit`, { method: 'PATCH', accessToken }) }
export function approveWorshipRepertoire(accessToken: string, repertoireId: string, comentario?: string) { return apiRequest<WorshipRepertoire>(`/worship-repertoires/${repertoireId}/approve`, { method: 'PATCH', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify(comentario ? { comentario } : {}) }) }
export function returnWorshipRepertoire(accessToken: string, repertoireId: string, comentario: string) { return apiRequest<WorshipRepertoire>(`/worship-repertoires/${repertoireId}/return`, { method: 'PATCH', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ comentario }) }) }
export function sendWorshipRepertoireToOrder(accessToken: string, repertoireId: string, input: { orderItemId?: string; receivingServiceAreaId: string; dueAt?: string }) { return apiRequest<WorshipRepertoire>(`/worship-repertoires/${repertoireId}/send-to-worship-order`, { method: 'PATCH', accessToken, headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }) }
