import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createServiceSchedule, listServiceAreaSchedules, listServiceScheduleHistory, substituteServiceSchedule, updateServiceScheduleStatus } from './api/service-areas'
import type { ServiceAreaDetail, ServiceAreaSchedule, ServiceScheduleHistory, ServiceScheduleStatus } from './api/service-areas'

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
  const [action, setAction] = useState<ScheduleAction | null>(null)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [history, setHistory] = useState<ServiceScheduleHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState('')

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

  const refresh = () => setVersion((value) => value + 1)
  const selectedTeamMembers = (selectedTeamId: string) => {
    const people = area.memberships
      .filter((membership) => membership.team?.id === selectedTeamId)
      .map((membership) => membership.person)
    return [...new Map(people.map((person) => [person.id, person])).values()]
  }

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
        {canManage && <button className="primary-button" type="button" disabled={area.teams.length === 0} onClick={() => setIsCreateOpen(true)}>+ Nova escala</button>}
      </header>

      <form className="service-schedule-filters" onSubmit={(event) => { event.preventDefault(); refresh() }}>
        <label>De<input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label>Até<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label>Equipe<select value={teamId} onChange={(event) => setTeamId(event.target.value)}><option value="">Todas as equipes</option>{area.teams.map((team) => <option value={team.id} key={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as ServiceScheduleStatus | '')}><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <button className="secondary-button" type="submit">Atualizar</button>
      </form>

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

      {isCreateOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setIsCreateOpen(false)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-create-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setIsCreateOpen(false)}>×</button><p className="eyebrow">{area.nome}</p><h2 id="schedule-create-title">Nova escala</h2><p className="dialog-description">A escala pertence à equipe. A pessoa receberá uma solicitação para confirmar ou recusar.</p><form className="event-form" onSubmit={saveSchedule}><SchedulePersonSelect area={area} /><label>Data e horário<input name="data" type="datetime-local" required /></label><label>Função<input name="funcao" required minLength={2} maxLength={100} placeholder="Ex.: Recepção" /></label><label>Observação <span className="field-optional">(opcional)</span><input name="observacao" maxLength={1000} placeholder="Informação útil para a pessoa escalada" /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Criando...' : 'Criar escala'}</button></div></form></section></div>}

      {action?.type === 'decline' && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAction(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-decline-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setAction(null)}>×</button><p className="eyebrow">Sua escala</p><h2 id="schedule-decline-title">Recusar escala</h2><p className="dialog-description">A liderança da área será avisada para providenciar uma substituição.</p><form className="event-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void changeStatus(action.schedule, 'DECLINED', String(form.get('reason') ?? '') || undefined) }}><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Estarei fora da cidade neste fim de semana." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setAction(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Registrando...' : 'Confirmar recusa'}</button></div></form></section></div>}

      {action?.type === 'substitute' && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAction(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-substitute-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setAction(null)}>×</button><p className="eyebrow">{action.schedule.team.nome}</p><h2 id="schedule-substitute-title">Substituir pessoa escalada</h2><p className="dialog-description">A nova pessoa receberá uma solicitação de confirmação. O sistema verificará conflitos de horário.</p><form className="event-form" onSubmit={saveSubstitution}><label>Nova pessoa<select name="personId" required defaultValue=""><option value="" disabled>Selecione uma pessoa da equipe</option>{selectedTeamMembers(action.schedule.team.id).filter((person) => person.id !== action.schedule.person.id).map((person) => <option value={person.id} key={person.id}>{person.nome}</option>)}</select></label><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Substituição após recusa." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setAction(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Substituindo...' : 'Confirmar substituição'}</button></div></form></section></div>}
    </section>
  )
}

function SchedulePersonSelect({ area }: { area: ServiceAreaDetail }) {
  const [teamId, setTeamId] = useState('')
  const people = area.memberships.filter((membership) => membership.team?.id === teamId).map((membership) => membership.person)
  const uniquePeople = [...new Map(people.map((person) => [person.id, person])).values()]

  return <><label>Equipe<select name="teamId" value={teamId} onChange={(event) => setTeamId(event.target.value)} required><option value="" disabled>Selecione a equipe</option>{area.teams.map((team) => <option key={team.id} value={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><label>Pessoa<select name="personId" required defaultValue="" disabled={!teamId || uniquePeople.length === 0}><option value="" disabled>{teamId ? uniquePeople.length ? 'Selecione a pessoa' : 'Não há pessoas vinculadas a esta equipe' : 'Escolha uma equipe antes'}</option>{uniquePeople.map((person) => <option key={person.id} value={person.id}>{person.nome}</option>)}</select></label></>
}
