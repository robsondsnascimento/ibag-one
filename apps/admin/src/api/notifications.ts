import { apiRequest } from './client'

export type InboxNotification = {
  id: string
  deliveredAt: string
  readAt: string | null
  notification: {
    id: string
    titulo: string
    mensagem: string
    createdAt: string
    event: {
      id: string
      titulo: string
      inicio: string
    } | null
  }
}

export function listMyNotifications(accessToken: string) {
  return apiRequest<InboxNotification[]>('/notifications/mine', { accessToken })
}

export function markNotificationRead(accessToken: string, recipientId: string) {
  return apiRequest<unknown>(`/notifications/recipients/${recipientId}/read`, {
    method: 'PATCH',
    accessToken,
  })
}
