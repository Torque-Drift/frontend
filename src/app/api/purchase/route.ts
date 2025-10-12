import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "@/constants";
import {
  TorqueDriftCars__factory,
  TorqueDriftGame__factory,
} from "@/contracts/factories";

// Enums for NFT items
enum Rarity {
  COMMON = "Common",
  RARE = "Rare",
  EPIC = "Epic",
  LEGENDARY = "Legendary",
}

enum Version {
  VINTAGE = "Vintage",
  MODERN = "Modern",
}

interface NFTItem {
  id: string;
  name: string;
  symbol: string;
  uri: string;
  rarity: Rarity;
  version: Version;
  probability: number;
  hashRange: [number, number];
  cooldown: number;
  dailyYield: number;
  roi: number;
}

const nftCatalog: NFTItem[] = [
  {
    id: "common-vintage",
    name: "Common Vintage Car",
    symbol: "CVNTG",
    uri: "https://api.torquedrift.fun/metadata/common-vintage.json",
    rarity: Rarity.COMMON,
    version: Version.VINTAGE,
    probability: 0.42,
    hashRange: [0, 41], // 42% (0-41)
    cooldown: 12,
    dailyYield: 0.931,
    roi: 12.53,
  },
  {
    id: "common-modern",
    name: "Common Modern Car",
    symbol: "CMOD",
    uri: "https://api.torquedrift.fun/metadata/common-modern.json",
    rarity: Rarity.COMMON,
    version: Version.MODERN,
    probability: 0.28,
    hashRange: [42, 69], // 28% (42-69)
    cooldown: 11,
    dailyYield: 1.33,
    roi: 8.77,
  },
  {
    id: "rare-vintage",
    name: "Rare Vintage Car",
    symbol: "UVNTG",
    uri: "https://api.torquedrift.fun/metadata/rare-vintage.json",
    rarity: Rarity.RARE,
    version: Version.VINTAGE,
    probability: 0.15,
    hashRange: [70, 84], // 15% (70-84)
    cooldown: 9,
    dailyYield: 2.194,
    roi: 5.32,
  },
  {
    id: "rare-modern",
    name: "Rare Modern Car",
    symbol: "UMOD",
    uri: "https://api.torquedrift.fun/metadata/rare-modern.json",
    rarity: Rarity.RARE,
    version: Version.MODERN,
    probability: 0.1,
    hashRange: [85, 94], // 10% (85-94)
    cooldown: 8,
    dailyYield: 2.792,
    roi: 4.18,
  },
  {
    id: "epic-vintage",
    name: "Epic Vintage Car",
    symbol: "EVNTG",
    uri: "https://api.torquedrift.fun/metadata/epic-vintage.json",
    rarity: Rarity.EPIC,
    version: Version.VINTAGE,
    probability: 0.027,
    hashRange: [95, 96], // ~3% (95-96)
    cooldown: 6,
    dailyYield: 3.79,
    roi: 3.08,
  },
  {
    id: "epic-modern",
    name: "Epic Modern Car",
    symbol: "EMOD",
    uri: "https://api.torquedrift.fun/metadata/epic-modern.json",
    rarity: Rarity.EPIC,
    version: Version.MODERN,
    probability: 0.018,
    hashRange: [97, 98], // ~2% (97-98)
    cooldown: 5,
    dailyYield: 4.488,
    roi: 2.6,
  },
  {
    id: "legendary-vintage",
    name: "Legendary Vintage Car",
    symbol: "LVNTG",
    uri: "https://api.torquedrift.fun/metadata/legendary-vintage.json",
    rarity: Rarity.LEGENDARY,
    version: Version.VINTAGE,
    probability: 0.003,
    hashRange: [99, 99], // ~1% (99)
    cooldown: 4,
    dailyYield: 5.452,
    roi: 2.14,
  },
  {
    id: "legendary-modern",
    name: "Dodge Challenger Black",
    symbol: "LMOD",
    uri: "https://api.torquedrift.fun/metadata/legendary-modern.json",
    rarity: Rarity.LEGENDARY,
    version: Version.MODERN,
    probability: 0.002,
    hashRange: [99, 99], // ~1% (99) - compartilhado para raridade
    cooldown: 3,
    dailyYield: 6.117,
    roi: 1.91,
  },
];

// Car catalog data based on rarity and version
function getCarCatalogData(rarity: number, version: number) {
  // Mapeamento baseado no nftCatalog do NftDrawService
  const catalogMap: Record<string, any> = {
    // Common
    "0-0": {
      name: "Chevrolet Bel Air 1955",
      description:
        "The classic American beauty from the 1950s. This rock 'n' roll era icon combines vintage elegance with reliable performance. Its aerodynamic design and V8 engine make it a popular choice for those who appreciate automotive history.",
      image: "/images/common_0.png",
      hashRange: [10, 18],
      cooldown: 12,
      dailyYield: 0.931,
      roi: 12.53,
    },
    "0-1": {
      name: "UNO With Stairs",
      description:
        "A modern and creative take on the classic Fiat Uno. This compact urban vehicle features external stairs for easy rooftop access, perfect for urban adventures and improvised street races.",
      image: "/images/common_1.png",
      hashRange: [15, 25],
      cooldown: 11,
      dailyYield: 1.33,
      roi: 8.77,
    },
    // Rare
    "1-0": {
      name: "Rare Vintage Car",
      description:
        "A rare gem from the vintage collection. This classic vehicle has been meticulously restored with attention to original details, maintaining authenticity while offering modern performance. Perfect for collectors and enthusiasts.",
      image: "/images/rare_0.png",
      hashRange: [26, 40],
      cooldown: 9,
      dailyYield: 2.194,
      roi: 5.32,
    },
    "1-1": {
      name: "Golf GTI 2025",
      description:
        "The ultimate evolution of the sporty hatchback. With cutting-edge technology and aerodynamic design, this Golf GTI 2025 delivers an exceptional driving experience, combining daily comfort with track performance.",
      image: "/images/rare_1.png",
      hashRange: [34, 50],
      cooldown: 8,
      dailyYield: 2.792,
      roi: 4.18,
    },
    // Epic
    "2-0": {
      name: "Epic Vintage Car",
      description:
        "A masterpiece of vintage engineering. This legendary vehicle combines classic elegance with modern modifications, creating a unique machine that honors the past while leading the future of racing.",
      image: "/images/epic_0.png",
      hashRange: [51, 63],
      cooldown: 6,
      dailyYield: 3.79,
      roi: 3.08,
    },
    "2-1": {
      name: "Red Car",
      description:
        "A fiery red speedster that turns heads wherever it goes. Its vibrant color is more than just aesthetic - it symbolizes the passion and speed that this vehicle delivers on every turn and straight of the track.",
      image: "/images/epic_1.png",
      hashRange: [60, 75],
      cooldown: 5,
      dailyYield: 4.488,
      roi: 2.6,
    },
    // Legendary
    "3-0": {
      name: "Chevrolet Impala 1967",
      description:
        "The ultimate muscle car from the classic era. This 1967 Impala represents the pinnacle of American power, with its powerful V8 engine and imposing design. A legend on wheels that continues to dominate the tracks.",
      image: "/images/legendary_0.png",
      hashRange: [76, 88],
      cooldown: 4,
      dailyYield: 5.452,
      roi: 2.14,
    },
    "3-1": {
      name: "Dodge Challenger Black 2023",
      description:
        "Absolute darkness meets maximum speed. This midnight black Challenger combines muscle car heritage with cutting-edge technology, creating an unstoppable machine that leaves legendary trails wherever it goes.",
      image: "/images/legendary_1.png",
      hashRange: [84, 100],
      cooldown: 3,
      dailyYield: 6.117,
      roi: 1.91,
    },
  };

  const key = `${rarity}-${version}`;
  return catalogMap[key] || catalogMap["0-0"];
}

// Provably Fair function to determine NFT reward based on transaction hash
function getProvablyFairItem(transactionHash: string): NFTItem {
  // Convert transaction hash to a number between 0-99
  const hashValue = parseInt(transactionHash.slice(-8), 16) % 100;

  console.log(`🎲 Provably Fair: hashValue = ${hashValue}`);

  let selectedItem: NFTItem;

  // Find the item that matches the hash value using probability ranges
  // Common Vintage: 0-41 (42% chance)
  if (hashValue >= 0 && hashValue <= 41) {
    selectedItem = nftCatalog.find((item) => item.id === "common-vintage")!;
    console.log(
      `🎯 Selected: ${selectedItem.name} (${
        selectedItem.probability * 100
      }% chance)`
    );
  }
  // Common Modern: 42-69 (28% chance)
  else if (hashValue >= 42 && hashValue <= 69) {
    selectedItem = nftCatalog.find((item) => item.id === "common-modern")!;
    console.log(
      `🎯 Selected: ${selectedItem.name} (${
        selectedItem.probability * 100
      }% chance)`
    );
  }
  // Rare Vintage: 70-84 (15% chance)
  else if (hashValue >= 70 && hashValue <= 84) {
    selectedItem = nftCatalog.find((item) => item.id === "rare-vintage")!;
    console.log(
      `🎯 Selected: ${selectedItem.name} (${
        selectedItem.probability * 100
      }% chance)`
    );
  }
  // Rare Modern: 85-94 (10% chance)
  else if (hashValue >= 85 && hashValue <= 94) {
    selectedItem = nftCatalog.find((item) => item.id === "rare-modern")!;
    console.log(
      `🎯 Selected: ${selectedItem.name} (${
        selectedItem.probability * 100
      }% chance)`
    );
  }
  // Epic Vintage: 95-96 (~3% chance)
  else if (hashValue >= 95 && hashValue <= 96) {
    selectedItem = nftCatalog.find((item) => item.id === "epic-vintage")!;
    console.log(
      `🎯 Selected: ${selectedItem.name} (${
        selectedItem.probability * 100
      }% chance)`
    );
  }
  // Epic Modern: 97-98 (~2% chance)
  else if (hashValue >= 97 && hashValue <= 98) {
    selectedItem = nftCatalog.find((item) => item.id === "epic-modern")!;
    console.log(
      `🎯 Selected: ${selectedItem.name} (${
        selectedItem.probability * 100
      }% chance)`
    );
  }
  // Legendary: 99 (~2% chance total) - alternar entre vintage e modern baseado no último dígito
  else if (hashValue === 99) {
    const lastDigit = parseInt(transactionHash.slice(-1), 16) % 2;
    selectedItem =
      lastDigit === 0
        ? nftCatalog.find((item) => item.id === "legendary-vintage")!
        : nftCatalog.find((item) => item.id === "legendary-modern")!;
    console.log(
      `🎯 Selected: ${selectedItem.name} (Legendary - ${
        selectedItem.probability * 100
      }% chance)`
    );
  } else {
    // Fallback (shouldn't happen with proper ranges 0-99)
    console.warn(
      `⚠️ Unexpected hashValue: ${hashValue}, returning common-vintage`
    );
    selectedItem = nftCatalog.find((item) => item.id === "common-vintage")!;
  }

  return selectedItem;
}

async function validateBurnTransaction(
  transactionHash: string,
  userWallet: string,
  provider: ethers.JsonRpcProvider,
  expectedAmount?: string
): Promise<{ isValid: boolean; burnAmount?: string; error?: string }> {
  try {
    // Initialize provider (you may want to use environment variables for RPC URL)

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(transactionHash);

    if (!receipt) {
      return { isValid: false, error: "Transaction not found on blockchain" };
    }

    if (receipt.status !== 1) {
      return { isValid: false, error: "Transaction failed" };
    }

    // Get transaction details
    const tx = await provider.getTransaction(transactionHash);

    if (!tx) {
      return { isValid: false, error: "Transaction details not found" };
    }

    // Check if transaction was sent to either game contract or token contract
    const TORQUE_DRIFT_GAME_ADDRESS = CONTRACT_ADDRESSES.TorqueDriftGame;
    const TORQUE_DRIFT_TOKEN_ADDRESS = CONTRACT_ADDRESSES.TorqueDriftToken;

    const targetAddress = tx.to?.toLowerCase();

    if (targetAddress === TORQUE_DRIFT_GAME_ADDRESS?.toLowerCase()) {
      // Transaction sent to game contract - should call gambleDiscount
      console.log("Validating game contract transaction");

      if (tx.data && tx.data.length > 10) {
        // Check function signature for gambleDiscount(uint8,uint256)
        const functionSignature = tx.data.slice(0, 10); // First 4 bytes + 0x
        const gambleFunctionSignature = "0x3793c8a7"; // keccak256("gambleDiscount(uint8,uint256)")[:8]

        if (functionSignature !== gambleFunctionSignature) {
          return {
            isValid: false,
            error: "Transaction did not call gambleDiscount function",
          };
        }
      }
    } else if (targetAddress === TORQUE_DRIFT_TOKEN_ADDRESS?.toLowerCase()) {
      // Transaction sent directly to token contract - should call burn
      console.log("Validating direct token burn transaction");

      if (tx.data && tx.data.length > 10) {
        // Check function signature for burn(uint256)
        const functionSignature = tx.data.slice(0, 10); // First 4 bytes + 0x
        const burnFunctionSignature = "0x42966c68"; // keccak256("burn(uint256)")[:8]

        if (functionSignature !== burnFunctionSignature) {
          return {
            isValid: false,
            error: "Transaction did not call burn function",
          };
        }

        // For direct burns, we can extract the amount from the transaction data
        if (expectedAmount) {
          const encodedAmount = tx.data.slice(10, 74); // uint256 parameter (64 chars)
          const burnAmount = ethers.formatUnits("0x" + encodedAmount, 9); // Token uses 9 decimals

          if (Number(burnAmount) !== Number(expectedAmount)) {
            return {
              isValid: false,
              error: `Burn amount mismatch: expected ${expectedAmount}, got ${burnAmount}`,
            };
          }
        }
      }
    } else {
      return {
        isValid: false,
        error: "Transaction not sent to valid contract",
      };
    }

    // Check for Transfer event logs that indicate token burn
    // Since the burn happens internally in the game contract, we look for Transfer events
    // from the user's address to zero address (burn)
    const transferLogs = receipt.logs.filter((log: any) => {
      // ERC20 Transfer event signature
      return (
        log.topics[0] ===
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
      );
    });

    if (transferLogs.length === 0) {
      return { isValid: false, error: "No token transfer events found" };
    }

    // Find burn transfer (from user to zero address)
    const burnTransfer = transferLogs.find((log: any) => {
      const fromAddress = "0x" + log.topics[1].slice(26); // Extract 'from' address from topic
      const toAddress = "0x" + log.topics[2].slice(26); // Extract 'to' address from topic
      return (
        fromAddress.toLowerCase() === userWallet.toLowerCase() && // From the user
        toAddress === "0x0000000000000000000000000000000000000000" // To burn address (zero)
      );
    });

    if (!burnTransfer) {
      return {
        isValid: false,
        error: "No burn transfer from user to zero address found",
      };
    }

    // Extract burn amount from log data (ERC20 Transfer event uses uint256)
    const burnAmount = ethers.formatUnits(burnTransfer.data, 9); // Token uses 9 decimals

    // Validate burn amount matches expected
    if (expectedAmount && Number(burnAmount) !== Number(expectedAmount)) {
      return {
        isValid: false,
        error: `Burn amount mismatch: expected ${expectedAmount}, got ${burnAmount}`,
      };
    }

    return {
      isValid: true,
      burnAmount,
    };
  } catch (error) {
    console.error("Error validating burn transaction:", error);
    return {
      isValid: false,
      error: `Blockchain validation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userWallet, burnTxSignature } = body;

    // Validate required fields
    if (!userWallet || !burnTxSignature) {
      return NextResponse.json(
        {
          error: "Missing required fields: userWallet, burnTxSignature",
        },
        { status: 400 }
      );
    }

    // Fixed: One lootbox costs exactly 100 tokens
    const expectedBurnAmount = "100";

    // Validate transaction hash format (basic Ethereum tx hash validation)
    if (!/^0x[a-fA-F0-9]{64}$/.test(burnTxSignature)) {
      return NextResponse.json(
        { error: "Invalid transaction hash format" },
        { status: 400 }
      );
    }
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL ||
        "https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
    );

    // Validate burn transaction on blockchain
    console.log(`Validating burn transaction: ${burnTxSignature}`);
    const validation = await validateBurnTransaction(
      burnTxSignature,
      userWallet,
      provider,
      expectedBurnAmount
    );

    if (!validation.isValid) {
      console.error(`Transaction validation failed: ${validation.error}`);
      return NextResponse.json(
        { error: `Transaction validation failed: ${validation.error}` },
        { status: 400 }
      );
    }

    console.log(
      `Transaction validated successfully. Burn amount: ${validation.burnAmount}`
    );

    // Use provably fair system to determine the reward
    const rewardItem = getProvablyFairItem(burnTxSignature);

    const rarity =
      typeof rewardItem.rarity === "string"
        ? rewardItem.rarity === "Common"
          ? 0
          : rewardItem.rarity === "Rare"
          ? 1
          : rewardItem.rarity === "Epic"
          ? 2
          : 3
        : rewardItem.rarity;
    const version =
      typeof rewardItem.version === "string"
        ? rewardItem.version === "Vintage"
          ? 0
          : 1
        : rewardItem.version;

    await mintCar(userWallet, rewardItem, provider);

    const catalogData = getCarCatalogData(rarity, version);

    // Return the reward item details with catalog data
    return NextResponse.json({
      rewardItem: {
        id: rewardItem.id,
        name: catalogData.name, // Use catalog name
        symbol: rewardItem.symbol,
        uri: rewardItem.uri,
        rarity: rewardItem.rarity,
        version: rewardItem.version,
        image: catalogData.image, // Add catalog image
        description: catalogData.description, // Add catalog description
        dailyYield: catalogData.dailyYield, // Use catalog yield
        cooldown: catalogData.cooldown, // Use catalog cooldown
        roi: catalogData.roi, // Use catalog ROI
        hashValue: parseInt(burnTxSignature.slice(-8), 16) % 100,
      },
      // Include validation details
      transactionValidated: true,
      burnAmount: validation.burnAmount,
      expectedBurnAmount,
    });
  } catch (error) {
    console.error("Error in lootbox draw:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function mintCar(
  userWallet: string,
  car: NFTItem,
  provider: ethers.JsonRpcProvider
): Promise<string> {
  try {
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || "");
    const signer = wallet.connect(provider);
    const carContract = await TorqueDriftGame__factory.connect(
      CONTRACT_ADDRESSES.TorqueDriftGame,
      signer
    );
    const rarity =
      car.rarity === "Common"
        ? 0
        : car.rarity === "Rare"
        ? 1
        : car.rarity === "Epic"
        ? 2
        : 3;
    const version = car.version === "Vintage" ? 0 : 1;
    const tx = await carContract.createAdditionalCar(
      userWallet,
      rarity,
      version
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error minting car:", error);
    throw error;
  }
}

