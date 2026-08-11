import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AgendaEvent } from './api/dashboard'
import { EventSchedulesDialog } from './EventSchedulesDialog'

const statusLabels: Record<string, string> = {
  REQUESTED: 'Aguardando aprovação',
  APPROVED: 'Aprovado',
  CANCELLED: 'Cancelado',
}

const typeLabels: Record<string, string> = {
  MEETING: 'Reunião',
  WORSHIP: 'Culto',
  TRAINING: 'Treinamento',
  REHEARSAL: 'Ensaio',
  PASTORAL: 'Pastoral',
  SERVICE: 'Serviço',
  CONFERENCE: 'Conferência',
  SPECIAL_PROGRAM: 'Programação especial',
}

type Props = {
  event: AgendaEvent
  accessToken: string
  canApprove: boolean
  onClose: () => void
  onEdit: () => void
  onApprove: () => Promise<void>
  onCancel: () => Promise<void>
  onAddChecklist: (description: string) => Promise<void>
  onToggleChecklist: (checklistId: string) => Promise<void>
}

function eventDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function EventDetailsDialog({ event, accessToken, canApprove, onClose, onEdit, onApprove, onCancel, onAddChecklist, onToggleChecklist }: Props) {
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSchedules, setShowSchedules] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const run = async (action: () => Promise<void>) => {
    setError('')
    setIsSaving(true)
    try {
      await action()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar este evento.')
    } finally {
      setIsSaving(false)
    }
  }

  const addChecklist = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    const description = String(new FormData(formEvent.currentTarget).get('description') ?? '').trim()
    if (!description) return
    void run(async () => {
      await onAddChecklist(description)
      formEvent.currentTarget.reset()
    })
  }

  const checklist = event.checklist ?? []
  return <>
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="event-dialog event-dialog--event-details" role="dialog" aria-modal="true" aria-labelledby="event-details-title" onMouseDown={(dialogEvent) => dialogEvent.stopPropagation()}>
        <button className="dialog-close" type="button" aria-label="Fechar" onClick={onClose}>×</button>
        <div className="event-details-heading"><div><p className="eyebrow">Agenda institucional</p><h2 id="event-details-title">{event.titulo}</h2><p className="dialog-description">{typeLabels[event.type] ?? event.type} · {event.campus.nome}</p></div><span className={`event-status event-status--${event.status.toLowerCase()}`}>{statusLabels[event.status] ?? event.status}</span></div>
        <dl className="event-details-summary"><div><dt>Início</dt><dd>{eventDate(event.inicio)}</dd></div><div><dt>Término</dt><dd>{eventDate(event.fim)}</dd></div>{event.cell && <div><dt>Célula</dt><dd>{event.cell.nome}</dd></div>}{event.descricao && <div className="event-details-summary--full"><dt>Observação</dt><dd>{event.descricao}</dd></div>}</dl>
        <EventReferences title="Áreas de Serviço" names={event.serviceAreas.map((item) => item.serviceArea.nome)} emptyMessage="Nenhuma área vinculada." />
        <EventReferences title="Equipes envolvidas" names={event.teams.map((item) => item.team.nome)} emptyMessage="Nenhuma equipe vinculada." />
        <EventReferences title="Espaços reservados" names={event.spaces.map((item) => item.space.nome)} emptyMessage="Nenhum espaço reservado." />
        <section className="event-details-section"><header><div><p className="eyebrow">Preparação</p><h3>Checklist do evento</h3></div><span>{checklist.filter((item) => item.concluido).length}/{checklist.length}</span></header>{checklist.length ? <div className="event-checklist">{checklist.map((item) => <label key={item.id}><input type="checkbox" checked={item.concluido} disabled={isSaving} onChange={() => void run(() => onToggleChecklist(item.id))} /><span>{item.descricao}</span></label>)}</div> : <p className="event-details-empty">Ainda não há itens de preparação.</p>}<form className="event-checklist-form" onSubmit={addChecklist}><input name="description" minLength={2} required placeholder="Ex.: Confirmar montagem do som" disabled={isSaving} /><button className="secondary-button" type="submit" disabled={isSaving}>+ Adicionar</button></form></section>
        {error && <p className="form-error" role="alert">{error}</p>}
        {confirmCancel ? <div className="event-cancel-confirmation"><strong>Cancelar este evento?</strong><p>O histórico será preservado e o evento deixará de aparecer na agenda.</p><div><button className="secondary-button" type="button" disabled={isSaving} onClick={() => setConfirmCancel(false)}>Voltar</button><button className="member-end-button" type="button" disabled={isSaving} onClick={() => void run(onCancel)}>{isSaving ? 'Cancelando...' : 'Confirmar cancelamento'}</button></div></div> : <div className="dialog-actions event-details-actions"><button className="secondary-button" type="button" onClick={() => setShowSchedules(true)}>Ver escalas</button><button className="secondary-button" type="button" disabled={isSaving} onClick={onEdit}>Editar</button>{event.status === 'REQUESTED' && canApprove && <button className="primary-button" type="button" disabled={isSaving} onClick={() => void run(onApprove)}>{isSaving ? 'Aprovando...' : 'Aprovar evento'}</button>}{event.status !== 'CANCELLED' && <button className="member-end-button" type="button" disabled={isSaving} onClick={() => setConfirmCancel(true)}>Cancelar evento</button>}</div>}
      </section>
    </div>
    {showSchedules && <EventSchedulesDialog event={event} accessToken={accessToken} onClose={() => setShowSchedules(false)} />}
  </>
}

function EventReferences({ title, names, emptyMessage }: { title: string; names: string[]; emptyMessage: string }) {
  return <section className="event-details-section"><header><h3>{title}</h3></header>{names.length ? <div className="event-reference-list">{names.map((name) => <span key={name}>{name}</span>)}</div> : <p className="event-details-empty">{emptyMessage}</p>}</section>
}
