'use client'
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({ session: null, user: null, isLoading: true })

export const AuthProvider = ({ children, serverSession }: { children: React.ReactNode, serverSession: Session | null }) => {
  const [session, setSession] = useState<Session | null>(serverSession)
  const [user, setUser] = useState<User | null>(serverSession?.user ?? null)
  const [isLoading, setIsLoading] = useState(!serverSession)

  const supabase = useMemo(() => createBrowserClient(), [])

  const handleAuthChange = useCallback((_event: AuthChangeEvent, newSession: Session | null) => {
    // console.log("Auth state changed", newSession)
    setSession(newSession)
    setUser(newSession?.user ?? null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    if (!serverSession) {
      setIsLoading(true)
      supabase.auth.getSession().then(({ data: { session } }) => {
        handleAuthChange('INITIAL_SESSION', session)
      })
    }

    return () => subscription.unsubscribe()
  }, [supabase, handleAuthChange, serverSession])

  const contextValue = useMemo(() => ({
    session,
    user,
    isLoading
  }), [session, user, isLoading])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)