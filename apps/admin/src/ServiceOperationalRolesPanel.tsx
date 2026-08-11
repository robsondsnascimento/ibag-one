import { useEffect, useMemo, useState } from 'react'
import type { ServiceAreaDetail } from './api/service-areas'
import { isMusicServiceArea } from './ServiceFunctionsField'

type Props = {
  area: ServiceAreaDetail
  canManage: boolean
}

function isMinister(functionName: string) {
  return functionName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR') === 'ministro'
}

export function ServiceOperationalRolesPanel(props: Props) {
  if (!isMusicServiceArea(props.area.nome)) return null
  return <MusicOperationalRolesPanel {...props} />
}

function MusicOperationalRolesPanel({ area, canManage }: Props) {
  const activeTeams = useMemo(() => area.teams.filter((item) => item.ativo), [area.teams])
  const [teamId, setTeamId] = useState(activeTeams[0]?.id ?? '')
  const team = activeTeams.find((item) => item.id === teamId) ?? null
  const ministers = useMemo(() => {
    const unique = new Map<string, ServiceAreaDetail['memberships'][number]['person']>()
    area.memberships
      .filter((membership) => membership.team?.id === teamId && membership.funcoes.some(isMinister))
      .forEach((membership) => unique.set(membership.person.id, membership.person))
    return [...unique.values()].sort((first, second) => first.nome.localeCompare(second.nome, 'pt-BR'))
  }, [area.memberships, teamId])

  useEffect(() => {
    if (!activeTeams.some((item) => item.id === teamId)) setTeamId(activeTeams[0]?.id ?? '')
  }, [activeTeams, teamId])

  return <section className="service-area-panel service-area-panel--operational-roles">
    <header><div><p className="eyebrow">Funções operacionais</p><h2>Ministros de Louvor</h2></div><span>{ministers.length}</span></header>
    <div className="operational-roles-content">
      <p className="operational-roles-description">A função <strong>Ministro</strong> é definida nas funções de serviço da pessoa. Ela libera o repertório quando a pessoa estiver escalada e confirmada no culto.</p>
      {activeTeams.length ? <label className="operational-team-select">Equipe<select value={teamId} onChange={(event) => setTeamId(event.target.value)}>{activeTeams.map((item) => <option key={item.id} value={item.id}>{item.nome} · {item.campus.nome}</option>)}</select></label> : <p className="service-area-empty">Não há equipe ativa para consultar.</p>}
      {team && <div className="operational-role-list">{ministers.length ? ministers.map((person) => <article key={person.id}><span>♫</span><div><strong>{person.nome}</strong><small>Ministro de Louvor · {team.nome}</small></div></article>) : <p className="service-area-empty">Esta equipe ainda não possui ministros cadastrados.</p>}</div>}
      {canManage ? <p className="operational-roles-description">Para incluir ou remover um ministro, abra <strong>Funções</strong> no cadastro do integrante e marque ou desmarque <strong>Ministro</strong>.</p> : <p className="operational-roles-description">Seu perfil pode consultar os ministros da equipe.</p>}
    </div>
  </section>
}
