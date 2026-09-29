import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;

export const SUPABASE_URL = env.VITE_SUPABASE_URL?.trim() || 'https://rihuafhmdntqemtdread.supabase.co';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  || env.VITE_SUPABASE_ANON_KEY?.trim()
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaHVhZmhtZG50cWVtdGRyZWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MjQ4MTksImV4cCI6MjEwNjIwMDgxOX0.xDznBMDWYuzBIFCT0rZPOr2ngcUbwQmlyAEq58RCDP0';
export const BACKEND_API_URL = env.VITE_BACKEND_API_URL?.trim().replace(/\/+$/, '') || '';

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
