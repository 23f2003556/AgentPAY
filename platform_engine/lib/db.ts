import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ServiceCategory =
  | "summarization"
  | "code-review"
  | "image-analysis"
  | "data-lookup"
  | "translation"
  | "verification"
  | "other";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "summarization",
  "code-review",
  "image-analysis",
  "data-lookup",
  "translation",
  "verification",
  "other",
];

export type Service = {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  endpoint_url: string;
  price_sats: number;
  provider_id: string;
  provider_name: string;
  is_active: boolean;
  created_at: string;
};

export type Reputation = {
  id: string;
  service_id: string;
  total_requests: number;
  successful_requests: number;
  total_sats_earned: number;
  score: number;
  last_updated: string;
};

export type Payment = {
  id: string;
  service_id: string;
  payment_hash: string;
  amount_sats: number;
  status: "pending" | "confirmed" | "failed";
  buyer_id: string | null;
  created_at: string;
  confirmed_at: string | null;
};
