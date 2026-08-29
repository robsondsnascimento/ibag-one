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
  acceptEmptyResponse?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { acceptEmptyResponse = false, ...requestOptions } = options
  const response = await fetch(`${apiUrl}${path}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.accessToken ? { authorization: `Bearer ${requestOptions.accessToken}` } : {}),
      ...requestOptions.headers,
    },
  })

  if (!response.ok) throw new ApiError(await errorMessage(response), response.status)
  const body = await response.text()
  if (!body.trim()) {
    if (acceptEmptyResponse) return null as T
    throw new ApiError('A API não retornou os dados esperados para esta operação.', response.status)
  }
  return JSON.parse(body) as T
}

export async function apiFormRequest<T>(path: string, accessToken: string, form: FormData): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}` },
    body: form,
  })

  if (!response.ok) throw new ApiError(await errorMessage(response), response.status)
  const body = await response.text()
  if (!body.trim()) throw new ApiError('A API não retornou os dados esperados para esta operação.', response.status)
  return JSON.parse(body) as T
}

export async function apiBlobRequest(path: string, accessToken: string): Promise<Blob> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw new ApiError(await errorMessage(response), response.status)
  return response.blob()
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
