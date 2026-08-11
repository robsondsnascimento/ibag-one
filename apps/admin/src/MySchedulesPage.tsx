import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createServiceScheduleSwapRequest, listMyServiceSchedules, listServiceScheduleSwapCandidates, updateServiceScheduleStatus } from './api/service-areas'
import type { ServiceAreaSchedule, ServiceScheduleSwapCandidate } from './api/service-areas'

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
  const [swapSchedule, setSwapSchedule] = useState<ServiceAreaSchedule | null>(null)
  const [swapCandidates, setSwapCandidates] = useState<ServiceScheduleSwapCandidate[]>([])
  const [isLoadingSwapCandidates, setIsLoadingSwapCandidates] = useState(false)
  const [swapError, setSwapError] = useState('')

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

  const openSwapRequest = async (schedule: ServiceAreaSchedule) => {
    setSwapSchedule(schedule)
    setSwapCandidates([])
    setSwapError('')
    setIsLoadingSwapCandidates(true)
    try {
      setSwapCandidates(await listServiceScheduleSwapCandidates(accessToken, schedule.id))
    } catch (failure) {
      setSwapError(failure instanceof Error ? failure.message : 'Não foi possível carregar as pessoas disponíveis para a troca.')
    } finally {
      setIsLoadingSwapCandidates(false)
    }
  }

  const submitSwapRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!swapSchedule) return
    const form = new FormData(event.currentTarget)
    const replacementPersonId = String(form.get('replacementPersonId') ?? '')
    if (!replacementPersonId) return
    setIsSaving(true)
    setSwapError('')
    try {
      await createServiceScheduleSwapRequest(accessToken, swapSchedule.id, {
        replacementPersonId,
        reason: String(form.get('reason') ?? '') || undefined,
      })
      setSwapSchedule(null)
      onNotificationsChanged()
      onNotice('Solicitação enviada. A liderança de Louvor precisa aprová-la antes de alterar a escala.')
    } catch (failure) {
      setSwapError(failure instanceof Error ? failure.message : 'Não foi possível enviar a solicitação de troca.')
    } finally {
      setIsSaving(false)
    }
  }

  return <section className="my-schedules-page"><header className="my-schedules-intro"><div><p className="eyebrow">Minha agenda de serviço</p><h2>Minhas escalas</h2><p>Confirme sua disponibilidade ou avise a liderança quando não puder servir.</p></div><span>{pending.length} pendente{pending.length === 1 ? '' : 's'}</span></header>{error && <p className="form-error" role="alert">{error}</p>}{isLoading ? <p className="records-empty">Carregando suas escalas...</p> : schedules.length ? <div className="my-schedule-list">{schedules.map((schedule) => { const canRequestSwap = (schedule.status === 'SCHEDULED' || schedule.status === 'CONFIRMED') && new Date(schedule.data) > new Date(); return <article className="my-schedule-card" key={schedule.id}><div><span className={`service-schedule-status service-schedule-status--${schedule.status.toLocaleLowerCase('pt-BR')}`}>{statusLabels[schedule.status]}</span><h3>{schedule.funcao}</h3><p>{formatDate(schedule.data)}</p><small>{schedule.team.serviceArea.nome} · {schedule.team.nome}{schedule.event ? ` · ${schedule.event.titulo}` : ''}</small>{schedule.observacao && <small>{schedule.observacao}</small>}</div>{(schedule.status === 'SCHEDULED' || canRequestSwap) && <div className="my-schedule-actions">{schedule.status === 'SCHEDULED' && <><button className="secondary-button" type="button" disabled={isSaving} onClick={() => setDeclining(schedule)}>Não posso servir</button><button className="primary-button" type="button" disabled={isSaving} onClick={() => void changeStatus(schedule, 'CONFIRMED')}>Confirmar presença</button></>}{canRequestSwap && <button className="secondary-button" type="button" disabled={isSaving} onClick={() => void openSwapRequest(schedule)}>Solicitar troca</button>}</div>}</article>})}</div> : <p className="records-empty">Você não possui escalas neste momento.</p>}{declining && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setDeclining(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="my-schedule-decline-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setDeclining(null)}>×</button><p className="eyebrow">{declining.team.nome}</p><h2 id="my-schedule-decline-title">Não posso servir</h2><p className="dialog-description">A liderança receberá um alerta para providenciar uma substituição.</p><form className="event-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); void changeStatus(declining, 'DECLINED', String(form.get('reason') ?? '') || undefined) }}><label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Estarei fora da cidade neste fim de semana." /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setDeclining(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Registrando...' : 'Confirmar recusa'}</button></div></form></section></div>}{swapSchedule && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setSwapSchedule(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="my-schedule-swap-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setSwapSchedule(null)}>×</button><p className="eyebrow">{swapSchedule.team.nome}</p><h2 id="my-schedule-swap-title">Solicitar troca</h2><p className="dialog-description">Escolha uma pessoa disponível com a função <strong>{swapSchedule.funcao}</strong>. A escala só será alterada depois da aprovação do líder de Louvor.</p>{isLoadingSwapCandidates ? <p className="dialog-description">Consultando pessoas disponíveis...</p> : <form className="event-form" onSubmit={submitSwapRequest}><label>Pessoa disponível<select name="replacementPersonId" required defaultValue="" disabled={swapCandidates.length === 0}><option value="" disabled>{swapCandidates.length ? 'Selecione uma pessoa' : 'Nenhuma pessoa disponível'}</option>{swapCandidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.nome}</option>)}</select></label>{swapCandidates.length === 0 && !swapError && <p className="record-detail-note">Não há integrantes com essa função cadastrada e disponíveis neste horário. Peça à liderança para revisar as funções da equipe.</p>}<label>Motivo <span className="field-optional">(opcional)</span><textarea name="reason" maxLength={1000} placeholder="Ex.: Estarei em viagem neste dia." /></label>{swapError && <p className="form-error" role="alert">{swapError}</p>}<div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setSwapSchedule(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving || swapCandidates.length === 0}>{isSaving ? 'Enviando...' : 'Enviar solicitação'}</button></div></form>}</section></div>}</section>
}
