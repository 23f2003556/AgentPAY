import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/platform/db";
import { fallbackServices } from "../route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const { data, error } = await supabase
    .from("services")
    .select("*, reputation(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    // Graceful fallback to real-world agents list
    const matched = fallbackServices.find(s => s.id === id);
    if (matched) {
      return NextResponse.json({ service: matched });
    }
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  
  return NextResponse.json({ service: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const { error } = await supabase
    .from("services")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ message: "Service deactivated" });
}
