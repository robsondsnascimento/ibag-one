export type AuthUser = {
  id: string;
  loginEmail: string;
  personId: string;
  organizationId: string;
  role: string;
  additionalRoles: string[];
  person: {
    id: string;
    nome: string;
    campusId: string;
    campus: { nome: string };
    campusMemberships: Array<{ campusId: string; campus: { id: string; nome: string } }>;
  };
  organization: { id: string; nome: string };
};

export type AuthSession = {
  access_token: string;
  user: AuthUser;
};

export type ServiceSchedule = {
  id: string;
  data: string;
  funcao: string;
  observacao: string | null;
  status: 'SCHEDULED' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';
  team: { id: string; nome: string; serviceArea: { id: string; nome: string }; campus: { id: string; nome: string } };
  event: { id: string; titulo: string; inicio: string; fim: string } | null;
};

export type AgendaEvent = {
  id: string;
  titulo: string;
  descricao: string | null;
  inicio: string;
  fim: string;
  status: string;
  type: string;
  campus: { id: string; nome: string };
  serviceAreas: Array<{ serviceArea: { id: string; nome: string } }>;
};

export type CellMembership = {
  id: string;
  inicio: string;
  cell: {
    id: string;
    nome: string;
    descricao: string | null;
    ativo: boolean;
    status: string;
    meetingDay: string | null;
    meetingTime: string | null;
    campus: { id: string; nome: string };
  };
};

export type CellStudy = {
  id: string;
  titulo: string;
  descricao: string | null;
  weekStart: string;
  attachmentName: string;
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');

type RequestOptions = RequestInit & { accessToken?: string };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      ...(options.accessToken ? { authorization: `Bearer ${options.accessToken}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) throw new ApiError(await errorMessage(response), response.status);
  return response.json() as Promise<T>;
}

export function login(username: string, password: string) {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ loginEmail: username, password }),
  });
}

export function validateSession(accessToken: string) {
  return apiRequest<{ userId: string; personId: string; organizationId: string }>('/auth/me', { accessToken });
}

export function listMySchedules(accessToken: string) {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  const end = new Date();
  end.setDate(end.getDate() + 90);
  return apiRequest<ServiceSchedule[]>(`/service-areas/schedules/me?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`, { accessToken });
}

export function updateMyScheduleStatus(accessToken: string, scheduleId: string, status: 'CONFIRMED' | 'DECLINED') {
  return apiRequest<ServiceSchedule>(`/service-areas/schedules/${scheduleId}/status`, {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export function listAgendaEvents(accessToken: string) {
  const start = new Date();
  start.setDate(start.getDate() - 1);
  const end = new Date();
  end.setDate(end.getDate() + 90);
  return apiRequest<AgendaEvent[]>(`/events/me?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`, { accessToken });
}

export function listMyCells(accessToken: string) {
  return apiRequest<CellMembership[]>('/cells/me', { accessToken });
}

export function getCurrentStudy(accessToken: string) {
  return apiRequest<CellStudy>('/cell-studies/current', { accessToken });
}

async function errorMessage(response: Response) {
  try {
    const body = await response.json() as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message[0];
    if (body.message) return body.message;
  } catch {
    // Mantém uma mensagem segura quando a API não responder JSON.
  }
  return response.status >= 500 ? 'Não foi possível concluir esta operação agora.' : 'Não foi possível concluir esta operação.';
}
