import { useEffect, useState } from 'react'
import { listMyNotifications, markNotificationRead } from './api/notifications'
import type { InboxNotification } from './api/notifications'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function NotificationDialog({ accessToken, onClose, onUnreadCountChange }: { accessToken: string; onClose: () => void; onUnreadCountChange: (count: number) => void }) {
  const [items, setItems] = useState<InboxNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void listMyNotifications(accessToken)
      .then((notifications) => {
        if (!active) return
        setItems(notifications)
        onUnreadCountChange(notifications.filter((item) => !item.readAt).length)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar suas notificações.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, onUnreadCountChange])

  const markRead = async (item: InboxNotification) => {
    if (item.readAt) return
    try {
      await markNotificationRead(accessToken, item.id)
      setItems((current) => {
        const next = current.map((entry) => entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)
        onUnreadCountChange(next.filter((entry) => !entry.readAt).length)
        return next
      })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível marcar esta notificação como lida.')
    }
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="event-dialog event-dialog--notifications" role="dialog" aria-modal="true" aria-labelledby="notifications-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={onClose}>×</button><p className="eyebrow">Central de avisos</p><h2 id="notifications-title">Notificações</h2>{isLoading ? <p className="dialog-description">Carregando notificações...</p> : error ? <p className="form-error">{error}</p> : items.length ? <div className="notification-list">{items.map((item) => <button className={`notification-item ${item.readAt ? '' : 'notification-item--unread'}`} type="button" key={item.id} onClick={() => void markRead(item)}><span>{item.readAt ? '✓' : '•'}</span><div><strong>{item.notification.titulo}</strong><p>{item.notification.mensagem}</p>{item.notification.event && <small>{item.notification.event.titulo} · {formatDate(item.notification.event.inicio)}</small>}<small>{formatDate(item.deliveredAt)}</small></div></button>)}</div> : <p className="record-detail-note">Você não possui notificações.</p>}</section></div>
}
