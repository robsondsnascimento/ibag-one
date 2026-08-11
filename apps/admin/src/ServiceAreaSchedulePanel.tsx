import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { approveServiceScheduleSwapRequest, createServiceSchedule, createServiceScheduleBatch, listApprovedScheduleEvents, listServiceAreaSchedules, listServiceScheduleHistory, listTeamServiceScheduleSwapRequests, rejectServiceScheduleSwapRequest, substituteServiceSchedule, updateServiceScheduleStatus } from './api/service-areas'
import type { ServiceAreaDetail, ServiceAreaSchedule, ServiceScheduleEventCandidate, ServiceScheduleHistory, ServiceScheduleStatus, ServiceScheduleSwapRequest } from './api/service-areas'

const statusLabels: Record<ServiceScheduleStatus, string> = {
  SCHEDULED: 'A confirmar',
  CONFIRMED: 'Confirmada',
  DECLINED: 'Recusada',
  COMPLETED: 'Concluída',
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

function defaultPeriod() {
  const start = new Date()
  start.setDate(1)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 2, 0)
  return { start: toDateInputValue(start), end: toDateInputValue(end) }
}

function toPeriodStart(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined
}

function toPeriodEnd(value: string) {
  return value ? new Date(`${value}T23:59:59`).toISOString() : undefined
}

function formatScheduleDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function historyLabel(item: ServiceScheduleHistory) {
  if (item.action === 'CREATED') return 'Escala criada'
  if (item.action === 'SUBSTITUTED') return `Substituição: ${item.previousPersonName ?? 'Pessoa anterior'} → ${item.replacementPersonName ?? 'Nova pessoa'}`
  return `Status alterado para ${item.newStatus ? statusLabels[item.newStatus] : 'atualizado'}`
}

type ScheduleAction =
  | { type: 'decline'; schedule: ServiceAreaSchedule }
  | { type: 'substitute'; schedule: ServiceAreaSchedule }
  | { type: 'reject-swap'; request: ServiceScheduleSwapRequest }

export function ServiceAreaSchedulePanel({
  area,
  accessToken,
  currentPersonId,
  canManage,
  onNotice,
}: {
  area: ServiceAreaDetail
  accessToken: string
  currentPersonId: string
  canManage: boolean
  onNotice: (message: string) => void
}) {
  const period = useMemo(defaultPeriod, [])
  const [start, setStart] = useState(period.start)
  const [end, setEnd] = useState(period.end)
  const [teamId, setTeamId] = useState('')
  const [status, setStatus] = useState<ServiceScheduleStatus | ''>('')
  const [schedules, setSchedules] = useState<ServiceAreaSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isBatchOpen, setIsBatchOpen] = useState(false)
  const [createDate, setCreateDate] = useState('')
  const [eventCandidates, setEventCandidates] = useState<ServiceScheduleEventCandidate[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [eventError, setEventError] = useState('')
  const [action, setAction] = useState<ScheduleAction | null>(null)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [history, setHistory] = useState<ServiceScheduleHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [swapRequests, setSwapRequests] = useState<ServiceScheduleSwapRequest[]>([])
  const [isLoadingSwapRequests, setIsLoadingSwapRequests] = useState(false)
  const [swapRequestsError, setSwapRequestsError] = useState('')

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')
    void listServiceAreaSchedules(accessToken, area.id, {
      start: toPeriodStart(start),
      end: toPeriodEnd(end),
      teamId: teamId || undefined,
      status: status || undefined,
    })
      .then((items) => {
        if (active) setSchedules(items)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar as escalas desta área.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, area.id, end, start, status, teamId, version])

  useEffect(() => {
    if (!canManage) {
      setSwapRequests([])
      return
    }
    let active = true
    setIsLoadingSwapRequests(true)
    setSwapRequestsError('')
    void Promise.allSettled(area.teams.map((team) => listTeamServiceScheduleSwapRequests(accessToken, team.id)))
      .then((results) => {
        if (active) setSwapRequests(results.flatMap((result) => result.status === 'fulfilled' ? result.value : []))
      })
      .catch((reason) => {
        if (active) setSwapRequestsError(reason instanceof Error ? reason.message : 'Não foi possível carregar as solicitações de troca.')
      })
      .finally(() => {
        if (active) setIsLoadingSwapRequests(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, area.teams, canManage, version])

  useEffect(() => {
    if (!isCreateOpen && !isBatchOpen) return
    const firstDay = new Date()
    firstDay.setDate(firstDay.getDate() - 7)
    const lastDay = new Date()
    lastDay.setFullYear(lastDay.getFullYear() + 1)
    let active = true
    setIsLoadingEvents(true)
    setEventError('')
    void listApprovedScheduleEvents(accessToken, firstDay.toISOString(), lastDay.toISOString())
      .then((items) => {
        if (active) setEventCandidates(items)
      })
      .catch((reason) => {
        if (active) setEventError(reason instanceof Error ? reason.message : 'Não foi possível carregar os eventos aprovados.')
      })
      .finally(() => {
        if (active) setIsLoadingEvents(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, isBatchOpen, isCreateOpen])

  const refresh = () => setVersion((value) => value + 1)
  const selectedTeamMembers = (selectedTeamId: string) => {
    const people = area.memberships
      .filter((membership) => membership.team?.id === selectedTeamId)
      .map((membership) => membership.person)
    return [...new Map(people.map((person) => [person.id, person])).values()]
  }
  const pendingCount = schedules.filter((schedule) => schedule.status === 'SCHEDULED').length
  const declinedCount = schedules.filter((schedule) => schedule.status === 'DECLINED').length

  const saveSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const selectedTeamId = String(form.get('teamId') ?? '')
    const data = String(form.get('data') ?? '')
    if (!selectedTeamId || !data) return
    setIsSaving(true)
    setError('')
    try {
      await createServiceSchedule(accessToken, selectedTeamId, {
        personId: String(form.get('personId') ?? ''),
        data: new Date(data).toISOString(),
        funcao: String(form.get('funcao') ?? ''),
        observacao: String(form.get('observacao') ?? '') || undefined,
        eventId: String(form.get('eventId') ?? '') || undefined,
      })
      setIsCreateOpen(false)
      refresh()
      onNotice('Escala criada e enviada para confirmação da pessoa.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível criar esta escala.')
    } finally {
      setIsSaving(false)
    }
  }

  const saveScheduleBatch = async (input: { teamId: string; data: string; eventId?: string; observacao?: string; schedules: Array<{ personId: string; funcao: string }> }) => {
    setIsSaving(true)
    setError('')
    try {
      await createServiceScheduleBatch(accessToken, input.teamId, {
        schedules: input.schedules.map((schedule) => ({
          ...schedule,
          data: new Date(input.data).toISOString(),
          eventId: input.eventId,
          observacao: input.observacao,
        })),
      })
      setIsBatchOpen(false)
      refresh()
      onNotice(`${input.schedules.length} escalas foram criadas e enviadas para confirmação.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível criar este lote de escalas.')
    } finally {
      setIsSaving(false)
    }
  }

  const changeStatus = async (schedule: ServiceAreaSchedule, nextStatus: ServiceScheduleStatus, reason?: string) => {
    setIsSaving(true)
    setError('')
    try {
      await updateServiceScheduleStatus(accessToken, schedule.id, { status: nextStatus, reason })
      setAction(null)
      refresh()
      onNotice(nextStatus === 'DECLINED' ? 'Recusa registrada e liderança avisada.' : `Escala marcada como ${statusLabels[nextStatus].toLocaleLowerCase('pt-BR')}.`)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível atualizar esta escala.')
    } finally {
      setIsSaving(false)
    }
  }

  const saveSubstitution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!action || action.type !== 'substitute') return
    const form = new FormData(event.currentTarget)
    setIsSaving(true)
    setError('')
    try {
      await substituteServiceSchedule(accessToken, action.schedule.id, {
        personId: String(form.get('personId') ?? ''),
        reason: String(form.get('reason') ?? '') || undefined,
      })
      setAction(null)
      refresh()
      onNotice('Substituição registrada. A nova pessoa precisa confirmar a escala.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível substituir a pessoa escalada.')
    } finally {
      setIsSaving(false)
    }
  }

  const approveSwapRequest = async (request: ServiceScheduleSwapRequest) => {
    setIsSaving(true)
    setError('')
    try {
      await approveServiceScheduleSwapRequest(accessToken, request.id)
      refresh()
      onNotice('Troca aprovada. A nova pessoa foi escalada e precisa confirmar presença.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível aprovar a solicitação de troca.')
    } finally {
      setIsSaving(false)
    }
  }

  const rejectSwapRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!action || action.type !== 'reject-swap') return
    const form = new FormData(event.currentTarget)
    setIsSaving(true)
    setError('')
    try {
      await rejectServiceScheduleSwapRequest(accessToken, action.request.id, String(form.get('reason') ?? '') || undefined)
      setAction(null)
      refresh()
      onNotice('Solicitação de troca recusada. A pessoa solicitante foi avisada.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível recusar a solicitação de troca.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleHistory = async (scheduleId: string) => {
    if (activeHistoryId === scheduleId) {
      setActiveHistoryId(null)
      setHistory([])
      setHistoryError('')
      return
    }
    setActiveHistoryId(scheduleId)
    setHistory([])
    setHistoryError('')
    setIsLoadingHistory(true)
    try {
      setHistory(await listServiceScheduleHistory(accessToken, scheduleId))
    } catch (failure) {
      setHistoryError(failure instanceof Error ? failure.message : 'Não foi possível carregar o histórico da escala.')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  return (
    <section className="service-area-panel service-area-panel--schedules">
      <header>
        <div><p className="eyebrow">Escalas</p><h2>Serviços da área</h2></div>
        {canManage && <div className="service-schedule-header-actions"><button className="secondary-button" type="button" disabled={area.teams.length === 0} onClick={() => { setEventCandidates([]); setIsBatchOpen(true) }}>Escala em lote</button><button className="primary-button" type="button" disabled={area.teams.length === 0} onClick={() => { setCreateDate(''); setEventCandidates([]); setIsCreateOpen(true) }}>+ Nova escala</button></div>}
      </header>

      <form className="service-schedule-filters" onSubmit={(event) => { event.preventDefault(); refresh() }}>
        <label>De<input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label>Até<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label>Equipe<select value={teamId} onChange={(event) => setTeamId(event.target.value)}><option value="">Todas as equipes</option>{area.teams.map((team) => <option value={team.id} key={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as ServiceScheduleStatus | '')}><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <button className="secondary-button" type="submit">Atualizar</button>
      </form>

      {canManage && !isLoading && <section className="service-schedule-pending"><div><span>Pendências no período</span><strong>{pendingCount + declinedCount}</strong></div><button type="button" className={status === 'SCHEDULED' ? 'service-pending-card service-pending-card--active' : 'service-pending-card'} onClick={() => setStatus(status === 'SCHEDULED' ? '' : 'SCHEDULED')}><strong>{pendingCount}</strong><span>Aguardando confirmação</span></button><button type="button" className={status === 'DECLINED' ? 'service-pending-card service-pending-card--active service-pending-card--declined' : 'service-pending-card service-pending-card--declined'} onClick={() => setStatus(status === 'DECLINED' ? '' : 'DECLINED')}><strong>{declinedCount}</strong><span>Recusas para resolver</span></button></section>}

      {canManage && <section className="service-schedule-swap-requests"><header><div><p className="eyebrow">Trocas</p><h3>Solicitações para aprovar</h3></div><span>{swapRequests.length}</span></header>{isLoadingSwapRequests ? <p className="service-area-empty">Carregando solicitações de troca...</p> : swapRequestsError ? <p className="form-error">{swapRequestsError}</p> : swapRequests.length ? <div className="service-schedule-swap-list">{swapRequests.map((request) => <article key={request.id}><div><strong>{request.schedule.funcao} · {request.schedule.team.nome}</strong><span>{request.requesterPerson.nome} → {request.replacementPerson.nome}</span><small>{formatScheduleDate(request.schedule.data)}{request.schedule.event ? ` · ${request.schedule.event.titulo}` : ''}</small>{request.reason && <small>Motivo: {request.reason}</small>}</div><div className="service-schedule-actions"><button type="button" className="schedule-action schedule-action--confirm" disabled={isSaving} onClick={() => void approveSwapRequest(request)}>Aprovar</button><button type="button" className="schedule-action" disabled={isSaving} onClick={() => setAction({ type: 'reject-swap', request })}>Recusar</button></div></article>)}</div> : <p className="service-area-empty">Não há solicitações de troca pendentes.</p>}</section>}

      {error && <p className="form-error service-schedule-error" role="alert">{error}</p>}
      {isLoading ? <p className="service-area-empty">Carregando escalas...</p> : schedules.length ? <div className="service-schedule-list">{schedules.map((schedule) => {
        const ownSchedule = schedule.person.id === currentPersonId
        const canSubstitute = canManage && schedule.status !== 'COMPLETED'
        return <article className="service-schedule-row" key={schedule.id}>
          <div className="service-schedule-date"><strong>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(schedule.data)).replace('.', '')}</strong><span>{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(schedule.data))}</span></div>
          <div className="service-schedule-main"><strong>{schedule.funcao}</strong><span>{schedule.person.nome} · {schedule.team.nome}</span>{schedule.event && <small>{schedule.event.titulo}</small>}{schedule.observacao && <small>{schedule.observacao}</small>}</div>
          <span className={`service-schedule-status service-schedule-status--${schedule.status.toLocaleLowerCase('pt-BR')}`}>{statusLabels[schedule.status]}</span>
          <div className="service-schedule-actions">
            {ownSchedule && schedule.status === 'SCHEDULED' && <><button type="button" className="schedule-action schedule-action--confirm" disabled={isSaving} onClick={() => void changeStatus(schedule, 'CONFIRMED')}>Confirmar</button><button type="button" className="schedule-action" disabled={isSaving} onClick={() => setAction({ type: 'decline', schedule })}>Recusar</button></>}
            {canManage && schedule.status !== 'COMPLETED' && <button type="button" className="schedule-action" disabled={isSaving} onClick={() => void changeStatus(schedule, 'COMPLETED')}>Concluir</button>}
            {canManage && schedule.status === 'COMPLETED' && <button type="button" className="schedule-action" disabled={isSaving} onClick={() => void changeStatus(schedule, 'SCHEDULED')}>Reabrir</button>}
            {canSubstitute && <button type="button" className="schedule-action" disabled={isSaving} onClick={() => setAction({ type: 'substitute', schedule })}>Substituir</button>}
            <button type="button" className="schedule-action" onClick={() => void toggleHistory(schedule.id)}>{activeHistoryId === schedule.id ? 'Ocultar histórico' : 'Histórico'}</button>
          </div>
          {activeHistoryId === schedule.id && <div className="service-schedule-history">{isLoadingHistory ? <p>Carregando histórico...</p> : historyError ? <p className="form-error">{historyError}</p> : history.length ? history.map((item) => <article key={item.id}><strong>{historyLabel(item)}</strong><span>{formatScheduleDate(item.createdAt)} · {item.changedByUser.loginEmail}</span>{item.reason && <small>{item.reason}</small>}</article>) : <p>Nenhuma alteração registrada.</p>}</div>}
        </article>
      })}</div> : <p className="service-area-empty">Não há escalas neste período para os filtros escolhidos.</p>}

      {isCreateOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setIsCreateOpen(false)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-create-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setIsCreateOpen(false)}>×</button><p className="eyebrow">{area.nome}</p><h2 id="schedule-create-title">Nova escala</h2><p className="dialog-description">A escala pertence à equipe. Quando houver evento, ele apenas exibirá a escala — a gestão continua sendo da área.</p><form className="event-form" onSubmit={saveSchedule}><SchedulePersonSelect area={area} events={eventCandidates} isLoadingEvents={isLoadingEvents} eventError={eventError} onEventSelect={(selectedEvent) => setCreateDate(selectedEvent ? toDateTimeLocalValue(selectedEvent.inicio) : '')} /><label>Data e horário<input name="data" type="datetime-local" required value={createDate} onChange={(event) => setCreateDate(event.target.value)} /></label><label>Função<input name="funcao" required minLength={2} maxLength={100} placeholder="Ex.: Recepção" /></label><label>Observação <span className="field-optional">(opcional)</span><input name="observacao" maxLength={1000} placeholder="Informação útil para a pessoa escalada" /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Criando...' : 'Criar escala'}</button></div></form></section></div>}

      {isBatchOpen && <ServiceScheduleBatchDialog area={area} events={eventCandidates} isLoadingEvents={isLoadingEvents} eventError={eventError} isSaving={isSaving} onClose={() => setIsBatchOpen(false)} onSave={saveScheduleBatch} />}

      {action?.type === 'decline' && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAction(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-decline-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setAction(null)}>×</button><p className="eyebrow">Sua escala</p><h2 id="schedule-decline-title">Recusar escala</h2><p className="dialog-description">A liderança da área será avisada para providenciar uma substituição.</p><form className="event-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void changeStatus(action.schedule, 'DECLINED', String(form.get('reason') ?? '') || undefined) }}><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Estarei fora da cidade neste fim de semana." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setAction(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Registrando...' : 'Confirmar recusa'}</button></div></form></section></div>}

      {action?.type === 'substitute' && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAction(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-substitute-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setAction(null)}>×</button><p className="eyebrow">{action.schedule.team.nome}</p><h2 id="schedule-substitute-title">Substituir pessoa escalada</h2><p className="dialog-description">A nova pessoa receberá uma solicitação de confirmação. O sistema verificará conflitos de horário.</p><form className="event-form" onSubmit={saveSubstitution}><label>Nova pessoa<select name="personId" required defaultValue=""><option value="" disabled>Selecione uma pessoa da equipe</option>{selectedTeamMembers(action.schedule.team.id).filter((person) => person.id !== action.schedule.person.id).map((person) => <option value={person.id} key={person.id}>{person.nome}</option>)}</select></label><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Substituição após recusa." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setAction(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Substituindo...' : 'Confirmar substituição'}</button></div></form></section></div>}
      {action?.type === 'reject-swap' && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAction(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-swap-reject-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setAction(null)}>×</button><p className="eyebrow">Solicitação de troca</p><h2 id="schedule-swap-reject-title">Recusar troca</h2><p className="dialog-description">A escala permanecerá com {action.request.requesterPerson.nome}. Você pode informar o motivo para orientar a pessoa.</p><form className="event-form" onSubmit={rejectSwapRequest}><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Precisamos manter a composição atual deste culto." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setAction(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Recusando...' : 'Recusar solicitação'}</button></div></form></section></div>}
    </section>
  )
}

function ServiceScheduleBatchDialog({
  area,
  events,
  isLoadingEvents,
  eventError,
  isSaving,
  onClose,
  onSave,
}: {
  area: ServiceAreaDetail
  events: ServiceScheduleEventCandidate[]
  isLoadingEvents: boolean
  eventError: string
  isSaving: boolean
  onClose: () => void
  onSave: (input: { teamId: string; data: string; eventId?: string; observacao?: string; schedules: Array<{ personId: string; funcao: string }> }) => Promise<void>
}) {
  const [teamId, setTeamId] = useState('')
  const [eventId, setEventId] = useState('')
  const [data, setData] = useState('')
  const [selectedPeople, setSelectedPeople] = useState<string[]>([])
  const [formError, setFormError] = useState('')
  const people = area.memberships.filter((membership) => membership.team?.id === teamId).map((membership) => membership.person)
  const teamPeople = [...new Map(people.map((person) => [person.id, person])).values()]
  const teamEvents = events.filter((event) => event.teams.some((item) => item.teamId === teamId))

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!teamId || !data || selectedPeople.length === 0) {
      setFormError('Escolha a equipe, a data e ao menos uma pessoa para criar o lote.')
      return
    }
    const form = new FormData(event.currentTarget)
    void onSave({
      teamId,
      data,
      eventId: eventId || undefined,
      observacao: String(form.get('observacao') ?? '') || undefined,
      schedules: selectedPeople.map((personId) => ({
        personId,
        funcao: String(form.get(`funcao-${personId}`) ?? ''),
      })),
    })
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="event-dialog event-dialog--schedule-batch" role="dialog" aria-modal="true" aria-labelledby="schedule-batch-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={onClose}>×</button><p className="eyebrow">{area.nome}</p><h2 id="schedule-batch-title">Escala em lote</h2><p className="dialog-description">Escolha uma equipe e selecione as pessoas. O lote é criado por inteiro ou não é criado, caso exista algum conflito.</p><form className="event-form" onSubmit={submit}><label>Equipe<select value={teamId} required onChange={(event) => { setTeamId(event.target.value); setEventId(''); setData(''); setSelectedPeople([]); setFormError('') }}><option value="" disabled>Selecione a equipe</option>{area.teams.map((team) => <option key={team.id} value={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><label>Evento <span className="field-optional">(opcional)</span><select value={eventId} disabled={!teamId || isLoadingEvents} onChange={(event) => { const selected = teamEvents.find((item) => item.id === event.target.value); setEventId(event.target.value); setData(selected ? toDateTimeLocalValue(selected.inicio) : '') }}><option value="">{isLoadingEvents ? 'Carregando eventos aprovados...' : teamId ? 'Escala independente de evento' : 'Escolha uma equipe antes'}</option>{teamEvents.map((event) => <option value={event.id} key={event.id}>{event.titulo} · {formatScheduleDate(event.inicio)}</option>)}</select>{eventError && <small className="form-error">{eventError}</small>}</label><label>Data e horário<input type="datetime-local" required value={data} onChange={(event) => setData(event.target.value)} /></label><label>Observação para o grupo <span className="field-optional">(opcional)</span><input name="observacao" maxLength={1000} placeholder="Orientação comum para as pessoas escaladas" /></label><section className="schedule-batch-people"><header><strong>Pessoas da equipe</strong><span>{selectedPeople.length} selecionada{selectedPeople.length === 1 ? '' : 's'}</span></header>{teamId && teamPeople.length ? teamPeople.map((person) => { const selected = selectedPeople.includes(person.id); return <label className={`schedule-batch-person ${selected ? 'schedule-batch-person--selected' : ''}`} key={person.id}><input type="checkbox" value={person.id} checked={selected} onChange={(event) => setSelectedPeople((current) => event.target.checked ? [...current, person.id] : current.filter((id) => id !== person.id))} /><span>{person.nome}</span><input name={`funcao-${person.id}`} disabled={!selected} required={selected} minLength={2} maxLength={100} defaultValue="Integrante" aria-label={`Função de ${person.nome}`} /></label> }) : <p>{teamId ? 'Não há pessoas vinculadas a esta equipe.' : 'Escolha uma equipe para selecionar as pessoas.'}</p>}</section>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="dialog-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving || selectedPeople.length === 0}>{isSaving ? 'Criando lote...' : 'Criar escalas'}</button></div></form></section></div>
}

function SchedulePersonSelect({
  area,
  events,
  isLoadingEvents,
  eventError,
  onEventSelect,
}: {
  area: ServiceAreaDetail
  events: ServiceScheduleEventCandidate[]
  isLoadingEvents: boolean
  eventError: string
  onEventSelect: (event: ServiceScheduleEventCandidate | null) => void
}) {
  const [teamId, setTeamId] = useState('')
  const [personId, setPersonId] = useState('')
  const [eventId, setEventId] = useState('')
  const people = area.memberships.filter((membership) => membership.team?.id === teamId).map((membership) => membership.person)
  const uniquePeople = [...new Map(people.map((person) => [person.id, person])).values()]
  const teamEvents = events.filter((event) => event.teams.some((item) => item.teamId === teamId))

  return <><label>Equipe<select name="teamId" value={teamId} onChange={(event) => { setTeamId(event.target.value); setPersonId(''); setEventId(''); onEventSelect(null) }} required><option value="" disabled>Selecione a equipe</option>{area.teams.map((team) => <option key={team.id} value={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><label>Pessoa<select name="personId" required value={personId} disabled={!teamId || uniquePeople.length === 0} onChange={(event) => setPersonId(event.target.value)}><option value="" disabled>{teamId ? uniquePeople.length ? 'Selecione a pessoa' : 'Não há pessoas vinculadas a esta equipe' : 'Escolha uma equipe antes'}</option>{uniquePeople.map((person) => <option key={person.id} value={person.id}>{person.nome}</option>)}</select></label><label>Evento <span className="field-optional">(opcional)</span><select name="eventId" value={eventId} disabled={!teamId || isLoadingEvents} onChange={(event) => { setEventId(event.target.value); onEventSelect(teamEvents.find((item) => item.id === event.target.value) ?? null) }}><option value="">{isLoadingEvents ? 'Carregando eventos aprovados...' : teamId ? 'Escala independente de evento' : 'Escolha uma equipe antes'}</option>{teamEvents.map((event) => <option value={event.id} key={event.id}>{event.titulo} · {formatScheduleDate(event.inicio)}</option>)}</select>{eventError && <small className="form-error">{eventError}</small>}</label><small className="schedule-event-note">Ao selecionar um evento, a data e o horário são preenchidos automaticamente.</small></>
}
