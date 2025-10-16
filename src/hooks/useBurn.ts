import { useMutation } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES } from "@/constants";
import { TorqueDriftToken__factory } from "@/contracts";
import { useEthers } from "./useEthers";
import toast from "react-hot-toast";

async function burnTokensForLootbox(signer: any) {
  if (!signer) throw new Error("Wallet not connected");

  const tokenContract = TorqueDriftToken__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftToken,
    signer
  );

  const tokensToBurn = 300;
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
        `Insufficient $TOD balance. Required: ${tokensToBurn} $TOD, Available: ${balanceInTokens} $TOD`
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

  const mutation = useMutation({
    mutationFn: async () => {
      if (!signer || !isConnected || !address)
        throw new Error("Wallet not connected");
      const burnTxSignature = await burnTokensForLootbox(signer);
      if (!burnTxSignature) throw new Error("Failed to get transaction hash");
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: address,
          burnTxSignature,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to open lootbox");
      }
      const lootboxResult = await response.json();
      const item = lootboxResult.rewardItem;
      return {
        burnTxSignature,
        rewardItem: item,
        itemDetails: {
          id: item.id,
          name: item.name,
          rarity: item.rarity,
          version: item.version,
          dailyYield: item.dailyYield,
          cooldown: item.cooldown,
          roi: item.roi,
          uri: item.uri,
        },
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
