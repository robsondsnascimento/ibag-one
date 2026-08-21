import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { addServiceAreaMember, endServiceAreaMembership, getServiceArea, listServiceAreas, transferServiceAreaMembership, updateServiceMembershipFunctions } from './api/service-areas'
import type { ServiceAreaDetail, ServiceAreaListItem } from './api/service-areas'
import { ServiceFunctionsField } from './ServiceFunctionsField'
import { createPersonSystemAccess, getPersonSystemAccess } from './api/users'
import type { PersonSystemAccess } from './api/users'
import { updatePersonMinisterialTitles } from './api/directory'
import type { PersonListItem } from './api/directory'

type Props = {
  accessToken: string
  person: PersonListItem
  canManageAccess: boolean
  canManageServiceAreas: boolean
  onPersonChange: (person: PersonListItem) => void
  onNotice: (message: string) => void
}

const ministerialTitleSuggestions = [
  'Pastor de Adoração',
  'Pastor de Campus',
  'Pastor de Crianças',
  'Pastor de Ensino',
  'Pastor de Famílias',
  'Pastor de Homens',
  'Pastor de Jovens',
  'Pastor de Missões',
  'Pastor de Mulheres',
]

function displayLogin(loginEmail: string) {
  return loginEmail.split('@')[0]
}

export function PersonRegistrationPanel({ accessToken, person, canManageAccess, canManageServiceAreas, onPersonChange, onNotice }: Props) {
  const [access, setAccess] = useState<PersonSystemAccess | null>(null)
  const [isLoadingAccess, setIsLoadingAccess] = useState(canManageAccess)
  const [grantLogin, setGrantLogin] = useState(false)
  const [showInitialPassword, setShowInitialPassword] = useState(false)
  const [isSavingAccess, setIsSavingAccess] = useState(false)
  const [accessError, setAccessError] = useState('')
  const [ministerialTitles, setMinisterialTitles] = useState(person.titulosMinisteriais ?? [])
  const [ministerialTitleDraft, setMinisterialTitleDraft] = useState('')
  const [isSavingMinisterialTitles, setIsSavingMinisterialTitles] = useState(false)
  const [ministerialTitlesError, setMinisterialTitlesError] = useState('')
  const [areas, setAreas] = useState<ServiceAreaListItem[]>([])
  const [selectedAreaId, setSelectedAreaId] = useState('')
  const [selectedArea, setSelectedArea] = useState<ServiceAreaDetail | null>(null)
  const [isLoadingAreas, setIsLoadingAreas] = useState(canManageServiceAreas)
  const [isLoadingArea, setIsLoadingArea] = useState(false)
  const [isSavingService, setIsSavingService] = useState(false)
  const [serviceError, setServiceError] = useState('')
  const [assignService, setAssignService] = useState(false)
  const [serviceFunctions, setServiceFunctions] = useState<string[]>([])
  const [editingMembership, setEditingMembership] = useState<NonNullable<PersonListItem['serviceMemberships']>[number] | null>(null)
  const [editingAreaId, setEditingAreaId] = useState('')
  const [editingArea, setEditingArea] = useState<ServiceAreaDetail | null>(null)
  const [editingTeamId, setEditingTeamId] = useState('')
  const [editingFunctions, setEditingFunctions] = useState<string[]>([])
  const [isLoadingEditingArea, setIsLoadingEditingArea] = useState(false)

  useEffect(() => {
    if (!canManageAccess) return
    let active = true
    setIsLoadingAccess(true)
    void getPersonSystemAccess(accessToken, person.id)
      .then((result) => { if (active) setAccess(result) })
      .catch((reason) => { if (active) setAccessError(reason instanceof Error ? reason.message : 'Não foi possível consultar o acesso da pessoa.') })
      .finally(() => { if (active) setIsLoadingAccess(false) })
    return () => { active = false }
  }, [accessToken, canManageAccess, person.id])

  useEffect(() => {
    setMinisterialTitles(person.titulosMinisteriais ?? [])
  }, [person.id, person.titulosMinisteriais])

  useEffect(() => {
    if (!canManageServiceAreas) return
    let active = true
    setIsLoadingAreas(true)
    void listServiceAreas(accessToken)
      .then((result) => { if (active) setAreas(result) })
      .catch((reason) => { if (active) setServiceError(reason instanceof Error ? reason.message : 'Não foi possível carregar as Áreas de Serviço.') })
      .finally(() => { if (active) setIsLoadingAreas(false) })
    return () => { active = false }
  }, [accessToken, canManageServiceAreas])

  useEffect(() => {
    if (!selectedAreaId) {
      setSelectedArea(null)
      return
    }
    let active = true
    setIsLoadingArea(true)
    setServiceError('')
    void getServiceArea(accessToken, selectedAreaId)
      .then((result) => { if (active) setSelectedArea(result) })
      .catch((reason) => { if (active) setServiceError(reason instanceof Error ? reason.message : 'Não foi possível carregar as equipes da área.') })
      .finally(() => { if (active) setIsLoadingArea(false) })
    return () => { active = false }
  }, [accessToken, selectedAreaId])

  useEffect(() => {
    if (!editingAreaId) {
      setEditingArea(null)
      return
    }
    let active = true
    setIsLoadingEditingArea(true)
    setServiceError('')
    void getServiceArea(accessToken, editingAreaId)
      .then((result) => { if (active) setEditingArea(result) })
      .catch((reason) => { if (active) setServiceError(reason instanceof Error ? reason.message : 'Não foi possível carregar a Área de Serviço.') })
      .finally(() => { if (active) setIsLoadingEditingArea(false) })
    return () => { active = false }
  }, [accessToken, editingAreaId])

  const activeMemberships = useMemo(() => person.serviceMemberships ?? [], [person.serviceMemberships])
  const activeTeams = useMemo(() => selectedArea?.teams.filter((team) => team.ativo) ?? [], [selectedArea])

  const createAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!grantLogin || access) return
    const password = String(new FormData(event.currentTarget).get('initialPassword') ?? '')
    setAccessError('')
    setIsSavingAccess(true)
    void createPersonSystemAccess(accessToken, person.id, password)
      .then((created) => {
        setAccess(created)
        setGrantLogin(false)
        onNotice(`Acesso criado para ${person.nome}. Usuário: ${displayLogin(created.loginEmail)}.`)
      })
      .catch((reason) => setAccessError(reason instanceof Error ? reason.message : 'Não foi possível criar o acesso agora.'))
      .finally(() => setIsSavingAccess(false))
  }

  const saveMinisterialTitles = (titles: string[]) => {
    setMinisterialTitlesError('')
    setIsSavingMinisterialTitles(true)
    void updatePersonMinisterialTitles(accessToken, person.id, titles)
      .then((updated) => {
        setMinisterialTitles(updated.titulosMinisteriais)
        onPersonChange({ ...person, titulosMinisteriais: updated.titulosMinisteriais })
        onNotice(`Títulos ministeriais de ${person.nome} atualizados.`)
      })
      .catch((reason) => setMinisterialTitlesError(reason instanceof Error ? reason.message : 'Não foi possível atualizar os títulos ministeriais.'))
      .finally(() => setIsSavingMinisterialTitles(false))
  }

  const addMinisterialTitle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = ministerialTitleDraft.trim().replace(/\s+/g, ' ')
    if (!title) {
      setMinisterialTitlesError('Informe um título ministerial.')
      return
    }
    if (ministerialTitles.some((item) => item.localeCompare(title, 'pt-BR', { sensitivity: 'accent' }) === 0)) {
      setMinisterialTitlesError('Este título já está vinculado à pessoa.')
      return
    }
    setMinisterialTitleDraft('')
    saveMinisterialTitles([...ministerialTitles, title])
  }

  const addMembership = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedArea) return
    const form = new FormData(event.currentTarget)
    const teamId = String(form.get('teamId') ?? '')
    const funcoes = serviceFunctions
    setServiceError('')
    setIsSavingService(true)
    void addServiceAreaMember(accessToken, selectedArea.id, { personId: person.id, role: 'MEMBER', teamId, ...(funcoes.length ? { funcoes } : {}) })
      .then((membership) => {
        onPersonChange({ ...person, serviceMemberships: [...activeMemberships, membership] })
        setSelectedAreaId('')
        setServiceFunctions([])
        onNotice(`${person.nome} foi vinculado(a) à Área de Serviço ${membership.serviceArea.nome}.`)
      })
      .catch((reason) => setServiceError(reason instanceof Error ? reason.message : 'Não foi possível vincular a pessoa à Área de Serviço.'))
      .finally(() => setIsSavingService(false))
  }

  const openMembershipEditor = (membership: NonNullable<PersonListItem['serviceMemberships']>[number]) => {
    setEditingMembership(membership)
    setEditingAreaId(membership.serviceArea.id)
    setEditingTeamId(membership.team?.id ?? '')
    setEditingFunctions(membership.funcoes)
    setServiceError('')
  }

  const saveMembershipEditor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingMembership || !editingArea || !editingTeamId) return
    setServiceError('')
    setIsSavingService(true)
    const samePlacement = editingMembership.serviceArea.id === editingArea.id && editingMembership.team?.id === editingTeamId
    const request = samePlacement
      ? updateServiceMembershipFunctions(accessToken, editingMembership.id, editingFunctions)
      : transferServiceAreaMembership(accessToken, editingMembership.id, { serviceAreaId: editingArea.id, teamId: editingTeamId, funcoes: editingFunctions })
    void request
      .then((membership) => {
        onPersonChange({ ...person, serviceMemberships: activeMemberships.map((item) => item.id === editingMembership.id ? membership : item) })
        setEditingMembership(null)
        setEditingAreaId('')
        setEditingArea(null)
        onNotice(`${person.nome} teve o vínculo de serviço atualizado.`)
      })
      .catch((reason) => setServiceError(reason instanceof Error ? reason.message : 'Não foi possível atualizar o vínculo de serviço.'))
      .finally(() => setIsSavingService(false))
  }

  const removeMembership = (membership: NonNullable<PersonListItem['serviceMemberships']>[number]) => {
    if (!window.confirm(`Remover ${person.nome} da Área de Serviço ${membership.serviceArea.nome}? O histórico será preservado.`)) return
    setServiceError('')
    setIsSavingService(true)
    void endServiceAreaMembership(accessToken, membership.id)
      .then(() => {
        onPersonChange({ ...person, serviceMemberships: activeMemberships.filter((item) => item.id !== membership.id) })
        onNotice(`${person.nome} foi removido(a) da Área de Serviço ${membership.serviceArea.nome}.`)
      })
      .catch((reason) => setServiceError(reason instanceof Error ? reason.message : 'Não foi possível remover o vínculo de serviço.'))
      .finally(() => setIsSavingService(false))
  }

  return <section className="person-registration-panel">
    <div><p className="eyebrow">Complementar cadastro</p><h3>Acesso e serviço</h3><p className="dialog-description">Defina se esta pessoa receberá login e em qual equipe ela serve.</p></div>
    <section className="person-registration-section">
      <h4>Acesso ao sistema</h4>
      {canManageAccess ? isLoadingAccess ? <p className="record-detail-note">Consultando acesso...</p> : access ? <p className="record-detail-note">Login {access.ativo ? 'ativo' : 'inativo'}: <strong>{displayLogin(access.loginEmail)}</strong></p> : <form className="event-form person-registration-form" onSubmit={createAccess}>
        <label className="checkbox-label checkbox-label--form"><input type="checkbox" checked={grantLogin} onChange={(event) => setGrantLogin(event.target.checked)} /> Esta pessoa receberá login no IBAG One.</label>
        {grantLogin && <><label>Senha inicial<span className="password-field"><input name="initialPassword" type={showInitialPassword ? 'text' : 'password'} minLength={6} required autoComplete="new-password" placeholder="Mínimo de 6 caracteres" /><button className="password-visibility-toggle" type="button" onClick={() => setShowInitialPassword((visible) => !visible)} aria-label={showInitialPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showInitialPassword ? 'Ocultar' : 'Mostrar'}</button></span></label><small className="field-help">O usuário será gerado automaticamente a partir do nome e poderá ser informado sem o domínio institucional.</small></>}
        {accessError && <p className="form-error" role="alert">{accessError}</p>}
        <button className="secondary-button" type="submit" disabled={!grantLogin || isSavingAccess}>{isSavingAccess ? 'Criando acesso...' : 'Criar acesso'}</button>
      </form> : <p className="record-detail-note">Somente administração ou super administração pode liberar login.</p>}
    </section>
    <section className="person-registration-section">
      <h4>Títulos ministeriais</h4>
      <p className="dialog-description">Os títulos identificam a atuação ministerial da pessoa e não concedem permissões de acesso automaticamente.</p>
      {ministerialTitles.length ? <ul className="person-ministerial-title-list">{ministerialTitles.map((title) => <li key={title}><span>{title}</span>{canManageServiceAreas && <button className="schedule-action" type="button" disabled={isSavingMinisterialTitles} onClick={() => saveMinisterialTitles(ministerialTitles.filter((item) => item !== title))} aria-label={`Remover título ${title}`}>Remover</button>}</li>)}</ul> : <p className="record-detail-note">Nenhum título ministerial informado.</p>}
      {canManageServiceAreas && <form className="event-form person-registration-form person-ministerial-title-form" onSubmit={addMinisterialTitle}>
        <label>Adicionar título ministerial<input list="ministerial-title-suggestions" value={ministerialTitleDraft} onChange={(event) => setMinisterialTitleDraft(event.target.value)} maxLength={80} disabled={isSavingMinisterialTitles} placeholder="Ex.: Pastor de Adoração" /></label>
        <datalist id="ministerial-title-suggestions">{ministerialTitleSuggestions.map((title) => <option value={title} key={title} />)}</datalist>
        {ministerialTitlesError && <p className="form-error" role="alert">{ministerialTitlesError}</p>}
        <button className="secondary-button" type="submit" disabled={isSavingMinisterialTitles}>{isSavingMinisterialTitles ? 'Salvando...' : 'Adicionar título'}</button>
      </form>}
    </section>
    <section className="person-registration-section">
      <h4>Áreas de Serviço</h4>
      {activeMemberships.length ? <ul className="person-service-list">{activeMemberships.map((membership) => <li key={membership.id}><div><strong>{membership.serviceArea.nome}</strong><span>{membership.team?.nome ?? 'Sem equipe'}{membership.funcoes.length ? ` · ${membership.funcoes.join(', ')}` : ''}</span></div>{canManageServiceAreas && <div className="person-service-actions">{membership.team && ['MEMBER', 'TEAM_LEADER'].includes(membership.role) && <button className="schedule-action" type="button" disabled={isSavingService} onClick={() => openMembershipEditor(membership)}>Editar</button>}<button className="schedule-action" type="button" disabled={isSavingService} onClick={() => removeMembership(membership)}>Remover</button></div>}</li>)}</ul> : <p className="record-detail-note">Esta pessoa ainda não possui vínculo ativo em uma Área de Serviço.</p>}
      {canManageServiceAreas && <><label className="checkbox-label checkbox-label--form"><input type="checkbox" checked={assignService} onChange={(event) => setAssignService(event.target.checked)} /> Esta pessoa atua em uma Área de Serviço.</label>
      {assignService && <form className="event-form person-registration-form" onSubmit={addMembership}>
        <label>Área de Serviço<select value={selectedAreaId} onChange={(event) => { setSelectedAreaId(event.target.value); setServiceFunctions([]) }} required disabled={isLoadingAreas || isSavingService}><option value="" disabled>{isLoadingAreas ? 'Carregando áreas...' : 'Selecione a área'}</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.nome}</option>)}</select></label>
        {selectedAreaId && (isLoadingArea ? <p className="record-detail-note">Carregando equipes...</p> : selectedArea ? <><label>Equipe<select name="teamId" required defaultValue="" disabled={activeTeams.length === 0 || isSavingService}><option value="" disabled>{activeTeams.length ? 'Selecione a equipe' : 'Crie uma equipe ativa antes'}</option>{activeTeams.map((team) => <option key={team.id} value={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><ServiceFunctionsField key={selectedArea.id} areaName={selectedArea.nome} availableFunctions={selectedArea.funcoes} value={serviceFunctions} onChange={setServiceFunctions} disabled={isSavingService} inputName="functions" /></> : <p className="record-detail-note">Não foi possível carregar a Área de Serviço selecionada.</p>)}
        {serviceError && <p className="form-error" role="alert">{serviceError}</p>}
        <button className="secondary-button" type="submit" disabled={!selectedArea || isLoadingArea || isSavingService}>{isSavingService ? 'Vinculando...' : 'Vincular à Área de Serviço'}</button>
      </form>}</>}
    </section>
    {editingMembership && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setEditingMembership(null)}><section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="person-service-membership-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" aria-label="Fechar" onClick={() => setEditingMembership(null)}>×</button><p className="eyebrow">{person.nome}</p><h2 id="person-service-membership-title">Editar Área de Serviço</h2><p className="dialog-description">A alteração encerra o vínculo anterior e cria o novo, preservando o histórico da pessoa.</p><form className="event-form" onSubmit={saveMembershipEditor}><label>Área de Serviço<select value={editingAreaId} onChange={(event) => { setEditingAreaId(event.target.value); setEditingTeamId(''); setEditingFunctions([]) }} required disabled={isLoadingAreas || isSavingService}><option value="" disabled>Selecione a área</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.nome}</option>)}</select></label>{isLoadingEditingArea ? <p className="record-detail-note">Carregando equipes...</p> : editingArea ? <><label>Equipe<select value={editingTeamId} onChange={(event) => setEditingTeamId(event.target.value)} required disabled={isSavingService}><option value="" disabled>Selecione a equipe</option>{editingArea.teams.filter((team) => team.ativo).map((team) => <option key={team.id} value={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label><ServiceFunctionsField areaName={editingArea.nome} availableFunctions={editingArea.funcoes} value={editingFunctions} onChange={setEditingFunctions} disabled={isSavingService} /></> : <p className="record-detail-note">Selecione uma Área de Serviço ativa.</p>}{serviceError && <p className="form-error" role="alert">{serviceError}</p>}<div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setEditingMembership(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={!editingArea || !editingTeamId || isLoadingEditingArea || isSavingService}>{isSavingService ? 'Salvando...' : 'Salvar vínculo'}</button></div></form></section></div>}
  </section>
}
