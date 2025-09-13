import { z } from 'zod'

// Schema de validação para despesas
export const expenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  value: z
    .number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(999999.99, 'Valor muito alto'),
  type: z.enum(['food', 'study', 'transport', 'fun', 'other'], {
    required_error: 'Tipo é obrigatório'
  })
})

// Schema de validação para API
export const apiExpenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  value: z
    .number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(999999.99, 'Valor muito alto'),
  type: z.enum(['food', 'study', 'transport', 'fun', 'other'], {
    required_error: 'Tipo deve ser um dos seguintes: food, study, transport, fun, other'
  })
})

// Schema de validação para email
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(1, 'Email é obrigatório')

// Schema de validação para API key
export const apiKeySchema = z
  .string()
  .min(32, 'API key inválida')
  .max(32, 'API key inválida')

// Tipos inferidos dos schemas
export type ExpenseFormData = z.infer<typeof expenseSchema>
export type ApiExpenseData = z.infer<typeof apiExpenseSchema>
export type EmailData = z.infer<typeof emailSchema>
export type ApiKeyData = z.infer<typeof apiKeySchema>
