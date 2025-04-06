import { NextResponse } from "next/server";

const metadata = {
  rare: {
    description: "A Rare Land",
    external_url: "https://orcmine.io",
    image: "https://orcmine.vercel.app/metadata/lands/rare.jpg",
    name: "Rare Land",
    attributes: [{ trait_type: "Rarity", value: "Rare" }],
  },
  epic: {
    description: "A Epic Land",
    external_url: "https://orcmine.io",
    image: "https://orcmine.vercel.app/metadata/lands/epic.jpg",
    name: "Epic Land",
    attributes: [{ trait_type: "Rarity", value: "Epic" }],
  },
  legendary: {
    description: "A Legendary Land",
    external_url: "https://orcmine.io",
    image: "https://orcmine.vercel.app/metadata/lands/legendary.jpg",
    name: "Legendary Land",
    attributes: [{ trait_type: "Rarity", value: "Legendary" }],
  },
};

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
