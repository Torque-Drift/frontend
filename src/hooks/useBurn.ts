import { useMutation } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES } from "@/constants";
import {
  TorqueDriftToken__factory,
  TorqueDriftCars__factory,
  TorqueDriftGame__factory,
} from "@/contracts";
import { useEthers } from "./useEthers";
import { useInitializeGame } from "./useInitializeGame";
import toast from "react-hot-toast";

async function burnTokensForLootbox(signer: any, lootboxAmount: number = 1) {
  if (!signer) throw new Error("Wallet not connected");

  const address = await signer.getAddress();

  // Verificar limite diário de mints antes do burn
  const carsContract = TorqueDriftCars__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftCars,
    signer
  );

  const [currentMints, remainingMints] = await carsContract.getUserDailyMintStatus(address);

  if (Number(remainingMints) < lootboxAmount) {
    throw new Error(
      `Daily mint limit exceeded. You can mint ${remainingMints} more cars today.`
    );
  }

  const tokenContract = TorqueDriftToken__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftToken,
    signer
  );

  // Calculate tokens to burn based on lootbox amount with discounts
  const baseCost = 300;
  let totalCost = baseCost * lootboxAmount;

  // Apply discounts
  if (lootboxAmount === 5) {
    totalCost = Math.floor(totalCost * 0.95); // 5% discount
  } else if (lootboxAmount === 10) {
    totalCost = Math.floor(totalCost * 0.90); // 10% discount
  }

  const tokensToBurn = totalCost;
  const amountToBurn = BigInt(tokensToBurn) * BigInt(10 ** 9);

  try {
    const code = await signer.provider.getCode(
      CONTRACT_ADDRESSES.TorqueDriftToken
    );
    if (code === "0x") {
      throw new Error(
        "Token contract not found at the specified address. Please check if it's deployed."
      );
    }
    const address = await signer.getAddress();
    const balance = await tokenContract.balanceOf(address);
    const balanceInTokens = Number(balance) / 10 ** 9;

    if (balance < amountToBurn) {
      throw new Error(
        `Insufficient $TOD balance. Required: ${tokensToBurn} $TOD, Available: ${balanceInTokens.toFixed(2)} $TOD`
      );
    }

    let estimatedGas: bigint;
    try {
      estimatedGas = await tokenContract.burn.estimateGas(amountToBurn);
    } catch (estimateError: any) {
      console.error("Gas estimation failed:", estimateError);
      if (estimateError.code === "CALL_EXCEPTION") {
        throw new Error(
          "The burn function reverted during gas estimation. This usually means insufficient balance or the function has restrictions."
        );
      }
      throw estimateError;
    }
    const tx = await tokenContract.burn(amountToBurn, {
      gasLimit: estimatedGas * BigInt(2),
    });
    const receipt = await tx.wait();
    return receipt?.hash;
  } catch (error: any) {
    console.error("Burn transaction failed:", error);
    if (error.code === "CALL_EXCEPTION") {
      throw new Error(
        "Transaction reverted. This might be due to insufficient balance or contract restrictions."
      );
    }
    if (error.code === "INSUFFICIENT_FUNDS") {
      throw new Error("Insufficient BNB for gas fees.");
    }
    if (error.message.includes("user rejected action")) {
      throw new Error("User rejected action");
    }
    if (error.message.includes("ERC20: burn amount exceeds balance")) {
      throw new Error("You don't have enough $TOD tokens to burn.");
    }

    throw error;
  }
}

export const useBurn = () => {
  const { signer, address, isConnected } = useEthers();
  const { userExists } = useInitializeGame();

  const mutation = useMutation({
    mutationFn: async (lootboxAmount: number = 1) => {
      console.log(`🎯 useBurn called with lootboxAmount: ${lootboxAmount}`);

      if (!signer || !isConnected || !address)
        throw new Error("Wallet not connected");

      if (!userExists) {
        throw new Error(
          "You must initialize the game before opening lootboxes. Please start your account first."
        );
      }

      // Validate lootboxAmount
      if (lootboxAmount < 1 || lootboxAmount > 10) {
        throw new Error("Invalid lootbox amount. Must be between 1 and 10.");
      }

      // A verificação de limite diário agora é feita na função burnTokensForLootbox

      const burnTxSignature = await burnTokensForLootbox(signer, lootboxAmount);
      if (!burnTxSignature) throw new Error("Failed to get transaction hash");
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: address,
          burnTxSignature,
          lootboxAmount,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to open lootbox");
      }
      const lootboxResult = await response.json();
      return {
        burnTxSignature,
        rewardItems: lootboxResult.rewardItems,
        lootboxAmount,
        discountApplied: lootboxResult.discountApplied,
        itemDetails: lootboxResult.rewardItems?.map((item: any) => ({
          id: item.id,
          name: item.name,
          rarity: item.rarity,
          version: item.version,
          dailyYield: item.dailyYield,
          cooldown: item.cooldown,
          roi: item.roi,
          uri: item.uri,
          lootboxIndex: item.lootboxIndex,
        })),
      };
    },
    onError: (error) => {
      toast.error(
        `Failed to open lootbox: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
  };
};

