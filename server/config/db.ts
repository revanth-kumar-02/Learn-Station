import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars immediately to prevent hoisting issues
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize the Supabase client using Service Role Key to bypass RLS (admin access)
let supabase: SupabaseClient;

try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} catch (error: any) {
  console.error('❌ Failed to initialize Supabase client:', error?.message);
}

const connectDB = async (): Promise<SupabaseClient> => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
  }
  console.log('🔌 Supabase Admin Client Initialized');
  return supabase;
};

export default connectDB;
export { supabase };
