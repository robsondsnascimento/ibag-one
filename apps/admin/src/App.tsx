import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CellHierarchy } from './CellHierarchy'
import { login, validateSession } from './api/auth'
import type { AuthSession } from './api/auth'
import { addAgendaEventChecklist, approveAgendaEvent, cancelAgendaEvent, createAgendaEvent, listEventSpaces, loadAgenda, loadDashboard, toggleAgendaEventChecklist, updateAgendaEvent } from './api/dashboard'
import type { AgendaEvent, CreateAgendaEventInput, DashboardSummary, EventSpace } from './api/dashboard'
import { closeCellMeeting, convertCellMeetingVisitorToMember, createCell, createCellLeadership, createCellMeetingVisitor, createCellMembership, createCellSupportRole, createPerson, endCellLeadership, endCellMembership, endCellSupportRole, getCellMeetingRoster, getCellOverview, getPerson, listCampuses, listCellMeetingVisitors, listCells, listPeople, saveCellMeetingRoster, updateCell, updatePerson } from './api/directory'
import type { CampusListItem, CellListItem, CellMeetingRosterItem, CellMeetingVisitor, CellOverview, CellPersonReference, Paginated, PersonListItem } from './api/directory'
import { assignCellToNetwork, createCellCampusCoordination, createCellNetwork, createCellNetworkSupervision, endCellCampusCoordination, endCellNetworkSupervision, listCellCampusCoordinations, listCellNetworks, listCellNetworkSupervisions, unassignCellFromNetwork } from './api/directory'
import type { CellCampusCoordination, CellNetworkListItem, CellNetworkSupervision } from './api/directory'
import { downloadCurrentCellStudy, getCurrentCellStudy, getStudyForWeek, publishCellStudy } from './api/cell-studies'
import type { CellStudy } from './api/cell-studies'
import { addServiceAreaMember, approveServiceAreaApplication, completeServiceAreaApplicationStage, createServiceAreaApplication, createServiceAreaEntryStage, createServiceTeam, getServiceArea, listServiceAreaApplications, listServiceAreaEntryStages, listServiceAreas, rejectServiceAreaApplication, reorderServiceAreaEntryStages, startServiceAreaApplication, updateServiceAreaEntryStage, withdrawServiceAreaApplication } from './api/service-areas'
import type { ServiceAreaApplication, ServiceAreaDetail, ServiceAreaEntryStage, ServiceAreaListItem, ServiceMembershipRole } from './api/service-areas'
import { ServiceAreaWorkspace } from './ServiceAreaWorkspace'
import { ServiceFunctionsField } from './ServiceFunctionsField'
import { ServiceAreaOnboardingDialog } from './ServiceAreaOnboardingDialog'
import { MySchedulesPage } from './MySchedulesPage'
import { EventDetailsDialog } from './EventDetailsDialog'
import { EventFormDialog } from './EventFormDialog'
import { WorshipPage } from './WorshipPage'
import { NotificationDialog } from './NotificationDialog'
import { PersonRegistrationPanel } from './PersonRegistrationPanel'
import { listMyNotifications } from './api/notifications'
import { ApiError } from './api/client'
import { clearSession, readSession, saveSession } from './auth/session'
import './App.css'
import './CellStudies.css'
import './CellHierarchy.css'
import './CellHierarchyCells.css'
import './CellLeadershipAutocomplete.css'
import './CellNavigation.css'
import './ServiceAreaWorkspace.css'
import './ServiceAreaOnboardingDialog.css'
import './ServiceSchedulePages.css'
import './WorshipPage.css'
import './Sidebar.css'

type Page =
  | 'dashboard'
  | 'agenda'
  | 'cells'
  | 'cell-structure'
  | 'studies'
  | 'people'
  | 'teams'
  | 'my-schedules'
  | 'kids'
  | 'worship'
  | 'reports'

type Theme = 'light' | 'night'

type SelectedRecord =
  | { kind: 'cell'; id: string }
  | { kind: 'person'; id: string }

type RecordDetail =
  | { kind: 'cell'; data: CellListItem }
  | { kind: 'person'; data: PersonListItem }

type NavigationItem = {
  page: Page
  label: string
  icon: string
}

const mainNavigation: NavigationItem[] = [
  { page: 'dashboard', label: 'Visão geral', icon: '◈' },
  { page: 'agenda', label: 'Agenda', icon: '▦' },
  { page: 'worship', label: 'Ordem de Culto', icon: '♬' },
  { page: 'kids', label: 'IBAG Kids', icon: '☆' },
]

const cellNavigation: NavigationItem[] = [
  { page: 'cells', label: 'Cadastro de células', icon: '◉' },
  { page: 'cell-structure', label: 'Estrutura', icon: '◇' },
  { page: 'studies', label: 'Estudos semanais', icon: '◆' },
]

const moduleNavigation: NavigationItem[] = [
  { page: 'people', label: 'Pessoas', icon: '◉' },
  { page: 'my-schedules', label: 'Minhas escalas', icon: '◷' },
  { page: 'reports', label: 'Relatórios', icon: '▤' },
]

const pageCopy: Record<Exclude<Page, 'dashboard' | 'agenda'>, { eyebrow: string; title: string; description: string }> = {
  'cell-structure': {
    eyebrow: 'Estrutura de células',
    title: 'Cuidado conectado em todos os níveis',
    description: 'Coordenações, supervisões e redes organizam o acompanhamento das células.',
  },
  studies: {
    eyebrow: 'Estudos de célula',
    title: 'Um estudo para toda a igreja',
    description: 'A secretaria publica o estudo semanal para todas as células da organização.',
  },
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
    eyebrow: 'Áreas de Serviço',
    title: 'Servir com clareza e propósito',
    description: 'As áreas de serviço, equipes, lideranças, voluntários e escalas serão organizados aqui.',
  },
  'my-schedules': {
    eyebrow: 'Minha agenda de serviço',
    title: 'Minhas escalas',
    description: 'Veja seus serviços e confirme sua disponibilidade.',
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

function currentDateLabel() {
  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function startOfWeek(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1))
  return start
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function toDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [theme, setTheme] = useState<Theme>('light')
  const [session, setSession] = useState<AuthSession | null>(() => readSession())
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(session))
  const [authError, setAuthError] = useState('')
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [dashboardError, setDashboardError] = useState('')
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [dashboardVersion, setDashboardVersion] = useState(0)
  const [agendaWeekStart, setAgendaWeekStart] = useState(() => startOfWeek(new Date()))
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([])
  const [agendaError, setAgendaError] = useState('')
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(false)
  const [agendaVersion, setAgendaVersion] = useState(0)
  const [selectedAgendaEvent, setSelectedAgendaEvent] = useState<AgendaEvent | null>(null)
  const [eventFormDraft, setEventFormDraft] = useState<AgendaEvent | null>(null)
  const [eventFormCampusId, setEventFormCampusId] = useState('')
  const [eventFormCells, setEventFormCells] = useState<CellListItem[]>([])
  const [eventFormAreas, setEventFormAreas] = useState<ServiceAreaListItem[]>([])
  const [eventFormSpaces, setEventFormSpaces] = useState<EventSpace[]>([])
  const [isLoadingEventReferences, setIsLoadingEventReferences] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const [notificationsVersion, setNotificationsVersion] = useState(0)
  const [campuses, setCampuses] = useState<CampusListItem[]>([])
  const [eventFormError, setEventFormError] = useState('')
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false)
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false)
  const [creationMode, setCreationMode] = useState<'cell' | 'person' | null>(null)
  const [directoryFormError, setDirectoryFormError] = useState('')
  const [isSubmittingDirectory, setIsSubmittingDirectory] = useState(false)
  const [cells, setCells] = useState<Paginated<CellListItem> | null>(null)
  const [people, setPeople] = useState<Paginated<PersonListItem> | null>(null)
  const [directoryError, setDirectoryError] = useState('')
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false)
  const [directoryVersion, setDirectoryVersion] = useState(0)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<SelectedRecord | null>(null)
  const [recordDetail, setRecordDetail] = useState<RecordDetail | null>(null)
  const [cellOverview, setCellOverview] = useState<CellOverview | null>(null)
  const [recordDetailError, setRecordDetailError] = useState('')
  const [isLoadingRecordDetail, setIsLoadingRecordDetail] = useState(false)
  const [isSavingRecord, setIsSavingRecord] = useState(false)
  const [membershipCell, setMembershipCell] = useState<{ id: string; nome: string } | null>(null)
  const [membershipCandidates, setMembershipCandidates] = useState<PersonListItem[]>([])
  const [membershipFormError, setMembershipFormError] = useState('')
  const [isLoadingMembershipCandidates, setIsLoadingMembershipCandidates] = useState(false)
  const [isSavingMembership, setIsSavingMembership] = useState(false)
  const [isTransferConfirmationNeeded, setIsTransferConfirmationNeeded] = useState(false)
  const [leadershipCell, setLeadershipCell] = useState<{ id: string; nome: string; members: CellPersonReference[] } | null>(null)
  const [leadershipPersonId, setLeadershipPersonId] = useState('')
  const [leadershipSearch, setLeadershipSearch] = useState('')
  const [leadershipFormError, setLeadershipFormError] = useState('')
  const [isSavingLeadership, setIsSavingLeadership] = useState(false)
  const [rosterMeeting, setRosterMeeting] = useState<{ id: string; title: string } | null>(null)
  const [roster, setRoster] = useState<CellMeetingRosterItem[]>([])
  const [rosterFormError, setRosterFormError] = useState('')
  const [isLoadingRoster, setIsLoadingRoster] = useState(false)
  const [isSavingRoster, setIsSavingRoster] = useState(false)
  const [visitorMeeting, setVisitorMeeting] = useState<{ id: string; title: string; cellId: string } | null>(null)
  const [meetingVisitors, setMeetingVisitors] = useState<CellMeetingVisitor[]>([])
  const [visitorFormError, setVisitorFormError] = useState('')
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false)
  const [isSavingVisitor, setIsSavingVisitor] = useState(false)
  const [isConvertingVisitor, setIsConvertingVisitor] = useState(false)
  const [hasVisitorsToRegister, setHasVisitorsToRegister] = useState(false)
  const [visitorSuggestion, setVisitorSuggestion] = useState<{ id: string; nome: string; visits: number } | null>(null)
  const [visitorTransfer, setVisitorTransfer] = useState<{ personId: string; personName: string; cellId: string } | null>(null)
  const [hierarchy, setHierarchy] = useState<{
    networks: CellNetworkListItem[]
    coordinations: CellCampusCoordination[]
    supervisions: CellNetworkSupervision[]
    campuses: CampusListItem[]
    people: PersonListItem[]
    cells: CellListItem[]
  } | null>(null)
  const [hierarchyError, setHierarchyError] = useState('')
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(false)
  const [isSavingHierarchy, setIsSavingHierarchy] = useState(false)
  const [hierarchyVersion, setHierarchyVersion] = useState(0)
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaListItem[]>([])
  const [isLoadingServiceAreas, setIsLoadingServiceAreas] = useState(false)
  const [serviceAreasVersion, setServiceAreasVersion] = useState(0)
  const [selectedServiceAreaId, setSelectedServiceAreaId] = useState<string | null>(null)
  const [serviceAreaDetail, setServiceAreaDetail] = useState<ServiceAreaDetail | null>(null)
  const [serviceAreaDetailError, setServiceAreaDetailError] = useState('')
  const [isLoadingServiceAreaDetail, setIsLoadingServiceAreaDetail] = useState(false)
  const [serviceAreaDetailVersion, setServiceAreaDetailVersion] = useState(0)
  const [serviceTeamArea, setServiceTeamArea] = useState<ServiceAreaDetail | null>(null)
  const [serviceMemberArea, setServiceMemberArea] = useState<ServiceAreaDetail | null>(null)
  const [serviceFormCampuses, setServiceFormCampuses] = useState<CampusListItem[]>([])
  const [serviceFormPeople, setServiceFormPeople] = useState<PersonListItem[]>([])
  const [serviceFormError, setServiceFormError] = useState('')
  const [isLoadingServiceForm, setIsLoadingServiceForm] = useState(false)
  const [isSavingServiceForm, setIsSavingServiceForm] = useState(false)
  const [serviceMemberPersonId, setServiceMemberPersonId] = useState('')
  const [serviceMemberPersonSearch, setServiceMemberPersonSearch] = useState('')
  const [serviceMembershipRole, setServiceMembershipRole] = useState<ServiceMembershipRole>('MEMBER')
  const [serviceMemberFunctions, setServiceMemberFunctions] = useState<string[]>([])
  const [serviceOnboardingArea, setServiceOnboardingArea] = useState<ServiceAreaDetail | null>(null)
  const [serviceOnboardingStages, setServiceOnboardingStages] = useState<ServiceAreaEntryStage[]>([])
  const [serviceOnboardingApplications, setServiceOnboardingApplications] = useState<ServiceAreaApplication[]>([])
  const [serviceOnboardingPeople, setServiceOnboardingPeople] = useState<PersonListItem[]>([])
  const [serviceOnboardingError, setServiceOnboardingError] = useState('')
  const [isLoadingServiceOnboarding, setIsLoadingServiceOnboarding] = useState(false)
  const [isSavingServiceOnboarding, setIsSavingServiceOnboarding] = useState(false)
  const [isCellsMenuExpanded, setIsCellsMenuExpanded] = useState(false)
  const [isServiceMenuExpanded, setIsServiceMenuExpanded] = useState(false)
  const [studyWeekStart, setStudyWeekStart] = useState(() => toDateInputValue(startOfWeek(new Date())))
  const [study, setStudy] = useState<CellStudy | null>(null)
  const [studyError, setStudyError] = useState('')
  const [isLoadingStudy, setIsLoadingStudy] = useState(false)
  const [isSubmittingStudy, setIsSubmittingStudy] = useState(false)
  const [notice, setNotice] = useState('')
  const assignedRoles = [session?.user.role, ...(session?.user.additionalRoles ?? [])]
  const canManageDirectory = ['SUPER_ADMIN', 'ADMIN', 'SECRETARY'].some((role) => assignedRoles.includes(role))
  const canManagePersonAccess = ['SUPER_ADMIN', 'ADMIN'].some((role) => assignedRoles.includes(role))
  const canManageStudies = ['SUPER_ADMIN', 'SECRETARY'].some((role) => assignedRoles.includes(role))
  const canManageNetworks = ['SUPER_ADMIN', 'ADMIN', 'SECRETARY', 'PASTOR', 'PASTOR_SENIOR'].some((role) => assignedRoles.includes(role))
  const canCentrallyManageServiceAreas = ['SUPER_ADMIN', 'ADMIN', 'SECRETARY'].some((role) => assignedRoles.includes(role))
  const canBlockCampusAgenda = ['SUPER_ADMIN', 'ADMIN', 'SECRETARY'].some((role) => assignedRoles.includes(role))
  const canApproveAgendaEvents = ['SUPER_ADMIN', 'ADMIN', 'SECRETARY', 'PASTOR', 'PASTOR_SENIOR'].some((role) => assignedRoles.includes(role))
  const canManageAnyWorshipOrder = ['SUPER_ADMIN', 'ADMIN', 'SECRETARY', 'WORSHIP_ORDER_MANAGER', 'PASTOR', 'PASTOR_SENIOR'].some((role) => assignedRoles.includes(role))
  const canManageWorshipTemplates = ['SUPER_ADMIN', 'ADMIN', 'SECRETARY', 'WORSHIP_ORDER_MANAGER', 'PASTOR_SENIOR'].some((role) => assignedRoles.includes(role))
  const isCellSection = ['cells', 'cell-structure', 'studies'].includes(activePage)
  const isServiceSection = ['teams', 'kids'].includes(activePage)
  const selectedServiceArea = serviceAreas.find((area) => area.id === selectedServiceAreaId) ?? null
  const activeServiceMemberTeams = serviceMemberArea?.teams.filter((team) => team.ativo) ?? []
  const ownServiceAreaMemberships = serviceAreaDetail?.memberships.filter((membership) => membership.person.id === session?.user.personId) ?? []
  const canCreateServiceTeam = canCentrallyManageServiceAreas || ownServiceAreaMemberships.some((membership) => membership.role === 'GENERAL_LEADER')
  const canManageServiceMembers = canCentrallyManageServiceAreas || ownServiceAreaMemberships.some((membership) => membership.role !== 'MEMBER')
  const canManageServiceEntryStages = canCentrallyManageServiceAreas || ownServiceAreaMemberships.some((membership) => membership.role === 'GENERAL_LEADER')

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

  useEffect(() => {
    if (!session) {
      setServiceAreas([])
      setSelectedServiceAreaId(null)
      return
    }

    let active = true
    setIsLoadingServiceAreas(true)
    void listServiceAreas(session.access_token, canCentrallyManageServiceAreas)
      .then((areas) => {
        if (active) setServiceAreas(areas)
      })
      .catch(() => {
        if (active) setServiceAreas([])
      })
      .finally(() => {
        if (active) setIsLoadingServiceAreas(false)
      })

    return () => {
      active = false
    }
  }, [canCentrallyManageServiceAreas, serviceAreasVersion, session])

  useEffect(() => {
    if (!session || activePage !== 'teams' || !selectedServiceAreaId) {
      setServiceAreaDetail(null)
      setServiceAreaDetailError('')
      setIsLoadingServiceAreaDetail(false)
      return
    }

    let active = true
    setServiceAreaDetail(null)
    setServiceAreaDetailError('')
    setIsLoadingServiceAreaDetail(true)

    void getServiceArea(session.access_token, selectedServiceAreaId)
      .then((area) => {
        if (active) setServiceAreaDetail(area)
      })
      .catch((error) => {
        if (active) setServiceAreaDetailError(error instanceof Error ? error.message : 'Não foi possível carregar esta área de serviço.')
      })
      .finally(() => {
        if (active) setIsLoadingServiceAreaDetail(false)
      })

    return () => {
      active = false
    }
  }, [activePage, selectedServiceAreaId, serviceAreaDetailVersion, session])

  useEffect(() => {
    if (!session) {
      setDashboard(null)
      setDashboardError('')
      return
    }

    let active = true
    setIsLoadingDashboard(true)
    setDashboardError('')

    void loadDashboard(session.access_token)
      .then((summary) => {
        if (active) setDashboard(summary)
      })
      .catch((error) => {
        if (!active) return
        setDashboardError(error instanceof Error ? error.message : 'Não foi possível carregar os dados do painel.')
      })
      .finally(() => {
        if (active) setIsLoadingDashboard(false)
      })

    return () => {
      active = false
    }
  }, [dashboardVersion, session])

  useEffect(() => {
    if (!session || activePage !== 'agenda') return

    let active = true
    setIsLoadingAgenda(true)
    setAgendaError('')

    void loadAgenda(session.access_token, agendaWeekStart)
      .then((events) => {
        if (active) setAgendaEvents(events)
      })
      .catch((error) => {
        if (active) setAgendaError(error instanceof Error ? error.message : 'Não foi possível carregar a agenda.')
      })
      .finally(() => {
        if (active) setIsLoadingAgenda(false)
      })

    return () => {
      active = false
    }
  }, [activePage, agendaVersion, agendaWeekStart, session])

  useEffect(() => {
    if (!session) {
      setUnreadNotificationCount(0)
      return
    }
    let active = true
    void listMyNotifications(session.access_token)
      .then((items) => {
        if (active) setUnreadNotificationCount(items.filter((item) => !item.readAt).length)
      })
      .catch(() => {
        if (active) setUnreadNotificationCount(0)
      })
    return () => {
      active = false
    }
  }, [notificationsVersion, session])

  useEffect(() => {
    if (!session || (!isCreateEventOpen && !creationMode && !selectedRecord)) return

    let active = true
    setIsLoadingCampuses(true)
    setEventFormError('')

    void listCampuses(session.access_token)
      .then((items) => {
        if (active) setCampuses(items)
      })
      .catch((error) => {
        if (active) setEventFormError(error instanceof Error ? error.message : 'Não foi possível carregar os campi disponíveis.')
      })
      .finally(() => {
        if (active) setIsLoadingCampuses(false)
      })

    return () => {
      active = false
    }
  }, [creationMode, isCreateEventOpen, selectedRecord, session])

  useEffect(() => {
    if (!session || !isCreateEventOpen) return

    let active = true
    setIsLoadingEventReferences(true)
    void Promise.all([listCells(session.access_token), listServiceAreas(session.access_token)])
      .then(([cellResult, areaList]) => {
        if (!active) return
        setEventFormCells(cellResult.data)
        setEventFormAreas(areaList)
      })
      .catch((error) => {
        if (active) setEventFormError(error instanceof Error ? error.message : 'Não foi possível carregar os vínculos disponíveis para este evento.')
      })
      .finally(() => {
        if (active) setIsLoadingEventReferences(false)
      })

    return () => {
      active = false
    }
  }, [isCreateEventOpen, session])

  useEffect(() => {
    if (!session || !isCreateEventOpen || !eventFormCampusId) {
      setEventFormSpaces([])
      return
    }

    let active = true
    void listEventSpaces(session.access_token, eventFormCampusId)
      .then((spaces) => {
        if (active) setEventFormSpaces(spaces)
      })
      .catch((error) => {
        if (active) setEventFormError(error instanceof Error ? error.message : 'Não foi possível carregar os espaços deste campus.')
      })

    return () => {
      active = false
    }
  }, [eventFormCampusId, isCreateEventOpen, session])

  useEffect(() => {
    if (!session || (activePage !== 'cells' && activePage !== 'people') || (activePage === 'cells' && !canManageDirectory)) return

    let active = true
    setIsLoadingDirectory(true)
    setDirectoryError('')

    const request = activePage === 'cells' ? listCells(session.access_token) : listPeople(session.access_token)

    void request
      .then((result) => {
        if (!active) return
        if (activePage === 'cells') setCells(result as Paginated<CellListItem>)
        else setPeople(result as Paginated<PersonListItem>)
      })
      .catch((error) => {
        if (active) setDirectoryError(error instanceof Error ? error.message : 'Não foi possível carregar estes dados.')
      })
      .finally(() => {
        if (active) setIsLoadingDirectory(false)
      })

    return () => {
      active = false
    }
  }, [activePage, canManageDirectory, directoryVersion, session])

  useEffect(() => {
    if (!session || activePage !== 'cell-structure') return

    let active = true
    setIsLoadingHierarchy(true)
    setHierarchyError('')

    const cellsRequest = canManageNetworks
      ? listCells(session.access_token)
      : Promise.resolve({ data: [] as CellListItem[] })

    void Promise.all([
      listCellNetworks(session.access_token),
      listCellCampusCoordinations(session.access_token),
      listCellNetworkSupervisions(session.access_token),
      listCampuses(session.access_token),
      listPeople(session.access_token),
      cellsRequest,
    ])
      .then(([networks, coordinations, supervisions, hierarchyCampuses, hierarchyPeople, hierarchyCells]) => {
        if (!active) return
        setHierarchy({
          networks,
          coordinations,
          supervisions,
          campuses: hierarchyCampuses,
          people: hierarchyPeople.data,
          cells: hierarchyCells.data,
        })
      })
      .catch((error) => {
        if (active) setHierarchyError(error instanceof Error ? error.message : 'Não foi possível carregar a estrutura de células.')
      })
      .finally(() => {
        if (active) setIsLoadingHierarchy(false)
      })

    return () => {
      active = false
    }
  }, [activePage, canManageNetworks, hierarchyVersion, session])

  useEffect(() => {
    if (!session || activePage !== 'studies') return

    let active = true
    setIsLoadingStudy(true)
    setStudyError('')
    setStudy(null)

    const request = canManageStudies
      ? getStudyForWeek(session.access_token, studyWeekStart)
      : getCurrentCellStudy(session.access_token)

    void request
      .then((result) => {
        if (active) setStudy(result)
      })
      .catch((error) => {
        if (active) setStudyError(error instanceof Error ? error.message : 'Não foi possível carregar o estudo.')
      })
      .finally(() => {
        if (active) setIsLoadingStudy(false)
      })

    return () => {
      active = false
    }
  }, [activePage, canManageStudies, session, studyWeekStart])

  useEffect(() => {
    if (!session || !selectedRecord) return

    let active = true
    setRecordDetail(null)
    setCellOverview(null)
    setRecordDetailError('')
    setIsLoadingRecordDetail(true)

    const request = selectedRecord.kind === 'cell'
      ? getCellOverview(session.access_token, selectedRecord.id)
      : getPerson(session.access_token, selectedRecord.id)

    void request
      .then((result) => {
        if (!active) return
        if (selectedRecord.kind === 'cell') {
          const overview = result as CellOverview
          setCellOverview(overview)
          setRecordDetail({ kind: 'cell', data: overview.cell })
        }
        else setRecordDetail({ kind: 'person', data: result as PersonListItem })
      })
      .catch((error) => {
        if (active) setRecordDetailError(error instanceof Error ? error.message : 'Não foi possível carregar este cadastro.')
      })
      .finally(() => {
        if (active) setIsLoadingRecordDetail(false)
      })

    return () => {
      active = false
    }
  }, [selectedRecord, session])

  useEffect(() => {
    if (selectedRecord?.kind !== 'person') return
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [selectedRecord])

  useEffect(() => {
    if (!session || !membershipCell) return

    let active = true
    setIsLoadingMembershipCandidates(true)
    setMembershipFormError('')

    void listPeople(session.access_token)
      .then((result) => {
        if (active) setMembershipCandidates(result.data.filter((person) => person.ativo))
      })
      .catch((error) => {
        if (active) setMembershipFormError(error instanceof Error ? error.message : 'Não foi possível carregar as pessoas disponíveis.')
      })
      .finally(() => {
        if (active) setIsLoadingMembershipCandidates(false)
      })

    return () => {
      active = false
    }
  }, [membershipCell, session])

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
    setDashboard(null)
    setDashboardError('')
    setAgendaEvents([])
    setAgendaError('')
    setCampuses([])
    setEventFormError('')
    setCreationMode(null)
    setDirectoryFormError('')
    setCells(null)
    setPeople(null)
    setDirectoryError('')
    setHierarchy(null)
    setHierarchyError('')
    setServiceAreas([])
    setSelectedServiceAreaId(null)
    setSelectedRecord(null)
    setRecordDetail(null)
    setRecordDetailError('')
    setStudy(null)
    setStudyError('')
    setNotice('')
    setAuthError('')
  }

  const openEventForm = (event: AgendaEvent | null = null) => {
    setNotice('')
    setEventFormError('')
    setEventFormDraft(event)
    setEventFormCampusId(event?.campus.id ?? '')
    setEventFormSpaces([])
    setIsCreateEventOpen(true)
  }

  const closeEventForm = () => {
    setIsCreateEventOpen(false)
    setEventFormDraft(null)
    setEventFormCampusId('')
    setEventFormError('')
  }

  const saveEvent = async (input: CreateAgendaEventInput) => {
    if (!session) return

    setEventFormError('')
    setIsSubmittingEvent(true)

    try {
      const saved = eventFormDraft
        ? await updateAgendaEvent(session.access_token, eventFormDraft.id, input)
        : await createAgendaEvent(session.access_token, input)
      closeEventForm()
      setSelectedAgendaEvent(saved)
      setAgendaVersion((version) => version + 1)
      setDashboardVersion((version) => version + 1)
      if (eventFormDraft) setNotice('Alterações do evento salvas na agenda.')
      else setNotice(saved.status === 'APPROVED' ? 'Evento criado e aprovado na agenda.' : 'Evento enviado para aprovação na agenda.')
    } catch (error) {
      setEventFormError(error instanceof Error ? error.message : 'Não foi possível salvar o evento.')
    } finally {
      setIsSubmittingEvent(false)
    }
  }

  const approveSelectedAgendaEvent = async () => {
    if (!session || !selectedAgendaEvent) return
    const updated = await approveAgendaEvent(session.access_token, selectedAgendaEvent.id)
    setSelectedAgendaEvent(updated)
    setAgendaVersion((version) => version + 1)
    setDashboardVersion((version) => version + 1)
    setNotice('Evento aprovado e incluído na agenda institucional.')
  }

  const cancelSelectedAgendaEvent = async () => {
    if (!session || !selectedAgendaEvent) return
    await cancelAgendaEvent(session.access_token, selectedAgendaEvent.id)
    setSelectedAgendaEvent(null)
    setAgendaVersion((version) => version + 1)
    setDashboardVersion((version) => version + 1)
    setNotice('Evento cancelado. O histórico foi preservado.')
  }

  const addSelectedAgendaChecklist = async (description: string) => {
    if (!session || !selectedAgendaEvent) return
    const item = await addAgendaEventChecklist(session.access_token, selectedAgendaEvent.id, description)
    setSelectedAgendaEvent((current) => current?.id === selectedAgendaEvent.id ? { ...current, checklist: [...current.checklist, item] } : current)
    setNotice('Item adicionado ao checklist do evento.')
  }

  const toggleSelectedAgendaChecklist = async (checklistId: string) => {
    if (!session || !selectedAgendaEvent) return
    const updated = await toggleAgendaEventChecklist(session.access_token, checklistId)
    setSelectedAgendaEvent((current) => current?.id === selectedAgendaEvent.id ? { ...current, checklist: current.checklist.map((item) => item.id === updated.id ? updated : item) } : current)
  }

  const openDirectoryForm = (mode: 'cell' | 'person') => {
    setNotice('')
    setDirectoryFormError('')
    setCreationMode(mode)
  }

  const closeDirectoryForm = () => {
    setCreationMode(null)
    setDirectoryFormError('')
  }

  const closeRecordDetail = () => {
    setSelectedRecord(null)
    setRecordDetail(null)
    setRecordDetailError('')
  }

  const openMembershipForm = (cell: CellListItem) => {
    setMembershipCell({ id: cell.id, nome: cell.nome })
    setMembershipFormError('')
    setIsTransferConfirmationNeeded(false)
  }

  const closeMembershipForm = () => {
    setMembershipCell(null)
    setMembershipCandidates([])
    setMembershipFormError('')
    setIsTransferConfirmationNeeded(false)
  }

  const refreshSelectedCell = () => {
    if (selectedRecord?.kind === 'cell') {
      setSelectedRecord({ kind: 'cell', id: selectedRecord.id })
    }
  }

  const saveMembership = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !membershipCell) return

    const formData = new FormData(event.currentTarget)
    const personId = String(formData.get('personId') ?? '')
    setMembershipFormError('')
    setIsSavingMembership(true)

    try {
      await createCellMembership(session.access_token, {
        cellId: membershipCell.id,
        personId,
        confirmTransfer: isTransferConfirmationNeeded,
      })
      closeMembershipForm()
      refreshSelectedCell()
      setNotice('Pessoa vinculada à célula com sucesso.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setIsTransferConfirmationNeeded(true)
        setMembershipFormError('Esta pessoa já participa de outra célula. Confirme a transferência para continuar.')
      } else {
        setMembershipFormError(error instanceof Error ? error.message : 'Não foi possível vincular esta pessoa à célula.')
      }
    } finally {
      setIsSavingMembership(false)
    }
  }

  const endMembership = async (membershipId: string, personName: string) => {
    if (!session) return

    setRecordDetailError('')
    try {
      await endCellMembership(session.access_token, membershipId)
      refreshSelectedCell()
      setNotice(`${personName} não possui mais vínculo ativo com esta célula.`)
    } catch (error) {
      setRecordDetailError(error instanceof Error ? error.message : 'Não foi possível encerrar o vínculo desta pessoa.')
    }
  }

  const openLeadershipForm = (cell: CellListItem, members: CellPersonReference[]) => {
    setLeadershipCell({ id: cell.id, nome: cell.nome, members })
    setLeadershipPersonId('')
    setLeadershipSearch('')
    setLeadershipFormError('')
  }

  const closeLeadershipForm = () => {
    setLeadershipCell(null)
    setLeadershipPersonId('')
    setLeadershipSearch('')
    setLeadershipFormError('')
  }

  const saveLeadership = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !leadershipCell) return

    const formData = new FormData(event.currentTarget)
    const personId = leadershipPersonId
    const role = String(formData.get('role') ?? 'LEADER')
    if (!personId) {
      setLeadershipFormError('Pesquise e selecione uma pessoa vinculada a esta célula.')
      return
    }
    setLeadershipFormError('')
    setIsSavingLeadership(true)

    try {
      if (role === 'LEADER') await createCellLeadership(session.access_token, { cellId: leadershipCell.id, personId })
      else await createCellSupportRole(session.access_token, { cellId: leadershipCell.id, personId, role: role as 'LEADER_IN_TRAINING' | 'HOST' })
      closeLeadershipForm()
      refreshSelectedCell()
      setNotice('Função atribuída à pessoa com sucesso.')
    } catch (error) {
      setLeadershipFormError(error instanceof Error ? error.message : 'Não foi possível atribuir esta função.')
    } finally {
      setIsSavingLeadership(false)
    }
  }

  const endLeadershipAssignment = async (id: string, type: 'leadership' | 'support', personName: string) => {
    if (!session) return

    setRecordDetailError('')
    try {
      if (type === 'leadership') await endCellLeadership(session.access_token, id)
      else await endCellSupportRole(session.access_token, id)
      refreshSelectedCell()
      setNotice(`Função de ${personName} encerrada com sucesso.`)
    } catch (error) {
      setRecordDetailError(error instanceof Error ? error.message : 'Não foi possível encerrar esta função.')
    }
  }

  const openRosterForm = async (meetingId: string, title: string) => {
    if (!session) return

    setRosterMeeting({ id: meetingId, title })
    setRoster([])
    setRosterFormError('')
    setIsLoadingRoster(true)
    try {
      setRoster(await getCellMeetingRoster(session.access_token, meetingId))
    } catch (error) {
      setRosterFormError(error instanceof Error ? error.message : 'Não foi possível carregar a chamada deste encontro.')
    } finally {
      setIsLoadingRoster(false)
    }
  }

  const closeRosterForm = () => {
    setRosterMeeting(null)
    setRoster([])
    setRosterFormError('')
  }

  const openVisitorForm = async (meetingId: string, title: string, cellId: string) => {
    if (!session) return

    setVisitorMeeting({ id: meetingId, title, cellId })
    setMeetingVisitors([])
    setVisitorFormError('')
    setHasVisitorsToRegister(false)
    setVisitorSuggestion(null)
    setVisitorTransfer(null)
    setIsLoadingVisitors(true)
    try {
      setMeetingVisitors(await listCellMeetingVisitors(session.access_token, meetingId))
    } catch (error) {
      setVisitorFormError(error instanceof Error ? error.message : 'Não foi possível carregar os visitantes deste encontro.')
    } finally {
      setIsLoadingVisitors(false)
    }
  }

  const closeVisitorForm = () => {
    setVisitorMeeting(null)
    setMeetingVisitors([])
    setVisitorFormError('')
    setHasVisitorsToRegister(false)
    setVisitorSuggestion(null)
    setVisitorTransfer(null)
  }

  const saveVisitor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !visitorMeeting) return

    const formData = new FormData(event.currentTarget)
    const nome = String(formData.get('name') ?? '').trim()
    const telefone = String(formData.get('phone') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const observacao = String(formData.get('observation') ?? '').trim()

    setVisitorFormError('')
    setIsSavingVisitor(true)
    try {
      const result = await createCellMeetingVisitor(session.access_token, {
        meetingId: visitorMeeting.id,
        nome,
        telefone,
        ...(email ? { email } : {}),
        ...(observacao ? { observacao } : {}),
      })
      setMeetingVisitors(await listCellMeetingVisitors(session.access_token, visitorMeeting.id))
      event.currentTarget.reset()
      refreshSelectedCell()

      if (result.membershipSuggestion.eligible) {
        setVisitorSuggestion({
          id: result.visitor.id,
          nome: result.visitor.nome,
          visits: result.membershipSuggestion.visits,
        })
      } else {
        setNotice('Visitante registrado no encontro.')
      }
    } catch (error) {
      setVisitorFormError(error instanceof Error ? error.message : 'Não foi possível registrar o visitante.')
    } finally {
      setIsSavingVisitor(false)
    }
  }

  const convertVisitorToMember = async (visitor: CellMeetingVisitor) => {
    if (!session || !visitorMeeting) return

    setVisitorFormError('')
    setIsConvertingVisitor(true)
    try {
      const result = await convertCellMeetingVisitorToMember(session.access_token, visitor.id)
      if (result.requiresTransfer) {
        setVisitorSuggestion(null)
        setVisitorTransfer({
          personId: result.person.id,
          personName: result.person.nome,
          cellId: visitorMeeting.cellId,
        })
        return
      }

      setVisitorSuggestion(null)
      await refreshSelectedCell()
      setNotice(result.created ? `${result.person.nome} agora participa ativamente desta célula.` : `${result.person.nome} já participa desta célula.`)
    } catch (error) {
      setVisitorFormError(error instanceof Error ? error.message : 'Não foi possível incluir o visitante na célula.')
    } finally {
      setIsConvertingVisitor(false)
    }
  }

  const confirmVisitorTransfer = async () => {
    if (!session || !visitorTransfer) return

    setVisitorFormError('')
    setIsConvertingVisitor(true)
    try {
      await createCellMembership(session.access_token, {
        personId: visitorTransfer.personId,
        cellId: visitorTransfer.cellId,
        confirmTransfer: true,
      })
      setVisitorTransfer(null)
      await refreshSelectedCell()
      setNotice(`${visitorTransfer.personName} foi transferido(a) para esta célula.`)
    } catch (error) {
      setVisitorFormError(error instanceof Error ? error.message : 'Não foi possível transferir a pessoa para esta célula.')
    } finally {
      setIsConvertingVisitor(false)
    }
  }

  const openServiceTeamForm = async (area: ServiceAreaDetail) => {
    if (!session) return

    setServiceTeamArea(area)
    setServiceFormCampuses([])
    setServiceFormError('')
    setIsLoadingServiceForm(true)
    try {
      setServiceFormCampuses(await listCampuses(session.access_token))
    } catch (error) {
      setServiceFormError(error instanceof Error ? error.message : 'Não foi possível carregar os campi para esta equipe.')
    } finally {
      setIsLoadingServiceForm(false)
    }
  }

  const closeServiceTeamForm = () => {
    setServiceTeamArea(null)
    setServiceFormCampuses([])
    setServiceFormError('')
  }

  const saveServiceTeam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !serviceTeamArea) return

    const formData = new FormData(event.currentTarget)
    const nome = String(formData.get('name') ?? '').trim()
    const descricao = String(formData.get('description') ?? '').trim()
    const campusId = serviceTeamArea.scope === 'CAMPUS'
      ? serviceTeamArea.campus?.id ?? ''
      : String(formData.get('campusId') ?? '')

    if (!campusId) {
      setServiceFormError('Selecione o campus da equipe.')
      return
    }

    setServiceFormError('')
    setIsSavingServiceForm(true)
    try {
      await createServiceTeam(session.access_token, serviceTeamArea.id, {
        nome,
        campusId,
        ...(descricao ? { descricao } : {}),
      })
      closeServiceTeamForm()
      setServiceAreaDetailVersion((version) => version + 1)
      setServiceAreasVersion((version) => version + 1)
      setNotice('Equipe criada com sucesso.')
    } catch (error) {
      setServiceFormError(error instanceof Error ? error.message : 'Não foi possível criar a equipe.')
    } finally {
      setIsSavingServiceForm(false)
    }
  }

  const openServiceMemberForm = async (area: ServiceAreaDetail) => {
    if (!session) return

    setServiceMemberArea(area)
    setServiceFormPeople([])
    setServiceFormCampuses([])
    setServiceMemberPersonId('')
    setServiceMemberPersonSearch('')
    setServiceMembershipRole('MEMBER')
    setServiceMemberFunctions([])
    setServiceFormError('')
    setIsLoadingServiceForm(true)
    try {
      const [peopleResult, availableCampuses] = await Promise.all([
        listPeople(session.access_token),
        listCampuses(session.access_token),
      ])
      setServiceFormPeople(peopleResult.data.filter((person) => person.ativo))
      setServiceFormCampuses(availableCampuses)
    } catch (error) {
      setServiceFormError(error instanceof Error ? error.message : 'Não foi possível carregar as pessoas e os campi disponíveis.')
    } finally {
      setIsLoadingServiceForm(false)
    }
  }

  const closeServiceMemberForm = () => {
    setServiceMemberArea(null)
    setServiceFormPeople([])
    setServiceFormCampuses([])
    setServiceMemberPersonId('')
    setServiceMemberPersonSearch('')
    setServiceMembershipRole('MEMBER')
    setServiceMemberFunctions([])
    setServiceFormError('')
  }

  const saveServiceMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !serviceMemberArea) return

    const formData = new FormData(event.currentTarget)
    const personId = serviceMemberPersonId
    const teamId = String(formData.get('teamId') ?? '')
    const funcoes = (serviceMembershipRole === 'MEMBER' || serviceMembershipRole === 'TEAM_LEADER') ? serviceMemberFunctions : []
    const campusId = serviceMemberArea.scope === 'CAMPUS'
      ? serviceMemberArea.campus?.id ?? ''
      : String(formData.get('campusId') ?? '')

    if (!personId) {
      setServiceFormError('Selecione uma pessoa.')
      return
    }

    if (serviceMembershipRole === 'CAMPUS_LEADER' && !campusId) {
      setServiceFormError('Selecione o campus desta liderança.')
      return
    }

    if ((serviceMembershipRole === 'TEAM_LEADER' || serviceMembershipRole === 'MEMBER') && !teamId) {
      setServiceFormError('Selecione a equipe da pessoa.')
      return
    }

    setServiceFormError('')
    setIsSavingServiceForm(true)
    try {
      await addServiceAreaMember(session.access_token, serviceMemberArea.id, {
        personId,
        role: serviceMembershipRole,
        ...(serviceMembershipRole === 'CAMPUS_LEADER' ? { campusId } : {}),
        ...((serviceMembershipRole === 'TEAM_LEADER' || serviceMembershipRole === 'MEMBER') ? { teamId } : {}),
        ...(funcoes.length ? { funcoes } : {}),
      })
      closeServiceMemberForm()
      setServiceAreaDetailVersion((version) => version + 1)
      setServiceAreasVersion((version) => version + 1)
      setNotice('Pessoa vinculada à área de serviço com sucesso.')
    } catch (error) {
      setServiceFormError(error instanceof Error ? error.message : 'Não foi possível vincular a pessoa à área de serviço.')
    } finally {
      setIsSavingServiceForm(false)
    }
  }

  const refreshServiceOnboarding = async (area: ServiceAreaDetail) => {
    if (!session) return false

    setServiceOnboardingError('')
    setIsLoadingServiceOnboarding(true)
    try {
      const [stages, applications, peopleResult] = await Promise.all([
        listServiceAreaEntryStages(session.access_token, area.id),
        listServiceAreaApplications(session.access_token, area.id),
        listPeople(session.access_token),
      ])
      setServiceOnboardingStages(stages)
      setServiceOnboardingApplications(applications)
      setServiceOnboardingPeople(peopleResult.data.filter((person) => person.ativo))
      return true
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível carregar a jornada de entrada desta área.')
      return false
    } finally {
      setIsLoadingServiceOnboarding(false)
    }
  }

  const openServiceOnboarding = async (area: ServiceAreaDetail) => {
    setServiceOnboardingArea(area)
    setServiceOnboardingStages([])
    setServiceOnboardingApplications([])
    setServiceOnboardingPeople([])
    setServiceOnboardingError('')
    await refreshServiceOnboarding(area)
  }

  const closeServiceOnboarding = () => {
    setServiceOnboardingArea(null)
    setServiceOnboardingStages([])
    setServiceOnboardingApplications([])
    setServiceOnboardingPeople([])
    setServiceOnboardingError('')
  }

  const createServiceEntryStage = async (input: { nome: string; descricao?: string; obrigatoria: boolean }) => {
    if (!session || !serviceOnboardingArea) return false

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await createServiceAreaEntryStage(session.access_token, serviceOnboardingArea.id, input)
      const refreshed = await refreshServiceOnboarding(serviceOnboardingArea)
      if (refreshed) setNotice('Etapa de entrada adicionada com sucesso.')
      return refreshed
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível adicionar a etapa de entrada.')
      return false
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const updateServiceEntryStage = async (stageId: string, input: { nome: string; descricao?: string; obrigatoria: boolean; ativo: boolean }) => {
    if (!session || !serviceOnboardingArea) return false

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await updateServiceAreaEntryStage(session.access_token, stageId, input)
      const refreshed = await refreshServiceOnboarding(serviceOnboardingArea)
      if (refreshed) setNotice(input.ativo ? 'Etapa atualizada com sucesso.' : 'Etapa desativada. O histórico existente foi preservado.')
      return refreshed
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível atualizar esta etapa.')
      return false
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const reorderServiceEntryStages = async (stageIds: string[]) => {
    if (!session || !serviceOnboardingArea) return

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await reorderServiceAreaEntryStages(session.access_token, serviceOnboardingArea.id, stageIds)
      if (await refreshServiceOnboarding(serviceOnboardingArea)) setNotice('Ordem das etapas atualizada.')
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível reorganizar as etapas.')
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const createServiceEntryApplication = async (input: { personId: string; desiredTeamId?: string; observacao?: string }) => {
    if (!session || !serviceOnboardingArea) return false

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await createServiceAreaApplication(session.access_token, {
        serviceAreaId: serviceOnboardingArea.id,
        ...input,
      })
      const refreshed = await refreshServiceOnboarding(serviceOnboardingArea)
      if (refreshed) setNotice('Interesse registrado e pronto para acompanhamento.')
      return refreshed
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível registrar o interesse nesta área.')
      return false
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const startServiceEntryApplication = async (applicationId: string) => {
    if (!session || !serviceOnboardingArea) return

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await startServiceAreaApplication(session.access_token, applicationId)
      if (await refreshServiceOnboarding(serviceOnboardingArea)) setNotice('Processo de entrada iniciado.')
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível iniciar o processo de entrada.')
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const completeServiceEntryStage = async (applicationId: string, stageId: string) => {
    if (!session || !serviceOnboardingArea) return

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await completeServiceAreaApplicationStage(session.access_token, applicationId, stageId)
      if (await refreshServiceOnboarding(serviceOnboardingArea)) setNotice('Etapa concluída no acompanhamento da pessoa.')
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível concluir esta etapa.')
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const approveServiceEntryApplication = async (applicationId: string, teamId: string) => {
    if (!session || !serviceOnboardingArea) return

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await approveServiceAreaApplication(session.access_token, applicationId, teamId)
      const refreshed = await refreshServiceOnboarding(serviceOnboardingArea)
      if (refreshed) {
        setServiceAreaDetailVersion((version) => version + 1)
        setServiceAreasVersion((version) => version + 1)
        setNotice('Pessoa aprovada e incluída na equipe.')
      }
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível aprovar esta pessoa.')
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const rejectServiceEntryApplication = async (applicationId: string, motivo: string) => {
    if (!session || !serviceOnboardingArea) return false

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await rejectServiceAreaApplication(session.access_token, applicationId, motivo)
      const refreshed = await refreshServiceOnboarding(serviceOnboardingArea)
      if (refreshed) setNotice('Processo encerrado como não aprovado.')
      return refreshed
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível recusar este processo.')
      return false
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const withdrawServiceEntryApplication = async (applicationId: string, motivo?: string) => {
    if (!session || !serviceOnboardingArea) return false

    setServiceOnboardingError('')
    setIsSavingServiceOnboarding(true)
    try {
      await withdrawServiceAreaApplication(session.access_token, applicationId, motivo)
      const refreshed = await refreshServiceOnboarding(serviceOnboardingArea)
      if (refreshed) setNotice('Desistência registrada e histórico preservado.')
      return refreshed
    } catch (error) {
      setServiceOnboardingError(error instanceof Error ? error.message : 'Não foi possível registrar a desistência.')
      return false
    } finally {
      setIsSavingServiceOnboarding(false)
    }
  }

  const saveRoster = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !rosterMeeting) return

    const formData = new FormData(event.currentTarget)
    setRosterFormError('')
    setIsSavingRoster(true)
    try {
      await saveCellMeetingRoster(session.access_token, rosterMeeting.id, roster.map((item) => ({ personId: item.person.id, presente: formData.get(`presence-${item.person.id}`) === 'present' })))
      closeRosterForm()
      refreshSelectedCell()
      setNotice('Chamada salva com sucesso.')
    } catch (error) {
      setRosterFormError(error instanceof Error ? error.message : 'Não foi possível salvar a chamada.')
    } finally {
      setIsSavingRoster(false)
    }
  }

  const finishMeeting = async (meetingId: string) => {
    if (!session) return

    setRecordDetailError('')
    try {
      await closeCellMeeting(session.access_token, meetingId)
      refreshSelectedCell()
      setNotice('Registro do encontro concluído com sucesso.')
    } catch (error) {
      setRecordDetailError(error instanceof Error ? error.message : 'Preencha a chamada completa antes de concluir este encontro.')
    }
  }

  const saveStudy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    const formData = new FormData(event.currentTarget)
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      setStudyError('Selecione o anexo do estudo para publicar.')
      return
    }

    setStudyError('')
    setIsSubmittingStudy(true)
    try {
      const published = await publishCellStudy(session.access_token, {
        titulo: String(formData.get('title') ?? '').trim(),
        weekStart: studyWeekStart,
        descricao: String(formData.get('description') ?? '').trim() || undefined,
        file,
      })
      setStudy(published)
      setNotice('Estudo semanal publicado para todas as células da organização.')
    } catch (error) {
      setStudyError(error instanceof Error ? error.message : 'Não foi possível publicar o estudo.')
    } finally {
      setIsSubmittingStudy(false)
    }
  }

  const downloadStudy = async () => {
    if (!session) return

    setStudyError('')
    try {
      const { blob, filename } = await downloadCurrentCellStudy(session.access_token)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setStudyError(error instanceof Error ? error.message : 'Não foi possível baixar o estudo.')
    }
  }

  const runHierarchyAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setHierarchyError('')
    setIsSavingHierarchy(true)
    try {
      await action()
      setHierarchyVersion((version) => version + 1)
      setNotice(successMessage)
    } catch (error) {
      setHierarchyError(error instanceof Error ? error.message : 'Não foi possível concluir a alteração na estrutura de células.')
    } finally {
      setIsSavingHierarchy(false)
    }
  }

  const saveNetwork = async (input: { nome: string; descricao?: string; campusId: string }) => {
    if (!session) return
    await runHierarchyAction(
      () => createCellNetwork(session.access_token, input),
      'Rede criada com sucesso.',
    )
  }

  const saveCoordination = async (personId: string, campusId: string) => {
    if (!session) return
    await runHierarchyAction(
      () => createCellCampusCoordination(session.access_token, { personId, campusId }),
      'Coordenação de células atribuída com sucesso.',
    )
  }

  const saveSupervision = async (personId: string, networkId: string) => {
    if (!session) return
    await runHierarchyAction(
      () => createCellNetworkSupervision(session.access_token, { personId, networkId }),
      'Supervisão da rede atribuída com sucesso.',
    )
  }

  const linkCellToNetwork = async (networkId: string, cellId: string) => {
    if (!session) return
    await runHierarchyAction(
      () => assignCellToNetwork(session.access_token, networkId, cellId),
      'Célula vinculada à rede com sucesso.',
    )
  }

  const unlinkCellFromNetwork = async (networkId: string, cellId: string, cellName: string) => {
    if (!session) return
    await runHierarchyAction(
      () => unassignCellFromNetwork(session.access_token, networkId, cellId),
      `${cellName} não está mais vinculada a esta rede.`,
    )
  }

  const finishCoordination = async (id: string, personName: string) => {
    if (!session) return
    await runHierarchyAction(
      () => endCellCampusCoordination(session.access_token, id),
      `Coordenação de ${personName} encerrada com sucesso.`,
    )
  }

  const finishSupervision = async (id: string, personName: string) => {
    if (!session) return
    await runHierarchyAction(
      () => endCellNetworkSupervision(session.access_token, id),
      `Supervisão de ${personName} encerrada com sucesso.`,
    )
  }

  const saveDirectoryEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !creationMode) return

    const formData = new FormData(event.currentTarget)
    const campusId = String(formData.get('campusId') ?? '')
    const nome = String(formData.get('name') ?? '').trim()

    setDirectoryFormError('')
    setIsSubmittingDirectory(true)

    try {
      if (creationMode === 'cell') {
        await createCell(session.access_token, {
          nome,
          descricao: String(formData.get('description') ?? '').trim() || undefined,
          campusId,
          meetingDay: String(formData.get('meetingDay') ?? '') || undefined,
          meetingTime: String(formData.get('meetingTime') ?? '') || undefined,
        })
        setNotice('Célula criada com sucesso.')
      } else {
        const created = await createPerson(session.access_token, {
          nome,
          telefone: String(formData.get('phone') ?? '').trim() || undefined,
          email: String(formData.get('email') ?? '').trim() || undefined,
          campusId,
          campusIds: formData.getAll('campusIds').map(String),
          organizationId: session.user.organizationId,
        })
        setSelectedRecord({ kind: 'person', id: created.id })
        setNotice('Pessoa cadastrada. Complete abaixo o acesso e o vínculo de serviço, se necessário.')
      }

      setCreationMode(null)
      setDirectoryVersion((version) => version + 1)
      setDashboardVersion((version) => version + 1)
    } catch (error) {
      setDirectoryFormError(error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.')
    } finally {
      setIsSubmittingDirectory(false)
    }
  }

  const saveRecordDetail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || !selectedRecord || !recordDetail) return

    const formData = new FormData(event.currentTarget)
    const campusId = String(formData.get('campusId') ?? '')
    const nome = String(formData.get('name') ?? '').trim()

    setRecordDetailError('')
    setIsSavingRecord(true)

    try {
      if (recordDetail.kind === 'cell') {
        await updateCell(session.access_token, recordDetail.data.id, {
          nome,
          campusId,
          descricao: String(formData.get('description') ?? '').trim() || null,
          meetingDay: String(formData.get('meetingDay') ?? '') || null,
          meetingTime: String(formData.get('meetingTime') ?? '') || null,
          ativo: String(formData.get('ativo') ?? 'true') === 'true',
        })
        setNotice('Dados da célula atualizados com sucesso.')
      } else {
        await updatePerson(session.access_token, recordDetail.data.id, {
          nome,
          campusId,
          campusIds: formData.getAll('campusIds').map(String),
          telefone: String(formData.get('phone') ?? '').trim() || null,
          email: String(formData.get('email') ?? '').trim() || null,
        })
        setNotice('Dados da pessoa atualizados com sucesso.')
      }

      closeRecordDetail()
      setDirectoryVersion((version) => version + 1)
      setDashboardVersion((version) => version + 1)
    } catch (error) {
      setRecordDetailError(error instanceof Error ? error.message : 'Não foi possível atualizar este cadastro.')
    } finally {
      setIsSavingRecord(false)
    }
  }

  const primaryAction = activePage === 'cell-structure' || activePage === 'studies'
    ? null
    : activePage === 'cells' && canManageDirectory
      ? { label: '+ Nova célula', action: () => openDirectoryForm('cell') }
      : activePage === 'people' && canManageDirectory
        ? { label: '+ Nova pessoa', action: () => openDirectoryForm('person') }
        : { label: '+ Novo evento', action: () => openEventForm() }

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
              <input name="username" type="text" placeholder="Seu usuário" autoComplete="username" required />
            </label>
            <label>
              Senha
              <span className="password-field"><input name="password" type={showLoginPassword ? 'text' : 'password'} placeholder="Sua senha" autoComplete="current-password" required /><button className="password-visibility-toggle" type="button" onClick={() => setShowLoginPassword((visible) => !visible)} aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showLoginPassword ? 'Ocultar' : 'Mostrar'}</button></span>
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
          {mainNavigation.map((item) => (
            <button
              className={`navigation-item ${activePage === item.page ? 'navigation-item--active' : ''}`}
              type="button"
              key={item.page}
              onClick={() => setActivePage(item.page)}
              aria-current={activePage === item.page ? 'page' : undefined}
            >
              <span className="navigation-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.page === 'agenda' && dashboard && dashboard.requestedEvents > 0 && <span className="navigation-badge">{dashboard.requestedEvents}</span>}
            </button>
          ))}
          <div className="navigation-group">
            <div className="navigation-group-header">
              <button className={`navigation-item navigation-group-parent ${isCellSection ? 'navigation-item--active' : ''}`} type="button" onClick={() => { setActivePage('cells'); setIsCellsMenuExpanded((expanded) => !expanded) }} aria-current={isCellSection ? 'page' : undefined}><span className="navigation-icon" aria-hidden="true">◎</span>Células</button>
              <button className="navigation-group-toggle" type="button" onClick={() => setIsCellsMenuExpanded((expanded) => !expanded)} aria-label={isCellsMenuExpanded ? 'Recolher menu de células' : 'Expandir menu de células'} aria-expanded={isCellsMenuExpanded} aria-controls="cell-submenu">{isCellsMenuExpanded ? '⌃' : '⌄'}</button>
            </div>
            {isCellsMenuExpanded && <div className="navigation-submenu" id="cell-submenu">
              {cellNavigation.map((item) => (
                <button className={`navigation-subitem ${activePage === item.page ? 'navigation-subitem--active' : ''}`} type="button" key={item.page} onClick={() => setActivePage(item.page)} aria-current={activePage === item.page ? 'page' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</button>
              ))}
            </div>}
          </div>
          <div className="navigation-group">
            <div className="navigation-group-header">
              <button className={`navigation-item navigation-group-parent ${isServiceSection ? 'navigation-item--active' : ''}`} type="button" onClick={() => { setSelectedServiceAreaId(null); setActivePage('teams'); setIsServiceMenuExpanded((expanded) => !expanded) }} aria-current={isServiceSection ? 'page' : undefined}><span className="navigation-icon" aria-hidden="true">◇</span>Áreas de Serviço</button>
              <button className="navigation-group-toggle" type="button" onClick={() => setIsServiceMenuExpanded((expanded) => !expanded)} aria-label={isServiceMenuExpanded ? 'Recolher menu de áreas de serviço' : 'Expandir menu de áreas de serviço'} aria-expanded={isServiceMenuExpanded} aria-controls="service-submenu">{isServiceMenuExpanded ? '⌃' : '⌄'}</button>
            </div>
            {isServiceMenuExpanded && <div className="navigation-submenu" id="service-submenu">
              {isLoadingServiceAreas && <p className="navigation-submenu-loading">Carregando áreas...</p>}
              {serviceAreas.filter((area) => !['ibag kids', 'ordem de culto'].includes(area.nome.trim().toLocaleLowerCase('pt-BR'))).map((area) => <button className={`navigation-subitem ${!area.ativo ? 'navigation-subitem--inactive' : ''} ${activePage === 'teams' && selectedServiceAreaId === area.id ? 'navigation-subitem--active' : ''}`} type="button" key={area.id} onClick={() => { setSelectedServiceAreaId(area.id); setActivePage('teams') }} aria-current={activePage === 'teams' && selectedServiceAreaId === area.id ? 'page' : undefined}><span aria-hidden="true">◇</span>{area.nome}{!area.ativo ? ' · Inativa' : ''}</button>)}
            </div>}
          </div>
          {moduleNavigation.map((item) => (
            <button
              className={`navigation-item ${activePage === item.page ? 'navigation-item--active' : ''}`}
              type="button"
              key={item.page}
              onClick={() => setActivePage(item.page)}
              aria-current={activePage === item.page ? 'page' : undefined}
            >
              <span className="navigation-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.page === 'agenda' && dashboard && dashboard.requestedEvents > 0 && <span className="navigation-badge">{dashboard.requestedEvents}</span>}
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
            <p className="eyebrow">{activePage === 'dashboard' ? currentDateLabel() : activePage === 'agenda' ? 'Agenda institucional' : activePage === 'teams' && selectedServiceArea ? 'Área de Serviço' : pageCopy[activePage].eyebrow}</p>
            <h1>{activePage === 'dashboard' ? `Bom dia, ${firstName(session.user.person.nome)}.` : activePage === 'agenda' ? `Tudo que acontece na ${session.user.organization.nome}` : activePage === 'teams' && selectedServiceArea ? selectedServiceArea.nome : pageCopy[activePage].title}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Buscar">⌕</button>
            <button className="icon-button icon-button--notification" type="button" aria-label="Notificações" onClick={() => setIsNotificationsOpen(true)}>♧{unreadNotificationCount > 0 && <span>{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span>}</button>
            {primaryAction && <button className="primary-button" type="button" onClick={primaryAction.action}>{primaryAction.label}</button>}
          </div>
        </header>

        {notice && <div className="notice" role="status"><span>✓</span>{notice}<button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}

        {activePage === 'dashboard' && <Dashboard summary={dashboard} error={dashboardError} isLoading={isLoadingDashboard} onRetry={() => setDashboardVersion((version) => version + 1)} onOpenAgenda={() => setActivePage('agenda')} onOpenCells={() => setActivePage('cells')} />}
        {activePage === 'agenda' && <Agenda events={agendaEvents} error={agendaError} isLoading={isLoadingAgenda} weekStart={agendaWeekStart} onRetry={() => setAgendaVersion((version) => version + 1)} onPreviousWeek={() => setAgendaWeekStart((start) => addDays(start, -7))} onNextWeek={() => setAgendaWeekStart((start) => addDays(start, 7))} onToday={() => setAgendaWeekStart(startOfWeek(new Date()))} onCreateEvent={() => openEventForm()} onSelectEvent={setSelectedAgendaEvent} />}
        {activePage === 'cells' && (canManageDirectory ? <CellsPage data={cells} error={directoryError} isLoading={isLoadingDirectory} onRetry={() => setDirectoryVersion((version) => version + 1)} onSelect={(id) => setSelectedRecord({ kind: 'cell', id })} /> : <CellDirectoryRestricted />)}
        {activePage === 'cell-structure' && <CellHierarchy campuses={hierarchy?.campuses ?? []} cells={hierarchy?.cells ?? []} coordinations={hierarchy?.coordinations ?? []} currentPersonId={session.user.personId} error={hierarchyError} isLoading={isLoadingHierarchy} isSaving={isSavingHierarchy} networks={hierarchy?.networks ?? []} people={hierarchy?.people ?? []} supervisions={hierarchy?.supervisions ?? []} canManageNetworks={canManageNetworks} onAssignCell={linkCellToNetwork} onCreateCoordination={saveCoordination} onCreateNetwork={saveNetwork} onCreateSupervision={saveSupervision} onEndCoordination={finishCoordination} onEndSupervision={finishSupervision} onUnassignCell={unlinkCellFromNetwork} />}
        {activePage === 'studies' && <StudiesPage canManage={canManageStudies} study={study} error={studyError} isLoading={isLoadingStudy} weekStart={studyWeekStart} isSubmitting={isSubmittingStudy} onWeekStartChange={setStudyWeekStart} onPublish={saveStudy} onDownload={downloadStudy} />}
        {activePage === 'people' && <PeoplePage data={people} error={directoryError} isLoading={isLoadingDirectory} onRetry={() => setDirectoryVersion((version) => version + 1)} onSelect={(id) => setSelectedRecord({ kind: 'person', id })} />}
        {activePage === 'my-schedules' && <MySchedulesPage accessToken={session.access_token} onNotice={setNotice} onNotificationsChanged={() => setNotificationsVersion((version) => version + 1)} />}
        {activePage === 'worship' && <WorshipPage accessToken={session.access_token} currentUserId={session.user.id} canManageAnyOrder={canManageAnyWorshipOrder} canManageTemplates={canManageWorshipTemplates} onNotice={setNotice} />}
        {activePage === 'teams' && selectedServiceArea && <ServiceAreaWorkspace area={serviceAreaDetail} error={serviceAreaDetailError} isLoading={isLoadingServiceAreaDetail} onRetry={() => setServiceAreaDetailVersion((version) => version + 1)} canManageArea={canCentrallyManageServiceAreas} canCreateTeam={canCreateServiceTeam} canManageTeams={canManageServiceMembers} canManageMembers={canManageServiceMembers} canManageOnboarding={canManageServiceMembers} canManageSchedules={canManageServiceMembers} accessToken={session.access_token} currentPersonId={session.user.personId} onNotice={setNotice} onCreateTeam={openServiceTeamForm} onAddMember={openServiceMemberForm} onOpenOnboarding={openServiceOnboarding} onStructureChange={(areaIsActive) => { setServiceAreaDetailVersion((version) => version + 1); setServiceAreasVersion((version) => version + 1); if (!areaIsActive) setSelectedServiceAreaId(null) }} />}
        {activePage !== 'dashboard' && activePage !== 'agenda' && activePage !== 'cells' && activePage !== 'cell-structure' && activePage !== 'studies' && activePage !== 'people' && activePage !== 'my-schedules' && activePage !== 'worship' && (activePage !== 'teams' || !selectedServiceArea) && <ModulePreview copy={pageCopy[activePage]} />}
      </main>

      {selectedAgendaEvent && <EventDetailsDialog event={selectedAgendaEvent} accessToken={session.access_token} canApprove={canApproveAgendaEvents} onClose={() => setSelectedAgendaEvent(null)} onEdit={() => { const event = selectedAgendaEvent; setSelectedAgendaEvent(null); openEventForm(event) }} onApprove={approveSelectedAgendaEvent} onCancel={cancelSelectedAgendaEvent} onAddChecklist={addSelectedAgendaChecklist} onToggleChecklist={toggleSelectedAgendaChecklist} />}
      {isNotificationsOpen && <NotificationDialog accessToken={session.access_token} onClose={() => setIsNotificationsOpen(false)} onUnreadCountChange={setUnreadNotificationCount} />}

      {isCreateEventOpen && <EventFormDialog key={eventFormDraft?.id ?? 'new-event'} event={eventFormDraft} campuses={campuses} cells={eventFormCells} areas={eventFormAreas} spaces={eventFormSpaces} isLoading={isLoadingCampuses || isLoadingEventReferences} isSaving={isSubmittingEvent} error={eventFormError} canBlockCampusAgenda={canBlockCampusAgenda} onCampusChange={setEventFormCampusId} onClose={closeEventForm} onSubmit={(input) => void saveEvent(input)} />}

      {creationMode && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeDirectoryForm}>
          <section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="directory-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={closeDirectoryForm} aria-label="Fechar">×</button>
            <p className="eyebrow">{creationMode === 'cell' ? 'Células' : 'Pessoas'}</p>
            <h2 id="directory-dialog-title">{creationMode === 'cell' ? 'Nova célula' : 'Nova pessoa'}</h2>
            <p className="dialog-description">{creationMode === 'cell' ? 'Informe o campus e, se já definido, o dia e o horário do encontro.' : 'O cadastro essencial começa com nome e campus. Os demais dados podem ser complementados depois.'}</p>
            <form className="event-form" onSubmit={saveDirectoryEntry}>
              <label>{creationMode === 'cell' ? 'Nome da célula' : 'Nome completo'}<input name="name" required placeholder={creationMode === 'cell' ? 'Ex.: Célula Esperança' : 'Ex.: Nome da pessoa'} /></label>
              {creationMode === 'cell' ? <><label>Descrição <span className="field-optional">(opcional)</span><input name="description" placeholder="Uma breve identificação da célula" /></label><div className="form-grid"><label>Dia do encontro<select name="meetingDay" defaultValue=""><option value="">Ainda não definido</option><option value="MONDAY">Segunda-feira</option><option value="TUESDAY">Terça-feira</option><option value="WEDNESDAY">Quarta-feira</option><option value="THURSDAY">Quinta-feira</option><option value="FRIDAY">Sexta-feira</option><option value="SATURDAY">Sábado</option><option value="SUNDAY">Domingo</option></select></label><label>Horário <span className="field-optional">(opcional)</span><input name="meetingTime" type="time" /></label></div></> : <><div className="form-grid"><label>Telefone <span className="field-optional">(opcional)</span><input name="phone" type="tel" placeholder="(51) 00000-0000" /></label><label>E-mail <span className="field-optional">(opcional)</span><input name="email" type="email" placeholder="pessoa@email.com" /></label></div></>}
              <label>Campus principal<select name="campusId" defaultValue="" required disabled={isLoadingCampuses || campuses.length === 0}><option value="" disabled>{isLoadingCampuses ? 'Carregando campi...' : 'Selecione o campus'}</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.nome}</option>)}</select></label>
              {creationMode === 'person' && <CampusMembershipField campuses={campuses} selectedCampusIds={[]} disabled={isLoadingCampuses} />}
              {directoryFormError && <p className="form-error" role="alert">{directoryFormError}</p>}
              <div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeDirectoryForm}>Cancelar</button><button className="primary-button" type="submit" disabled={isLoadingCampuses || campuses.length === 0 || isSubmittingDirectory}>{isSubmittingDirectory ? 'Salvando...' : creationMode === 'cell' ? 'Criar célula' : 'Cadastrar pessoa'}</button></div>
            </form>
          </section>
        </div>
      )}

      {serviceTeamArea && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeServiceTeamForm}>
          <section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="service-team-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={closeServiceTeamForm} aria-label="Fechar">×</button>
            <p className="eyebrow">{serviceTeamArea.nome}</p>
            <h2 id="service-team-dialog-title">Nova equipe</h2>
            <p className="dialog-description">Uma equipe pertence a esta área e a um campus. Depois, as pessoas poderão ser vinculadas a ela.</p>
            <form className="event-form" onSubmit={saveServiceTeam}>
              <label>Nome da equipe<input name="name" required minLength={3} placeholder="Ex.: Recepção de domingo" /></label>
              <label>Descrição <span className="field-optional">(opcional)</span><input name="description" placeholder="Uma breve identificação da equipe" /></label>
              {serviceTeamArea.scope === 'CAMPUS' && serviceTeamArea.campus ? <p className="record-detail-note">Esta área pertence ao <strong>{serviceTeamArea.campus.nome}</strong>; a equipe será criada nesse mesmo campus.</p> : <label>Campus<select name="campusId" required defaultValue="" disabled={isLoadingServiceForm || serviceFormCampuses.length === 0}><option value="" disabled>{isLoadingServiceForm ? 'Carregando campi...' : 'Selecione o campus'}</option>{serviceFormCampuses.map((campus) => <option value={campus.id} key={campus.id}>{campus.nome}</option>)}</select></label>}
              {serviceFormError && <p className="form-error" role="alert">{serviceFormError}</p>}
              <div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeServiceTeamForm}>Cancelar</button><button className="primary-button" type="submit" disabled={isLoadingServiceForm || isSavingServiceForm}>{isSavingServiceForm ? 'Criando...' : 'Criar equipe'}</button></div>
            </form>
          </section>
        </div>
      )}

      {serviceMemberArea && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeServiceMemberForm}>
          <section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="service-member-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={closeServiceMemberForm} aria-label="Fechar">×</button>
            <p className="eyebrow">{serviceMemberArea.nome}</p>
            <h2 id="service-member-dialog-title">Vincular pessoa</h2>
            <p className="dialog-description">Defina onde a pessoa servirá ou qual responsabilidade assumirá dentro desta área.</p>
            <form className="event-form" onSubmit={saveServiceMember}>
              <label>Pessoa<ServiceMemberAutocomplete people={serviceFormPeople} selectedPersonId={serviceMemberPersonId} search={serviceMemberPersonSearch} disabled={isLoadingServiceForm} onSearchChange={(value) => { setServiceMemberPersonSearch(value); setServiceMemberPersonId('') }} onSelect={(person) => { setServiceMemberPersonId(person.id); setServiceMemberPersonSearch(person.nome) }} /></label>
              <label>Função na área<select value={serviceMembershipRole} onChange={(event) => setServiceMembershipRole(event.target.value as ServiceMembershipRole)}><option value="MEMBER">Integrante</option><option value="TEAM_LEADER">Liderança de equipe</option><option value="CAMPUS_LEADER">Liderança de campus</option><option value="GENERAL_LEADER">Liderança geral</option></select></label>
              {serviceMembershipRole === 'CAMPUS_LEADER' && (serviceMemberArea.scope === 'CAMPUS' && serviceMemberArea.campus ? <p className="record-detail-note">A liderança será vinculada ao <strong>{serviceMemberArea.campus.nome}</strong>.</p> : <label>Campus<select name="campusId" required defaultValue="" disabled={isLoadingServiceForm || serviceFormCampuses.length === 0}><option value="" disabled>{isLoadingServiceForm ? 'Carregando campi...' : 'Selecione o campus'}</option>{serviceFormCampuses.map((campus) => <option value={campus.id} key={campus.id}>{campus.nome}</option>)}</select></label>)}
              {(serviceMembershipRole === 'MEMBER' || serviceMembershipRole === 'TEAM_LEADER') && <label>Equipe<select name="teamId" required defaultValue="" disabled={activeServiceMemberTeams.length === 0}><option value="" disabled>{activeServiceMemberTeams.length ? 'Selecione a equipe' : 'Crie uma equipe ativa antes'}</option>{activeServiceMemberTeams.map((team) => <option key={team.id} value={team.id}>{team.nome} · {team.campus.nome}</option>)}</select></label>}
              {(serviceMembershipRole === 'MEMBER' || serviceMembershipRole === 'TEAM_LEADER') && <ServiceFunctionsField areaName={serviceMemberArea.nome} availableFunctions={serviceMemberArea.funcoes} value={serviceMemberFunctions} onChange={setServiceMemberFunctions} disabled={isSavingServiceForm} />}
              {serviceFormError && <p className="form-error" role="alert">{serviceFormError}</p>}
              <div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeServiceMemberForm}>Cancelar</button><button className="primary-button" type="submit" disabled={isLoadingServiceForm || !serviceMemberPersonId || isSavingServiceForm}>{isSavingServiceForm ? 'Vinculando...' : 'Vincular pessoa'}</button></div>
            </form>
          </section>
        </div>
      )}

      {serviceOnboardingArea && <ServiceAreaOnboardingDialog area={serviceOnboardingArea} stages={serviceOnboardingStages} applications={serviceOnboardingApplications} people={serviceOnboardingPeople} error={serviceOnboardingError} isLoading={isLoadingServiceOnboarding} isSaving={isSavingServiceOnboarding} canManageStages={canManageServiceEntryStages} canManageApplications={canManageServiceMembers} onClose={closeServiceOnboarding} onCreateStage={createServiceEntryStage} onUpdateStage={updateServiceEntryStage} onReorderStages={(stageIds) => void reorderServiceEntryStages(stageIds)} onCreateApplication={createServiceEntryApplication} onStartApplication={(applicationId) => void startServiceEntryApplication(applicationId)} onCompleteStage={(applicationId, stageId) => void completeServiceEntryStage(applicationId, stageId)} onApproveApplication={(applicationId, teamId) => void approveServiceEntryApplication(applicationId, teamId)} onRejectApplication={rejectServiceEntryApplication} onWithdrawApplication={withdrawServiceEntryApplication} />}

      {selectedRecord && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeRecordDetail}>
          <section className={`event-dialog event-dialog--record-details ${selectedRecord.kind === 'cell' ? 'event-dialog--cell-details' : selectedRecord.kind === 'person' ? 'event-dialog--person-details' : ''}`} role="dialog" aria-modal="true" aria-labelledby="record-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={closeRecordDetail} aria-label="Fechar">×</button>
            {isLoadingRecordDetail && <p className="dialog-description">Carregando cadastro...</p>}
            {!isLoadingRecordDetail && recordDetailError && !recordDetail && <p className="form-error" role="alert">{recordDetailError}</p>}
            {!isLoadingRecordDetail && recordDetail?.kind === 'cell' && <CellDetailForm data={recordDetail.data} overview={cellOverview} campuses={campuses} isLoadingCampuses={isLoadingCampuses} canEdit={canManageDirectory} isSaving={isSavingRecord} error={recordDetailError} onCancel={closeRecordDetail} onSubmit={saveRecordDetail} onAddMember={() => openMembershipForm(recordDetail.data)} onEndMembership={endMembership} onAssignLeadership={() => openLeadershipForm(recordDetail.data, cellOverview?.memberships.map((membership) => membership.person) ?? [])} onEndLeadership={endLeadershipAssignment} onOpenRoster={openRosterForm} onOpenVisitors={openVisitorForm} onFinishMeeting={finishMeeting} />}
            {!isLoadingRecordDetail && recordDetail?.kind === 'person' && <div className="person-detail-layout"><PersonDetailForm data={recordDetail.data} campuses={campuses} isLoadingCampuses={isLoadingCampuses} canEdit={canManageDirectory} isSaving={isSavingRecord} error={recordDetailError} onCancel={closeRecordDetail} onSubmit={saveRecordDetail} /><PersonRegistrationPanel accessToken={session.access_token} person={recordDetail.data} canManageAccess={canManagePersonAccess} canManageServiceAreas={canCentrallyManageServiceAreas} onPersonChange={(person) => setRecordDetail({ kind: 'person', data: person })} onNotice={setNotice} /></div>}
          </section>
        </div>
      )}

      {membershipCell && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeMembershipForm}>
          <section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="membership-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={closeMembershipForm} aria-label="Fechar">×</button>
            <p className="eyebrow">Pessoas da célula</p>
            <h2 id="membership-dialog-title">Vincular pessoa</h2>
            <p className="dialog-description">Escolha a pessoa que passará a participar de {membershipCell.nome}.</p>
            <form className="event-form" onSubmit={saveMembership}>
              <label>Pessoa<select name="personId" required disabled={isLoadingMembershipCandidates || membershipCandidates.length === 0}><option value="" disabled>{isLoadingMembershipCandidates ? 'Carregando pessoas...' : 'Selecione uma pessoa'}</option>{membershipCandidates.map((person) => <option key={person.id} value={person.id}>{person.nome}{person.campus.nome ? ` · ${person.campus.nome}` : ''}</option>)}</select></label>
              {isTransferConfirmationNeeded && <label className="checkbox-label checkbox-label--form"><input name="confirmTransfer" type="checkbox" required /> Confirmo a transferência desta pessoa da célula atual.</label>}
              {membershipFormError && <p className="form-error" role="alert">{membershipFormError}</p>}
              <div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeMembershipForm}>Cancelar</button><button className="primary-button" type="submit" disabled={isLoadingMembershipCandidates || membershipCandidates.length === 0 || isSavingMembership}>{isSavingMembership ? 'Vinculando...' : isTransferConfirmationNeeded ? 'Transferir pessoa' : 'Vincular pessoa'}</button></div>
            </form>
          </section>
        </div>
      )}

      {leadershipCell && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeLeadershipForm}>
          <section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="leadership-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={closeLeadershipForm} aria-label="Fechar">×</button>
            <p className="eyebrow">Liderança da célula</p>
            <h2 id="leadership-dialog-title">Atribuir função</h2>
            <p className="dialog-description">Escolha uma pessoa já vinculada a {leadershipCell.nome} e defina sua função.</p>
            <form className="event-form" onSubmit={saveLeadership}>
              <label>Pessoa<LeadershipPersonAutocomplete members={leadershipCell.members} selectedPersonId={leadershipPersonId} search={leadershipSearch} onSearchChange={(value) => { setLeadershipSearch(value); setLeadershipPersonId('') }} onSelect={(person) => { setLeadershipPersonId(person.id); setLeadershipSearch(person.nome) }} /></label>
              <label>Função<select name="role" defaultValue="LEADER"><option value="LEADER">Líder da célula</option><option value="LEADER_IN_TRAINING">Líder em treinamento</option><option value="HOST">Anfitrião</option></select></label>
              {leadershipFormError && <p className="form-error" role="alert">{leadershipFormError}</p>}
              <div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeLeadershipForm}>Cancelar</button><button className="primary-button" type="submit" disabled={!leadershipPersonId || isSavingLeadership}>{isSavingLeadership ? 'Salvando...' : 'Atribuir função'}</button></div>
            </form>
          </section>
        </div>
      )}

      {rosterMeeting && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeRosterForm}>
          <section className="event-dialog event-dialog--roster" role="dialog" aria-modal="true" aria-labelledby="roster-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={closeRosterForm} aria-label="Fechar">×</button>
            <p className="eyebrow">Chamada da célula</p>
            <h2 id="roster-dialog-title">{rosterMeeting.title}</h2>
            <p className="dialog-description">Marque presença ou falta para todas as pessoas vinculadas à célula.</p>
            {isLoadingRoster ? <p className="dialog-description">Carregando chamada...</p> : <form className="event-form" onSubmit={saveRoster}><div className="roster-list">{roster.map((item) => <label className="roster-row" key={item.person.id}><span className="cell-person-symbol">{initials(item.person.nome)}</span><span>{item.person.nome}</span><select name={`presence-${item.person.id}`} defaultValue={item.attendance?.presente === false ? 'absent' : 'present'}><option value="present">Presente</option><option value="absent">Falta</option></select></label>)}</div>{rosterFormError && <p className="form-error" role="alert">{rosterFormError}</p>}<div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeRosterForm}>Cancelar</button><button className="primary-button" type="submit" disabled={roster.length === 0 || isSavingRoster}>{isSavingRoster ? 'Salvando...' : 'Salvar chamada'}</button></div></form>}
          </section>
        </div>
      )}

      {visitorMeeting && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={closeVisitorForm}>
          <section className="event-dialog event-dialog--visitors" role="dialog" aria-modal="true" aria-labelledby="visitor-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="dialog-close" type="button" onClick={closeVisitorForm} aria-label="Fechar">×</button>
            <p className="eyebrow">Visitantes da célula</p>
            <h2 id="visitor-dialog-title">{visitorMeeting.title}</h2>
            {!hasVisitorsToRegister ? <section className="visitor-question"><p>Houve visitantes neste encontro?</p><span>Se não houve, você pode seguir sem preencher nenhum dado.</span><div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeVisitorForm}>Não houve visitante</button><button className="primary-button" type="button" onClick={() => setHasVisitorsToRegister(true)}>Sim, registrar visitante</button></div></section> : <><p className="dialog-description">Registre nome e telefone. Os demais dados podem ser completados quando a pessoa passar a participar da célula.</p>{visitorSuggestion && <section className="visitor-suggestion"><strong>{visitorSuggestion.nome} participou de {visitorSuggestion.visits} encontros.</strong><p>Deseja incluir esta pessoa como participante ativo da célula?</p><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setVisitorSuggestion(null)}>Agora não</button><button className="primary-button" type="button" disabled={isConvertingVisitor} onClick={() => { const visitor = meetingVisitors.find((item) => item.id === visitorSuggestion.id); if (visitor) void convertVisitorToMember(visitor) }}>{isConvertingVisitor ? 'Incluindo...' : 'Incluir na célula'}</button></div></section>}{visitorTransfer && <section className="visitor-suggestion visitor-suggestion--transfer"><strong>{visitorTransfer.personName} já possui vínculo ativo em outra célula.</strong><p>Confirmando, o vínculo anterior será encerrado e a pessoa passará a participar desta célula.</p><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setVisitorTransfer(null)}>Cancelar</button><button className="primary-button" type="button" disabled={isConvertingVisitor} onClick={() => void confirmVisitorTransfer()}>{isConvertingVisitor ? 'Transferindo...' : 'Confirmar transferência'}</button></div></section>}{isLoadingVisitors ? <p className="dialog-description">Carregando visitantes...</p> : <><form className="event-form visitor-form" onSubmit={saveVisitor}><label>Nome completo<input name="name" required minLength={3} placeholder="Ex.: Nome da pessoa" /></label><div className="form-grid"><label>Telefone<input name="phone" type="tel" required minLength={8} placeholder="(51) 00000-0000" /></label><label>E-mail <span className="field-optional">(opcional)</span><input name="email" type="email" placeholder="pessoa@email.com" /></label></div><label>Observação <span className="field-optional">(opcional)</span><input name="observation" placeholder="Informação útil para o acompanhamento" /></label><div className="dialog-actions"><button className="primary-button" type="submit" disabled={isSavingVisitor}>{isSavingVisitor ? 'Registrando...' : 'Adicionar visitante'}</button></div></form><div className="visitor-list">{meetingVisitors.length ? meetingVisitors.map((visitor) => <article className="visitor-row" key={visitor.id}><span className="cell-person-symbol">{initials(visitor.nome)}</span><div><strong>{visitor.nome}</strong><small>{visitor.telefone || visitor.email || 'Contato não informado'} · {visitor.visitCount} {visitor.visitCount === 1 ? 'encontro' : 'encontros'}</small></div>{visitor.eligibleForMembership && !visitor.personId && <button className="secondary-button" type="button" disabled={isConvertingVisitor} onClick={() => void convertVisitorToMember(visitor)}>Incluir na célula</button>}</article>) : <p className="record-detail-note">Ainda não há visitantes registrados neste encontro.</p>}</div></>}{visitorFormError && <p className="form-error" role="alert">{visitorFormError}</p>}</>}
          </section>
        </div>
      )}
    </div>
  )
}

function LeadershipPersonAutocomplete({
  members,
  selectedPersonId,
  search,
  onSearchChange,
  onSelect,
}: {
  members: CellPersonReference[]
  selectedPersonId: string
  search: string
  onSearchChange: (value: string) => void
  onSelect: (person: CellPersonReference) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const matches = members.filter((person) => person.nome.toLocaleLowerCase('pt-BR').includes(normalizedSearch)).slice(0, 8)

  return (
    <div className="leadership-autocomplete">
      <input value={search} type="search" placeholder={members.length ? 'Pesquise pelo nome da pessoa' : 'Não há pessoas vinculadas'} disabled={members.length === 0} autoComplete="off" role="combobox" aria-expanded={isOpen} aria-controls="leadership-person-options" onFocus={() => setIsOpen(true)} onChange={(event) => { onSearchChange(event.target.value); setIsOpen(true) }} onBlur={() => setIsOpen(false)} />
      {isOpen && members.length > 0 && <div className="leadership-autocomplete-list" id="leadership-person-options" role="listbox">{matches.length ? matches.map((person) => <button className={`leadership-autocomplete-option ${selectedPersonId === person.id ? 'leadership-autocomplete-option--selected' : ''}`} key={person.id} type="button" role="option" aria-selected={selectedPersonId === person.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { onSelect(person); setIsOpen(false) }}><span className="cell-person-symbol">{initials(person.nome)}</span><span><strong>{person.nome}</strong>{(person.telefone || person.email) && <small>{person.telefone || person.email}</small>}</span></button>) : <p className="leadership-autocomplete-empty">Nenhuma pessoa vinculada encontrada.</p>}</div>}
    </div>
  )
}

function ServiceMemberAutocomplete({
  people,
  selectedPersonId,
  search,
  disabled,
  onSearchChange,
  onSelect,
}: {
  people: PersonListItem[]
  selectedPersonId: string
  search: string
  disabled: boolean
  onSearchChange: (value: string) => void
  onSelect: (person: PersonListItem) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const matches = people.filter((person) => person.nome.toLocaleLowerCase('pt-BR').includes(normalizedSearch)).slice(0, 8)

  return <div className="leadership-autocomplete">
    <input value={search} type="search" placeholder={disabled ? 'Carregando pessoas...' : people.length ? 'Pesquise pelo nome da pessoa' : 'Não há pessoas ativas'} disabled={disabled || people.length === 0} autoComplete="off" role="combobox" aria-expanded={isOpen} aria-controls="service-member-person-options" onFocus={() => setIsOpen(true)} onChange={(event) => { onSearchChange(event.target.value); setIsOpen(true) }} onBlur={() => setIsOpen(false)} />
    {isOpen && people.length > 0 && <div className="leadership-autocomplete-list" id="service-member-person-options" role="listbox">{matches.length ? matches.map((person) => <button className={`leadership-autocomplete-option ${selectedPersonId === person.id ? 'leadership-autocomplete-option--selected' : ''}`} key={person.id} type="button" role="option" aria-selected={selectedPersonId === person.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { onSelect(person); setIsOpen(false) }}><span className="cell-person-symbol">{initials(person.nome)}</span><span><strong>{person.nome}</strong><small>{person.campus.nome}{person.telefone || person.email ? ` · ${person.telefone || person.email}` : ''}</small></span></button>) : <p className="leadership-autocomplete-empty">Nenhuma pessoa ativa encontrada.</p>}</div>}
  </div>
}

function StudiesPage({
  canManage,
  study,
  error,
  isLoading,
  weekStart,
  isSubmitting,
  onWeekStartChange,
  onPublish,
  onDownload,
}: {
  canManage: boolean
  study: CellStudy | null
  error: string
  isLoading: boolean
  weekStart: string
  isSubmitting: boolean
  onWeekStartChange: (value: string) => void
  onPublish: (event: FormEvent<HTMLFormElement>) => void
  onDownload: () => void
}) {
  const weekLabel = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${weekStart}T12:00:00`))

  return (
    <div className="records-page studies-page">
      <section className="studies-intro">
        <div>
          <p className="eyebrow">Estudo semanal</p>
          <h2>{canManage ? 'Publicação para a organização' : 'Seu estudo desta semana'}</h2>
          <p>{canManage ? 'O mesmo estudo será disponibilizado para os membros de todas as células da organização.' : 'O estudo aparece aqui após o registro do encontro da semana anterior ser concluído.'}</p>
        </div>
        {canManage && <label className="study-week-picker">Semana de início<input type="date" value={weekStart} onChange={(event) => onWeekStartChange(toDateInputValue(startOfWeek(new Date(`${event.target.value}T12:00:00`))))} /></label>}
      </section>

      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading && <p className="records-empty">Carregando estudo...</p>}

      {!isLoading && study && (
        <article className="study-card">
          <span className="study-card-icon">◆</span>
          <div className="study-card-copy">
            <p className="eyebrow">{canManage ? `Publicado para a semana de ${weekLabel}` : 'Disponível para sua célula'}</p>
            <h3>{study.titulo}</h3>
            {study.descricao && <p>{study.descricao}</p>}
            <small>Anexo: {study.attachmentName}</small>
          </div>
          {!canManage && <button className="primary-button" type="button" onClick={onDownload}>Baixar anexo</button>}
        </article>
      )}

      {!isLoading && !study && !error && !canManage && <p className="records-empty">O estudo desta semana ainda não está disponível.</p>}

      {canManage && !study && !isLoading && (
        <section className="study-publish-card">
          <div>
            <p className="eyebrow">Semana de {weekLabel}</p>
            <h3>Publicar estudo semanal</h3>
            <p>Envie o material que ficará disponível para todas as células nesta semana.</p>
          </div>
          <form className="event-form" onSubmit={onPublish}>
            <label>Título do estudo<input name="title" required placeholder="Ex.: Vivendo em comunhão" /></label>
            <label>Descrição <span className="field-optional">(opcional)</span><input name="description" placeholder="Uma breve orientação para os líderes" /></label>
            <label>Anexo do estudo<input name="file" type="file" required /></label>
            <div className="study-form-actions"><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Publicando...' : 'Publicar estudo'}</button></div>
          </form>
        </section>
      )}

      {canManage && study && <p className="record-detail-note">Já existe um estudo publicado para esta semana. Para preservar uma única versão válida, uma nova publicação não é permitida.</p>}
    </div>
  )
}

function Dashboard({
  summary,
  error,
  isLoading,
  onRetry,
  onOpenAgenda,
  onOpenCells,
}: {
  summary: DashboardSummary | null
  error: string
  isLoading: boolean
  onRetry: () => void
  onOpenAgenda: () => void
  onOpenCells: () => void
}) {
  const campusData = summary?.cellsByCampus ?? []
  const eventData = summary?.weekEvents.slice(0, 3) ?? []
  const largestCampusTotal = Math.max(...campusData.map((item) => item.total), 1)
  const displayValue = (value: number | undefined) => value === undefined ? (isLoading ? '…' : '—') : value.toLocaleString('pt-BR')

  return (
    <div className="dashboard-layout">
      {error && <div className="dashboard-feedback" role="alert"><span>!</span><p>{error}</p><button type="button" onClick={onRetry}>Tentar novamente</button></div>}
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
        <article className="stat-card"><div className="stat-icon stat-icon--blue">◎</div><div><p>Células ativas</p><strong>{displayValue(summary?.activeCells)}</strong><span className="stat-up">Dados da organização</span></div></article>
        <article className="stat-card"><div className="stat-icon stat-icon--orange">◉</div><div><p>Pessoas cadastradas</p><strong>{displayValue(summary?.peopleTotal)}</strong><span className="stat-up">Dados da organização</span></div></article>
        <article className="stat-card"><div className="stat-icon stat-icon--green">◇</div><div><p>Eventos nesta semana</p><strong>{displayValue(summary?.weekEvents.length)}</strong><span className="stat-up">Agenda compartilhada</span></div></article>
        <article className="stat-card stat-card--attention"><div className="stat-icon stat-icon--red">!</div><div><p>Solicitações pendentes</p><strong>{displayValue(summary?.requestedEvents)}</strong><button type="button" onClick={onOpenAgenda}>Ver agenda →</button></div></article>
      </section>

      <section className="content-grid">
        <article className="panel panel--chart">
          <div className="panel-heading"><div><p className="eyebrow">Células ativas</p><h2>Distribuição por campus</h2></div><button className="date-button" type="button" onClick={onOpenCells}>Ver células <span>→</span></button></div>
          <div className="chart-summary"><strong>{displayValue(summary?.activeCells)}</strong><span className="stat-up"><small>células em status ativo</small></span></div>
          <div className="bar-chart" aria-label="Células ativas por campus">
            {campusData.length > 0
              ? campusData.slice(0, 7).map((item) => <div className="bar-column" key={item.campus}><div className="bar bar--active" style={{ height: `${Math.max(14, (item.total / largestCampusTotal) * 100)}%` }}><span>{item.total}</span></div><small>{shortCampusLabel(item.campus)}</small></div>)
              : <p className="chart-empty">{isLoading ? 'Carregando células...' : 'Ainda não há células ativas para exibir.'}</p>}
          </div>
        </article>

        <article className="panel panel--insights">
          <div className="panel-heading"><div><p className="eyebrow">Atenção operacional</p><h2>Para olhar com carinho</h2></div><button className="more-button" type="button" onClick={onOpenAgenda}>→</button></div>
          <div className="insight-list">
            <button type="button" className="insight-row" onClick={onOpenAgenda}><span className="insight-dot insight-dot--red" /><span><strong>{displayValue(summary?.requestedEvents)} solicitações aguardam na agenda</strong><small>Confira os eventos que ainda precisam de aprovação.</small></span><b>→</b></button>
            <button type="button" className="insight-row" onClick={onOpenCells}><span className="insight-dot insight-dot--orange" /><span><strong>{displayValue(summary?.inactiveCells)} células estão fora do status ativo</strong><small>Revise planejamentos, pausas ou encerramentos quando necessário.</small></span><b>→</b></button>
            <button type="button" className="insight-row" onClick={onOpenAgenda}><span className="insight-dot insight-dot--blue" /><span><strong>{displayValue(summary?.weekEvents.length)} eventos previstos nesta semana</strong><small>Acompanhe a agenda compartilhada da organização.</small></span><b>→</b></button>
          </div>
        </article>
      </section>

      <section className="panel panel--agenda">
        <div className="panel-heading"><div><p className="eyebrow">Agenda compartilhada</p><h2>Próximos acontecimentos</h2></div><button className="text-button" type="button" onClick={onOpenAgenda}>Ver agenda completa →</button></div>
        <div className="event-list">
          {eventData.length > 0
            ? eventData.map((event, index) => <DashboardEventRow event={event} index={index} key={event.id} />)
            : <p className="event-empty">{isLoading ? 'Carregando os próximos eventos...' : 'Não há eventos previstos para esta semana.'}</p>}
        </div>
      </section>
    </div>
  )
}

function DashboardEventRow({ event, index }: { event: AgendaEvent; index: number }) {
  const date = new Date(event.inicio)
  const tone = ['blue', 'orange', 'green', 'purple'][index % 4]
  const day = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '').toUpperCase()
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)

  return <article className="event-row"><div className="event-date"><strong>{date.getDate()}</strong><small>{day}</small></div><div className={`event-tone event-tone--${tone}`} /><div className="event-information"><div><p>{time}</p><h3>{event.titulo}</h3></div><span>{event.cell ? `${event.campus.nome} · ${event.cell.nome}` : event.campus.nome}</span></div><span className={`event-tag event-tag--${tone}`}>{eventLabel(event)}</span><span className="row-more" aria-hidden="true">›</span></article>
}

function shortCampusLabel(campus: string) {
  return campus.replace(/^Campus\s+/i, '').slice(0, 10)
}

function eventLabel(event: AgendaEvent) {
  if (event.status === 'REQUESTED') return 'Pendente'
  const labels: Record<string, string> = {
    WORSHIP: 'Culto',
    CELL: 'Célula',
    TRAINING: 'Formação',
    CONFERENCE: 'Conferência',
  }
  return labels[event.type] ?? 'Evento'
}

function CellsPage({ data, error, isLoading, onRetry, onSelect }: { data: Paginated<CellListItem> | null; error: string; isLoading: boolean; onRetry: () => void; onSelect: (id: string) => void }) {
  return (
    <section className="records-page">
      <div className="records-heading"><div><p className="eyebrow">Células</p><h2>Células da organização</h2><p>Veja as células, o campus e o dia de encontro de cada uma.</p></div><span className="records-total">{data ? `${data.meta.total} registradas` : isLoading ? 'Carregando...' : 'Sem dados'}</span></div>
      {error && <PageFeedback message={error} onRetry={onRetry} />}
      <div className="records-panel">
        {data?.data.length ? data.data.map((cell) => <button className="record-row" type="button" key={cell.id} onClick={() => onSelect(cell.id)} aria-label={`Ver cadastro da célula ${cell.nome}`}><div className="record-symbol record-symbol--cell">◎</div><div className="record-main"><strong>{cell.nome}</strong><small>{cell.descricao || 'Sem descrição cadastrada'}</small></div><div className="record-detail"><span>Campus</span><strong>{cell.campus.nome}</strong></div><div className="record-detail"><span>Encontro</span><strong>{formatMeeting(cell.meetingDay, cell.meetingTime)}</strong></div><span className={`record-status ${cell.ativo && cell.status === 'ACTIVE' ? 'record-status--active' : ''}`}>{!cell.ativo ? 'Inativa' : cell.status === 'ACTIVE' ? 'Ativa' : cellStatusLabel(cell.status)}</span><span className="record-arrow" aria-hidden="true">›</span></button>) : <EmptyRecords isLoading={isLoading} label="Ainda não há células cadastradas." />}
      </div>
    </section>
  )
}

function PeoplePage({ data, error, isLoading, onRetry, onSelect }: { data: Paginated<PersonListItem> | null; error: string; isLoading: boolean; onRetry: () => void; onSelect: (id: string) => void }) {
  return (
    <section className="records-page">
      <div className="records-heading"><div><p className="eyebrow">Pessoas</p><h2>Pessoas da organização</h2><p>Cadastros vinculados aos campi da organização atual.</p></div><span className="records-total">{data ? `${data.meta.total} cadastradas` : isLoading ? 'Carregando...' : 'Sem dados'}</span></div>
      {error && <PageFeedback message={error} onRetry={onRetry} />}
      <div className="records-panel">
        {data?.data.length ? data.data.map((person) => <button className="record-row" type="button" key={person.id} onClick={() => onSelect(person.id)} aria-label={`Ver cadastro de ${person.nome}`}><div className="record-symbol record-symbol--person">{initials(person.nome)}</div><div className="record-main"><strong>{person.nome}</strong><small>{person.email || person.telefone || 'Sem contato cadastrado'}</small></div><div className="record-detail"><span>Campus</span><strong>{person.campus.nome}</strong></div><div className="record-detail"><span>Telefone</span><strong>{person.telefone || 'Não informado'}</strong></div><span className={`record-status ${person.ativo ? 'record-status--active' : ''}`}>{person.ativo ? 'Ativa' : 'Inativa'}</span><span className="record-arrow" aria-hidden="true">›</span></button>) : <EmptyRecords isLoading={isLoading} label="Ainda não há pessoas cadastradas." />}
      </div>
    </section>
  )
}

type DetailFormProps = {
  campuses: CampusListItem[]
  isLoadingCampuses: boolean
  canEdit: boolean
  isSaving: boolean
  error: string
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

type CellDetailsTab = 'registration' | 'leadership' | 'people' | 'meetings'

function CellDetailForm({ data, overview, campuses, isLoadingCampuses, canEdit, isSaving, error, onCancel, onSubmit, onAddMember, onEndMembership, onAssignLeadership, onEndLeadership, onOpenRoster, onOpenVisitors, onFinishMeeting }: DetailFormProps & { data: CellListItem; overview: CellOverview | null; onAddMember: () => void; onEndMembership: (membershipId: string, personName: string) => void; onAssignLeadership: () => void; onEndLeadership: (id: string, type: 'leadership' | 'support', personName: string) => void; onOpenRoster: (meetingId: string, title: string) => void; onOpenVisitors: (meetingId: string, title: string, cellId: string) => void; onFinishMeeting: (meetingId: string) => void }) {
  const [activeTab, setActiveTab] = useState<CellDetailsTab>('registration')
  const tabs: Array<{ id: CellDetailsTab; label: string; count?: number }> = [
    { id: 'registration', label: 'Cadastro' },
    { id: 'leadership', label: 'Liderança', count: (overview?.leaderships.length ?? 0) + (overview?.supportRoles.length ?? 0) },
    { id: 'people', label: 'Pessoas', count: overview?.summary.activeMembers ?? 0 },
    { id: 'meetings', label: 'Encontros', count: overview?.meetings.length ?? 0 },
  ]

  return (
    <form className="event-form cell-detail-form" onSubmit={canEdit && activeTab === 'registration' ? onSubmit : undefined}>
      <div className="cell-detail-heading"><div><p className="eyebrow">Células</p><h2 id="record-dialog-title">{data.nome}</h2><p className="dialog-description">Visão operacional, pessoas e histórico recente da célula.</p></div><span className={`record-status ${data.ativo && data.status === 'ACTIVE' ? 'record-status--active' : ''}`}>{data.ativo ? 'Ativa' : 'Inativa'}</span></div>
      <div className="cell-summary-strip"><span><b>{overview?.summary.activeMembers ?? '—'}</b> pessoas ativas</span><span><b>{(overview?.leaderships.length ?? 0) + (overview?.supportRoles.length ?? 0)}</b> na liderança</span><span><b>{overview?.summary.multiplicationCount ?? '—'}</b> multiplicações</span></div>
      <nav className="cell-detail-tabs" aria-label="Seções da célula">{tabs.map((tab) => <button className={activeTab === tab.id ? 'cell-detail-tab cell-detail-tab--active' : 'cell-detail-tab'} type="button" key={tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}{tab.count !== undefined && <span>{tab.count}</span>}</button>)}</nav>

      {activeTab === 'registration' && <><label>Nome da célula<input name="name" required defaultValue={data.nome} disabled={!canEdit} /></label><label>Descrição <span className="field-optional">(opcional)</span><input name="description" defaultValue={data.descricao ?? ''} disabled={!canEdit} /></label><div className="form-grid"><label>Dia do encontro<select name="meetingDay" defaultValue={data.meetingDay ?? ''} disabled={!canEdit}><option value="">Ainda não definido</option><option value="MONDAY">Segunda-feira</option><option value="TUESDAY">Terça-feira</option><option value="WEDNESDAY">Quarta-feira</option><option value="THURSDAY">Quinta-feira</option><option value="FRIDAY">Sexta-feira</option><option value="SATURDAY">Sábado</option><option value="SUNDAY">Domingo</option></select></label><label>Horário <span className="field-optional">(opcional)</span><input name="meetingTime" type="time" defaultValue={data.meetingTime ?? ''} disabled={!canEdit} /></label></div><label>Campus<select name="campusId" defaultValue={data.campus.id} required disabled={!canEdit || isLoadingCampuses || campuses.length === 0}><option value={data.campus.id}>{isLoadingCampuses ? 'Carregando campi...' : data.campus.nome}</option>{campuses.filter((campus) => campus.id !== data.campus.id).map((campus) => <option key={campus.id} value={campus.id}>{campus.nome}</option>)}</select></label><label>Situação atual<select name="ativo" defaultValue={data.ativo ? 'true' : 'false'} disabled={!canEdit}><option value="true">Ativa</option><option value="false">Inativa</option></select></label><p className="record-detail-note">Uma célula inativa deixa de aparecer como ativa nos indicadores, mas seu histórico é preservado.</p>{overview?.summary.lastMultiplicationAt && <p className="record-detail-note">Última multiplicação: <strong>{formatShortDate(overview.summary.lastMultiplicationAt)}</strong>.</p>}{!canEdit && <p className="dialog-description">Seu perfil pode consultar este cadastro, mas não alterá-lo.</p>}{error && <p className="form-error" role="alert">{error}</p>}<DetailActions canEdit={canEdit} isSaving={isSaving} onCancel={onCancel} saveLabel="Salvar alterações" /></>}

      {activeTab === 'leadership' && <CellLeadershipPanel overview={overview} canEdit={canEdit} onAssign={onAssignLeadership} onEndAssignment={onEndLeadership} />}
      {activeTab === 'people' && <CellPeoplePanel overview={overview} canEdit={canEdit} onAddMember={onAddMember} onEndMembership={onEndMembership} />}
      {activeTab === 'meetings' && <CellMeetingsPanel overview={overview} canEdit={canEdit} onOpenRoster={onOpenRoster} onOpenVisitors={onOpenVisitors} onFinishMeeting={onFinishMeeting} />}
    </form>
  )
}

function CellLeadershipPanel({ overview, canEdit, onAssign, onEndAssignment }: { overview: CellOverview | null; canEdit: boolean; onAssign: () => void; onEndAssignment: (id: string, type: 'leadership' | 'support', personName: string) => void }) {
  const leaders = overview?.leaderships.map((item) => ({ id: item.id, person: item.person, type: 'leadership' as const })) ?? []
  const trainees = overview?.supportRoles.filter((item) => item.role === 'LEADER_IN_TRAINING').map((item) => ({ id: item.id, person: item.person, type: 'support' as const })) ?? []
  const hosts = overview?.supportRoles.filter((item) => item.role === 'HOST').map((item) => ({ id: item.id, person: item.person, type: 'support' as const })) ?? []

  return <section className="cell-tab-panel"><div className="cell-tab-toolbar"><p className="dialog-description">A cadeia de cuidado desta célula, desde o campus até suas funções internas.</p>{canEdit && <button className="secondary-button" type="button" onClick={onAssign}>+ Atribuir função</button>}</div><div className="cell-hierarchy"><CellHierarchyNode label="Coordenação de células" description={`Campus ${overview?.cell.campus.nome ?? ''}`} people={overview?.coordinations.map((item) => ({ id: item.id, person: item.person, type: 'coordination' as const })) ?? []} /><CellHierarchyNode label="Supervisão" description={overview?.cell.network ? `Rede ${overview.cell.network.nome}` : 'Rede ainda não definida'} people={overview?.supervisions.map((item) => ({ id: item.id, person: item.person, type: 'supervision' as const })) ?? []} /><CellHierarchyNode label="Rede" value={overview?.cell.network?.nome ?? null} /><CellHierarchyNode label="Líder da célula" people={leaders} canEnd={canEdit} onEndAssignment={onEndAssignment} /><CellHierarchyNode label="Líder em treinamento" people={trainees} canEnd={canEdit} onEndAssignment={onEndAssignment} /><CellHierarchyNode label="Anfitrião" people={hosts} canEnd={canEdit} onEndAssignment={onEndAssignment} last /></div></section>
}

function CellHierarchyNode({ label, description, value, people, canEnd = false, onEndAssignment, last = false }: { label: string; description?: string; value?: string | null; people?: Array<{ id: string; person: CellPersonReference; type: 'leadership' | 'support' | 'coordination' | 'supervision' }>; canEnd?: boolean; onEndAssignment?: (id: string, type: 'leadership' | 'support', personName: string) => void; last?: boolean }) {
  const hasPeople = Boolean(people?.length)
  return <article className={last ? 'cell-hierarchy-node cell-hierarchy-node--last' : 'cell-hierarchy-node'}><span className="cell-hierarchy-line" aria-hidden="true" /><div><strong>{label}</strong>{description && <small>{description}</small>}{value ? <p>{value}</p> : hasPeople ? <div className="cell-hierarchy-people">{people?.map((assignment) => <span key={assignment.id}>{assignment.person.nome}{canEnd && (assignment.type === 'leadership' || assignment.type === 'support') && <button type="button" onClick={() => onEndAssignment?.(assignment.id, assignment.type as 'leadership' | 'support', assignment.person.nome)} aria-label={`Encerrar função de ${assignment.person.nome}`}>×</button>}</span>)}</div> : <p className="cell-hierarchy-empty">Não definido</p>}</div></article>
}

function CellPeoplePanel({ overview, canEdit, onAddMember, onEndMembership }: { overview: CellOverview | null; canEdit: boolean; onAddMember: () => void; onEndMembership: (membershipId: string, personName: string) => void }) {
  const people = overview?.memberships ?? []
  return <section className="cell-tab-panel"><div className="cell-tab-toolbar"><p className="dialog-description">Pessoas com membresia ativa nesta célula.</p>{canEdit && <button className="secondary-button" type="button" onClick={onAddMember}>+ Vincular pessoa</button>}</div>{people.length ? <div className="cell-data-list">{people.map((item) => <article className="cell-data-row cell-data-row--member" key={item.id}><span className="cell-person-symbol">{initials(item.person.nome)}</span><div><strong>{item.person.nome}</strong><small>Na célula desde {formatShortDate(item.inicio)}</small></div><span>{item.person.telefone || item.person.email || 'Contato não informado'}</span>{canEdit && <button className="member-end-button" type="button" onClick={() => onEndMembership(item.id, item.person.nome)}>Remover</button>}</article>)}</div> : <CellPanelEmpty message="Ainda não há pessoas vinculadas a esta célula." />}</section>
}

function CellMeetingsPanel({ overview, canEdit, onOpenRoster, onOpenVisitors, onFinishMeeting }: { overview: CellOverview | null; canEdit: boolean; onOpenRoster: (meetingId: string, title: string) => void; onOpenVisitors: (meetingId: string, title: string, cellId: string) => void; onFinishMeeting: (meetingId: string) => void }) {
  const meetings = overview?.meetings ?? []
  const memberCount = overview?.summary.activeMembers ?? 0
  const availabilityMessage = !overview?.summary.meetingScheduleConfigured
    ? 'Defina o dia e o horário do encontro no cadastro para gerar o registro semanal.'
    : 'O registro semanal é gerado automaticamente a partir da agenda da célula.'
  return <section className="cell-tab-panel"><p className="record-detail-note">{availabilityMessage}</p>{meetings.length ? <div className="cell-data-list">{meetings.map((item) => <article className="cell-data-row cell-data-row--meeting" key={item.id}><span className="cell-meeting-date"><b>{new Date(item.data).getDate()}</b><small>{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(item.data)).replace('.', '').toUpperCase()}</small></span><div><strong>{item.tema || 'Encontro de célula'}</strong><small>{item._count.attendances} chamadas preenchidas · {item.visitantes} visitantes</small></div><span className={item.registroConcluidoEm ? 'meeting-status meeting-status--complete' : 'meeting-status'}>{item.registroConcluidoEm ? 'Concluído' : 'Pendente'}</span>{canEdit && !item.registroConcluidoEm && <span className="meeting-actions"><button type="button" onClick={() => onOpenVisitors(item.id, item.tema || 'Visitantes do encontro', overview?.cell.id ?? '')}>Visitantes</button><button type="button" onClick={() => onOpenRoster(item.id, item.tema || 'Chamada do encontro')}>Chamada</button>{memberCount > 0 && item._count.attendances >= memberCount && <button type="button" onClick={() => onFinishMeeting(item.id)}>Concluir</button>}</span>}</article>)}</div> : <CellPanelEmpty message="Ainda não há encontros disponíveis para esta célula." />}</section>
}

function CellPanelEmpty({ message }: { message: string }) {
  return <p className="cell-panel-empty">{message}</p>
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)).replace('.', '')
}

function PersonDetailForm({ data, campuses, isLoadingCampuses, canEdit, isSaving, error, onCancel, onSubmit }: DetailFormProps & { data: PersonListItem }) {
  return (
    <form className="event-form" onSubmit={canEdit ? onSubmit : undefined}>
      <p className="eyebrow">Pessoas</p>
      <h2 id="record-dialog-title">Cadastro da pessoa</h2>
      <p className="dialog-description">Mantenha os dados de contato, o campus principal e os demais vínculos sempre atualizados.</p>
      <label>Nome completo<input name="name" required defaultValue={data.nome} disabled={!canEdit} /></label>
      <div className="form-grid"><label>Telefone <span className="field-optional">(opcional)</span><input name="phone" type="tel" defaultValue={data.telefone ?? ''} disabled={!canEdit} /></label><label>E-mail <span className="field-optional">(opcional)</span><input name="email" type="email" defaultValue={data.email ?? ''} disabled={!canEdit} /></label></div>
      <label>Campus principal<select name="campusId" defaultValue={data.campus.id} required disabled={!canEdit || isLoadingCampuses || campuses.length === 0}><option value={data.campus.id}>{isLoadingCampuses ? 'Carregando campi...' : data.campus.nome}</option>{campuses.filter((campus) => campus.id !== data.campus.id).map((campus) => <option key={campus.id} value={campus.id}>{campus.nome}</option>)}</select></label>
      <CampusMembershipField campuses={campuses} selectedCampusIds={data.campusMemberships?.map((membership) => membership.campusId) ?? [data.campus.id]} disabled={!canEdit || isLoadingCampuses} />
      <p className="record-detail-note">Status atual: <strong>{data.ativo ? 'Ativa' : 'Inativa'}</strong></p>
      {!canEdit && <p className="dialog-description">Seu perfil pode consultar este cadastro, mas não alterá-lo.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <DetailActions canEdit={canEdit} isSaving={isSaving} onCancel={onCancel} saveLabel="Salvar alterações" />
    </form>
  )
}

function CampusMembershipField({ campuses, selectedCampusIds, disabled }: { campuses: CampusListItem[]; selectedCampusIds: string[]; disabled: boolean }) {
  if (campuses.length < 2) return null
  return <fieldset className="campus-membership-field" disabled={disabled}><legend>Campi vinculados</legend><p>Marque todos os campi em que esta pessoa pode atuar. O login continua único para toda a organização.</p><div>{campuses.map((campus) => <label key={campus.id}><input type="checkbox" name="campusIds" value={campus.id} defaultChecked={selectedCampusIds.includes(campus.id)} /><span>{campus.nome}</span></label>)}</div></fieldset>
}

function DetailActions({ canEdit, isSaving, onCancel, saveLabel }: { canEdit: boolean; isSaving: boolean; onCancel: () => void; saveLabel: string }) {
  return <div className="dialog-actions"><button className="secondary-button" type="button" onClick={onCancel}>{canEdit ? 'Cancelar' : 'Fechar'}</button>{canEdit && <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : saveLabel}</button>}</div>
}

function PageFeedback({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="dashboard-feedback" role="alert"><span>!</span><p>{message}</p><button type="button" onClick={onRetry}>Tentar novamente</button></div>
}

function EmptyRecords({ isLoading, label }: { isLoading: boolean; label: string }) {
  return <p className="records-empty">{isLoading ? 'Carregando dados da organização...' : label}</p>
}

function formatMeeting(day: string | null, time: string | null) {
  if (!day) return 'Não informado'
  const labels: Record<string, string> = {
    MONDAY: 'Segunda-feira',
    TUESDAY: 'Terça-feira',
    WEDNESDAY: 'Quarta-feira',
    THURSDAY: 'Quinta-feira',
    FRIDAY: 'Sexta-feira',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
  }
  return `${labels[day] ?? day}${time ? ` · ${time}` : ''}`
}

function cellStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PLANNING: 'Planejamento',
    MULTIPLIED: 'Multiplicada',
    PAUSED: 'Pausada',
    CLOSED: 'Encerrada',
  }
  return labels[status] ?? status
}

function Agenda({
  events,
  error,
  isLoading,
  weekStart,
  onRetry,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onCreateEvent,
  onSelectEvent,
}: {
  events: AgendaEvent[]
  error: string
  isLoading: boolean
  weekStart: Date
  onRetry: () => void
  onPreviousWeek: () => void
  onNextWeek: () => void
  onToday: () => void
  onCreateEvent: () => void
  onSelectEvent: (event: AgendaEvent) => void
}) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const today = new Date()

  return (
    <div className="agenda-page">
      <section className="agenda-toolbar"><div className="agenda-navigation"><button type="button" onClick={onPreviousWeek} aria-label="Semana anterior">←</button><strong>{weekLabel(weekStart)}</strong><button type="button" onClick={onNextWeek} aria-label="Próxima semana">→</button></div><div><button type="button" className="secondary-button" onClick={onToday}>Hoje</button><button type="button" className="primary-button" onClick={onCreateEvent}>+ Novo evento</button></div></section>
      {error && <PageFeedback message={error} onRetry={onRetry} />}
      <section className="agenda-board"><div className="agenda-weekdays">{days.map((day) => <span className={isSameDay(day, today) ? 'agenda-today' : ''} key={day.toISOString()}>{new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day).replace('.', '').toUpperCase()} <b>{day.getDate()}</b></span>)}</div><div className="agenda-grid"><div className="time-column"><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span></div><div className="agenda-events">{events.map((event, index) => <AgendaEventCard event={event} index={index} weekStart={weekStart} onSelect={onSelectEvent} key={event.id} />)}{events.length === 0 && <p className="agenda-empty">{isLoading ? 'Carregando eventos...' : 'Não há eventos nesta semana.'}</p>}</div></div></section>
      <section className="agenda-note"><span>◈</span><p><strong>Calendário institucional compartilhado.</strong> Eventos aprovados são sincronizados automaticamente com o Google Calendar quando a integração estiver ativa.</p></section>
    </div>
  )
}

function AgendaEventCard({ event, index, weekStart, onSelect }: { event: AgendaEvent; index: number; weekStart: Date; onSelect: (event: AgendaEvent) => void }) {
  const start = new Date(event.inicio)
  const end = new Date(event.fim)
  const tone = ['blue', 'orange', 'green', 'purple'][index % 4]
  const top = Math.max(0, Math.min(450, ((start.getHours() * 60 + start.getMinutes() - 8 * 60) / 60) * 34.5))
  const duration = Math.max(38, Math.min(118, ((end.getTime() - start.getTime()) / 3_600_000) * 34.5))
  const dayIndex = Math.max(0, Math.min(6, Math.round((startOfWeek(start).getTime() - weekStart.getTime()) / 86_400_000)))
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(start)
  const endTime = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(end)

  return <button className={`calendar-event calendar-event--${tone}`} type="button" aria-label={`Consultar escalas de ${event.titulo}`} onClick={() => onSelect(event)} style={{ left: `calc(${(dayIndex * 100) / 7}% + 3px)`, top, height: duration, width: 'calc(14.285% - 6px)' }}><small>{time} — {endTime}</small><strong>{event.titulo}</strong><span>{event.cell?.nome ?? event.campus.nome}</span></button>
}

function weekLabel(weekStart: Date) {
  const end = addDays(weekStart, 6)
  const formatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' })
  return `${formatter.format(weekStart)} — ${formatter.format(end)}`
}

function isSameDay(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate()
}

function ModulePreview({ copy }: { copy: { eyebrow: string; title: string; description: string } }) {
  return <section className="module-preview"><div className="module-preview-icon">✦</div><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p>{copy.description}</p><button className="primary-button" type="button">Começar configuração <span>→</span></button></section>
}

function CellDirectoryRestricted() {
  return <section className="module-preview"><div className="module-preview-icon">🔒</div><p className="eyebrow">Células</p><h2>Acesso restrito</h2><p>O cadastro de células é destinado a secretários, administradores e super administradores.</p></section>
}

export default App
