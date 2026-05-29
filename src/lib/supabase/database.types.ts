export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_emoji: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_emoji?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_emoji?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      diary_entries: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          mood_label: string | null;
          content: string;
          entry_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          mood_label?: string | null;
          content: string;
          entry_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: string;
          mood_label?: string | null;
          content?: string;
          entry_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type DiaryEntry = Database["public"]["Tables"]["diary_entries"]["Row"];
export type DiaryEntryInsert =
  Database["public"]["Tables"]["diary_entries"]["Insert"];
export type DiaryEntryUpdate =
  Database["public"]["Tables"]["diary_entries"]["Update"];
