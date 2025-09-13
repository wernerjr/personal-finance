export type ExpenseType = 'food' | 'study' | 'transport' | 'fun' | 'other'

export type ExpenseTypeLabel = {
  [K in ExpenseType]: string
}

export const EXPENSE_TYPE_LABELS: ExpenseTypeLabel = {
  food: 'Alimentação',
  study: 'Estudo',
  transport: 'Transporte',
  fun: 'Diversão',
  other: 'Outros'
}

export interface Expense {
  id: string
  user_mail: string
  description: string
  value: number
  type: ExpenseType
  created_at: string
  updated_at: string
  user_ip: string
}

export interface ApiKey {
  id: string
  user_mail: string
  api_key: string
  created_at: string
  revoked: boolean
}

export interface CreateExpenseData {
  description: string
  value: number
  type: ExpenseType
}

export interface User {
  id: string
  email: string
  api_key?: string
}
