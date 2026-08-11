import type { FormEvent } from 'react'
import type {
  CampusListItem,
  CellCampusCoordination,
  CellListItem,
  CellNetworkListItem,
  CellNetworkSupervision,
  PersonListItem,
} from './api/directory'

type CellHierarchyProps = {
  campuses: CampusListItem[]
  cells: CellListItem[]
  coordinations: CellCampusCoordination[]
  currentPersonId: string
  error: string
  isLoading: boolean
  isSaving: boolean
  networks: CellNetworkListItem[]
  people: PersonListItem[]
  supervisions: CellNetworkSupervision[]
  canManageNetworks: boolean
  onAssignCell: (networkId: string, cellId: string) => Promise<void>
  onCreateCoordination: (personId: string, campusId: string) => Promise<void>
  onCreateNetwork: (input: { nome: string; descricao?: string; campusId: string }) => Promise<void>
  onCreateSupervision: (personId: string, networkId: string) => Promise<void>
  onEndCoordination: (id: string, personName: string) => Promise<void>
  onEndSupervision: (id: string, personName: string) => Promise<void>
  onUnassignCell: (networkId: string, cellId: string, cellName: string) => Promise<void>
}

export function CellHierarchy({
  campuses,
  cells,
  coordinations,
  currentPersonId,
  error,
  isLoading,
  isSaving,
  networks,
  people,
  supervisions,
  canManageNetworks,
  onAssignCell,
  onCreateCoordination,
  onCreateNetwork,
  onCreateSupervision,
  onEndCoordination,
  onEndSupervision,
  onUnassignCell,
}: CellHierarchyProps) {
  const activeCoordinations = coordinations.filter((coordination) => coordination.ativo)
  const activeNetworks = networks.filter((network) => network.ativo)
  const canManageSupervision = canManageNetworks || activeCoordinations.some((coordination) => coordination.person.id === currentPersonId)
  const activePeople = people.filter((person) => person.ativo)

  const submitNetwork = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void onCreateNetwork({
      nome: String(form.get('networkName') ?? '').trim(),
      descricao: String(form.get('networkDescription') ?? '').trim() || undefined,
      campusId: String(form.get('networkCampusId') ?? ''),
    })
  }

  const submitCoordination = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void onCreateCoordination(String(form.get('coordinationPersonId') ?? ''), String(form.get('coordinationCampusId') ?? ''))
  }

  const submitSupervision = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void onCreateSupervision(String(form.get('supervisionPersonId') ?? ''), String(form.get('supervisionNetworkId') ?? ''))
  }

  return (
    <div className="records-page hierarchy-page">
      <section className="hierarchy-intro">
        <div>
          <p className="eyebrow">Estrutura de células</p>
          <h2>Uma cadeia de cuidado clara</h2>
          <p>Coordenação por campus, supervisão por rede e células vinculadas à sua rede.</p>
        </div>
        <span className="records-total">{activeNetworks.length} redes ativas</span>
      </section>

      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading && <p className="records-empty">Carregando a estrutura de células...</p>}

      {!isLoading && (
        <>
          {canManageNetworks && <section className="hierarchy-forms">
            <article className="hierarchy-form-card">
              <p className="eyebrow">Coordenação</p>
              <h3>Definir coordenador</h3>
              <form className="event-form" onSubmit={submitCoordination}>
                <label>Pessoa<select name="coordinationPersonId" defaultValue="" required disabled={isSaving || activePeople.length === 0}><option value="" disabled>Selecione uma pessoa</option>{activePeople.map((person) => <option value={person.id} key={person.id}>{person.nome}</option>)}</select></label>
                <label>Campus<select name="coordinationCampusId" defaultValue="" required disabled={isSaving || campuses.length === 0}><option value="" disabled>Selecione um campus</option>{campuses.map((campus) => <option value={campus.id} key={campus.id}>{campus.nome}</option>)}</select></label>
                <button className="secondary-button" type="submit" disabled={isSaving || activePeople.length === 0 || campuses.length === 0}>Atribuir coordenação</button>
              </form>
            </article>

            <article className="hierarchy-form-card">
              <p className="eyebrow">Rede</p>
              <h3>Criar nova rede</h3>
              <form className="event-form" onSubmit={submitNetwork}>
                <label>Nome da rede<input name="networkName" required placeholder="Ex.: Rede Esperança" disabled={isSaving} /></label>
                <label>Campus<select name="networkCampusId" defaultValue="" required disabled={isSaving || campuses.length === 0}><option value="" disabled>Selecione um campus</option>{campuses.map((campus) => <option value={campus.id} key={campus.id}>{campus.nome}</option>)}</select></label>
                <label>Descrição <span className="field-optional">(opcional)</span><input name="networkDescription" placeholder="Uma breve identificação" disabled={isSaving} /></label>
                <button className="secondary-button" type="submit" disabled={isSaving || campuses.length === 0}>Criar rede</button>
              </form>
            </article>
          </section>}

          {!canManageNetworks && <p className="record-detail-note">Você pode consultar as redes dentro do seu escopo. A criação de redes e coordenações é feita pela secretaria, administração ou pastores autorizados.</p>}

          <section className="hierarchy-section">
            <div className="hierarchy-section-heading"><div><p className="eyebrow">Coordenadores ativos</p><h3>Coordenação por campus</h3></div><span>{activeCoordinations.length}</span></div>
            {activeCoordinations.length ? <div className="hierarchy-assignment-list">{activeCoordinations.map((coordination) => <article className="hierarchy-assignment" key={coordination.id}><span className="cell-person-symbol">{initials(coordination.person.nome)}</span><div><strong>{coordination.person.nome}</strong><small>Coordena as células do {coordination.campus.nome}</small></div>{canManageNetworks && <button type="button" onClick={() => void onEndCoordination(coordination.id, coordination.person.nome)} disabled={isSaving}>Encerrar</button>}</article>)}</div> : <p className="records-empty">Ainda não há coordenadores ativos.</p>}
          </section>

          {canManageSupervision && activeNetworks.some((network) => !supervisions.some((supervision) => supervision.ativo && supervision.network.id === network.id)) && <section className="hierarchy-supervision-form">
            <div><p className="eyebrow">Supervisão</p><h3>Definir supervisor de rede</h3><p>Cada rede pode possuir apenas um supervisor ativo.</p></div>
            <form className="event-form" onSubmit={submitSupervision}>
              <label>Pessoa<select name="supervisionPersonId" defaultValue="" required disabled={isSaving || activePeople.length === 0}><option value="" disabled>Selecione uma pessoa</option>{activePeople.map((person) => <option value={person.id} key={person.id}>{person.nome}</option>)}</select></label>
              <label>Rede<select name="supervisionNetworkId" defaultValue="" required disabled={isSaving || activeNetworks.length === 0}><option value="" disabled>Selecione uma rede sem supervisor</option>{activeNetworks.filter((network) => !supervisions.some((supervision) => supervision.ativo && supervision.network.id === network.id)).map((network) => <option value={network.id} key={network.id}>{network.nome} · {network.campus.nome}</option>)}</select></label>
              <button className="secondary-button" type="submit" disabled={isSaving || activePeople.length === 0 || activeNetworks.length === 0}>Atribuir supervisor</button>
            </form>
          </section>}

          <section className="network-card-grid">
            {networks.map((network) => {
              const supervisor = supervisions.find((item) => item.ativo && item.network.id === network.id)
              const availableCells = cells.filter((cell) => cell.campus.id === network.campus.id && !cell.network)
              return <article className={`network-card ${network.ativo ? '' : 'network-card--inactive'}`} key={network.id}>
                <div className="network-card-heading"><span className="network-symbol">◇</span><div><p className="eyebrow">{network.campus.nome}</p><h3>{network.nome}</h3></div><span className={network.ativo ? 'record-status record-status--active' : 'record-status'}>{network.ativo ? 'Ativa' : 'Inativa'}</span></div>
                {network.descricao && <p className="network-description">{network.descricao}</p>}
                <div className="network-card-detail"><span>Supervisor</span><strong>{supervisor?.person.nome ?? 'Não definido'}</strong>{supervisor && canManageSupervision && <button type="button" onClick={() => void onEndSupervision(supervisor.id, supervisor.person.nome)} disabled={isSaving}>Encerrar supervisão</button>}</div>
                <div className="network-card-detail"><span>Células vinculadas</span><strong>{network._count.cells}</strong></div>
                {network.cells.length > 0 && <div className="network-cell-list">{network.cells.map((cell) => <span key={cell.id}>{cell.nome}{canManageNetworks && <button type="button" aria-label={`Remover ${cell.nome} da rede`} onClick={() => void onUnassignCell(network.id, cell.id, cell.nome)} disabled={isSaving}>×</button>}</span>)}</div>}
                {canManageNetworks && network.ativo && <form className="network-link-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void onAssignCell(network.id, String(form.get('cellId') ?? '')) }}><select name="cellId" defaultValue="" required disabled={isSaving || availableCells.length === 0}><option value="" disabled>{availableCells.length ? 'Vincular célula sem rede' : 'Não há células sem rede neste campus'}</option>{availableCells.map((cell) => <option value={cell.id} key={cell.id}>{cell.nome}</option>)}</select><button type="submit" disabled={isSaving || availableCells.length === 0}>Vincular</button></form>}
              </article>
            })}
            {!networks.length && <p className="records-empty">Ainda não há redes cadastradas no seu escopo.</p>}
          </section>
        </>
      )}
    </div>
  )
}

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'IB'
}
