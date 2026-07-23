import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

/** The signed-in Supabase auth user, or null. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The signed-in user's role, or null if signed out. */
export const getCurrentRole = cache(async (): Promise<UserRole | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return (data?.role as UserRole | undefined) ?? "viewer";
});

export async function isEditor(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === "editor" || role === "admin";
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === "admin";
}
