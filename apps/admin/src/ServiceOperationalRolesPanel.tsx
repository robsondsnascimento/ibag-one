import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { assignServiceOperationalRole, endServiceOperationalRole, listServiceOperationalRoles } from './api/service-areas'
import type { ServiceAreaDetail, ServiceOperationalRoleAssignment } from './api/service-areas'

const roleLabels = {
  WORSHIP_MINISTER: 'Ministro de Louvor',
} as const

type Props = {
  area: ServiceAreaDetail
  accessToken: string
  canManage: boolean
  onNotice: (message: string) => void
}

export function ServiceOperationalRolesPanel({ area, accessToken, canManage, onNotice }: Props) {
  const [teamId, setTeamId] = useState(area.teams[0]?.id ?? '')
  const [assignments, setAssignments] = useState<ServiceOperationalRoleAssignment[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(area.teams[0]))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const team = area.teams.find((item) => item.id === teamId) ?? null
  const candidates = useMemo(() => {
    const unique = new Map<string, ServiceAreaDetail['memberships'][number]['person']>()
    area.memberships.filter((membership) => membership.team?.id === teamId).forEach((membership) => unique.set(membership.person.id, membership.person))
    return [...unique.values()].sort((first, second) => first.nome.localeCompare(second.nome, 'pt-BR'))
  }, [area.memberships, teamId])

  useEffect(() => {
    if (!teamId) {
      setAssignments([])
      setIsLoading(false)
      return
    }
    let active = true
    setIsLoading(true)
    setError('')
    void listServiceOperationalRoles(accessToken, teamId)
      .then((items) => {
        if (active) setAssignments(items)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar as funções desta equipe.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [accessToken, teamId])

  const assign = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault()
    if (!teamId) return
    const personId = String(new FormData(formEvent.currentTarget).get('personId') ?? '')
    if (!personId) return
    setError('')
    setIsSaving(true)
    void assignServiceOperationalRole(accessToken, teamId, { personId, role: 'WORSHIP_MINISTER' })
      .then((assignment) => {
        setAssignments((current) => [...current, assignment])
        formEvent.currentTarget.reset()
        onNotice(`${assignment.person.nome} agora atua como Ministro de Louvor nesta equipe.`)
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Não foi possível atribuir esta função.'))
      .finally(() => setIsSaving(false))
  }

  const end = (assignment: ServiceOperationalRoleAssignment) => {
    setError('')
    setIsSaving(true)
    void endServiceOperationalRole(accessToken, assignment.id)
      .then(() => {
        setAssignments((current) => current.filter((item) => item.id !== assignment.id))
        onNotice(`A função operacional de ${assignment.person.nome} foi encerrada.`)
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Não foi possível encerrar esta função.'))
      .finally(() => setIsSaving(false))
  }

  return <section className="service-area-panel service-area-panel--operational-roles">
    <header><div><p className="eyebrow">Funções operacionais</p><h2>Responsabilidades da equipe</h2></div><span>{assignments.length}</span></header>
    <div className="operational-roles-content">
      <p className="operational-roles-description">A função complementa o vínculo da pessoa na equipe. Neste momento, o painel disponibiliza a atribuição de <strong>Ministro de Louvor</strong> para o fluxo de repertório.</p>
      {area.teams.length ? <label className="operational-team-select">Equipe<select value={teamId} onChange={(event) => setTeamId(event.target.value)} disabled={isSaving}>{area.teams.map((item) => <option key={item.id} value={item.id}>{item.nome} · {item.campus.nome}</option>)}</select></label> : <p className="service-area-empty">Crie uma equipe para atribuir funções operacionais.</p>}
      {team && <><div className="operational-role-list">{isLoading ? <p className="service-area-empty">Carregando funções da equipe...</p> : assignments.length ? assignments.map((assignment) => <article key={assignment.id}><span>♫</span><div><strong>{assignment.person.nome}</strong><small>{roleLabels[assignment.role]} · desde {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(assignment.inicio)).replace('.', '')}</small></div>{canManage && <button className="member-end-button" type="button" disabled={isSaving} onClick={() => end(assignment)}>Encerrar</button>}</article>) : <p className="service-area-empty">Esta equipe ainda não possui funções operacionais ativas.</p>}</div>{canManage ? <form className="operational-role-form" onSubmit={assign}><label>Pessoa da equipe<select name="personId" required disabled={isSaving || candidates.length === 0}><option value="" disabled>Selecione uma pessoa</option>{candidates.map((person) => <option value={person.id} key={person.id}>{person.nome}</option>)}</select></label><p><strong>Função:</strong> Ministro de Louvor</p><button className="secondary-button" type="submit" disabled={isSaving || candidates.length === 0}>{isSaving ? 'Salvando...' : '+ Atribuir função'}</button>{candidates.length === 0 && <small>Vincule uma pessoa como integrante desta equipe antes de atribuir a função.</small>}</form> : <p className="operational-roles-description">Seu perfil pode consultar as funções, mas não alterá-las.</p>}</>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  </section>
}
