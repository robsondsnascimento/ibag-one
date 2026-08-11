import { useState } from 'react'
import type { FormEvent } from 'react'
import { updateServiceMembershipFunctions } from './api/service-areas'
import type { ServiceAreaDetail } from './api/service-areas'
import { ServiceAreaManagementDialog } from './ServiceAreaManagementDialog'
import { ServiceFunctionsField } from './ServiceFunctionsField'
import { ServiceOperationalRolesPanel } from './ServiceOperationalRolesPanel'
import { ServiceAreaSchedulePanel } from './ServiceAreaSchedulePanel'

const membershipRoleLabels: Record<ServiceAreaDetail['memberships'][number]['role'], string> = {
  GENERAL_LEADER: 'Liderança geral',
  CAMPUS_LEADER: 'Liderança de campus',
  TEAM_LEADER: 'Liderança de equipe',
  MEMBER: 'Integrante',
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'IB'
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value)).replace('.', '')
}

export function ServiceAreaWorkspace({
  area,
  error,
  isLoading,
  onRetry,
  canManageArea,
  canCreateTeam,
  canManageTeams,
  canManageMembers,
  canManageOnboarding,
  canManageSchedules,
  accessToken,
  currentPersonId,
  onNotice,
  onCreateTeam,
  onAddMember,
  onOpenOnboarding,
  onStructureChange,
}: {
  area: ServiceAreaDetail | null
  error: string
  isLoading: boolean
  onRetry: () => void
  canManageArea: boolean
  canCreateTeam: boolean
  canManageTeams: boolean
  canManageMembers: boolean
  canManageOnboarding: boolean
  canManageSchedules: boolean
  accessToken: string
  currentPersonId: string
  onNotice: (message: string) => void
  onCreateTeam: (area: ServiceAreaDetail) => void
  onAddMember: (area: ServiceAreaDetail) => void
  onOpenOnboarding: (area: ServiceAreaDetail) => void
  onStructureChange: (areaIsActive: boolean) => void
}) {
  const [editingFunctions, setEditingFunctions] = useState<ServiceAreaDetail['memberships'][number] | null>(null)
  const [managementTarget, setManagementTarget] = useState<
    | { kind: 'area'; area: ServiceAreaDetail }
    | { kind: 'team'; area: ServiceAreaDetail; team: ServiceAreaDetail['teams'][number] }
    | null
  >(null)
  const [isSavingFunctions, setIsSavingFunctions] = useState(false)
  const [functionsError, setFunctionsError] = useState('')

  if (isLoading) {
    return <section className="service-area-page"><p className="service-area-feedback">Carregando a área de serviço...</p></section>
  }

  if (error) {
    return <section className="service-area-page"><div className="dashboard-feedback"><span>!</span><p>{error}</p><button type="button" onClick={onRetry}>Tentar novamente</button></div></section>
  }

  if (!area) {
    return <section className="service-area-page"><p className="service-area-feedback">Selecione uma área de serviço no menu lateral.</p></section>
  }

  const generalLeaders = area.memberships.filter((membership) => membership.role === 'GENERAL_LEADER')
  const campusLeaders = area.memberships.filter((membership) => membership.role === 'CAMPUS_LEADER')
  const teamLeaders = area.memberships.filter((membership) => membership.role === 'TEAM_LEADER')
  const teamMembers = area.memberships.filter((membership) => membership.role === 'MEMBER')
  const activeTeams = area.teams.filter((team) => team.ativo)

  const saveFunctions = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingFunctions) return
    const funcoes = editingFunctions.funcoes
    setFunctionsError('')
    setIsSavingFunctions(true)
    try {
      await updateServiceMembershipFunctions(accessToken, editingFunctions.id, funcoes)
      setEditingFunctions(null)
      onRetry()
      onNotice('Funções de serviço atualizadas.')
    } catch (error) {
      setFunctionsError(error instanceof Error ? error.message : 'Não foi possível atualizar as funções de serviço.')
    } finally {
      setIsSavingFunctions(false)
    }
  }

  return (
    <section className="service-area-page">
      <header className="service-area-intro">
        <div>
          <p>{area.descricao || 'Acompanhe as equipes, lideranças e integrantes desta área de serviço.'}</p>
          <small>{area.scope === 'GLOBAL' ? 'Atuação em toda a organização' : `Atuação no ${area.campus?.nome ?? 'campus definido'}`}</small>
        </div>
        <div className="service-area-actions"><span className={`service-area-scope ${area.ativo ? '' : 'service-area-scope--inactive'}`}>{area.ativo ? (area.scope === 'GLOBAL' ? 'Área global' : 'Área de campus') : 'Área inativa'}</span>{canManageArea && <button className="secondary-button" type="button" onClick={() => setManagementTarget({ kind: 'area', area })}>Configurar área</button>}{area.ativo && canManageOnboarding && <button className="secondary-button" type="button" onClick={() => onOpenOnboarding(area)}>Entrada e formação</button>}{area.ativo && canCreateTeam && <button className="secondary-button" type="button" onClick={() => onCreateTeam(area)}>+ Nova equipe</button>}{area.ativo && canManageMembers && <button className="primary-button" type="button" onClick={() => onAddMember(area)}>+ Vincular pessoa</button>}</div>
      </header>

      <div className="service-area-summary">
        <article><strong>{activeTeams.length}</strong><span>{activeTeams.length === 1 ? 'equipe ativa' : 'equipes ativas'}</span></article>
        <article><strong>{area.memberships.length}</strong><span>{area.memberships.length === 1 ? 'pessoa vinculada' : 'pessoas vinculadas'}</span></article>
        <article><strong>{generalLeaders.length + campusLeaders.length + teamLeaders.length}</strong><span>lideranças ativas</span></article>
      </div>

      <div className="service-area-grid">
        <section className="service-area-panel service-area-panel--teams">
          <header><div><p className="eyebrow">Equipes</p><h2>Estrutura da área</h2></div><span>{area.teams.length}</span></header>
          {area.teams.length ? <div className="service-team-list">{area.teams.map((team) => {
            const teamMemberships = area.memberships.filter((membership) => membership.team?.id === team.id)
            const leaders = teamMemberships.filter((membership) => membership.role === 'TEAM_LEADER')
            const members = teamMemberships.filter((membership) => membership.role === 'MEMBER')
            return <article className={`service-team-row ${team.ativo ? '' : 'service-team-row--inactive'}`} key={team.id}><span className="service-team-symbol">◇</span><div><strong>{team.nome}</strong><small>{team.descricao || `Equipe do ${team.campus.nome}`}</small><p>{team.campus.nome} · {members.length} {members.length === 1 ? 'integrante' : 'integrantes'}{leaders.length ? ` · ${leaders.length} ${leaders.length === 1 ? 'líder' : 'líderes'}` : ''}</p></div><div className="service-team-actions"><span className={`service-team-status ${team.ativo ? 'service-team-status--active' : ''}`}>{team.ativo ? 'Ativa' : 'Inativa'}</span>{canManageTeams && <button className="schedule-action" type="button" onClick={() => setManagementTarget({ kind: 'team', area, team })}>Gerenciar</button>}</div></article>
          })}</div> : <p className="service-area-empty">Ainda não há equipes ativas nesta área.</p>}
        </section>

        <section className="service-area-panel">
          <header><div><p className="eyebrow">Lideranças</p><h2>Cuidado e organização</h2></div><span>{generalLeaders.length + campusLeaders.length + teamLeaders.length}</span></header>
          {generalLeaders.length || campusLeaders.length || teamLeaders.length ? <div className="service-leadership-list">{[...generalLeaders, ...campusLeaders, ...teamLeaders].map((membership) => <article className="service-person-row" key={membership.id}><span className="service-person-symbol">{initials(membership.person.nome)}</span><div><strong>{membership.person.nome}</strong><small>{membershipRoleLabels[membership.role]}{membership.team ? ` · ${membership.team.nome}` : membership.campus ? ` · ${membership.campus.nome}` : ''}</small></div></article>)}</div> : <p className="service-area-empty">Ainda não há lideranças vinculadas a esta área.</p>}
        </section>
      </div>

      <section className="service-area-panel service-area-panel--members">
        <header><div><p className="eyebrow">Integrantes</p><h2>Pessoas em serviço</h2></div><span>{teamMembers.length}</span></header>
        {teamMembers.length ? <div className="service-membership-list">{teamMembers.map((membership) => <article className="service-membership-row" key={membership.id}><span className="service-person-symbol">{initials(membership.person.nome)}</span><div><strong>{membership.person.nome}</strong><small>{membership.team?.nome ?? 'Equipe não definida'} · desde {formatShortDate(membership.inicio)}{membership.funcoes.length ? ` · ${membership.funcoes.join(', ')}` : ''}</small></div><span>{membership.person.telefone || membership.person.email || 'Contato não informado'}</span>{canManageMembers && membership.team && activeTeams.some((team) => team.id === membership.team?.id) && <button className="schedule-action" type="button" onClick={() => { setFunctionsError(''); setEditingFunctions(membership) }}>Funções</button>}</article>)}</div> : <p className="service-area-empty">Ainda não há integrantes ativos nas equipes desta área.</p>}
      </section>

      {editingFunctions && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setEditingFunctions(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="service-member-functions-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setEditingFunctions(null)}>×</button><p className="eyebrow">{editingFunctions.team?.nome}</p><h2 id="service-member-functions-title">Funções de serviço</h2><p className="dialog-description">Cadastre as funções que {editingFunctions.person.nome} pode exercer. Elas serão usadas nas solicitações de troca.</p><form className="event-form" onSubmit={saveFunctions}><ServiceFunctionsField areaName={area.nome} value={editingFunctions.funcoes} onChange={(funcoes) => setEditingFunctions((membership) => membership ? { ...membership, funcoes } : null)} disabled={isSavingFunctions} />{functionsError && <p className="form-error" role="alert">{functionsError}</p>}<div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setEditingFunctions(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={isSavingFunctions}>{isSavingFunctions ? 'Salvando...' : 'Salvar funções'}</button></div></form></section></div>}

      {managementTarget && <ServiceAreaManagementDialog target={managementTarget} accessToken={accessToken} onClose={() => setManagementTarget(null)} onSaved={onStructureChange} onNotice={onNotice} />}

      {area.ativo ? <><ServiceOperationalRolesPanel area={area} canManage={canManageMembers} />
      <ServiceAreaSchedulePanel key={area.id} area={area} accessToken={accessToken} currentPersonId={currentPersonId} canManage={canManageSchedules} onNotice={onNotice} /></> : <section className="service-area-panel"><header><div><p className="eyebrow">Operação pausada</p><h2>Área inativa</h2></div></header><p className="service-area-empty">Reative a Área de Serviço para consultar funções operacionais e criar novas escalas. O histórico foi preservado.</p></section>}
    </section>
  )
}
