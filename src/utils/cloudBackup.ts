import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { collectAllData } from './backup'

function requireSession() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no configurado')
  }
  return supabase
}

export async function uploadCloudBackup(): Promise<void> {
  const client = requireSession()
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError || !userData.user) throw new Error('Sin sesión iniciada')
  const payload = await collectAllData()
  const { error } = await client
    .from('backups')
    .upsert({ user_id: userData.user.id, payload, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
}

export async function downloadCloudBackup(): Promise<string | null> {
  const client = requireSession()
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError || !userData.user) throw new Error('Sin sesión iniciada')
  const { data, error } = await client
    .from('backups')
    .select('payload')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return data.payload as string
}