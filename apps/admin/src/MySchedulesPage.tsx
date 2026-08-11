import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { listMyServiceSchedules, updateServiceScheduleStatus } from './api/service-areas'
import type { ServiceAreaSchedule } from './api/service-areas'

const statusLabels = {
  SCHEDULED: 'A confirmar',
  CONFIRMED: 'Confirmada',
  DECLINED: 'Recusada',
  COMPLETED: 'Concluída',
} as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value))
}

export function MySchedulesPage({
  accessToken,
  onNotice,
  onNotificationsChanged,
}: {
  accessToken: string
  onNotice: (message: string) => void
  onNotificationsChanged: () => void
}) {
  const [schedules, setSchedules] = useState<ServiceAreaSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [declining, setDeclining] = useState<ServiceAreaSchedule | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')
    void listMyServiceSchedules(accessToken)
      .then((items) => {
        if (active) setSchedules(items)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar suas escalas.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, version])

  const changeStatus = async (schedule: ServiceAreaSchedule, status: 'CONFIRMED' | 'DECLINED', reason?: string) => {
    setIsSaving(true)
    setError('')
    try {
      await updateServiceScheduleStatus(accessToken, schedule.id, { status, reason })
      setDeclining(null)
      setVersion((current) => current + 1)
      onNotificationsChanged()
      onNotice(status === 'CONFIRMED' ? 'Sua presença foi confirmada.' : 'Sua recusa foi registrada e a liderança avisada.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível atualizar sua escala.')
    } finally {
      setIsSaving(false)
    }
  }

  const pending = schedules.filter((schedule) => schedule.status === 'SCHEDULED')

  return <section className="my-schedules-page"><header className="my-schedules-intro"><div><p className="eyebrow">Minha agenda de serviço</p><h2>Minhas escalas</h2><p>Confirme sua disponibilidade ou avise a liderança quando não puder servir.</p></div><span>{pending.length} pendente{pending.length === 1 ? '' : 's'}</span></header>{error && <p className="form-error" role="alert">{error}</p>}{isLoading ? <p className="records-empty">Carregando suas escalas...</p> : schedules.length ? <div className="my-schedule-list">{schedules.map((schedule) => <article className="my-schedule-card" key={schedule.id}><div><span className={`service-schedule-status service-schedule-status--${schedule.status.toLocaleLowerCase('pt-BR')}`}>{statusLabels[schedule.status]}</span><h3>{schedule.funcao}</h3><p>{formatDate(schedule.data)}</p><small>{schedule.team.serviceArea.nome} · {schedule.team.nome}{schedule.event ? ` · ${schedule.event.titulo}` : ''}</small>{schedule.observacao && <small>{schedule.observacao}</small>}</div>{schedule.status === 'SCHEDULED' && <div className="my-schedule-actions"><button className="secondary-button" type="button" disabled={isSaving} onClick={() => setDeclining(schedule)}>Não posso servir</button><button className="primary-button" type="button" disabled={isSaving} onClick={() => void changeStatus(schedule, 'CONFIRMED')}>Confirmar presença</button></div>}</article>)}</div> : <p className="records-empty">Você não possui escalas neste momento.</p>}{declining && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setDeclining(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="my-schedule-decline-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setDeclining(null)}>×</button><p className="eyebrow">{declining.team.nome}</p><h2 id="my-schedule-decline-title">Não posso servir</h2><p className="dialog-description">A liderança receberá um alerta para providenciar uma substituição.</p><form className="event-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); void changeStatus(declining, 'DECLINED', String(form.get('reason') ?? '') || undefined) }}><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Estarei fora da cidade neste fim de semana." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setDeclining(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Registrando...' : 'Confirmar recusa'}</button></div></form></section></div>}</section>
}
