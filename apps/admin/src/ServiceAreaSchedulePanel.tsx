import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { approveServiceScheduleSwapRequest, createServiceSchedule, createServiceScheduleBatch, createServiceScheduleUnavailability, deleteServiceSchedule, deleteServiceScheduleUnavailability, hasWorshipMinisterRole, listApprovedScheduleEvents, listServiceAreaSchedules, listServiceScheduleHistory, listServiceScheduleNotes, listServiceScheduleUnavailabilities, listTeamServiceScheduleSwapRequests, rejectServiceScheduleSwapRequest, substituteServiceSchedule, updateServiceMembershipFunctions, updateServiceScheduleNote, updateServiceScheduleStatus } from './api/service-areas'
import type { ServiceAreaDetail, ServiceAreaSchedule, ServiceScheduleEventCandidate, ServiceScheduleHistory, ServiceScheduleNote, ServiceScheduleStatus, ServiceScheduleSwapRequest, ServiceScheduleUnavailability } from './api/service-areas'

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

function toMonthInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthPeriod(value: string) {
  const [year, month] = value.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  return { start: toDateInputValue(firstDay), end: toDateInputValue(lastDay) }
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

function monthStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

function monthTitle(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(value)
}

function historyLabel(item: ServiceScheduleHistory) {
  if (item.action === 'CREATED') return 'Escala criada'
  if (item.action === 'SUBSTITUTED') return `Substituição: ${item.previousPersonName ?? 'Pessoa anterior'} → ${item.replacementPersonName ?? 'Nova pessoa'}`
  return `Status alterado para ${item.newStatus ? statusLabels[item.newStatus] : 'atualizado'}`
}

function normalizedScheduleLabel(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR')
}

function isWorshipAreaName(value: string) {
  return normalizedScheduleLabel(value).includes('musica')
}

function scheduleColumnKey(schedule: ServiceAreaSchedule) {
  return schedule.event ? `event:${schedule.event.id}` : `date:${new Date(schedule.data).getTime()}`
}

const worshipFunctionOrder = ['ministro', 'voz', 'vocal', 'teclado', 'violao', 'guitarra', 'baixo', 'bateria']

type WorshipGridEditTarget = {
  key: string
  campusId: string
  campusName: string
  functionName: string
  date: string
  eventId?: string
  eventTitle: string
  assignments: ServiceAreaSchedule[]
}

type WorshipGridSaveInput = {
  operation: string
  teamId?: string
  personId?: string
}

function WorshipScheduleNoteCell({ note, canEdit, isSaving, onSave }: { note?: ServiceScheduleNote; canEdit: boolean; isSaving: boolean; onSave: (observacao: string) => Promise<void> }) {
  const [value, setValue] = useState(note?.observacao ?? '')
  useEffect(() => setValue(note?.observacao ?? ''), [note?.observacao])
  if (!canEdit) return <div className="worship-schedule-cell worship-schedule-cell--notes" role="cell"><span>{note?.observacao || 'Sem observações'}</span></div>
  const unchanged = value.trim() === (note?.observacao ?? '')
  const saveIfChanged = () => {
    if (!isSaving && !unchanged) void onSave(value)
  }
  return <div className="worship-schedule-cell worship-schedule-cell--notes worship-schedule-cell--notes-editable" role="cell"><textarea value={value} maxLength={2000} aria-label="Observação geral do culto" disabled={isSaving} onChange={(event) => setValue(event.target.value)} onBlur={saveIfChanged} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') event.currentTarget.blur() }} /></div>
}

function WorshipScheduleGrid({ area, schedules, events, notes, unavailabilities, currentPersonId, availabilityCampusIds, canEdit, activeTarget, editError, isSaving, isSavingAvailability, isSavingNote, onEditCell, onCloseEditor, onSave, onRemove, onSaveNote, onToggleAvailability }: { area: ServiceAreaDetail; schedules: ServiceAreaSchedule[]; events: ServiceScheduleEventCandidate[]; notes: ServiceScheduleNote[]; unavailabilities: ServiceScheduleUnavailability[]; currentPersonId: string; availabilityCampusIds: string[]; canEdit: boolean; activeTarget: WorshipGridEditTarget | null; editError: string; isSaving: boolean; isSavingAvailability: boolean; isSavingNote: boolean; onEditCell: (target: WorshipGridEditTarget) => void; onCloseEditor: () => void; onSave: (input: WorshipGridSaveInput) => Promise<void>; onRemove: (schedule: ServiceAreaSchedule) => Promise<void>; onSaveNote: (input: { campusId: string; date: string; eventId?: string; observacao: string }) => Promise<void>; onToggleAvailability: (date: string, item?: ServiceScheduleUnavailability) => void }) {
  const campusGroups = useMemo(() => {
    const campusMap = new Map<string, { id: string; nome: string; schedules: ServiceAreaSchedule[]; events: ServiceScheduleEventCandidate[] }>()
    events.forEach((event) => {
      const campus = event.campus
      const group = campusMap.get(campus.id) ?? { id: campus.id, nome: campus.nome, schedules: [], events: [] }
      group.events.push(event)
      campusMap.set(campus.id, group)
    })
    schedules.forEach((schedule) => {
      const campus = schedule.team.campus
      const group = campusMap.get(campus.id) ?? { id: campus.id, nome: campus.nome, schedules: [], events: [] }
      group.schedules.push(schedule)
      campusMap.set(campus.id, group)
    })
    return [...campusMap.values()].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
  }, [events, schedules])

  const functions = useMemo(() => {
    const values = [...area.funcoes, ...schedules.map((schedule) => schedule.funcao)]
    const unique = [...new Map(values.filter(Boolean).map((value) => [normalizedScheduleLabel(value), value])).values()]
    return unique.sort((left, right) => {
      const leftRank = worshipFunctionOrder.indexOf(normalizedScheduleLabel(left))
      const rightRank = worshipFunctionOrder.indexOf(normalizedScheduleLabel(right))
      if (leftRank >= 0 || rightRank >= 0) return (leftRank < 0 ? 99 : leftRank) - (rightRank < 0 ? 99 : rightRank)
      return left.localeCompare(right, 'pt-BR')
    })
  }, [area.funcoes, schedules])

  const ownAvailabilityDates = useMemo(() => [...new Map(events
    .filter((event) => availabilityCampusIds.includes(event.campus.id))
    .map((event) => {
      const dateKey = toDateInputValue(new Date(event.inicio))
      return [dateKey, { dateKey, date: event.inicio, title: event.titulo, campusName: event.campus.nome }] as const
    })).values()].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()), [availabilityCampusIds, events])

  return <section className="worship-schedule-board" aria-label="Escala do Louvor em grade">
    {!canEdit && availabilityCampusIds.length > 0 && <section className="worship-my-availability"><header><div><strong>Indisponibilidade para servir</strong><span>Marque somente as datas em que você não poderá servir. Apenas a liderança verá a lista consolidada.</span></div></header><div>{ownAvailabilityDates.length ? ownAvailabilityDates.map((item) => { const ownItem = unavailabilities.find((availability) => availability.person.id === currentPersonId && toDateInputValue(new Date(availability.data)) === item.dateKey); return <article key={item.dateKey}><span><strong>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' }).format(new Date(item.date)).replace('.', '')}</strong><small>{item.title} · {item.campusName}</small></span><button className={ownItem ? 'worship-availability-toggle worship-availability-toggle--active' : 'worship-availability-toggle'} type="button" disabled={isSavingAvailability} onClick={() => onToggleAvailability(item.dateKey, ownItem)}>{isSavingAvailability ? 'Salvando...' : ownItem ? 'Indisponibilidade marcada' : 'Marcar indisponibilidade'}</button></article> }) : <p>Não há cultos disponíveis neste mês para marcar indisponibilidade.</p>}</div></section>}
    {campusGroups.map((campus) => {
      const columnMap = new Map<string, { key: string; date: string; title: string; eventId?: string }>()
      campus.events.forEach((event) => columnMap.set(`event:${event.id}`, {
        key: `event:${event.id}`,
        date: event.inicio,
        title: event.titulo,
        eventId: event.id,
      }))
      campus.schedules.forEach((schedule) => {
        const key = scheduleColumnKey(schedule)
        if (!columnMap.has(key)) columnMap.set(key, {
          key,
          date: schedule.event?.inicio ?? schedule.data,
          title: schedule.event?.titulo ?? 'Escala independente',
          eventId: schedule.event?.id,
        })
      })
      const columns = [...columnMap.values()].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
      const tableStyle = {
        gridTemplateColumns: `150px repeat(${columns.length}, minmax(170px, 1fr))`,
        minWidth: `${150 + columns.length * 170}px`,
      } as CSSProperties
      const campusTeamIds = new Set(area.teams.filter((team) => team.ativo && team.campus.id === campus.id).map((team) => team.id))
      const campusPersonIds = new Set(area.memberships.filter((membership) => membership.team && campusTeamIds.has(membership.team.id)).map((membership) => membership.person.id))

      return <article className="worship-schedule-campus" key={campus.id}>
        <header><strong>{campus.nome}</strong><span>{columns.length} {columns.length === 1 ? 'culto' : 'cultos'} no período</span></header>
        <div className="worship-schedule-scroll">
          <div className="worship-schedule-grid" role="table" aria-label={`Escala do Louvor · ${campus.nome}`} style={tableStyle}>
            <div className="worship-schedule-corner" role="columnheader">Função</div>
            {columns.map((column) => {
              const date = new Date(column.date)
              return <div className="worship-schedule-event-heading" role="columnheader" key={column.key}><strong>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)} · {new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '')}</strong><span>{column.title}</span></div>
            })}
            {canEdit && <><div className="worship-schedule-function worship-schedule-function--availability" role="rowheader">Indisponibilidade</div>{columns.map((column) => {
              const dateKey = toDateInputValue(new Date(column.date))
              const items = unavailabilities.filter((item) => toDateInputValue(new Date(item.data)) === dateKey && campusPersonIds.has(item.person.id))
              const ownItem = items.find((item) => item.person.id === currentPersonId)
              const canToggle = availabilityCampusIds.includes(campus.id)
              return <div className="worship-schedule-cell worship-schedule-availability" role="cell" key={`availability:${column.key}`}><span>{items.length ? items.map((item) => item.person.nome).join(', ') : 'Ninguém indisponível'}</span>{canToggle && <button className={ownItem ? 'worship-availability-toggle worship-availability-toggle--active' : 'worship-availability-toggle'} type="button" disabled={isSavingAvailability} onClick={() => onToggleAvailability(dateKey, ownItem)}>{isSavingAvailability ? 'Salvando...' : ownItem ? 'Indisponível' : 'Marcar indisponível'}</button>}</div>
            })}</>}
            {functions.flatMap((functionName) => [
              <div className="worship-schedule-function" role="rowheader" key={`function:${functionName}`}>{functionName}</div>,
              ...columns.map((column) => {
                const assignments = campus.schedules.filter((schedule) => scheduleColumnKey(schedule) === column.key && normalizedScheduleLabel(schedule.funcao) === normalizedScheduleLabel(functionName))
                const editKey = `${campus.id}:${column.key}:${normalizedScheduleLabel(functionName)}`
                const isActive = activeTarget?.key === editKey
                const content = assignments.length
                  ? assignments.map((schedule) => <span className={`worship-schedule-person worship-schedule-person--${schedule.status.toLocaleLowerCase('pt-BR')}`} title={statusLabels[schedule.status]} key={schedule.id}>{schedule.person.nome}</span>)
                  : null
                return <div className={canEdit ? `worship-schedule-cell worship-schedule-cell--editable${isActive ? ' worship-schedule-cell--active' : ''}` : 'worship-schedule-cell'} role="cell" key={`${functionName}:${column.key}`}>{canEdit ? <button className="worship-schedule-cell-button" type="button" aria-label={`Editar ${functionName} em ${column.title}`} aria-expanded={isActive} onClick={() => onEditCell({
                  key: editKey,
                  campusId: campus.id,
                  campusName: campus.nome,
                  functionName,
                  date: column.date,
                  eventId: column.eventId,
                  eventTitle: column.title,
                  assignments,
                })}>{content}</button> : content}</div>
              }),
            ])}
            <div className="worship-schedule-function worship-schedule-function--notes" role="rowheader">Observações</div>{columns.map((column) => { const note = notes.find((item) => item.campusId === campus.id && (item.eventId ? item.eventId === column.eventId : new Date(item.data).getTime() === new Date(column.date).getTime())); return <WorshipScheduleNoteCell key={`notes:${column.key}`} note={note} canEdit={canEdit} isSaving={isSavingNote} onSave={(observacao) => onSaveNote({ campusId: campus.id, date: column.date, eventId: column.eventId, observacao })} /> })}
          </div>
        </div>
        {activeTarget?.campusId === campus.id && <WorshipScheduleInlineEditor key={activeTarget.key} target={activeTarget} area={area} unavailabilities={unavailabilities} isSaving={isSaving} error={editError} onClose={onCloseEditor} onSave={onSave} onRemove={onRemove} />}
      </article>
    })}
    <footer className="worship-schedule-legend"><span className="worship-schedule-person--scheduled">A confirmar</span><span className="worship-schedule-person--confirmed">Confirmada</span><span className="worship-schedule-person--declined">Recusada</span><span className="worship-schedule-person--completed">Concluída</span></footer>
  </section>
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
  const worshipArea = isWorshipAreaName(area.nome)
  const initialMonth = useMemo(() => toMonthInputValue(new Date()), [])
  const period = useMemo(() => worshipArea ? monthPeriod(initialMonth) : defaultPeriod(), [initialMonth, worshipArea])
  const [gridMonth, setGridMonth] = useState(initialMonth)
  const [gridCampusId, setGridCampusId] = useState('')
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
  const [createEventId, setCreateEventId] = useState('')
  const [eventCandidates, setEventCandidates] = useState<ServiceScheduleEventCandidate[]>([])
  const [gridEvents, setGridEvents] = useState<ServiceScheduleEventCandidate[]>([])
  const [isLoadingGridEvents, setIsLoadingGridEvents] = useState(worshipArea)
  const [gridEventsError, setGridEventsError] = useState('')
  const [unavailabilities, setUnavailabilities] = useState<ServiceScheduleUnavailability[]>([])
  const [isLoadingUnavailabilities, setIsLoadingUnavailabilities] = useState(worshipArea)
  const [isSavingAvailability, setIsSavingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [scheduleNotes, setScheduleNotes] = useState<ServiceScheduleNote[]>([])
  const [isLoadingScheduleNotes, setIsLoadingScheduleNotes] = useState(worshipArea)
  const [isSavingScheduleNote, setIsSavingScheduleNote] = useState(false)
  const [scheduleNotesError, setScheduleNotesError] = useState('')
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(worshipArea ? 'grid' : 'list')
  const [gridEditTarget, setGridEditTarget] = useState<WorshipGridEditTarget | null>(null)
  const [gridEditError, setGridEditError] = useState('')
  const activeTeams = useMemo(() => area.teams.filter((team) => team.ativo), [area.teams])
  const ownTeamIds = useMemo(() => new Set(area.memberships.filter((membership) => membership.person.id === currentPersonId && membership.team).map((membership) => membership.team?.id)), [area.memberships, currentPersonId])
  const availabilityCampusIds = useMemo(() => [...new Set(activeTeams.filter((team) => ownTeamIds.has(team.id)).map((team) => team.campus.id))], [activeTeams, ownTeamIds])
  const campusOptions = useMemo(() => [...new Map(activeTeams.map((team) => [team.campus.id, team.campus])).values()].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR')), [activeTeams])
  const visibleGridSchedules = gridCampusId ? schedules.filter((schedule) => schedule.team.campus.id === gridCampusId) : schedules
  const visibleGridEvents = gridCampusId ? gridEvents.filter((event) => event.campus.id === gridCampusId) : gridEvents

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
    if (!worshipArea || viewMode !== 'grid') return
    const periodStart = toPeriodStart(start)
    const periodEnd = toPeriodEnd(end)
    if (!periodStart || !periodEnd) return
    let active = true
    setIsLoadingGridEvents(true)
    setGridEventsError('')
    void listApprovedScheduleEvents(accessToken, periodStart, periodEnd)
      .then((items) => {
        if (active) setGridEvents(items)
      })
      .catch((reason) => {
        if (active) {
          setGridEvents([])
          setGridEventsError(reason instanceof Error ? reason.message : 'Não foi possível carregar os cultos deste mês.')
        }
      })
      .finally(() => {
        if (active) setIsLoadingGridEvents(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, end, start, viewMode, worshipArea, version])

  useEffect(() => {
    if (!worshipArea || viewMode !== 'grid') return
    let active = true
    setIsLoadingUnavailabilities(true)
    setAvailabilityError('')
    void listServiceScheduleUnavailabilities(accessToken, area.id, { start: toPeriodStart(start), end: toPeriodEnd(end) })
      .then((items) => {
        if (active) setUnavailabilities(items)
      })
      .catch((reason) => {
        if (active) {
          setUnavailabilities([])
          setAvailabilityError(reason instanceof Error ? reason.message : 'Não foi possível carregar as indisponibilidades deste mês.')
        }
      })
      .finally(() => {
        if (active) setIsLoadingUnavailabilities(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, area.id, end, start, viewMode, worshipArea, version])

  useEffect(() => {
    if (!worshipArea || viewMode !== 'grid') return
    let active = true
    setIsLoadingScheduleNotes(true)
    setScheduleNotesError('')
    void listServiceScheduleNotes(accessToken, area.id, { start: toPeriodStart(start), end: toPeriodEnd(end) })
      .then((items) => {
        if (active) setScheduleNotes(items)
      })
      .catch((reason) => {
        if (active) {
          setScheduleNotes([])
          setScheduleNotesError(reason instanceof Error ? reason.message : 'Não foi possível carregar as observações deste mês.')
        }
      })
      .finally(() => {
        if (active) setIsLoadingScheduleNotes(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, area.id, end, start, viewMode, worshipArea, version])

  useEffect(() => {
    if (!canManage) {
      setSwapRequests([])
      return
    }
    let active = true
    setIsLoadingSwapRequests(true)
    setSwapRequestsError('')
    void Promise.allSettled(activeTeams.map((team) => listTeamServiceScheduleSwapRequests(accessToken, team.id)))
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
  }, [accessToken, activeTeams, canManage, version])

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
  const summarySchedules = worshipArea && viewMode === 'grid' ? visibleGridSchedules : schedules
  const pendingCount = summarySchedules.filter((schedule) => schedule.status === 'SCHEDULED').length
  const declinedCount = summarySchedules.filter((schedule) => schedule.status === 'DECLINED').length

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

  const saveGridAssignment = async (input: WorshipGridSaveInput) => {
    if (!gridEditTarget) return
    if (!input.teamId || !input.personId) {
      setGridEditError('Escolha uma pessoa para esta posição da escala.')
      return
    }
    const membership = area.memberships.find((item) => item.team?.id === input.teamId && item.person.id === input.personId)
    if (!membership) {
      setGridEditError('A pessoa escolhida não possui vínculo ativo com esta equipe.')
      return
    }
    setIsSaving(true)
    setGridEditError('')
    try {
      if (!membership.funcoes.some((item) => normalizedScheduleLabel(item) === normalizedScheduleLabel(gridEditTarget.functionName))) {
        const functions = [...new Map([...membership.funcoes, gridEditTarget.functionName].map((item) => [normalizedScheduleLabel(item), item])).values()]
        await updateServiceMembershipFunctions(accessToken, membership.id, functions)
      }
      if (input.operation.startsWith('replace:')) {
        await substituteServiceSchedule(accessToken, input.operation.slice('replace:'.length), {
          personId: input.personId,
          reason: 'Substituição realizada pela grade da Escala do Louvor.',
        })
        onNotice(`Pessoa substituída em ${gridEditTarget.functionName}. A nova pessoa precisa confirmar a escala.`)
      } else {
        await createServiceSchedule(accessToken, input.teamId, {
          personId: input.personId,
          data: new Date(gridEditTarget.date).toISOString(),
          funcao: gridEditTarget.functionName,
          eventId: gridEditTarget.eventId,
        })
        onNotice(`${gridEditTarget.functionName} adicionado à escala. A pessoa precisa confirmar.`)
      }
      setGridEditTarget(null)
      refresh()
    } catch (failure) {
      setGridEditError(failure instanceof Error ? failure.message : 'Não foi possível editar esta posição da escala.')
    } finally {
      setIsSaving(false)
    }
  }

  const removeScheduleAssignment = async (schedule: ServiceAreaSchedule) => {
    if (!window.confirm(`Remover ${schedule.person.nome} da função ${schedule.funcao} nesta escala?`)) return
    setIsSaving(true)
    setGridEditError('')
    setError('')
    try {
      await deleteServiceSchedule(accessToken, schedule.id)
      setGridEditTarget(null)
      refresh()
      onNotice(`${schedule.person.nome} foi removido(a) da escala.`)
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : 'Não foi possível remover a pessoa da escala.'
      if (viewMode === 'grid') setGridEditError(message)
      else setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleAvailability = async (date: string, item?: ServiceScheduleUnavailability) => {
    setIsSavingAvailability(true)
    setAvailabilityError('')
    try {
      if (item) {
        await deleteServiceScheduleUnavailability(accessToken, area.id, item.id)
        onNotice('Sua disponibilidade para servir nesta data foi restaurada.')
      } else {
        await createServiceScheduleUnavailability(accessToken, area.id, date)
        onNotice('Sua indisponibilidade foi registrada para esta data.')
      }
      refresh()
    } catch (failure) {
      setAvailabilityError(failure instanceof Error ? failure.message : 'Não foi possível atualizar sua disponibilidade.')
    } finally {
      setIsSavingAvailability(false)
    }
  }

  const saveScheduleNote = async (input: { campusId: string; date: string; eventId?: string; observacao: string }) => {
    setIsSavingScheduleNote(true)
    setScheduleNotesError('')
    try {
      await updateServiceScheduleNote(accessToken, area.id, {
        campusId: input.campusId,
        data: new Date(input.date).toISOString(),
        eventId: input.eventId,
        observacao: input.observacao,
      })
      refresh()
      onNotice(input.observacao.trim() ? 'Observação geral salva.' : 'Observação geral removida.')
    } catch (failure) {
      setScheduleNotesError(failure instanceof Error ? failure.message : 'Não foi possível salvar a observação geral.')
    } finally {
      setIsSavingScheduleNote(false)
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
        <div><p className="eyebrow">Escalas</p><h2>{worshipArea ? 'Escala do Louvor' : 'Serviços da área'}</h2></div>
        {(worshipArea || canManage) && <div className="service-schedule-header-actions">{worshipArea && <div className="service-schedule-view-toggle" aria-label="Formato de visualização"><button type="button" className={viewMode === 'grid' ? 'service-schedule-view-option service-schedule-view-option--active' : 'service-schedule-view-option'} onClick={() => { setTeamId(''); setViewMode('grid') }}>Grade</button><button type="button" className={viewMode === 'list' ? 'service-schedule-view-option service-schedule-view-option--active' : 'service-schedule-view-option'} onClick={() => setViewMode('list')}>Lista</button></div>}{canManage && <><button className="secondary-button" type="button" disabled={activeTeams.length === 0} onClick={() => { setEventCandidates([]); setIsBatchOpen(true) }}>Escala em lote</button><button className="primary-button" type="button" disabled={activeTeams.length === 0} onClick={() => { setCreateDate(''); setCreateEventId(''); setEventCandidates([]); setIsCreateOpen(true) }}>+ Nova escala</button></>}</div>}
      </header>

      <form className={worshipArea && viewMode === 'grid' ? 'service-schedule-filters service-schedule-filters--worship-grid' : 'service-schedule-filters'} onSubmit={(event) => { event.preventDefault(); refresh() }}>
        {worshipArea && viewMode === 'grid' ? <>
          <label>Mês<input type="month" value={gridMonth} onChange={(event) => { const value = event.target.value; if (!value) return; const nextPeriod = monthPeriod(value); setGridMonth(value); setStart(nextPeriod.start); setEnd(nextPeriod.end) }} /></label>
          <label>Campus<select value={gridCampusId} onChange={(event) => setGridCampusId(event.target.value)}><option value="">Todos os Campus</option>{campusOptions.map((campus) => <option value={campus.id} key={campus.id}>{campus.nome}</option>)}</select></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as ServiceScheduleStatus | '')}><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </> : <>
          <label>De<input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
          <label>Até<input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
          <label>Equipe<select value={teamId} onChange={(event) => setTeamId(event.target.value)}><option value="">Todas as equipes</option>{activeTeams.map((team) => <option value={team.id} key={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as ServiceScheduleStatus | '')}><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        </>}
        <button className="secondary-button" type="submit">Atualizar</button>
      </form>

      {canManage && !isLoading && <section className="service-schedule-pending"><div><span>Pendências no período</span><strong>{pendingCount + declinedCount}</strong></div><button type="button" className={status === 'SCHEDULED' ? 'service-pending-card service-pending-card--active' : 'service-pending-card'} onClick={() => setStatus(status === 'SCHEDULED' ? '' : 'SCHEDULED')}><strong>{pendingCount}</strong><span>Aguardando confirmação</span></button><button type="button" className={status === 'DECLINED' ? 'service-pending-card service-pending-card--active service-pending-card--declined' : 'service-pending-card service-pending-card--declined'} onClick={() => setStatus(status === 'DECLINED' ? '' : 'DECLINED')}><strong>{declinedCount}</strong><span>Recusas para resolver</span></button></section>}

      {canManage && <section className="service-schedule-swap-requests"><header><div><p className="eyebrow">Trocas</p><h3>Solicitações para aprovar</h3></div><span>{swapRequests.length}</span></header>{isLoadingSwapRequests ? <p className="service-area-empty">Carregando solicitações de troca...</p> : swapRequestsError ? <p className="form-error">{swapRequestsError}</p> : swapRequests.length ? <div className="service-schedule-swap-list">{swapRequests.map((request) => <article key={request.id}><div><strong>{request.schedule.funcao} · {request.schedule.team.nome}</strong><span>{request.requesterPerson.nome} → {request.replacementPerson.nome}</span><small>{formatScheduleDate(request.schedule.data)}{request.schedule.event ? ` · ${request.schedule.event.titulo}` : ''}</small>{request.reason && <small>Motivo: {request.reason}</small>}</div><div className="service-schedule-actions"><button type="button" className="schedule-action schedule-action--confirm" disabled={isSaving} onClick={() => void approveSwapRequest(request)}>Aprovar</button><button type="button" className="schedule-action" disabled={isSaving} onClick={() => setAction({ type: 'reject-swap', request })}>Recusar</button></div></article>)}</div> : <p className="service-area-empty">Não há solicitações de troca pendentes.</p>}</section>}

      {error && <p className="form-error service-schedule-error" role="alert">{error}</p>}
      {worshipArea && viewMode === 'grid' && gridEventsError && <p className="form-error service-schedule-error" role="alert">{gridEventsError}</p>}
      {worshipArea && viewMode === 'grid' && availabilityError && <p className="form-error service-schedule-error" role="alert">{availabilityError}</p>}
      {worshipArea && viewMode === 'grid' && scheduleNotesError && <p className="form-error service-schedule-error" role="alert">{scheduleNotesError}</p>}
      {isLoading || (worshipArea && viewMode === 'grid' && (isLoadingGridEvents || isLoadingUnavailabilities || isLoadingScheduleNotes)) ? <p className="service-area-empty">Carregando escalas...</p> : worshipArea && viewMode === 'grid' ? visibleGridSchedules.length || visibleGridEvents.length ? <WorshipScheduleGrid area={area} schedules={visibleGridSchedules} events={visibleGridEvents} notes={scheduleNotes} unavailabilities={unavailabilities} currentPersonId={currentPersonId} availabilityCampusIds={availabilityCampusIds} canEdit={canManage} activeTarget={gridEditTarget} editError={gridEditError} isSaving={isSaving} isSavingAvailability={isSavingAvailability} isSavingNote={isSavingScheduleNote} onEditCell={(target) => { setGridEditError(''); setGridEditTarget((current) => current?.key === target.key ? null : target) }} onCloseEditor={() => { setGridEditError(''); setGridEditTarget(null) }} onSave={saveGridAssignment} onRemove={removeScheduleAssignment} onSaveNote={saveScheduleNote} onToggleAvailability={(date, item) => void toggleAvailability(date, item)} /> : <p className="service-area-empty">Não há cultos aprovados nem escalas neste mês para o Campus selecionado.</p> : schedules.length ? <div className="service-schedule-list">{schedules.map((schedule) => {
        const ownSchedule = schedule.person.id === currentPersonId
        const canSubstitute = canManage && schedule.status !== 'COMPLETED'
        const isWorshipMinister = hasWorshipMinisterRole(schedule)
        return <article className="service-schedule-row" key={schedule.id}>
          <div className="service-schedule-date"><strong>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(schedule.data)).replace('.', '')}</strong><span>{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(schedule.data))}</span></div>
          <div className="service-schedule-main"><strong>{schedule.funcao}</strong><span>{schedule.person.nome} · {schedule.team.nome}{isWorshipMinister ? ' · Ministro de Louvor' : ''}</span>{schedule.event && <small>{schedule.event.titulo}</small>}{schedule.observacao && <small>{schedule.observacao}</small>}</div>
          <span className={`service-schedule-status service-schedule-status--${schedule.status.toLocaleLowerCase('pt-BR')}`}>{statusLabels[schedule.status]}</span>
          <div className="service-schedule-actions">
            {ownSchedule && schedule.status === 'SCHEDULED' && <><button type="button" className="schedule-action schedule-action--confirm" disabled={isSaving} onClick={() => void changeStatus(schedule, 'CONFIRMED')}>Confirmar</button><button type="button" className="schedule-action" disabled={isSaving} onClick={() => setAction({ type: 'decline', schedule })}>Recusar</button></>}
            {canManage && schedule.status !== 'COMPLETED' && <button type="button" className="schedule-action" disabled={isSaving} onClick={() => void changeStatus(schedule, 'COMPLETED')}>Concluir</button>}
            {canManage && schedule.status === 'COMPLETED' && <button type="button" className="schedule-action" disabled={isSaving} onClick={() => void changeStatus(schedule, 'SCHEDULED')}>Reabrir</button>}
            {canSubstitute && <button type="button" className="schedule-action" disabled={isSaving} onClick={() => setAction({ type: 'substitute', schedule })}>Substituir</button>}
            {canSubstitute && <button type="button" className="schedule-action schedule-action--remove" disabled={isSaving} onClick={() => void removeScheduleAssignment(schedule)}>Remover</button>}
            <button type="button" className="schedule-action" onClick={() => void toggleHistory(schedule.id)}>{activeHistoryId === schedule.id ? 'Ocultar histórico' : 'Histórico'}</button>
          </div>
          {activeHistoryId === schedule.id && <div className="service-schedule-history">{isLoadingHistory ? <p>Carregando histórico...</p> : historyError ? <p className="form-error">{historyError}</p> : history.length ? history.map((item) => <article key={item.id}><strong>{historyLabel(item)}</strong><span>{formatScheduleDate(item.createdAt)} · {item.changedByUser.loginEmail}</span>{item.reason && <small>{item.reason}</small>}</article>) : <p>Nenhuma alteração registrada.</p>}</div>}
        </article>
      })}</div> : <p className="service-area-empty">Não há escalas neste período para os filtros escolhidos.</p>}

      {isCreateOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setIsCreateOpen(false)}><section className="event-dialog event-dialog--schedule-create" role="dialog" aria-modal="true" aria-labelledby="schedule-create-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setIsCreateOpen(false)}>×</button><p className="eyebrow">{area.nome}</p><h2 id="schedule-create-title">Nova escala</h2><p className="dialog-description">Escolha um Culto do calendário do campus ou registre uma escala independente por data e horário.</p><form className="event-form" onSubmit={saveSchedule}><SchedulePersonSelect area={area} events={eventCandidates} eventId={createEventId} isLoadingEvents={isLoadingEvents} eventError={eventError} onEventSelect={(selectedEvent) => { setCreateEventId(selectedEvent?.id ?? ''); setCreateDate(selectedEvent ? toDateTimeLocalValue(selectedEvent.inicio) : '') }} /><label>Data e horário<input name="data" type="datetime-local" required value={createDate} onChange={(event) => { setCreateDate(event.target.value); setCreateEventId('') }} /></label><label>Observação <span className="field-optional">(opcional)</span><input name="observacao" maxLength={1000} placeholder="Informação útil para a pessoa escalada" /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Criando...' : 'Criar escala'}</button></div></form></section></div>}

      {isBatchOpen && <ServiceScheduleBatchDialog area={area} events={eventCandidates} isLoadingEvents={isLoadingEvents} eventError={eventError} isSaving={isSaving} onClose={() => setIsBatchOpen(false)} onSave={saveScheduleBatch} />}

      {action?.type === 'decline' && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAction(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-decline-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setAction(null)}>×</button><p className="eyebrow">Sua escala</p><h2 id="schedule-decline-title">Recusar escala</h2><p className="dialog-description">A liderança da área será avisada para providenciar uma substituição.</p><form className="event-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void changeStatus(action.schedule, 'DECLINED', String(form.get('reason') ?? '') || undefined) }}><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Estarei fora da cidade neste fim de semana." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setAction(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Registrando...' : 'Confirmar recusa'}</button></div></form></section></div>}

      {action?.type === 'substitute' && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAction(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-substitute-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setAction(null)}>×</button><p className="eyebrow">{action.schedule.team.nome}</p><h2 id="schedule-substitute-title">Substituir pessoa escalada</h2><p className="dialog-description">A nova pessoa receberá uma solicitação de confirmação. O sistema verificará conflitos de horário.</p><form className="event-form" onSubmit={saveSubstitution}><label>Nova pessoa<select name="personId" required defaultValue=""><option value="" disabled>Selecione uma pessoa da equipe</option>{selectedTeamMembers(action.schedule.team.id).filter((person) => person.id !== action.schedule.person.id).map((person) => <option value={person.id} key={person.id}>{person.nome}</option>)}</select></label><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Substituição após recusa." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setAction(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Substituindo...' : 'Confirmar substituição'}</button></div></form></section></div>}
      {action?.type === 'reject-swap' && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setAction(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="schedule-swap-reject-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setAction(null)}>×</button><p className="eyebrow">Solicitação de troca</p><h2 id="schedule-swap-reject-title">Recusar troca</h2><p className="dialog-description">A escala permanecerá com {action.request.requesterPerson.nome}. Você pode informar o motivo para orientar a pessoa.</p><form className="event-form" onSubmit={rejectSwapRequest}><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Precisamos manter a composição atual deste culto." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setAction(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Recusando...' : 'Recusar solicitação'}</button></div></form></section></div>}
    </section>
  )
}

function WorshipScheduleInlineEditor({
  target,
  area,
  unavailabilities,
  isSaving,
  error,
  onClose,
  onSave,
  onRemove,
}: {
  target: WorshipGridEditTarget
  area: ServiceAreaDetail
  unavailabilities: ServiceScheduleUnavailability[]
  isSaving: boolean
  error: string
  onClose: () => void
  onSave: (input: WorshipGridSaveInput) => Promise<void>
  onRemove: (schedule: ServiceAreaSchedule) => Promise<void>
}) {
  const replaceableAssignments = target.assignments.filter((schedule) => schedule.status !== 'COMPLETED')
  const [operation, setOperation] = useState(replaceableAssignments.length ? `replace:${replaceableAssignments[0].id}` : 'add')
  const [search, setSearch] = useState('')
  const replacementSchedule = operation.startsWith('replace:') ? replaceableAssignments.find((schedule) => schedule.id === operation.slice('replace:'.length)) : undefined
  const campusTeamIds = new Set(area.teams.filter((team) => team.ativo && team.campus.id === target.campusId).map((team) => team.id))
  const assignedPersonIds = new Set(target.assignments.map((schedule) => schedule.person.id))
  const dateKey = toDateInputValue(new Date(target.date))
  const unavailablePersonIds = new Set(unavailabilities.filter((item) => toDateInputValue(new Date(item.data)) === dateKey).map((item) => item.person.id))
  const memberships = [...new Map(area.memberships
    .filter((membership) => membership.team && campusTeamIds.has(membership.team.id) && (!replacementSchedule || membership.team.id === replacementSchedule.team.id) && !assignedPersonIds.has(membership.person.id))
    .map((membership) => [`${membership.person.id}:${membership.team?.id}`, membership])).values()]
    .filter((membership) => normalizedScheduleLabel(membership.person.nome).includes(normalizedScheduleLabel(search)))
    .sort((left, right) => left.person.nome.localeCompare(right.person.nome, 'pt-BR'))

  return <section className="worship-grid-inline-editor" aria-label={`Editar ${target.functionName} em ${target.eventTitle}`}>
    <header><div><p className="eyebrow">{formatScheduleDate(target.date)} · {target.eventTitle}</p><strong>{target.functionName}</strong><span>Gerencie as pessoas desta posição da escala.</span></div><button className="secondary-button" type="button" onClick={onClose}>Fechar</button></header>
    {target.assignments.length > 0 && <div className="worship-grid-inline-actions"><span>Ação</span>{replaceableAssignments.map((schedule) => <div className="worship-grid-inline-assignment-actions" key={schedule.id}><button className={operation === `replace:${schedule.id}` ? 'worship-grid-inline-action worship-grid-inline-action--active' : 'worship-grid-inline-action'} type="button" onClick={() => { setOperation(`replace:${schedule.id}`); setSearch('') }}>Substituir {schedule.person.nome}</button><button className="worship-grid-inline-action worship-grid-inline-action--remove" type="button" disabled={isSaving} onClick={() => void onRemove(schedule)}>Remover {schedule.person.nome}</button></div>)}<button className={operation === 'add' ? 'worship-grid-inline-action worship-grid-inline-action--active' : 'worship-grid-inline-action'} type="button" onClick={() => { setOperation('add'); setSearch('') }}>Adicionar outra pessoa</button></div>}
    <label className="worship-grid-inline-search">Pesquisar pessoa<input value={search} type="search" placeholder="Digite o nome" autoComplete="off" onChange={(event) => setSearch(event.target.value)} /></label>
    <div className="worship-grid-inline-people">{memberships.length ? memberships.map((membership) => { const hasFunction = membership.funcoes.some((item) => normalizedScheduleLabel(item) === normalizedScheduleLabel(target.functionName)); const unavailable = unavailablePersonIds.has(membership.person.id); return <button className={unavailable ? 'worship-grid-person-option--unavailable' : undefined} type="button" disabled={isSaving || unavailable} key={`${membership.person.id}:${membership.team?.id}`} onClick={() => void onSave({ operation, teamId: membership.team?.id ?? '', personId: membership.person.id })}><span><strong>{membership.person.nome}</strong><small>{unavailable ? 'Indisponível nesta data' : `${membership.team?.nome}${hasFunction ? ` · ${target.functionName}` : ` · será vinculado(a) como ${target.functionName}`}`}</small></span><b>{unavailable ? 'Indisponível' : isSaving ? 'Salvando...' : operation.startsWith('replace:') ? 'Substituir' : 'Adicionar'}</b></button> }) : <p>Nenhuma outra pessoa vinculada ao Louvor foi encontrada para esta equipe e Campus.</p>}</div>
    <p className="worship-grid-function-note">Ao selecionar uma pessoa, a função <strong>{target.functionName}</strong> será vinculada automaticamente caso ainda não esteja em seu cadastro.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>
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
  const activeTeams = area.teams.filter((team) => team.ativo)
  const teamMemberships = area.memberships.filter((membership) => membership.team?.id === teamId)
  const teamPeople = [...new Map(teamMemberships.map((membership) => [membership.person.id, membership])).values()]
  const selectedTeam = activeTeams.find((team) => team.id === teamId)
  const teamEvents = events.filter((event) => event.campus.id === selectedTeam?.campus.id)

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

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="event-dialog event-dialog--schedule-batch" role="dialog" aria-modal="true" aria-labelledby="schedule-batch-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={onClose}>×</button><p className="eyebrow">{area.nome}</p><h2 id="schedule-batch-title">Escala em lote</h2><p className="dialog-description">Escolha uma equipe e selecione as pessoas. O lote é criado por inteiro ou não é criado, caso exista algum conflito.</p><form className="event-form" onSubmit={submit}><label>Equipe<select value={teamId} required onChange={(event) => { setTeamId(event.target.value); setEventId(''); setData(''); setSelectedPeople([]); setFormError('') }}><option value="" disabled>Selecione a equipe</option>{activeTeams.map((team) => <option key={team.id} value={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><label>Culto <span className="field-optional">(opcional)</span><select value={eventId} disabled={!teamId || isLoadingEvents} onChange={(event) => { const selected = teamEvents.find((item) => item.id === event.target.value); setEventId(event.target.value); setData(selected ? toDateTimeLocalValue(selected.inicio) : '') }}><option value="">{isLoadingEvents ? 'Carregando cultos aprovados...' : teamId ? 'Escala independente de Culto' : 'Escolha uma equipe antes'}</option>{teamEvents.map((event) => <option value={event.id} key={event.id}>{event.titulo} · {formatScheduleDate(event.inicio)}</option>)}</select>{eventError && <small className="form-error">{eventError}</small>}</label><label>Data e horário<input type="datetime-local" required value={data} onChange={(event) => { setData(event.target.value); setEventId('') }} /></label><label>Observação para o grupo <span className="field-optional">(opcional)</span><input name="observacao" maxLength={1000} placeholder="Orientação comum para as pessoas escaladas" /></label><section className="schedule-batch-people"><header><strong>Pessoas da equipe</strong><span>{selectedPeople.length} selecionada{selectedPeople.length === 1 ? '' : 's'}</span></header>{teamId && teamPeople.length ? teamPeople.map((membership) => { const selected = selectedPeople.includes(membership.person.id); const canSchedule = membership.funcoes.length > 0; return <label className={`schedule-batch-person ${selected ? 'schedule-batch-person--selected' : ''}`} key={membership.person.id}><input type="checkbox" value={membership.person.id} checked={selected} disabled={!canSchedule} onChange={(event) => setSelectedPeople((current) => event.target.checked ? [...current, membership.person.id] : current.filter((id) => id !== membership.person.id))} /><span>{membership.person.nome}{!canSchedule && <small>Cadastre funções antes de escalar.</small>}</span><select name={`funcao-${membership.person.id}`} disabled={!selected} required={selected} defaultValue="" aria-label={`Função de ${membership.person.nome}`}><option value="" disabled>Selecione a função</option>{membership.funcoes.map((functionName) => <option value={functionName} key={functionName}>{functionName}</option>)}</select></label> }) : <p>{teamId ? 'Não há pessoas vinculadas a esta equipe.' : 'Escolha uma equipe para selecionar as pessoas.'}</p>}</section>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="dialog-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving || selectedPeople.length === 0}>{isSaving ? 'Criando lote...' : 'Criar escalas'}</button></div></form></section></div>
}

function SchedulePersonSelect({
  area,
  events,
  eventId,
  isLoadingEvents,
  eventError,
  onEventSelect,
}: {
  area: ServiceAreaDetail
  events: ServiceScheduleEventCandidate[]
  eventId: string
  isLoadingEvents: boolean
  eventError: string
  onEventSelect: (event: ServiceScheduleEventCandidate | null) => void
}) {
  const [teamId, setTeamId] = useState('')
  const [personId, setPersonId] = useState('')
  const activeTeams = area.teams.filter((team) => team.ativo)
  const teamMemberships = area.memberships.filter((membership) => membership.team?.id === teamId)
  const uniquePeople = [...new Map(teamMemberships.map((membership) => [membership.person.id, membership])).values()]
  const selectedTeam = activeTeams.find((team) => team.id === teamId)
  const teamEvents = events.filter((event) => event.campus.id === selectedTeam?.campus.id)
  const selectedMembership = uniquePeople.find((membership) => membership.person.id === personId)

  return <><label>Equipe<select name="teamId" value={teamId} onChange={(event) => { setTeamId(event.target.value); setPersonId(''); onEventSelect(null) }} required><option value="" disabled>Selecione a equipe</option>{activeTeams.map((team) => <option key={team.id} value={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><label>Pessoa<select name="personId" required value={personId} disabled={!teamId || uniquePeople.length === 0} onChange={(event) => setPersonId(event.target.value)}><option value="" disabled>{teamId ? uniquePeople.length ? 'Selecione a pessoa' : 'Não há pessoas vinculadas a esta equipe' : 'Escolha uma equipe antes'}</option>{uniquePeople.map((membership) => <option key={membership.person.id} value={membership.person.id}>{membership.person.nome}</option>)}</select></label>{teamId && <WorshipCalendar events={teamEvents} selectedEventId={eventId} disabled={isLoadingEvents} onSelect={onEventSelect} />}{eventError && <p className="form-error">{eventError}</p>}<input name="eventId" type="hidden" value={eventId} /><label>Função<select key={personId} name="funcao" required disabled={!personId || !selectedMembership?.funcoes.length} defaultValue=""><option value="" disabled>{personId ? selectedMembership?.funcoes.length ? 'Selecione a função' : 'Cadastre funções para esta pessoa' : 'Escolha a pessoa antes'}</option>{selectedMembership?.funcoes.map((functionName) => <option value={functionName} key={functionName}>{functionName}</option>)}</select></label><small className="schedule-event-note">Ao escolher um Culto, a data e o horário são preenchidos automaticamente. Sem Culto, a escala poderá ser vinculada automaticamente quando houver um no mesmo campus e horário.</small></>
}

function WorshipCalendar({ events, selectedEventId, disabled, onSelect }: {
  events: ServiceScheduleEventCandidate[]
  selectedEventId: string
  disabled: boolean
  onSelect: (event: ServiceScheduleEventCandidate | null) => void
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()))
  const firstWeekDay = (visibleMonth.getDay() + 6) % 7
  const totalDays = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const days = Array.from({ length: totalDays }, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1))
  const eventsForDay = (day: Date) => events.filter((event) => {
    const date = new Date(event.inicio)
    return date.getFullYear() === day.getFullYear() && date.getMonth() === day.getMonth() && date.getDate() === day.getDate()
  })

  return <section className="schedule-worship-calendar" aria-label="Agenda mensal de cultos">
    <header><div><strong>Cultos disponíveis</strong><small>Selecione um Culto para preencher a escala automaticamente.</small></div><div><button type="button" aria-label="Mês anterior" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>‹</button><span>{monthTitle(visibleMonth)}</span><button type="button" aria-label="Próximo mês" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>›</button></div></header>
    <div className="schedule-worship-weekdays">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="schedule-worship-days">{Array.from({ length: firstWeekDay }, (_, index) => <span className="schedule-worship-day schedule-worship-day--empty" key={`empty-${index}`} />)}{days.map((day) => { const dayEvents = eventsForDay(day); return <div className="schedule-worship-day" key={day.toISOString()}><strong>{day.getDate()}</strong>{dayEvents.map((event) => <button className={event.id === selectedEventId ? 'schedule-worship-event schedule-worship-event--selected' : 'schedule-worship-event'} key={event.id} type="button" disabled={disabled} onClick={() => onSelect(event)}><span>{new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(event.inicio))}</span>{event.titulo}</button>)}</div> })}</div>
    {!events.length && <p>Nenhum Culto aprovado no campus desta equipe neste período. Informe a data e o horário manualmente.</p>}
  </section>
}
