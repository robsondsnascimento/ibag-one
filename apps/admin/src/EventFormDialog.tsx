import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { AgendaEvent, CreateAgendaEventInput, EventSpace } from './api/dashboard'
import type { CampusListItem, CellListItem } from './api/directory'
import type { ServiceAreaDetail } from './api/service-areas'

type Props = {
  event: AgendaEvent | null
  campuses: CampusListItem[]
  cells: CellListItem[]
  areas: ServiceAreaDetail[]
  spaces: EventSpace[]
  isLoading: boolean
  isSaving: boolean
  error: string
  canBlockCampusAgenda: boolean
  onCampusChange: (campusId: string) => void
  onClose: () => void
  onSubmit: (input: CreateAgendaEventInput) => void
}

function dateValue(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function timeValue(value?: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
}

function toggle(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}

export function EventFormDialog({ event, campuses, cells, areas, spaces, isLoading, isSaving, error, canBlockCampusAgenda, onCampusChange, onClose, onSubmit }: Props) {
  const [campusId, setCampusId] = useState(event?.campus.id ?? '')
  const [cellId, setCellId] = useState(event?.cell?.id ?? '')
  const [spaceIds, setSpaceIds] = useState(event?.spaces.map((item) => item.spaceId) ?? [])
  const [serviceAreaIds, setServiceAreaIds] = useState(event?.serviceAreas.map((item) => item.serviceAreaId) ?? [])
  const [teamIds, setTeamIds] = useState(event?.teams.map((item) => item.teamId) ?? [])
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    setCampusId(event?.campus.id ?? '')
    setCellId(event?.cell?.id ?? '')
    setSpaceIds(event?.spaces.map((item) => item.spaceId) ?? [])
    setServiceAreaIds(event?.serviceAreas.map((item) => item.serviceAreaId) ?? [])
    setTeamIds(event?.teams.map((item) => item.teamId) ?? [])
    setLocalError('')
  }, [event])

  const availableAreas = useMemo(() => areas.filter((area) => area.scope === 'GLOBAL' || area.campus?.id === campusId), [areas, campusId])
  const availableTeams = useMemo(() => availableAreas.flatMap((area) => area.teams.filter((team) => team.campus.id === campusId).map((team) => ({ ...team, areaId: area.id, areaName: area.nome }))), [availableAreas, campusId])
  const availableCells = useMemo(() => cells.filter((cell) => cell.ativo && cell.status === 'ACTIVE' && cell.campus.id === campusId), [cells, campusId])

  const changeCampus = (nextCampusId: string) => {
    setCampusId(nextCampusId)
    setCellId('')
    setSpaceIds([])
    setTeamIds([])
    setServiceAreaIds((current) => current.filter((areaId) => areas.some((area) => area.id === areaId && (area.scope === 'GLOBAL' || area.campus?.id === nextCampusId))))
    onCampusChange(nextCampusId)
  }

  const submit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    const data = new FormData(formEvent.currentTarget)
    const date = String(data.get('date') ?? '')
    const startTime = String(data.get('startTime') ?? '')
    const endTime = String(data.get('endTime') ?? '')
    const inicio = new Date(`${date}T${startTime}:00`)
    const fim = new Date(`${date}T${endTime}:00`)

    if (inicio >= fim) {
      setLocalError('O horário de término deve ser posterior ao horário de início.')
      return
    }

    setLocalError('')

    onSubmit({
      titulo: String(data.get('title') ?? '').trim(),
      descricao: String(data.get('description') ?? '').trim() || undefined,
      type: String(data.get('type') ?? 'MEETING'),
      campusId,
      cellId: cellId || undefined,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      alertEnabled: data.get('alertEnabled') === 'on',
      blocksCampusAgenda: canBlockCampusAgenda && data.get('blocksCampusAgenda') === 'on',
      spaceIds,
      serviceAreaIds,
      teamIds,
    })
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="event-dialog event-dialog--event-form" role="dialog" aria-modal="true" aria-labelledby="event-form-title" onMouseDown={(formEvent) => formEvent.stopPropagation()}>
      <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar">×</button>
      <p className="eyebrow">Agenda institucional</p>
      <h2 id="event-form-title">{event ? 'Editar evento' : 'Novo evento'}</h2>
      <p className="dialog-description">Defina a agenda, os envolvidos e os espaços. As permissões e conflitos continuam sendo validados pela organização.</p>
      <form className="event-form" onSubmit={submit}>
        <label>Nome do evento<input name="title" required defaultValue={event?.titulo ?? ''} placeholder="Ex.: Encontro de líderes" /></label>
        <div className="form-grid">
          <label>Tipo<select name="type" defaultValue={event?.type ?? 'MEETING'}><option value="MEETING">Reunião</option><option value="WORSHIP">Culto</option><option value="TRAINING">Treinamento</option><option value="REHEARSAL">Ensaio</option><option value="PASTORAL">Pastoral</option><option value="SERVICE">Serviço</option><option value="CONFERENCE">Conferência</option><option value="SPECIAL_PROGRAM">Programação especial</option></select></label>
          <label>Data<input name="date" type="date" required defaultValue={dateValue(event?.inicio)} /></label>
        </div>
        <div className="form-grid">
          <label>Início<input name="startTime" type="time" required defaultValue={timeValue(event?.inicio)} /></label>
          <label>Término<input name="endTime" type="time" required defaultValue={timeValue(event?.fim)} /></label>
        </div>
        <label>Campus<select name="campusId" value={campusId} required disabled={isLoading || campuses.length === 0} onChange={(changeEvent) => changeCampus(changeEvent.target.value)}><option value="" disabled>{isLoading ? 'Carregando campi...' : 'Selecione o campus'}</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.nome}</option>)}</select></label>
        <label>Célula relacionada <span className="field-optional">(opcional)</span><select name="cellId" value={cellId} disabled={!campusId} onChange={(changeEvent) => setCellId(changeEvent.target.value)}><option value="">Nenhuma célula específica</option>{availableCells.map((cell) => <option value={cell.id} key={cell.id}>{cell.nome}</option>)}</select></label>
        <EventSelection title="Áreas de Serviço envolvidas" description="Opcional para administração; necessário quando a liderança solicita um evento da área." items={availableAreas.map((area) => ({ id: area.id, label: area.nome }))} selectedIds={serviceAreaIds} onToggle={(id) => setServiceAreaIds((current) => toggle(current, id))} emptyMessage={campusId ? 'Não há áreas disponíveis neste campus.' : 'Escolha o campus para selecionar áreas.'} />
        <EventSelection title="Equipes envolvidas" description="As equipes tornam o evento disponível para vincular as escalas correspondentes." items={availableTeams.map((team) => ({ id: team.id, label: `${team.areaName} · ${team.nome}`, parentId: team.areaId }))} selectedIds={teamIds} onToggle={(id) => {
          const team = availableTeams.find((item) => item.id === id)
          setTeamIds((current) => toggle(current, id))
          if (team && !teamIds.includes(id)) setServiceAreaIds((current) => current.includes(team.areaId) ? current : [...current, team.areaId])
        }} emptyMessage={campusId ? 'Selecione uma área com equipe neste campus.' : 'Escolha o campus para selecionar equipes.'} />
        <EventSelection title="Espaços reservados" description="O sistema impede reservas simultâneas no mesmo espaço." items={spaces.map((space) => ({ id: space.id, label: space.capacidade ? `${space.nome} · ${space.capacidade} lugares` : space.nome }))} selectedIds={spaceIds} onToggle={(id) => setSpaceIds((current) => toggle(current, id))} emptyMessage={campusId ? 'Não há espaços cadastrados neste campus.' : 'Escolha o campus para consultar espaços.'} />
        <label>Observação <span className="field-optional">(opcional)</span><input name="description" defaultValue={event?.descricao ?? ''} placeholder="Informação útil para a agenda" /></label>
        <div className="event-form-options"><label className="checkbox-label checkbox-label--form"><input name="alertEnabled" type="checkbox" defaultChecked={event?.alertEnabled ?? false} /> Habilitar alertas do evento</label>{canBlockCampusAgenda && <label className="checkbox-label checkbox-label--form"><input name="blocksCampusAgenda" type="checkbox" defaultChecked={event?.blocksCampusAgenda ?? false} /> Bloquear a agenda do campus neste horário</label>}</div>
        {(localError || error) && <p className="form-error" role="alert">{localError || error}</p>}
        <div className="dialog-actions"><button className="secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={isLoading || !campusId || isSaving}>{isSaving ? 'Salvando...' : event ? 'Salvar alterações' : 'Criar evento'}</button></div>
      </form>
    </section>
  </div>
}

function EventSelection({ title, description, items, selectedIds, onToggle, emptyMessage }: { title: string; description: string; items: Array<{ id: string; label: string; parentId?: string }>; selectedIds: string[]; onToggle: (id: string) => void; emptyMessage: string }) {
  return <fieldset className="event-selection"><legend>{title}</legend><p>{description}</p>{items.length ? <div className="event-selection-options">{items.map((item) => <label key={item.id}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => onToggle(item.id)} /> <span>{item.label}</span></label>)}</div> : <small>{emptyMessage}</small>}</fieldset>
}
