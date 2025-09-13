// Constantes da aplicação
export const APP_NAME = 'Personal Finance'
export const APP_VERSION = '1.0.0'

// Configurações da API
export const API_ENDPOINTS = {
  EXPENSES: '/api/expenses'
} as const

// Configurações de validação
export const VALIDATION_LIMITS = {
  DESCRIPTION_MAX_LENGTH: 100,
  VALUE_MIN: 0.01,
  VALUE_MAX: 999999.99
} as const

// Configurações de UI
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000
} as const

// Configurações do Supabase
export const SUPABASE_CONFIG = {
  TABLES: {
    EXPENSES: 'expenses',
    API_KEYS: 'api_keys'
  }
} as const
