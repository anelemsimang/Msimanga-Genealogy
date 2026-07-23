import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Supabase client for use in Client Components (browser).
 * Uses the public anon key + Row Level Security for access control.
 */
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
