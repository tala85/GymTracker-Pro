import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { dbGet, dbPut } from '../lib/db'
import type { Profile } from '../types'

const LOCAL_PROFILE_ID = 'local-profile'

interface AuthResult {
  error?: string
  needsConfirmation?: boolean
}

interface AuthState {
  userId: string | null
  email: string | null
  profile: Profile | null
  isInitialized: boolean
  mode: 'cloud' | 'local'
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  continueLocally: () => Promise<void>
  updateProfile: (patch: Partial<Profile>) => Promise<void>
  signOut: () => Promise<void>
}

function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos',
    'Email not confirmed': 'Confirmá tu email antes de iniciar sesión',
    'User already registered': 'Este email ya está registrado',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  }
  return map[message] ?? message
}

async function fetchCloudProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id,
    email: data.email ?? '',
    fullName: data.full_name ?? '',
    avatarUrl: data.avatar_url ?? undefined,
    birthDate: data.birth_date ?? undefined,
    heightCm: data.height_cm ?? undefined,
    goal: data.goal ?? undefined,
    createdAt: data.created_at,
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  email: null,
  profile: null,
  isInitialized: false,
  mode: isSupabaseConfigured ? 'cloud' : 'local',

  initialize: async () => {
    if (!isSupabaseConfigured || !supabase) {
      const local = await dbGet<Profile>('settings', LOCAL_PROFILE_ID)
      set({
        mode: 'local',
        userId: local ? local.id : null,
        email: local?.email ?? null,
        profile: local ?? null,
        isInitialized: true,
      })
      return
    }
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (session?.user) {
      const profile = await fetchCloudProfile(session.user.id)
      set({ userId: session.user.id, email: session.user.email ?? null, profile })
    }
    set({ isInitialized: true })
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const uid = newSession?.user.id ?? null
      const profile = uid ? await fetchCloudProfile(uid) : null
      set({ userId: uid, email: newSession?.user.email ?? null, profile })
    })
  },

  login: async (email, password) => {
    if (!supabase) return { error: 'Modo nube no configurado' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: translateAuthError(error.message) }
    return {}
  },

  register: async (name, email, password) => {
    if (!supabase) return { error: 'Modo nube no configurado' }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) return { error: translateAuthError(error.message) }
    if (data.session === null) return { needsConfirmation: true }
    return {}
  },

  signInWithGoogle: async () => {
    if (!supabase) return { error: 'Modo nube no configurado' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) return { error: 'No se pudo iniciar con Google. Verificá que el proveedor esté habilitado en Supabase.' }
    return {}
  },

  continueLocally: async () => {
    const existing = get().profile
    const profile: Profile =
      existing ?? {
        id: LOCAL_PROFILE_ID,
        email: 'local',
        fullName: '',
        createdAt: new Date().toISOString(),
      }
    await dbPut('settings', profile)
    set({ userId: profile.id, email: profile.email, profile, mode: 'local' })
  },

  updateProfile: async (patch) => {
    const { profile, mode } = get()
    if (!profile) return
    const updated = { ...profile, ...patch }
    if (mode === 'local') {
      await dbPut('settings', updated)
      set({ profile: updated })
      return
    }
    if (supabase) {
      await supabase
        .from('profiles')
        .update({
          full_name: updated.fullName,
          avatar_url: updated.avatarUrl ?? null,
          birth_date: updated.birthDate ?? null,
          height_cm: updated.heightCm ?? null,
          goal: updated.goal ?? null,
        })
        .eq('id', updated.id)
    }
    set({ profile: updated })
  },

  signOut: async () => {
    if (get().mode === 'cloud' && supabase) {
      await supabase.auth.signOut()
    }
    set({ userId: null, email: null, profile: null })
  },
}))