import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");

// Public client (for reads)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Admin client (for writes from API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
