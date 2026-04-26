import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Public client (for reads)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (for writes from API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint_url: string;
  price_sats: number;
  provider_id: string;
  provider_name: string;
  is_active: boolean;
  created_at: string;
};

export type Reputation = {
  service_id: string;
  total_requests: number;
  successful_requests: number;
  total_sats_earned: number;
  score: number;
  last_updated: string;
};
