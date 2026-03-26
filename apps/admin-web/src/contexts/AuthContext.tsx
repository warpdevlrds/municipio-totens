import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@municipio-totens/supabase-client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const verifyAdminUser = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    return !error && !!data
  }

  useEffect(() => {
    // Verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const canAccess = await verifyAdminUser(session.user.id)
      if (!canAccess) {
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session.user)
      setIsAdmin(true)
      setLoading(false)
    })

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const canAccess = await verifyAdminUser(session.user.id)
      if (!canAccess) {
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session.user)
      setIsAdmin(true)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Email ou senha incorretos' }
        }
        return { error: error.message }
      }

      if (!data.user || !data.session) {
        return { error: 'Sessao invalida' }
      }

      const canAccess = await verifyAdminUser(data.user.id)
      if (!canAccess) {
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        return { error: 'Usuario sem permissao administrativa' }
      }

      setSession(data.session)
      setUser(data.user)
      setIsAdmin(true)
      return { error: null }
    } catch (err) {
      return { error: 'Erro ao conectar. Tente novamente.' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      signIn,
      signOut,
      isAuthenticated: !!session && isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
