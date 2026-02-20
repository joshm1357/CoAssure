import { supabase, isSupabaseConfigured } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'worker' | 'supervisor' | 'admin';
export type AccountType = 'personal' | 'contractor' | 'organisation';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  account_type: AccountType;
  org_id: string | null;
  worker_id: string | null; // Links to the worker profile for safety data
}

// --- Auth actions ---

export async function signUp(email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { user: null, error: 'Supabase not configured. Running in local mode.' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { user: null, error: 'Supabase not configured. Running in local mode.' };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signInWithMagicLink(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured. Running in local mode.' };

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { error: error?.message || null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };

  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user || null);
  });
}

// --- Profile helpers ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function createUserProfile(profile: Omit<UserProfile, 'id'> & { id: string }): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .insert(profile)
    .select()
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

// --- Local mode fallback ---
// When Supabase is not configured, the app falls back to localStorage
// This allows local development and testing without a Supabase project

export function isLocalMode(): boolean {
  return !isSupabaseConfigured();
}
