import { apiDownload, apiFormRequest, apiRequest } from './client'

export type CellStudy = {
  id: string
  titulo: string
  descricao: string | null
  weekStart: string
  attachmentName: string
  createdAt: string
}

export async function getStudyForWeek(accessToken: string, weekStart: string) {
  return apiRequest<CellStudy | null>(`/cell-studies?weekStart=${encodeURIComponent(weekStart)}`, { accessToken })
}

export async function getCurrentCellStudy(accessToken: string) {
  return apiRequest<CellStudy>('/cell-studies/current', { accessToken })
}

export async function publishCellStudy(accessToken: string, input: { titulo: string; weekStart: string; descricao?: string; file: File }) {
  const form = new FormData()
  form.append('titulo', input.titulo)
  form.append('weekStart', input.weekStart)
  if (input.descricao) form.append('descricao', input.descricao)
  form.append('file', input.file)
  return apiFormRequest<CellStudy>('/cell-studies', accessToken, form)
}

export async function downloadCurrentCellStudy(accessToken: string) {
  return apiDownload('/cell-studies/current/download', accessToken)
}
