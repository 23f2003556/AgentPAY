import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from("services")
    .select("*, reputation(*)")
    .eq("id", params.id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  return NextResponse.json({ service: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from("services")
    .update({ is_active: false })
    .eq("id", params.id);

  if (error) {
    console.error("services delete DB error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ message: "Service deactivated" });
}
