import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { CAR_CATALOG, CONTRACT_ADDRESSES } from "@/constants";
import {
  TorqueDriftAdmin__factory,
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
  dailyYield: number;
}

// Helper function to create NFTItem from catalog item
function createNFTItem(catalogItem: any, probability: number): NFTItem {
  const rarityMap: Record<number, Rarity> = {
    0: Rarity.COMMON,
    1: Rarity.RARE,
    2: Rarity.EPIC,
    3: Rarity.LEGENDARY,
  };

  const versionMap: Record<number, Version> = {
    0: Version.VINTAGE,
    1: Version.MODERN,
  };

  return {
    id: `${catalogItem.rarity}-${catalogItem.version}`,
    name: catalogItem.name,
    symbol: `TD${catalogItem.rarity}${catalogItem.version}`,
    uri: `/api/metadata/${catalogItem.rarity}/${catalogItem.version}`,
    rarity: rarityMap[catalogItem.rarity],
    version: versionMap[catalogItem.version],
    probability,
    hashRange: catalogItem.hashRange as [number, number],
    dailyYield: catalogItem.dailyYield,
  };
}

// Provably Fair function to determine NFT reward based on transaction hash
function getProvablyFairItem(transactionHash: string): NFTItem {
  // Convert transaction hash to a number between 0-99
  const hashValue = parseInt(transactionHash.slice(-8), 16) % 100;

  console.log(`🎲 Provably Fair: hashValue = ${hashValue}`);

  let catalogItem: any;
  let probability: number;

  // Find the item that matches the hash value using probability ranges
  // Common Vintage: 0-41 (42% chance)
  if (hashValue >= 0 && hashValue <= 41) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 0 && item.version === 0
    )!;
    probability = 0.42;
    console.log(`🎯 Selected: ${catalogItem.name} (42% chance)`);
  }
  // Common Modern: 42-69 (28% chance)
  else if (hashValue >= 42 && hashValue <= 69) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 0 && item.version === 1
    )!;
    probability = 0.28;
    console.log(`🎯 Selected: ${catalogItem.name} (28% chance)`);
  }
  // Rare Vintage: 70-84 (15% chance)
  else if (hashValue >= 70 && hashValue <= 84) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 1 && item.version === 0
    )!;
    probability = 0.15;
    console.log(`🎯 Selected: ${catalogItem.name} (15% chance)`);
  }
  // Rare Modern: 85-94 (10% chance)
  else if (hashValue >= 85 && hashValue <= 94) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 1 && item.version === 1
    )!;
    probability = 0.1;
    console.log(`🎯 Selected: ${catalogItem.name} (10% chance)`);
  }
  // Epic Vintage: 95-96 (~3% chance)
  else if (hashValue >= 95 && hashValue <= 96) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 2 && item.version === 0
    )!;
    probability = 0.03;
    console.log(`🎯 Selected: ${catalogItem.name} (~3% chance)`);
  }
  // Epic Modern: 97-98 (~2% chance)
  else if (hashValue >= 97 && hashValue <= 98) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 2 && item.version === 1
    )!;
    probability = 0.02;
    console.log(`🎯 Selected: ${catalogItem.name} (~2% chance)`);
  }
  // Legendary: 99 (~2% chance total) - alternar entre vintage e modern baseado no último dígito
  else if (hashValue === 99) {
    const lastDigit = parseInt(transactionHash.slice(-1), 16) % 2;
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 3 && item.version === lastDigit
    )!;
    probability = 0.02;
    console.log(`🎯 Selected: ${catalogItem.name} (Legendary - ~2% chance)`);
  } else {
    // Fallback (shouldn't happen with proper ranges 0-99)
    console.warn(
      `⚠️ Unexpected hashValue: ${hashValue}, returning common-vintage`
    );
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 0 && item.version === 0
    )!;
    probability = 0.42;
  }

  const selectedItem = createNFTItem(catalogItem, probability);
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
    const { userWallet, burnTxSignature, lootboxAmount = 1 } = body;

    console.log(`📦 API received: userWallet=${userWallet}, lootboxAmount=${lootboxAmount}`);

    if (!userWallet || !burnTxSignature) {
      return NextResponse.json(
        {
          error: "Missing required fields: userWallet, burnTxSignature",
        },
        { status: 400 }
      );
    }

    // Validate lootboxAmount
    if (lootboxAmount < 1 || lootboxAmount > 10) {
      return NextResponse.json(
        {
          error: "Invalid lootbox amount. Must be between 1 and 10.",
        },
        { status: 400 }
      );
    }

    // Calculate expected burn amount based on lootbox amount with discounts
    const baseCost = 300;
    let totalCost = baseCost * lootboxAmount;

    // Apply discounts
    if (lootboxAmount === 5) {
      totalCost = Math.floor(totalCost * 0.95); // 5% discount
    } else if (lootboxAmount === 10) {
      totalCost = Math.floor(totalCost * 0.9); // 10% discount
    }

    const expectedBurnAmount = totalCost.toString();

    if (!/^0x[a-fA-F0-9]{64}$/.test(burnTxSignature)) {
      return NextResponse.json(
        { error: "Invalid transaction hash format" },
        { status: 400 }
      );
    }
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
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
      `Transaction validated successfully. Burn amount: ${validation.burnAmount}, Expected: ${expectedBurnAmount}, Lootboxes: ${lootboxAmount}`
    );

    // Generate multiple rewards using provably fair system
    const rewardItems: any[] = [];
    const carsToMint: NFTItem[] = [];

    console.log(`🎲 Starting to generate ${lootboxAmount} rewards...`);

    for (let i = 0; i < lootboxAmount; i++) {
      const baseHash = burnTxSignature.slice(2); // Remove '0x' prefix
      const hashLength = baseHash.length;

      // Use different segments of the hash for each lootbox to ensure better distribution
      const segmentSize = Math.max(8, Math.floor(hashLength / lootboxAmount));
      const startPos = (i * segmentSize) % (hashLength - 8);
      const segment = baseHash.slice(startPos, startPos + 8);

      // Add entropy based on the index to ensure uniqueness
      const entropy = (i * 0x9E3779B9) >>> 0; // Use golden ratio hash for better distribution
      const segmentValue = parseInt(segment, 16);
      const uniqueValue = (segmentValue + entropy) >>> 0; // Use unsigned right shift for 32-bit

      // Create the unique hash by combining the modified segment with other parts
      const uniqueSegment = uniqueValue.toString(16).padStart(8, '0').slice(-8);
      const remainingHash = baseHash.slice(0, startPos) + baseHash.slice(startPos + 8);
      const uniqueHash = '0x' + uniqueSegment + remainingHash.slice(0, hashLength - 8);

      console.log(`🎯 Generating reward ${i + 1}/${lootboxAmount} with hash: ${uniqueHash} (segment: ${segment}, entropy: ${entropy})`);
      const rewardItem = getProvablyFairItem(uniqueHash);
      console.log(`✅ Generated: ${rewardItem.rarity} ${rewardItem.version} - ${rewardItem.name}`);

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

      // Collect all cars to mint in batch
      carsToMint.push(rewardItem);

      const catalogData = CAR_CATALOG.find(
        (car) => car.rarity === rarity && car.version === version
      )!;

      rewardItems.push({
        id: rewardItem.id,
        name: catalogData.name,
        symbol: rewardItem.symbol,
        uri: rewardItem.uri,
        rarity: rewardItem.rarity,
        version: rewardItem.version,
        image: catalogData.image,
        description: catalogData.description,
        dailyYield: catalogData.dailyYield,
        hashValue: parseInt(uniqueHash.slice(-8), 16) % 100,
        lootboxIndex: i + 1,
      });
    }

    console.log(`🎉 Generated ${rewardItems.length} reward items and ${carsToMint.length} cars to mint`);

    // Mint all cars in batch
    const batchTxHash = await mintCarBatch(userWallet, carsToMint, provider);

    return NextResponse.json({
      rewardItems,
      lootboxAmount,
      totalBurnAmount: validation.burnAmount,
      expectedBurnAmount,
      discountApplied: lootboxAmount === 5 ? 5 : lootboxAmount === 10 ? 10 : 0,
      batchTxHash,
      // Include validation details
      transactionValidated: true,
    });
  } catch (error) {
    console.error("Error in lootbox draw:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function mintCarBatch(
  userWallet: string,
  cars: NFTItem[],
  provider: ethers.JsonRpcProvider
): Promise<string> {
  try {
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || "");
    const signer = wallet.connect(provider);
    const carsContract = await TorqueDriftCars__factory.connect(
      CONTRACT_ADDRESSES.TorqueDriftCars,
      signer
    );

    // Prepare arrays for batch mint
    const owners = cars.map(() => userWallet); // Same owner for all cars
    const rarities = cars.map((car) =>
      car.rarity === "Common"
        ? 0
        : car.rarity === "Rare"
        ? 1
        : car.rarity === "Epic"
        ? 2
        : 3
    );
    const versions = cars.map((car) => (car.version === "Vintage" ? 0 : 1));

    // Execute mint in batch
    const tx = await carsContract.createGameCarBatch(
      owners,
      rarities,
      versions
    );

    console.log("Transação enviada:", tx.hash);

    const receipt = await tx.wait();
    console.log("Carros criados no bloco:", receipt?.blockNumber);

    return tx.hash;
  } catch (error) {
    console.error("Error minting car batch:", error);
    throw error;
  }
}

