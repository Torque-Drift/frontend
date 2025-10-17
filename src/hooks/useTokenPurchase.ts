import { useMutation } from "@tanstack/react-query";
import { TorqueDriftToken__factory } from "@/contracts";
import { CONTRACT_ADDRESSES } from "@/constants";
import { useEthers } from "./useEthers";
import toast from "react-hot-toast";

export const useTokenPurchase = () => {
  const { signer, address, isConnected } = useEthers();

  const mutation = useMutation({
    mutationFn: async ({ tokenAmount }: { tokenAmount: number }) => {
      if (!signer || !isConnected || !address) {
        throw new Error("Wallet not connected");
      }

      if (tokenAmount < 1) throw new Error("Minimum purchase is 1 token");
      try {
        const tokenContract = TorqueDriftToken__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftToken,
          signer
        );

        // Convert token amount to contract format (9 decimals)
        const tokenAmountWei = BigInt(tokenAmount) * BigInt(10 ** 9);

        // Calculate required BNB using contract function
        const requiredBnb = await tokenContract.calculateBnbForTokens(tokenAmountWei);
        const requiredBnbEther = Number(requiredBnb) / 10 ** 18;

        const balance = await signer.provider.getBalance(address);
        if (balance < requiredBnb) {
          throw new Error(
            `Insufficient BNB balance. Required: ${requiredBnbEther} BNB, Available: ${
              Number(balance) / 10 ** 18
            } BNB`
          );
        }

        // Purchase tokens using contract function
        const purchaseTx = await tokenContract.purchaseTokens(tokenAmountWei, {
          value: requiredBnb,
        });

        const receipt = await purchaseTx.wait();

        toast.success(`Successfully purchased ${tokenAmount} $TOD tokens!`);

        return {
          transactionHash: receipt?.hash,
          tokenAmount,
          bnbAmount: requiredBnbEther,
          status: "purchased",
        };
      } catch (error: any) {
        console.error("Token purchase failed:", error);

        if (error.code === "CALL_EXCEPTION") {
          throw new Error(
            "Purchase failed. Contract may be paused or you may not meet requirements."
          );
        }
        if (error.code === "INSUFFICIENT_FUNDS") {
          throw new Error("Insufficient BNB balance for purchase.");
        }

        throw error;
      }
    },
    onError: (error, variables) => {
      if (error.message.includes("user rejected action")) {
        toast.error("User rejected action");
      } else {
        toast.error(
          `Failed to purchase ${variables.tokenAmount} tokens: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
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
