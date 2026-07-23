/**
 * Centralized, validated access to Supabase environment variables.
 * Throws a clear error at call time (not import time) so the app can still
 * build and render pages that don't touch Supabase before keys are configured.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing environment variable "${name}". ` +
        `Copy .env.local.example to .env.local and fill in your Supabase project values.`
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Service role key — SERVER ONLY. Never import this into a Client Component.
 * Bypasses Row Level Security; use only for trusted admin/server operations.
 */
export function getSupabaseServiceRoleKey(): string {
  return required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
