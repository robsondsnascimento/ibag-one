export type AuthUser = {
  id: string
  loginEmail: string
  personId: string
  organizationId: string
  role: string
  additionalRoles: string[]
  person: {
    id: string
    nome: string
    campusId: string
    campus: {
      nome: string
    }
  }
  organization: {
    id: string
    nome: string
  }
}

export type AuthSession = {
  access_token: string
  user: AuthUser
}

type LoginInput = {
  username: string
  password: string
}

export async function login(input: LoginInput): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ loginEmail: input.username, password: input.password }),
  })
}

export async function validateSession(accessToken: string) {
  return apiRequest<{ userId: string; personId: string; organizationId: string }>('/auth/me', {
    accessToken,
  })
}
import { apiRequest } from './client'
