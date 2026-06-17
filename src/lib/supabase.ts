import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isPlaceholder = !supabaseUrl || !supabaseAnonKey;

if (isPlaceholder && typeof window !== 'undefined') {
  console.warn(
    '⚠️ Supabase environment variables are missing! Check your .env.local location.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Helper function to check if database is fully operational before executing requests
export const checkSupabaseConfig = () => {
  if (isPlaceholder) {
    alert('Configuration Error: Missing live Supabase keys in .env.local file. Please check folder paths and restart your dev server.');
    return false;
  }
  return true;
};