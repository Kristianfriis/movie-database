import { supabase } from './supabase.js'

export async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()

  const token = session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}
