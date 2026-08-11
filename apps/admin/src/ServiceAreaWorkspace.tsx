import type { ServiceAreaDetail } from './api/service-areas'

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
}: {
  area: ServiceAreaDetail | null
  error: string
  isLoading: boolean
  onRetry: () => void
}) {
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

  return (
    <section className="service-area-page">
      <header className="service-area-intro">
        <div>
          <p>{area.descricao || 'Acompanhe as equipes, lideranças e integrantes desta área de serviço.'}</p>
          <small>{area.scope === 'GLOBAL' ? 'Atuação em toda a organização' : `Atuação no ${area.campus?.nome ?? 'campus definido'}`}</small>
        </div>
        <span className="service-area-scope">{area.scope === 'GLOBAL' ? 'Área global' : 'Área de campus'}</span>
      </header>

      <div className="service-area-summary">
        <article><strong>{area.teams.length}</strong><span>{area.teams.length === 1 ? 'equipe ativa' : 'equipes ativas'}</span></article>
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
            return <article className="service-team-row" key={team.id}><span className="service-team-symbol">◇</span><div><strong>{team.nome}</strong><small>{team.descricao || `Equipe do ${team.campus.nome}`}</small><p>{team.campus.nome} · {members.length} {members.length === 1 ? 'integrante' : 'integrantes'}{leaders.length ? ` · ${leaders.length} ${leaders.length === 1 ? 'líder' : 'líderes'}` : ''}</p></div></article>
          })}</div> : <p className="service-area-empty">Ainda não há equipes ativas nesta área.</p>}
        </section>

        <section className="service-area-panel">
          <header><div><p className="eyebrow">Lideranças</p><h2>Cuidado e organização</h2></div><span>{generalLeaders.length + campusLeaders.length + teamLeaders.length}</span></header>
          {generalLeaders.length || campusLeaders.length || teamLeaders.length ? <div className="service-leadership-list">{[...generalLeaders, ...campusLeaders, ...teamLeaders].map((membership) => <article className="service-person-row" key={membership.id}><span className="service-person-symbol">{initials(membership.person.nome)}</span><div><strong>{membership.person.nome}</strong><small>{membershipRoleLabels[membership.role]}{membership.team ? ` · ${membership.team.nome}` : membership.campus ? ` · ${membership.campus.nome}` : ''}</small></div></article>)}</div> : <p className="service-area-empty">Ainda não há lideranças vinculadas a esta área.</p>}
        </section>
      </div>

      <section className="service-area-panel service-area-panel--members">
        <header><div><p className="eyebrow">Integrantes</p><h2>Pessoas em serviço</h2></div><span>{teamMembers.length}</span></header>
        {teamMembers.length ? <div className="service-membership-list">{teamMembers.map((membership) => <article className="service-membership-row" key={membership.id}><span className="service-person-symbol">{initials(membership.person.nome)}</span><div><strong>{membership.person.nome}</strong><small>{membership.team?.nome ?? 'Equipe não definida'} · desde {formatShortDate(membership.inicio)}</small></div><span>{membership.person.telefone || membership.person.email || 'Contato não informado'}</span></article>)}</div> : <p className="service-area-empty">Ainda não há integrantes ativos nas equipes desta área.</p>}
      </section>
    </section>
  )
}
