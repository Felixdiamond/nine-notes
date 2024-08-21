import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

export async function getServerSession() {
  const supabase = createServerComponentClient<Database>({ cookies })
  return await supabase.auth.getSession()
}