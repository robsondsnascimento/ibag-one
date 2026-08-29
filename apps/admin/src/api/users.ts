import { apiRequest } from './client'

export type PersonSystemAccess = {
  id: string
  loginEmail: string
  ativo: boolean
  role: string
}

export function getPersonSystemAccess(accessToken: string, personId: string) {
  return apiRequest<PersonSystemAccess | null>(`/users/persons/${personId}`, { accessToken, acceptEmptyResponse: true })
}

export function createPersonSystemAccess(accessToken: string, personId: string, password: string) {
  return apiRequest<PersonSystemAccess>(`/users/persons/${personId}`, {
    method: 'POST',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password }),
  })
}

export function changeOwnPassword(accessToken: string, input: { currentPassword: string; newPassword: string }) {
  return apiRequest<{ changed: true }>('/users/me/password', {
    method: 'PATCH',
    accessToken,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
}
