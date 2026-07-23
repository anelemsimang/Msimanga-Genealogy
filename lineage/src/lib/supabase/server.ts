import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

/**
 * Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Reads/writes the auth session from cookies and enforces Row Level Security.
 *
 * Note: we intentionally omit the Database generic here — recent supabase-js
 * versions are strict about generated Relationship tuples, and our hand-written
 * types were resolving table ops to `never`. Row shapes are asserted at the
 * call site via `@/lib/supabase/types`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // `setAll` can be called from a Server Component where cookies are
          // read-only. This is safe to ignore when middleware refreshes sessions.
        }
      },
    },
  });
}

/**
 * Privileged Supabase client that bypasses Row Level Security.
 * SERVER ONLY — use for admin tasks (invite generation, merges, GEDCOM import).
 * Does not persist any auth session.
 */
export function createAdminClient() {
  return createServerClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        /* no-op: admin client is stateless */
      },
    },
  });
}
