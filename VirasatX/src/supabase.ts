import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;

export const SUPABASE_URL = env.VITE_SUPABASE_URL?.trim() ?? '';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  ?? env.VITE_SUPABASE_ANON_KEY?.trim()
  ?? '';
export const BACKEND_API_URL = env.VITE_BACKEND_API_URL?.trim().replace(/\/+$/, '') ?? '';

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
