import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { CAR_CATALOG, CONTRACT_ADDRESSES } from "@/constants";
import { TorqueDriftGame__factory } from "@/contracts/factories";

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

  let selectedItem: NFTItem;
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

  selectedItem = createNFTItem(catalogItem, probability);
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

    if (!userWallet || !burnTxSignature) {
      return NextResponse.json(
        {
          error: "Missing required fields: userWallet, burnTxSignature",
        },
        { status: 400 }
      );
    }

    const expectedBurnAmount = "300";
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

    const catalogData = CAR_CATALOG.find(
      (car) => car.rarity === rarity && car.version === version
    )!;

    return NextResponse.json({
      rewardItem: {
        id: rewardItem.id,
        name: catalogData.name,
        symbol: rewardItem.symbol,
        uri: rewardItem.uri,
        rarity: rewardItem.rarity,
        version: rewardItem.version,
        image: catalogData.image,
        description: catalogData.description,
        dailyYield: catalogData.dailyYield,
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
