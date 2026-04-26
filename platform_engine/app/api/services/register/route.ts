import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, SERVICE_CATEGORIES } from "@/lib/db";

const REQUIRED_FIELDS = [
  "name",
  "description",
  "category",
  "endpoint_url",
  "price_sats",
  "provider_id",
  "provider_name",
] as const;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  if (!SERVICE_CATEGORIES.includes(body.category as never)) {
    return NextResponse.json(
      { error: `Invalid category. Must be one of: ${SERVICE_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  const price = Number(body.price_sats);
  if (!Number.isInteger(price) || price < 1 || price > 100000) {
    return NextResponse.json(
      { error: "price_sats must be an integer between 1 and 100000" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("services")
    .insert({
      name: body.name,
      description: body.description,
      category: body.category,
      endpoint_url: body.endpoint_url,
      price_sats: price,
      provider_id: body.provider_id,
      provider_name: body.provider_name,
    })
    .select()
    .single();

  if (error) {
    console.error("services/register DB error:", error);
    return NextResponse.json({ error: "Failed to register service" }, { status: 500 });
  }

  return NextResponse.json(
    { service: data, message: "Service registered successfully" },
    { status: 201 }
  );
}
