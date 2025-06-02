import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import { GpuAbi__factory } from "@/contracts";
import { gpuAddress } from "@/constants";
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

const pesosRaridade = {
  comum: 70,
  rara: 25,
  epica: 4.5,
  lendaria: 0.5,
};

let distribuicaoCache: Array<{
  hashpower: number;
  probabilidade: number;
}> | null = null;

const metadataCache = new Map<string, NFTMetadata>();

function gerarDistribuicao() {
  if (distribuicaoCache) return distribuicaoCache;
  const distribuicao = [];
  for (const [raridade, faixa] of Object.entries(raridades)) {
    const pesoTotal = pesosRaridade[raridade as keyof typeof pesosRaridade];
    const quantidadeHashpowers = faixa.max - faixa.min + 1;
    const probPorHash = pesoTotal / quantidadeHashpowers;
    for (let hash = faixa.min; hash <= faixa.max; hash++) {
      distribuicao.push({
        hashpower: hash,
        probabilidade: probPorHash,
      });
    }
  }
  distribuicaoCache = distribuicao;
  return distribuicao;
}

function sortearHashpower(
  distribuicao: Array<{ hashpower: number; probabilidade: number }>
) {
  const total = distribuicao.reduce((acc, item) => acc + item.probabilidade, 0);
  let acumulado = 0;
  const acumulada = distribuicao.map((item) => {
    acumulado += item.probabilidade / total;
    return {
      hashpower: item.hashpower,
      acumulado,
    };
  });
  const rand = Math.random();
  for (const item of acumulada) {
    if (rand <= item.acumulado) {
      return item.hashpower;
    }
  }
  return acumulada[acumulada.length - 1].hashpower;
}

function sortearHashpowerCached() {
  const distribuicao = gerarDistribuicao();
  return sortearHashpower(distribuicao);
}

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

async function getProvider() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
  return provider;
}

export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json();
    const power = sortearHashpowerCached();
    const raridadePortugues = classificarRaridade(power);
    const dadosRaridade = obterDadosRaridade(raridadePortugues);
    const rarity = dadosRaridade.name;
    const metadataFile = dadosRaridade.file;

    const metadataPath = path.join(
      process.cwd(),
      "public",
      "metadata",
      metadataFile
    );
    const baseMetadata: BaseMetadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );

    const metadata: NFTMetadata = {
      name: `${baseMetadata.name} #${tokenId}`,
      description: baseMetadata.description,
      image: baseMetadata.image,
      image_site: `/images/${rarity.toLowerCase()}.png`,
      animation_site: `/videos/${rarity.toLowerCase()}.mp4`,
      animation_url: `https://gpu-mine.com/videos/${rarity.toLowerCase()}.mp4`,
      external_url: baseMetadata.external_url,
      attributes: [
        ...baseMetadata.attributes,
        {
          trait_type: "Power",
          value: power,
        },
        {
          trait_type: "Token ID",
          value: tokenId,
        },
      ],
      power,
      rarity,
    };

    metadataCache.set(tokenId, metadata);
    const savedToSupabase = await MetadataService.saveMetadata(tokenId, metadata);
    if (!savedToSupabase) {
      console.warn(`Failed to save metadata to Supabase for token ${tokenId}, using memory cache only`);
    }

    const uri = `https://gpu-mine.com/api/metadata/${tokenId}`;

    const provider = await getProvider();
    const wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY_OPERATOR!,
      provider
    );
    const gpuContract = GpuAbi__factory.connect(gpuAddress, wallet);
    const box = await gpuContract.setGPUStatus(tokenId, uri, power, {
      gasLimit: 1000000,
    });
    console.log(box);
    await box.wait();
    /* const refresh = `https://api.opensea.io/api/v2/chain/amoy/contract/${gpuAddress}/nfts/${tokenId}/refresh`;
    await axios.post(refresh, {
      headers: { "X-API-KEY": process.env.OPENSEA_API_KEY! },
    }); */

    return NextResponse.json({
      success: true,
      metadata,
      uri,
      savedToDatabase: savedToSupabase
    });
  } catch (error) {
    console.error("Error generating NFT metadata:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate metadata" },
      { status: 500 }
    );
  }
}

export { metadataCache };

export async function GET() {
  return NextResponse.json({
    message: "GPU NFT Metadata Generator",
    rarities: {
      common: "70% (Hashpower: 10-25)",
      rare: "25% (Hashpower: 26-50)",
      epic: "4.5% (Hashpower: 51-75)",
      legendary: "0.5% (Hashpower: 76-100)",
    },
    system: "Advanced RNG with weighted distribution",
    note: "Each hashpower value within a rarity range has equal probability within that rarity tier",
  });
}
