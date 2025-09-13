// Códigos de erro da aplicação
export const ERROR_CODES = {
  // Autenticação
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // API
  INVALID_API_KEY: 'INVALID_API_KEY',
  API_KEY_REVOKED: 'API_KEY_REVOKED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Validação
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Banco de dados
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  
  // Sistema
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

// Mensagens de erro em português
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Autenticação necessária',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciais inválidas',
  [ERROR_CODES.SESSION_EXPIRED]: 'Sessão expirada',
  [ERROR_CODES.INVALID_API_KEY]: 'API key inválida ou revogada',
  [ERROR_CODES.API_KEY_REVOKED]: 'API key foi revogada',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Limite de requisições excedido',
  [ERROR_CODES.VALIDATION_ERROR]: 'Erro de validação',
  [ERROR_CODES.REQUIRED_FIELD]: 'Campo obrigatório',
  [ERROR_CODES.INVALID_FORMAT]: 'Formato inválido',
  [ERROR_CODES.DATABASE_ERROR]: 'Erro no banco de dados',
  [ERROR_CODES.RECORD_NOT_FOUND]: 'Registro não encontrado',
  [ERROR_CODES.DUPLICATE_RECORD]: 'Registro duplicado',
  [ERROR_CODES.INTERNAL_ERROR]: 'Erro interno do servidor',
  [ERROR_CODES.NETWORK_ERROR]: 'Erro de rede',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Erro desconhecido'
} as const

// Função para obter mensagem de erro
export function getErrorMessage(code: keyof typeof ERROR_CODES): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
}

// Função para criar erro padronizado
export function createError(code: keyof typeof ERROR_CODES, details?: string) {
  return {
    code,
    message: getErrorMessage(code),
    details
  }
}
