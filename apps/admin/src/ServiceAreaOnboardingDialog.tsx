import type { FormEvent } from 'react'
import { useState } from 'react'
import type { PersonListItem } from './api/directory'
import type { ServiceAreaApplication, ServiceAreaDetail, ServiceAreaEntryStage } from './api/service-areas'

const statusLabels: Record<ServiceAreaApplication['status'], string> = {
  INTERESTED: 'Interessado(a)',
  IN_PROGRESS: 'Em acompanhamento',
  APPROVED: 'Aprovado(a)',
  REJECTED: 'Não aprovado(a)',
  WITHDRAWN: 'Encerrado pelo interessado',
}

type Decision = {
  applicationId: string
  kind: 'reject' | 'withdraw'
}

export function ServiceAreaOnboardingDialog({
  area,
  stages,
  applications,
  people,
  error,
  isLoading,
  isSaving,
  canManageStages,
  canManageApplications,
  onClose,
  onCreateStage,
  onUpdateStage,
  onReorderStages,
  onCreateApplication,
  onStartApplication,
  onCompleteStage,
  onApproveApplication,
  onRejectApplication,
  onWithdrawApplication,
}: {
  area: ServiceAreaDetail
  stages: ServiceAreaEntryStage[]
  applications: ServiceAreaApplication[]
  people: PersonListItem[]
  error: string
  isLoading: boolean
  isSaving: boolean
  canManageStages: boolean
  canManageApplications: boolean
  onClose: () => void
  onCreateStage: (input: { nome: string; descricao?: string; obrigatoria: boolean }) => Promise<boolean>
  onUpdateStage: (stageId: string, input: { nome: string; descricao?: string; obrigatoria: boolean; ativo: boolean }) => Promise<boolean>
  onReorderStages: (stageIds: string[]) => void
  onCreateApplication: (input: { personId: string; desiredTeamId?: string; observacao?: string }) => Promise<boolean>
  onStartApplication: (applicationId: string) => void
  onCompleteStage: (applicationId: string, stageId: string) => void
  onApproveApplication: (applicationId: string, teamId: string) => void
  onRejectApplication: (applicationId: string, motivo: string) => Promise<boolean>
  onWithdrawApplication: (applicationId: string, motivo?: string) => Promise<boolean>
}) {
  const [isStageFormOpen, setIsStageFormOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<ServiceAreaEntryStage | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)

  const submitStage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const created = await onCreateStage({
      nome: String(formData.get('stageName') ?? '').trim(),
      descricao: String(formData.get('stageDescription') ?? '').trim() || undefined,
      obrigatoria: formData.get('required') === 'on',
    })
    if (created) {
      event.currentTarget.reset()
      setIsStageFormOpen(false)
    }
  }

  const submitStageEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingStage) return
    const formData = new FormData(event.currentTarget)
    const updated = await onUpdateStage(editingStage.id, {
      nome: String(formData.get('stageName') ?? '').trim(),
      descricao: String(formData.get('stageDescription') ?? '').trim() || undefined,
      obrigatoria: formData.get('required') === 'on',
      ativo: formData.get('active') === 'on',
    })
    if (updated) setEditingStage(null)
  }

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const created = await onCreateApplication({
      personId: String(formData.get('personId') ?? ''),
      desiredTeamId: String(formData.get('teamId') ?? '') || undefined,
      observacao: String(formData.get('observation') ?? '').trim() || undefined,
    })
    if (created) event.currentTarget.reset()
  }

  const submitDecision = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!decision) return
    const motivo = String(new FormData(event.currentTarget).get('reason') ?? '').trim()
    const completed = decision.kind === 'reject'
      ? await onRejectApplication(decision.applicationId, motivo)
      : await onWithdrawApplication(decision.applicationId, motivo || undefined)
    if (completed) setDecision(null)
  }

  const moveStage = (index: number, direction: -1 | 1) => {
    const destination = index + direction
    if (destination < 0 || destination >= stages.length) return
    const ordered = [...stages]
    ;[ordered[index], ordered[destination]] = [ordered[destination], ordered[index]]
    onReorderStages(ordered.map((stage) => stage.id))
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="event-dialog event-dialog--onboarding" role="dialog" aria-modal="true" aria-labelledby="service-onboarding-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar">×</button>
        <p className="eyebrow">Entrada e formação</p>
        <h2 id="service-onboarding-dialog-title">{area.nome}</h2>
        <p className="dialog-description">A pessoa só se torna integrante após concluir as etapas obrigatórias e receber aprovação para uma equipe.</p>

        {error && <p className="form-error" role="alert">{error}</p>}
        {isLoading ? <p className="dialog-description">Carregando o processo de entrada...</p> : <div className="onboarding-content">
          <section className="onboarding-section">
            <header><div><p className="eyebrow">Etapas da área</p><h3>Formação</h3></div>{canManageStages && <button className="secondary-button" type="button" onClick={() => setIsStageFormOpen((open) => !open)}>+ Nova etapa</button>}</header>
            {isStageFormOpen && <form className="event-form onboarding-inline-form" onSubmit={submitStage}><label>Nome da etapa<input name="stageName" required minLength={2} placeholder="Ex.: Treinamento de integração" /></label><label>Descrição <span className="field-optional">(opcional)</span><input name="stageDescription" placeholder="O que será acompanhado nesta etapa" /></label><label className="checkbox-label checkbox-label--form"><input name="required" type="checkbox" defaultChecked /> Etapa obrigatória para aprovação</label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setIsStageFormOpen(false)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Adicionar etapa'}</button></div></form>}
            {editingStage && <form className="event-form onboarding-inline-form" onSubmit={submitStageEdit}><p className="onboarding-form-title">Editar etapa</p><label>Nome da etapa<input name="stageName" required minLength={2} defaultValue={editingStage.nome} /></label><label>Descrição <span className="field-optional">(opcional)</span><input name="stageDescription" defaultValue={editingStage.descricao ?? ''} /></label><label className="checkbox-label checkbox-label--form"><input name="required" type="checkbox" defaultChecked={editingStage.obrigatoria} /> Etapa obrigatória para aprovação</label><label className="checkbox-label checkbox-label--form"><input name="active" type="checkbox" defaultChecked={editingStage.ativo} /> Etapa ativa</label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setEditingStage(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar etapa'}</button></div></form>}
            {stages.length ? <ol className="onboarding-stage-list">{stages.map((stage, index) => <li key={stage.id}><span>{stage.ordem}</span><div><strong>{stage.nome}</strong><small>{stage.descricao || (stage.obrigatoria ? 'Obrigatória para aprovação' : 'Opcional')}</small></div>{stage.obrigatoria && <b>Obrigatória</b>}{canManageStages && <div className="onboarding-stage-actions"><button type="button" disabled={isSaving || index === 0} onClick={() => moveStage(index, -1)} aria-label={`Mover ${stage.nome} para cima`}>↑</button><button type="button" disabled={isSaving || index === stages.length - 1} onClick={() => moveStage(index, 1)} aria-label={`Mover ${stage.nome} para baixo`}>↓</button><button type="button" disabled={isSaving} onClick={() => setEditingStage(stage)}>Editar</button></div>}</li>)}</ol> : <p className="onboarding-empty">Não há etapas configuradas. É possível iniciar processos sem etapas obrigatórias.</p>}
          </section>

          {canManageApplications && <section className="onboarding-section onboarding-section--application-form">
            <header><div><p className="eyebrow">Nova entrada</p><h3>Iniciar acompanhamento</h3></div></header>
            <form className="event-form" onSubmit={submitApplication}><label>Pessoa<select name="personId" required defaultValue="" disabled={people.length === 0}><option value="" disabled>{people.length ? 'Selecione uma pessoa' : 'Nenhuma pessoa disponível'}</option>{people.map((person) => <option key={person.id} value={person.id}>{person.nome}{person.campus.nome ? ` · ${person.campus.nome}` : ''}</option>)}</select></label><label>Equipe desejada <span className="field-optional">(opcional)</span><select name="teamId" defaultValue=""><option value="">Definir na aprovação</option>{area.teams.map((team) => <option value={team.id} key={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><label>Observação <span className="field-optional">(opcional)</span><input name="observation" placeholder="Ex.: demonstrou interesse em servir aos domingos" /></label><div className="dialog-actions"><button className="primary-button" type="submit" disabled={people.length === 0 || isSaving}>{isSaving ? 'Salvando...' : 'Registrar interesse'}</button></div></form>
          </section>}

          <section className="onboarding-section onboarding-section--applications">
            <header><div><p className="eyebrow">Processos</p><h3>Acompanhamento de pessoas</h3></div><span>{applications.length}</span></header>
            {applications.length ? <div className="onboarding-application-list">{applications.map((application) => {
              const completedStageIds = new Set(application.stageCompletions.map((completion) => completion.entryStageId))
              const requiredStagesComplete = stages.filter((stage) => stage.obrigatoria).every((stage) => completedStageIds.has(stage.id))
              const canClose = application.status === 'INTERESTED' || application.status === 'IN_PROGRESS'
              return <article className="onboarding-application-row" key={application.id}><header><div><strong>{application.person.nome}</strong><small>{application.desiredTeam ? `Equipe desejada: ${application.desiredTeam.nome}` : 'Equipe ainda não definida'}</small></div><span className={`onboarding-status onboarding-status--${application.status.toLowerCase()}`}>{statusLabels[application.status]}</span></header>{application.observacao && <p>{application.observacao}</p>}{application.status === 'INTERESTED' && <div className="onboarding-row-actions"><button className="secondary-button" type="button" disabled={isSaving} onClick={() => onStartApplication(application.id)}>Iniciar processo</button></div>}{application.status === 'IN_PROGRESS' && <><div className="onboarding-progress">{stages.length ? stages.map((stage) => <div key={stage.id}><span className={completedStageIds.has(stage.id) ? 'onboarding-progress-check onboarding-progress-check--complete' : 'onboarding-progress-check'}>{completedStageIds.has(stage.id) ? '✓' : stage.ordem}</span><strong>{stage.nome}</strong>{!completedStageIds.has(stage.id) && <button type="button" disabled={isSaving} onClick={() => onCompleteStage(application.id, stage.id)}>Concluir</button>}</div>) : <p>Nenhuma etapa configurada para esta área.</p>}</div><form className="onboarding-approve-form" onSubmit={(event) => { event.preventDefault(); const teamId = String(new FormData(event.currentTarget).get('approveTeamId') ?? ''); if (teamId) onApproveApplication(application.id, teamId) }}><label>Equipe de aprovação<select name="approveTeamId" defaultValue={application.desiredTeam?.id ?? ''} required><option value="" disabled>Selecione a equipe</option>{area.teams.map((team) => <option value={team.id} key={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><button className="primary-button" type="submit" disabled={isSaving || area.teams.length === 0 || !requiredStagesComplete}>{isSaving ? 'Aprovando...' : 'Aprovar e incluir'}</button>{!requiredStagesComplete && <small>Conclua as etapas obrigatórias para aprovar.</small>}</form></>}{canClose && <div className="onboarding-row-actions onboarding-row-actions--close"><button className="member-end-button" type="button" disabled={isSaving} onClick={() => setDecision({ applicationId: application.id, kind: 'reject' })}>Recusar</button><button className="member-end-button" type="button" disabled={isSaving} onClick={() => setDecision({ applicationId: application.id, kind: 'withdraw' })}>Registrar desistência</button></div>}{decision?.applicationId === application.id && <form className="event-form onboarding-decision-form" onSubmit={submitDecision}><strong>{decision.kind === 'reject' ? 'Recusar processo' : 'Registrar desistência'}</strong><label>Motivo {decision.kind === 'withdraw' && <span className="field-optional">(opcional)</span>}<input name="reason" required={decision.kind === 'reject'} minLength={decision.kind === 'reject' ? 2 : undefined} placeholder={decision.kind === 'reject' ? 'Informe o motivo da recusa' : 'Ex.: a pessoa preferiu aguardar outro momento'} /></label><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setDecision(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : decision.kind === 'reject' ? 'Confirmar recusa' : 'Confirmar desistência'}</button></div></form>}</article>
            })}</div> : <p className="onboarding-empty">Ainda não há pessoas em processo de entrada nesta área.</p>}
          </section>
        </div>}
      </section>
    </div>
  )
}
