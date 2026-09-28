import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;

export const SUPABASE_URL = env.VITE_SUPABASE_URL?.trim() || 'https://iqvkudeqxqbsnqvhzhdy.supabase.co';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  || env.VITE_SUPABASE_ANON_KEY?.trim()
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxdmt1ZGVxeHFic25xdmh6aGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDg4NDEsImV4cCI6MjEwNjAyNDg0MX0.EHRs2ej7EG-70w_kFCmnYuC_UQp7ohUqGCoIVC-6aQU';
export const BACKEND_API_URL = env.VITE_BACKEND_API_URL?.trim().replace(/\/+$/, '') || '';

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
