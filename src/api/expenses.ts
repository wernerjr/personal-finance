import { supabase } from '@/lib/supabase'
import { CreateExpenseData } from '@/types'

export async function createExpenseViaApi(apiKey: string, expenseData: CreateExpenseData) {
  try {
    // Verificar se a API key é válida
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_mail')
      .eq('api_key', apiKey)
      .eq('revoked', false)
      .single()

    if (apiKeyError || !apiKeyData) {
      return {
        success: false,
        error: 'API key inválida ou revogada',
        status: 401
      }
    }

    // Criar a despesa
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        user_mail: apiKeyData.user_mail,
        user_ip: 'api-request', // Em produção, pegar IP real do request
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        status: 400
      }
    }

    return {
      success: true,
      data,
      status: 201
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro interno do servidor',
      status: 500
    }
  }
}

// Função para validar os dados da despesa
export function validateExpenseData(data: unknown): { isValid: boolean; error?: string; validatedData?: CreateExpenseData } {
  // Verificar se data é um objeto
  if (!data || typeof data !== 'object' || data === null) {
    return { isValid: false, error: 'Dados inválidos' }
  }

  const expenseData = data as Record<string, unknown>

  if (!expenseData.description || typeof expenseData.description !== 'string' || expenseData.description.trim().length === 0) {
    return { isValid: false, error: 'Descrição é obrigatória' }
  }

  if (expenseData.description.length > 100) {
    return { isValid: false, error: 'Descrição deve ter no máximo 100 caracteres' }
  }

  if (!expenseData.value || typeof expenseData.value !== 'number' || expenseData.value <= 0) {
    return { isValid: false, error: 'Valor deve ser um número positivo' }
  }

  const validTypes = ['food', 'study', 'transport', 'fun', 'other']
  if (!expenseData.type || !validTypes.includes(expenseData.type as string)) {
    return { isValid: false, error: 'Tipo deve ser um dos seguintes: food, study, transport, fun, other' }
  }

  return {
    isValid: true,
    validatedData: {
      description: expenseData.description.trim(),
      value: expenseData.value,
      type: expenseData.type as CreateExpenseData['type']
    }
  }
}
