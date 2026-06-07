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
          email: string | null;
          display_name: string | null;
          tier: "free" | "researcher" | "pro";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          tier?: "free" | "researcher" | "pro";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          tier?: "free" | "researcher" | "pro";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          ticker: string;
          report_data: Json;
          filing_period: string | null;
          filing_date: string | null;
          gemini_model: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          ticker: string;
          report_data: Json;
          filing_period?: string | null;
          filing_date?: string | null;
          gemini_model?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          ticker?: string;
          report_data?: Json;
          filing_period?: string | null;
          filing_date?: string | null;
          gemini_model?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      journal_messages: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticker?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
      };
      analysis_usage: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticker?: string;
          created_at?: string;
        };
      };
      commitments: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          text: string;
          threshold: string | null;
          check_date: string | null;
          status: "watching" | "ok" | "warning" | "fired";
          source_message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          text: string;
          threshold?: string | null;
          check_date?: string | null;
          status?: "watching" | "ok" | "warning" | "fired";
          source_message_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticker?: string;
          text?: string;
          threshold?: string | null;
          check_date?: string | null;
          status?: "watching" | "ok" | "warning" | "fired";
          source_message_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
