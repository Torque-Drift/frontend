import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { metadataCache } from "../../generate/route";
import { MetadataService } from "@/lib/supabase";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  image_site: string;
  animation_site: string;
  animation_url: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
  power: number;
  rarity: string;
}

interface BaseMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

const raridades = {
  comum: { min: 10, max: 25 },
  rara: { min: 26, max: 50 },
  epica: { min: 51, max: 75 },
  lendaria: { min: 76, max: 100 },
};

function classificarRaridade(hashpower: number) {
  for (const [raridade, faixa] of Object.entries(raridades)) {
    if (hashpower >= faixa.min && hashpower <= faixa.max) {
      return raridade;
    }
  }
  return "desconhecida";
}

function obterDadosRaridade(raridade: string) {
  const mapeamento = {
    comum: { file: "common.json", name: "Common" },
    rara: { file: "rare.json", name: "Rare" },
    epica: { file: "epic.json", name: "Epic" },
    lendaria: { file: "legendary.json", name: "Legendary" },
  };

  return (
    mapeamento[raridade as keyof typeof mapeamento] || {
      file: "common.json",
      name: "Common",
    }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const { tokenId } = params;

    // First, try to get from Supabase
    const supabaseMetadata = await MetadataService.getMetadata(tokenId);
    if (supabaseMetadata) {
      // Cache it in memory for faster future access
      metadataCache.set(tokenId, supabaseMetadata);
      return NextResponse.json(supabaseMetadata);
    }

    // Second, check in-memory cache
    const cachedMetadata = metadataCache.get(tokenId);
    if (cachedMetadata) {
      // Try to save to Supabase for future requests
      MetadataService.saveMetadata(tokenId, cachedMetadata).catch(err => 
        console.warn(`Failed to backup metadata to Supabase for token ${tokenId}:`, err)
      );
      return NextResponse.json(cachedMetadata);
    }

    // Third, check if metadata file exists in public folder (legacy support)
    const metadataPath = path.join(
      process.cwd(),
      "public",
      "metadata",
      "gpu",
      `${tokenId}.json`
    );

    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
      // Cache it in memory and save to Supabase
      metadataCache.set(tokenId, metadata);
      MetadataService.saveMetadata(tokenId, metadata).catch(err => 
        console.warn(`Failed to migrate metadata to Supabase for token ${tokenId}:`, err)
      );
      return NextResponse.json(metadata);
    }

    // If not found anywhere, generate placeholder metadata
    const baseMetadataPath = path.join(
      process.cwd(),
      "public",
      "metadata",
      "common.json"
    );
    
    if (!fs.existsSync(baseMetadataPath)) {
      // Return minimal placeholder if base metadata doesn't exist
      const minimalMetadata: NFTMetadata = {
        name: `GPU Miner #${tokenId}`,
        description: "A powerful GPU NFT for mining operations",
        image: "https://gpu-mine.com/images/common.png",
        image_site: "/images/common.png",
        animation_site: "/videos/common.mp4",
        animation_url: "https://gpu-mine.com/videos/common.mp4",
        external_url: "https://gpu-mine.com",
        attributes: [
          {
            trait_type: "Rarity",
            value: "Common",
          },
          {
            trait_type: "Power",
            value: "TBD",
          },
          {
            trait_type: "Token ID",
            value: tokenId,
          },
          {
            trait_type: "Status",
            value: "Pending Generation",
          },
        ],
        power: 0,
        rarity: "Common",
      };
      
      return NextResponse.json(minimalMetadata);
    }
    
    const baseMetadata: BaseMetadata = JSON.parse(
      fs.readFileSync(baseMetadataPath, "utf8")
    );

    const placeholderMetadata: NFTMetadata = {
      name: `GPU Miner #${tokenId}`,
      description: baseMetadata.description,
      image: baseMetadata.image,
      image_site: "/images/common.png",
      animation_site: "/videos/common.mp4",
      animation_url: "https://gpu-mine.com/videos/common.mp4",
      external_url: baseMetadata.external_url,
      attributes: [
        ...baseMetadata.attributes,
        {
          trait_type: "Power",
          value: "TBD",
        },
        {
          trait_type: "Token ID",
          value: tokenId,
        },
        {
          trait_type: "Status",
          value: "Pending Generation",
        },
      ],
      power: 0,
      rarity: "Common",
    };

    return NextResponse.json(placeholderMetadata);
  } catch (error) {
    console.error("Error serving NFT metadata:", error);
    
    // Return minimal fallback metadata even if there's an error
    const fallbackMetadata: NFTMetadata = {
      name: `GPU Miner #${params.tokenId}`,
      description: "A powerful GPU NFT for mining operations",
      image: "https://gpu-mine.com/images/common.png",
      image_site: "/images/common.png",
      animation_site: "/videos/common.mp4",
      animation_url: "https://gpu-mine.com/videos/common.mp4",
      external_url: "https://gpu-mine.com",
      attributes: [
        {
          trait_type: "Rarity",
          value: "Common",
        },
        {
          trait_type: "Power",
          value: "TBD",
        },
        {
          trait_type: "Token ID",
          value: params.tokenId,
        },
        {
          trait_type: "Status",
          value: "Error Loading",
        },
      ],
      power: 0,
      rarity: "Common",
    };
    
    return NextResponse.json(fallbackMetadata);
  }
} 