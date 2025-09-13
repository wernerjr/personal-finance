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
export function validateExpenseData(data: any): { isValid: boolean; error?: string; validatedData?: CreateExpenseData } {
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    return { isValid: false, error: 'Descrição é obrigatória' }
  }

  if (data.description.length > 100) {
    return { isValid: false, error: 'Descrição deve ter no máximo 100 caracteres' }
  }

  if (!data.value || typeof data.value !== 'number' || data.value <= 0) {
    return { isValid: false, error: 'Valor deve ser um número positivo' }
  }

  const validTypes = ['food', 'study', 'transport', 'fun', 'other']
  if (!data.type || !validTypes.includes(data.type)) {
    return { isValid: false, error: 'Tipo deve ser um dos seguintes: food, study, transport, fun, other' }
  }

  return {
    isValid: true,
    validatedData: {
      description: data.description.trim(),
      value: data.value,
      type: data.type
    }
  }
}
