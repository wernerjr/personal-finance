import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Sessão atual:', session)
        console.log('Erro na sessão:', error)
        
        if (isMounted) {
          if (session?.user) {
            setUser(session.user)
            // Não aguardar fetchApiKey para não travar o loading
            fetchApiKey(session.user.email!).catch(err => 
              console.error('Erro ao buscar API key:', err)
            )
          } else {
            setUser(null)
            setApiKey(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session)
        
        if (isMounted) {
          if (session?.user) {
            setUser(session.user)
            // Não aguardar fetchApiKey para não travar o loading
            fetchApiKey(session.user.email!).catch(err => 
              console.error('Erro ao buscar API key:', err)
            )
          } else {
            setUser(null)
            setApiKey(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchApiKey = async (email: string) => {
    try {
      console.log('🔍 Buscando API key para:', email)
      
      // Adicionar timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao buscar API key')), 10000)
      )
      
      const fetchPromise = supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_mail', email)
        .eq('revoked', false)
        .single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as { data: { api_key: string } | null; error: { code: string; message: string } | null }

      if (error) {
        console.error('❌ Erro ao buscar API key:', error)
        console.log('Código do erro:', error.code)
        
        // Se não encontrar API key, criar uma nova automaticamente
        if (error.code === 'PGRST116') {
          console.log('🔄 API key não encontrada, criando nova automaticamente...')
          const result = await createApiKey(email)
          if (result.success) {
            console.log('✅ API key criada automaticamente no primeiro login')
            setApiKey(result.apiKey)
          } else {
            console.error('❌ Falha ao criar API key:', result.error)
          }
        }
        return
      }

      console.log('✅ API key encontrada:', data?.api_key)
      setApiKey(data?.api_key || null)
    } catch (error) {
      console.error('❌ Erro ao buscar API key:', error)
      // Em caso de erro, não travar o loading
      setApiKey(null)
    }
  }

  const signInWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
        },
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const createApiKey = async (email: string) => {
    try {
      console.log('🔑 Criando API key para:', email)
      
      // Primeiro, tentar usar a função RPC
      console.log('🔍 Tentando usar função RPC create_user_api_key...')
      
      const { data, error } = await supabase
        .rpc('create_user_api_key', { user_email: email })

      if (error) {
        console.error('❌ Erro na função RPC:', error)
        console.log('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Se a função RPC falhar, tentar método alternativo
        console.log('🔄 Tentando método alternativo...')
        return await createApiKeyAlternative(email)
      }

      console.log('✅ API key criada com sucesso via RPC:', data)
      setApiKey(data)
      return { success: true, apiKey: data }
    } catch (error) {
      console.error('❌ Erro ao criar API key:', error)
      // Tentar método alternativo em caso de erro
      console.log('🔄 Tentando método alternativo após erro...')
      return await createApiKeyAlternative(email)
    }
  }

  const createApiKeyAlternative = async (email: string) => {
    try {
      console.log('🔑 Criando API key via método alternativo para:', email)
      
      // Gerar API key no frontend
      const newApiKey = generateApiKey()
      console.log('🔑 API key gerada:', newApiKey)
      
      // Inserir diretamente na tabela
      const { data, error } = await supabase
        .from('api_keys')
        .upsert({
          user_mail: email,
          api_key: newApiKey,
          revoked: false
        })
        .select('api_key')
        .single()

      if (error) {
        console.error('❌ Erro ao inserir API key:', error)
        throw error
      }

      console.log('✅ API key criada com sucesso via método alternativo:', data?.api_key)
      setApiKey(data?.api_key)
      return { success: true, apiKey: data?.api_key }
    } catch (error) {
      console.error('❌ Erro no método alternativo:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  const generateApiKey = () => {
    // Gerar uma string aleatória de 32 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  return {
    user,
    apiKey,
    loading,
    signInWithEmail,
    signOut,
    createApiKey
  }
}
