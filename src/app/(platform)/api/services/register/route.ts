import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/platform/db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  const required = ["name", "description", "category", "endpoint_url", "price_sats", "provider_id", "provider_name"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  // Validate category
  const validCategories = ["summarization", "code-review", "image-analysis", "data-lookup", "translation", "verification", "other"];
  if (!validCategories.includes(body.category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Validate price
  if (body.price_sats < 1 || body.price_sats > 100000) {
    return NextResponse.json({ error: "price_sats must be between 1 and 100000" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("services")
    .insert({
      name: body.name,
      description: body.description,
      category: body.category,
      endpoint_url: body.endpoint_url,
      price_sats: body.price_sats,
      provider_id: body.provider_id,
      provider_name: body.provider_name,
    })
    .select()
    .single();

  if (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "Failed to register service" }, { status: 500 });
  }

  return NextResponse.json({ service: data, message: "Service registered successfully" }, { status: 201 });
}
