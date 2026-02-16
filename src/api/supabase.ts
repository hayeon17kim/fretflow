import { createClient } from '@supabase/supabase-js';
import { supabaseStorageAdapter } from '@/utils/storage';

// TODO: .env 파일에 실제 Supabase 키 넣은 후 env.ts import로 교체
// import { env } from '@/env';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN에서는 false
  },
});
