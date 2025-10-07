import { createClient } from '@supabase/supabase-js'

const fallbackUrl = 'https://ydrftlhlwajofcxnkmju.supabase.co'
const fallbackAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcmZ0bGhsd2Fqb2ZjeG5rbWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODM5OTIsImV4cCI6MjA3MjY1OTk5Mn0.p_YbW0ZVqq_dNr7-DsAFSSk3A6QE83JIPINpHPHJzBE'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? fallbackUrl
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? fallbackAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase