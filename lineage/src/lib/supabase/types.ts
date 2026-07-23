/**
 * Supabase database types — kept in sync by hand with
 * `supabase/migrations/*.sql`. (You can regenerate these once the Supabase CLI
 * is linked, via `npx supabase gen types typescript --linked`.)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "viewer" | "contributor" | "editor" | "admin";
export type Gender = "male" | "female" | "unknown";

export interface PersonRow {
  id: string;
  slug: string;
  full_name: string;
  gender: Gender;
  honorific: string | null;
  house: string | null;
  father_id: string | null;
  mother_id: string | null;
  father_name: string | null;
  mother_name: string | null;
  spouse: string | null;
  spouse_id: string | null;
  married_in: boolean;
  birth_date: string | null;
  birth_place: string | null;
  death_date: string | null;
  death_place: string | null;
  burial_date: string | null;
  burial_place: string | null;
  marriage_date: string | null;
  marriage_place: string | null;
  bio: string | null;
  image_path: string | null;
  is_living: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type PersonInsert = {
  id?: string;
  slug: string;
  full_name: string;
  gender?: Gender;
  honorific?: string | null;
  house?: string | null;
  father_id?: string | null;
  mother_id?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  spouse?: string | null;
  spouse_id?: string | null;
  married_in?: boolean;
  birth_date?: string | null;
  birth_place?: string | null;
  death_date?: string | null;
  death_place?: string | null;
  burial_date?: string | null;
  burial_place?: string | null;
  marriage_date?: string | null;
  marriage_place?: string | null;
  bio?: string | null;
  image_path?: string | null;
  is_living?: boolean;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
};

export type PersonUpdate = Partial<PersonInsert>;

export interface ProfileRow {
  id: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
}

export type ProfileInsert = {
  id: string;
  display_name?: string | null;
  role?: UserRole;
  created_at?: string;
};

export type ProfileUpdate = Partial<ProfileInsert>;

export interface PlaceRow {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  description: string;
  aliases: string[];
  sort_order: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type PlaceInsert = {
  id?: string;
  slug: string;
  name: string;
  region?: string | null;
  description?: string;
  aliases?: string[];
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
};

export type PlaceUpdate = Partial<PlaceInsert>;

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      people: {
        Row: PersonRow;
        Insert: PersonInsert;
        Update: PersonUpdate;
        Relationships: Relationship[];
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: Relationship[];
      };
      places: {
        Row: PlaceRow;
        Insert: PlaceInsert;
        Update: PlaceUpdate;
        Relationships: Relationship[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_editor: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      gender: Gender;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
