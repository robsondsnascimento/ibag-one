const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type RequestOptions = Omit<RequestInit, 'headers'> & {
  accessToken?: string
  headers?: Record<string, string>
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      ...(options.accessToken ? { authorization: `Bearer ${options.accessToken}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) throw new ApiError(await errorMessage(response), response.status)
  return response.json() as Promise<T>
}

export async function apiFormRequest<T>(path: string, accessToken: string, form: FormData): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}` },
    body: form,
  })

  if (!response.ok) throw new ApiError(await errorMessage(response), response.status)
  return response.json() as Promise<T>
}

export async function apiDownload(path: string, accessToken: string): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new ApiError(await errorMessage(response), response.status)
  const disposition = response.headers.get('content-disposition') ?? ''
  const filename = /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? 'estudo-da-semana'
  return { blob: await response.blob(), filename }
}

export async function errorMessage(response: Response) {
  try {
    const body = await response.json() as { message?: string | string[] }
    if (Array.isArray(body.message)) return body.message[0]
    if (body.message) return body.message
  } catch {
    // Mantém uma mensagem segura caso a API não responda JSON.
  }

  return response.status >= 500
    ? 'Não foi possível concluir esta operação agora. Tente novamente em instantes.'
    : 'Não foi possível concluir esta operação.'
}
