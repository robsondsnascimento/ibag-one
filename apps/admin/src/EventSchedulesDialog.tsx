import { useEffect, useState } from 'react'
import { listEventServiceSchedules } from './api/service-areas'
import type { ServiceAreaSchedule } from './api/service-areas'
import type { AgendaEvent } from './api/dashboard'

const statusLabels = {
  SCHEDULED: 'A confirmar',
  CONFIRMED: 'Confirmada',
  DECLINED: 'Recusada',
  COMPLETED: 'Concluída',
} as const

export function EventSchedulesDialog({ event, accessToken, onClose }: { event: AgendaEvent; accessToken: string; onClose: () => void }) {
  const [schedules, setSchedules] = useState<ServiceAreaSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void listEventServiceSchedules(accessToken, event.id)
      .then((items) => {
        if (active) setSchedules(items)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar as escalas deste evento.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, event.id])

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="event-dialog event-dialog--event-schedules" role="dialog" aria-modal="true" aria-labelledby="event-schedules-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={onClose}>×</button><p className="eyebrow">Escalas do evento</p><h2 id="event-schedules-title">{event.titulo}</h2><p className="dialog-description">As escalas são exibidas somente para consulta. A edição continua sendo feita pela Área de Serviço.</p>{isLoading ? <p className="dialog-description">Carregando escalas...</p> : error ? <p className="form-error">{error}</p> : schedules.length ? <div className="event-schedule-list">{schedules.map((schedule) => <article key={schedule.id}><span className={`service-schedule-status service-schedule-status--${schedule.status.toLocaleLowerCase('pt-BR')}`}>{statusLabels[schedule.status]}</span><div><strong>{schedule.person.nome}</strong><small>{schedule.funcao} · {schedule.team.serviceArea.nome} · {schedule.team.nome}</small></div></article>)}</div> : <p className="record-detail-note">Não há escalas vinculadas a este evento.</p>}</section></div>
}
