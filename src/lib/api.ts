// Configurações e utilitários para API


// Configurações da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const

// Headers padrão
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
} as const

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  status: number
}

// Classe para gerenciar requisições HTTP
export class ApiClient {
  private baseURL: string
  private timeout: number
  private retryAttempts: number
  private retryDelay: number

  constructor(config = API_CONFIG) {
    this.baseURL = config.BASE_URL
    this.timeout = config.TIMEOUT
    this.retryAttempts = config.RETRY_ATTEMPTS
    this.retryDelay = config.RETRY_DELAY
  }

  /**
   * Faz uma requisição HTTP
   */
  async request<T>(
    endpoint: string,
    options: Record<string, unknown> = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const config: Record<string, unknown> = {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erro na requisição',
          status: response.status
        }
      }

      return {
        success: true,
        data,
        status: response.status
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Timeout na requisição',
            status: 408
          }
        }
        return {
          success: false,
          error: error.message,
          status: 0
        }
      }
      return {
        success: false,
        error: 'Erro desconhecido',
        status: 0
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers
    })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers
    })
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers
    })
  }
}

// Instância padrão do cliente API
export const apiClient = new ApiClient()

// Função para criar headers com API key
export function createApiKeyHeaders(apiKey: string): Record<string, string> {
  return {
    'x-api-key': apiKey
  }
}

// Função para validar resposta da API
export function validateApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || 'Erro na API')
  }
  if (!response.data) {
    throw new Error('Dados não encontrados na resposta')
  }
  return response.data
}
