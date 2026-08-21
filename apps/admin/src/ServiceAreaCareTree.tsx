import { useState } from 'react'
import type { ServiceAreaDetail } from './api/service-areas'
import './ServiceAreaCareTree.css'

type CarePerson = {
  id: string
  nome: string
  detail?: string
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

function CareLevel({ title, people, emptyLabel = 'Não definido' }: { title: string; people: CarePerson[]; emptyLabel?: string }) {
  const [expanded, setExpanded] = useState(false)
  return <section className="service-care-level">
    <button type="button" className="service-care-level-toggle" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} aria-label={`${expanded ? 'Recolher' : 'Expandir'} ${title}`}><span className="service-care-level-marker" aria-hidden="true">{expanded ? '−' : '+'}</span></button>
    <div>
      <p>{title}</p>
      {expanded && (people.length ? <div className="service-care-people">{people.map((person) => <div className="service-care-person" key={person.id}><span>{initials(person.nome)}</span><div><strong>{person.nome}</strong>{person.detail && <small>{person.detail}</small>}</div></div>)}</div> : <small className="service-care-empty">{emptyLabel}</small>)}
    </div>
  </section>
}

export function ServiceAreaCareTree({ area }: { area: ServiceAreaDetail }) {
  const seniorPastors = area.pastoralLeadership.filter((leader) => leader.role === 'PASTOR_SENIOR').map((leader) => ({ id: leader.person.id, nome: leader.person.nome }))
  const pastors = area.pastoralLeadership.filter((leader) => leader.role === 'PASTOR').map((leader) => ({ id: leader.person.id, nome: leader.person.nome, detail: leader.person.campus.nome }))
  const generalLeaders = area.memberships.filter((membership) => membership.role === 'GENERAL_LEADER').map((membership) => ({ id: membership.id, nome: membership.person.nome }))

  return <div className="service-care-tree">
    <CareLevel title="Pastor sênior" people={seniorPastors} />
    <div className="service-care-branch">
      <CareLevel title="Pastores" people={pastors} emptyLabel="Nenhum pastor ativo" />
      <CareLevel title="Liderança geral da Área" people={generalLeaders} />
      <div className="service-care-branch service-care-branch--teams">
        {area.teams.map((team) => {
          const campusLeaders = area.memberships.filter((membership) => membership.role === 'CAMPUS_LEADER' && membership.campus?.id === team.campus.id).map((membership) => ({ id: membership.id, nome: membership.person.nome }))
          const teamLeaders = area.memberships.filter((membership) => membership.role === 'TEAM_LEADER' && membership.team?.id === team.id).map((membership) => ({ id: membership.id, nome: membership.person.nome }))
          const volunteers = area.memberships.filter((membership) => membership.role === 'MEMBER' && membership.team?.id === team.id).map((membership) => ({ id: membership.id, nome: membership.person.nome, detail: membership.funcoes.length ? membership.funcoes.join(', ') : undefined }))

          return <section className={`service-care-team ${team.ativo ? '' : 'service-care-team--inactive'}`} key={team.id}>
            <header><span>Equipe</span><strong>{team.nome}</strong><small>{team.campus.nome}</small></header>
            <div className="service-care-branch">
              <CareLevel title="Liderança de campus" people={campusLeaders} />
              <CareLevel title="Liderança de equipe" people={teamLeaders} />
              <CareLevel title="Voluntários" people={volunteers} emptyLabel="Nenhum voluntário vinculado" />
            </div>
          </section>
        })}
      </div>
    </div>
  </div>
}
