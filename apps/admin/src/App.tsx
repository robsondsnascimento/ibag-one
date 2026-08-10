import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { login, validateSession } from './api/auth'
import type { AuthSession } from './api/auth'
import { clearSession, readSession, saveSession } from './auth/session'
import './App.css'

type Page =
  | 'dashboard'
  | 'agenda'
  | 'cells'
  | 'people'
  | 'teams'
  | 'kids'
  | 'worship'
  | 'reports'

type Theme = 'light' | 'night'

type NavigationItem = {
  page: Page
  label: string
  icon: string
}

const navigation: NavigationItem[] = [
  { page: 'dashboard', label: 'Visão geral', icon: '◈' },
  { page: 'agenda', label: 'Agenda', icon: '▦' },
  { page: 'cells', label: 'Células', icon: '◎' },
  { page: 'people', label: 'Pessoas', icon: '◉' },
  { page: 'teams', label: 'Áreas e equipes', icon: '◇' },
  { page: 'kids', label: 'IBAG Kids', icon: '☆' },
  { page: 'worship', label: 'Cultos', icon: '♬' },
  { page: 'reports', label: 'Relatórios', icon: '▤' },
]

const weekEvents = [
  {
    day: 'SEG',
    date: '11',
    time: '19:30',
    title: 'Reunião de líderes de célula',
    place: 'Campus Centro · Sala de reunião',
    tag: 'Liderança',
    tone: 'blue',
  },
  {
    day: 'QUA',
    date: '13',
    time: '19:30',
    title: 'Culto de celebração',
    place: 'Campus Centro · Auditório',
    tag: 'Culto',
    tone: 'orange',
  },
  {
    day: 'SÁB',
    date: '16',
    time: '09:00',
    title: 'Treinamento de voluntários',
    place: 'Campus Norte · Espaço multiuso',
    tag: 'Formação',
    tone: 'green',
  },
]

const chartData = [
  { label: 'Dom', value: 96 },
  { label: 'Seg', value: 56 },
  { label: 'Ter', value: 42 },
  { label: 'Qua', value: 84 },
  { label: 'Qui', value: 68 },
  { label: 'Sex', value: 38 },
  { label: 'Sáb', value: 72 },
  ]

const pageCopy: Record<Exclude<Page, 'dashboard' | 'agenda'>, { eyebrow: string; title: string; description: string }> = {
  cells: {
    eyebrow: 'Células',
    title: 'Cuidado que começa perto',
    description: 'Aqui estarão as células, redes, lideranças, registros de encontro e a visão geográfica do cuidado pastoral.',
  },
  people: {
    eyebrow: 'Pessoas',
    title: 'Uma jornada para cada pessoa',
    description: 'Cadastro, famílias, visitantes, acompanhamento pastoral e a evolução de cada pessoa ficam reunidos neste espaço.',
  },
  teams: {
    eyebrow: 'Áreas e equipes',
    title: 'Servir com clareza e propósito',
    description: 'As áreas de serviço, equipes, lideranças, voluntários e escalas serão organizados aqui.',
  },
  kids: {
    eyebrow: 'IBAG Kids',
    title: 'Somos a igreja do hoje.',
    description: 'Turmas, responsáveis, check-in, check-out, QR de retirada, recursos e escalas do Kids aparecerão nesta área.',
  },
  worship: {
    eyebrow: 'Cultos',
    title: 'Tudo pronto para o culto',
    description: 'Ordem de culto, repertório, materiais, alertas e PDF serão conduzidos por um fluxo simples e colaborativo.',
  },
  reports: {
    eyebrow: 'Relatórios',
    title: 'Decisões orientadas por cuidado',
    description: 'Indicadores de células, pessoas, voluntariado e acompanhamento pastoral poderão ser acompanhados aqui.',
  },
}

const roleLabels: Record<string, string> = {
  MEMBER: 'Membro',
  SECRETARY: 'Secretário(a)',
  WORSHIP_ORDER_MANAGER: 'Responsável por ordem de culto',
  ADMIN: 'Administrador(a)',
  SUPER_ADMIN: 'Super administrador',
  PASTOR: 'Pastor(a)',
  PASTOR_SENIOR: 'Pastor(a) sênior',
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'você'
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

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [theme, setTheme] = useState<Theme>('light')
  const [session, setSession] = useState<AuthSession | null>(() => readSession())
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(session))
  const [authError, setAuthError] = useState('')
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!session) {
      setIsCheckingSession(false)
      return
    }

    let active = true
    setIsCheckingSession(true)

    void validateSession(session.access_token)
      .then(() => {
        if (active) setIsCheckingSession(false)
      })
      .catch(() => {
        if (!active) return
        clearSession()
        setSession(null)
        setAuthError('Sua sessão expirou. Entre novamente para continuar.')
        setIsCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [session])

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const keepSignedIn = formData.get('keepSignedIn') === 'on'

    setAuthError('')
    setIsSubmittingLogin(true)

    try {
      const nextSession = await login({ username, password })
      saveSession(nextSession, keepSignedIn)
      setIsCheckingSession(true)
      setSession(nextSession)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Não foi possível entrar agora. Tente novamente.')
    } finally {
      setIsSubmittingLogin(false)
    }
  }

  const signOut = () => {
    clearSession()
    setSession(null)
    setActivePage('dashboard')
    setNotice('')
    setAuthError('')
  }

  const openEventForm = () => {
    setNotice('')
    setIsCreateEventOpen(true)
  }

  const saveDemoEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreateEventOpen(false)
    setNotice('Evento salvo como solicitação. Ele seguirá para aprovação na agenda.')
  }

  if (!session) {
    return (
      <main className={`login-page theme-${theme}`}>
        <section className="login-intro">
          <div className="brand brand--light">
            <span className="brand-mark">i</span>
            <span>ibag<span>one</span></span>
          </div>
          <div className="login-copy">
            <p className="eyebrow eyebrow--light">Igreja Batista Amor & Graça</p>
            <h1>Uma lugar de novas vidas.</h1>
            <p>Uma familia pra pertencer.</p>
          </div>
          <div className="login-orbit login-orbit--one" />
          <div className="login-orbit login-orbit--two" />
        </section>

        <section className="login-form-panel">
          <form className="login-form" onSubmit={submitLogin}>
            <div className="login-heading">
              <p className="eyebrow">Boas-vindas</p>
              <h2>Entre na sua conta</h2>
              <p>Use seu acesso institucional para continuar.</p>
            </div>
            <label>
              Usuário
              <input name="username" type="text" placeholder="superadmin" autoComplete="username" required />
            </label>
            <label>
              Senha
              <input name="password" type="password" placeholder="Sua senha" autoComplete="current-password" required />
            </label>
            <div className="login-options">
              <label className="checkbox-label"><input name="keepSignedIn" type="checkbox" /> Manter conectado</label>
              <button type="button" className="text-button" disabled title="A recuperação de senha será disponibilizada em breve">Esqueci minha senha</button>
            </div>
            {authError && <p className="login-error" role="alert">{authError}</p>}
            <button className="primary-button primary-button--wide" type="submit" disabled={isSubmittingLogin}>
              {isSubmittingLogin ? 'Validando acesso...' : <>Entrar no IBAG One <span>→</span></>}
            </button>
            <p className="form-footnote">Use apenas seu usuário. O domínio institucional é completado automaticamente.</p>
          </form>
        </section>
      </main>
    )
  }

  if (isCheckingSession) {
    return (
      <main className={`session-loading theme-${theme}`}>
        <div>
          <span className="brand-mark">i</span>
          <p>Validando seu acesso...</p>
        </div>
      </main>
    )
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">i</span>
            <span>ibag<span>one</span></span>
          </div>
          <button className="organization-switcher" type="button">
            <span className="organization-avatar">{initials(session.user.organization.nome).slice(0, 1)}</span>
            <span><strong>{session.user.organization.nome}</strong><small>{session.user.person.campus?.nome ?? 'Campus não informado'}</small></span>
            <span className="chevron">⌄</span>
          </button>
        </div>

        <nav className="main-navigation" aria-label="Navegação principal">
          <p className="navigation-label">Organização</p>
          {navigation.map((item) => (
            <button
              className={`navigation-item ${activePage === item.page ? 'navigation-item--active' : ''}`}
              type="button"
              key={item.page}
              onClick={() => setActivePage(item.page)}
              aria-current={activePage === item.page ? 'page' : undefined}
            >
              <span className="navigation-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.page === 'agenda' && <span className="navigation-badge">3</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="theme-selector">
            <p className="navigation-label">Aparência</p>
            <div className="theme-selector-actions">
              <button className={`theme-button theme-button--light ${theme === 'light' ? 'theme-button--active' : ''}`} type="button" onClick={() => setTheme('light')} aria-pressed={theme === 'light'}>
                <span className="theme-swatch" aria-hidden="true" />
                Claro
              </button>
              <button className={`theme-button theme-button--night ${theme === 'night' ? 'theme-button--active' : ''}`} type="button" onClick={() => setTheme('night')} aria-pressed={theme === 'night'}>
                <span className="theme-swatch" aria-hidden="true" />
                Noturno
              </button>
            </div>
          </div>
          <button className="support-card" type="button">
            <span className="support-icon">?</span>
            <span><strong>Precisa de ajuda?</strong><small>Central de suporte</small></span>
          </button>
          <button className="profile-card" type="button" onClick={signOut} aria-label={`Sair da conta de ${session.user.person.nome}`}>
            <span className="profile-avatar">{initials(session.user.person.nome)}</span>
            <span><strong>{session.user.person.nome}</strong><small>{roleLabels[session.user.role] ?? session.user.role}</small></span>
            <span className="profile-more">Sair</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{activePage === 'dashboard' ? 'Segunda-feira, 11 de agosto' : activePage === 'agenda' ? 'Agenda institucional' : pageCopy[activePage].eyebrow}</p>
            <h1>{activePage === 'dashboard' ? `Bom dia, ${firstName(session.user.person.nome)}.` : activePage === 'agenda' ? `Tudo que acontece na ${session.user.organization.nome}` : pageCopy[activePage].title}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Buscar">⌕</button>
            <button className="icon-button icon-button--notification" type="button" aria-label="Notificações">♧<span /></button>
            <button className="primary-button" type="button" onClick={openEventForm}>+ Novo evento</button>
          </div>
        </header>

        {notice && <div className="notice" role="status"><span>✓</span>{notice}<button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}

        {activePage === 'dashboard' && <Dashboard onOpenAgenda={() => setActivePage('agenda')} onCreateEvent={openEventForm} />}
        {activePage === 'agenda' && <Agenda onCreateEvent={openEventForm} />}
        {activePage !== 'dashboard' && activePage !== 'agenda' && <ModulePreview copy={pageCopy[activePage]} />}
      </main>

      {isCreateEventOpen && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setIsCreateEventOpen(false)}>
          <section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={() => setIsCreateEventOpen(false)} aria-label="Fechar">×</button>
            <p className="eyebrow">Agenda institucional</p>
            <h2 id="event-dialog-title">Novo evento</h2>
            <p className="dialog-description">A solicitação será enviada para a agenda e seguirá o fluxo de aprovação definido para sua função.</p>
            <form className="event-form" onSubmit={saveDemoEvent}>
              <label>Nome do evento<input required placeholder="Ex.: Encontro de líderes" /></label>
              <div className="form-grid">
                <label>Data<input type="date" required /></label>
                <label>Horário<input type="time" required /></label>
              </div>
              <label>Local ou célula<select defaultValue=""><option value="" disabled>Selecione uma opção</option><option>Campus Centro</option><option>Célula Vida</option><option>Campus Norte</option></select></label>
              <div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setIsCreateEventOpen(false)}>Cancelar</button><button className="primary-button" type="submit">Salvar solicitação</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

function Dashboard({ onOpenAgenda, onCreateEvent }: { onOpenAgenda: () => void; onCreateEvent: () => void }) {
  return (
    <div className="dashboard-layout">
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-chip"><span>✦</span> Semana em movimento</span>
          <h2>Cuidar bem é perceber<br />o que está acontecendo.</h2>
          <p>Veja o panorama da igreja, acompanhe as prioridades e mantenha cada equipe conectada.</p>
          <button className="light-button" type="button" onClick={onOpenAgenda}>Ver agenda da semana <span>→</span></button>
        </div>
        <div className="welcome-art" aria-hidden="true"><div className="art-circle art-circle--one" /><div className="art-circle art-circle--two" /><div className="art-card"><span>11</span><small>AGO</small><strong>Uma semana<br />para cuidar</strong></div></div>
      </section>

      <section className="stats-grid" aria-label="Resumo da igreja">
        <article className="stat-card"><div className="stat-icon stat-icon--blue">◎</div><div><p>Células ativas</p><strong>48</strong><span className="stat-up">↑ 4 este mês</span></div></article>
        <article className="stat-card"><div className="stat-icon stat-icon--orange">◉</div><div><p>Pessoas acompanhadas</p><strong>1.284</strong><span className="stat-up">↑ 32 este mês</span></div></article>
        <article className="stat-card"><div className="stat-icon stat-icon--green">◇</div><div><p>Servindo em equipes</p><strong>376</strong><span className="stat-up">↑ 18 este mês</span></div></article>
        <article className="stat-card stat-card--attention"><div className="stat-icon stat-icon--red">!</div><div><p>Pendências para hoje</p><strong>07</strong><button type="button" onClick={onCreateEvent}>Ver prioridades →</button></div></article>
      </section>

      <section className="content-grid">
        <article className="panel panel--chart">
          <div className="panel-heading"><div><p className="eyebrow">Presença nas células</p><h2>Movimento da semana</h2></div><button className="date-button" type="button">Esta semana <span>⌄</span></button></div>
          <div className="chart-summary"><strong>86<span>%</span></strong><span className="stat-up">↑ 6,4% <small>comparado à semana anterior</small></span></div>
          <div className="bar-chart" aria-label="Gráfico de presença por dia">{chartData.map((bar) => <div className="bar-column" key={bar.label}><div className={`bar ${bar.value > 80 ? 'bar--active' : ''}`} style={{ height: `${bar.value}%` }}><span>{bar.value}%</span></div><small>{bar.label}</small></div>)}</div>
        </article>

        <article className="panel panel--insights">
          <div className="panel-heading"><div><p className="eyebrow">Atenção pastoral</p><h2>Para olhar com carinho</h2></div><button className="more-button" type="button">•••</button></div>
          <div className="insight-list">
            <button type="button" className="insight-row"><span className="insight-dot insight-dot--red" /><span><strong>6 visitantes participaram de 3 encontros</strong><small>Podem ser convidados a se tornarem membros de célula.</small></span><b>→</b></button>
            <button type="button" className="insight-row"><span className="insight-dot insight-dot--orange" /><span><strong>3 células ainda não fecharam o registro</strong><small>O estudo da nova semana depende desse preenchimento.</small></span><b>→</b></button>
            <button type="button" className="insight-row"><span className="insight-dot insight-dot--blue" /><span><strong>12 pessoas estão em acompanhamento</strong><small>Há retornos pastorais previstos para esta semana.</small></span><b>→</b></button>
          </div>
        </article>
      </section>

      <section className="panel panel--agenda">
        <div className="panel-heading"><div><p className="eyebrow">Agenda compartilhada</p><h2>Próximos acontecimentos</h2></div><button className="text-button" type="button" onClick={onOpenAgenda}>Ver agenda completa →</button></div>
        <div className="event-list">{weekEvents.map((event) => <article className="event-row" key={event.title}><div className="event-date"><strong>{event.date}</strong><small>{event.day}</small></div><div className={`event-tone event-tone--${event.tone}`} /><div className="event-information"><div><p>{event.time}</p><h3>{event.title}</h3></div><span>{event.place}</span></div><span className={`event-tag event-tag--${event.tone}`}>{event.tag}</span><button className="row-more" type="button" aria-label={`Mais opções para ${event.title}`}>•••</button></article>)}</div>
      </section>
    </div>
  )
}

function Agenda({ onCreateEvent }: { onCreateEvent: () => void }) {
  return (
    <div className="agenda-page">
      <section className="agenda-toolbar"><div className="agenda-navigation"><button type="button" aria-label="Semana anterior">←</button><strong>11 — 17 de agosto</strong><button type="button" aria-label="Próxima semana">→</button></div><div><button type="button" className="secondary-button">Hoje</button><button type="button" className="primary-button" onClick={onCreateEvent}>+ Novo evento</button></div></section>
      <section className="agenda-board"><div className="agenda-weekdays"><span>SEG <b>11</b></span><span>TER <b>12</b></span><span>QUA <b>13</b></span><span>QUI <b>14</b></span><span>SEX <b>15</b></span><span>SÁB <b>16</b></span><span>DOM <b>17</b></span></div><div className="agenda-grid"><div className="time-column"><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span></div><div className="agenda-events"><article className="calendar-event calendar-event--blue"><small>19:30 — 21:00</small><strong>Reunião de líderes</strong><span>Campus Centro</span></article><article className="calendar-event calendar-event--orange"><small>19:30 — 21:30</small><strong>Culto de celebração</strong><span>Auditório principal</span></article><article className="calendar-event calendar-event--green"><small>09:00 — 11:30</small><strong>Treinamento</strong><span>Campus Norte</span></article><article className="calendar-event calendar-event--purple"><small>18:00 — 20:00</small><strong>Encontro de célula</strong><span>Célula Vida</span></article></div></div></section>
      <section className="agenda-note"><span>◈</span><p><strong>Calendário institucional compartilhado.</strong> Eventos aprovados são sincronizados automaticamente com o Google Calendar quando a integração estiver ativa.</p></section>
    </div>
  )
}

function ModulePreview({ copy }: { copy: { eyebrow: string; title: string; description: string } }) {
  return <section className="module-preview"><div className="module-preview-icon">✦</div><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p>{copy.description}</p><button className="primary-button" type="button">Começar configuração <span>→</span></button></section>
}

export default App
