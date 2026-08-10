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

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '')

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ loginEmail: input.username, password: input.password }),
  })

  if (!response.ok) throw new Error(await errorMessage(response))
  return response.json() as Promise<AuthSession>
}

export async function validateSession(accessToken: string) {
  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new Error(await errorMessage(response))
  return response.json() as Promise<{ userId: string; personId: string; organizationId: string }>
}

async function errorMessage(response: Response) {
  try {
    const body = await response.json() as { message?: string | string[] }
    if (Array.isArray(body.message)) return body.message[0]
    if (body.message) return body.message
  } catch {
    // Mantém uma mensagem segura caso a API não responda JSON.
  }

  return response.status >= 500
    ? 'Não foi possível concluir o acesso agora. Tente novamente em instantes.'
    : 'Não foi possível validar seus dados de acesso.'
}
