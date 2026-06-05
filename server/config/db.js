const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client using Service Role Key to bypass RLS (admin access)
let supabase;

try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error.message);
}

const connectDB = async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
  }
  console.log('🔌 Supabase Admin Client Initialized');
  return supabase;
};

module.exports = connectDB;
module.exports.supabase = supabase;
