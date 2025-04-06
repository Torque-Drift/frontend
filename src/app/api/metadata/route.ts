import { metadata } from "@/constants";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rarity = searchParams.get("rarity")?.toLowerCase();

  if (!rarity || !(rarity in metadata)) {
    return NextResponse.json(
      { error: "Invalid rarity parameter" },
      { status: 400 }
    );
  }

  return NextResponse.json(metadata[rarity as keyof typeof metadata]);
}
