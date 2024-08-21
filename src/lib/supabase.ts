import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);