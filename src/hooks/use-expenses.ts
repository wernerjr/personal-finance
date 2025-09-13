import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Expense, CreateExpenseData, ExpenseType } from '@/types'

export function useExpenses(userEmail: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async () => {
    if (!userEmail) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_mail', userEmail)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [userEmail])

  const createExpense = async (expenseData: CreateExpenseData) => {
    if (!userEmail) return { success: false, error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          user_mail: userEmail,
          user_ip: 'web-app', // Em produção, pegar IP real
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setExpenses(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  }

  const updateExpense = async (id: string, updates: Partial<CreateExpenseData>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setExpenses(prev => 
        prev.map(expense => 
          expense.id === id ? data : expense
        )
      )
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setExpenses(prev => prev.filter(expense => expense.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    }
  }

  const getExpensesByType = (type: ExpenseType) => {
    return expenses.filter(expense => expense.type === type)
  }

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.value, 0)
  }

  const getExpensesByDateRange = (startDate: string, endDate: string) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at)
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate)
    })
  }

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpensesByType,
    getTotalExpenses,
    getExpensesByDateRange,
    refetch: fetchExpenses
  }
}
