import { useMutation } from "@tanstack/react-query";
import { TorqueDriftToken__factory } from "@/contracts";
import { CONTRACT_ADDRESSES } from "@/constants";
import { useEthers } from "./useEthers";
import toast from "react-hot-toast";

// Helper function to calculate BNB needed for tokens
export const calculateBnbForTokens = async (tokenAmount: number, signer: any) => {
  const tokenContract = TorqueDriftToken__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftToken,
    signer
  );

  // Convert token amount to contract format (9 decimals)
  const tokenAmountWei = BigInt(tokenAmount) * BigInt(10 ** 9);

  const requiredBnb = await tokenContract.calculateBnbForTokens(tokenAmountWei);
  return requiredBnb;
};

// Helper function to calculate tokens for BNB amount
export const calculateTokensForBnb = async (bnbAmount: bigint, signer: any) => {
  const tokenContract = TorqueDriftToken__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftToken,
    signer
  );

  const tokensAmount = await tokenContract.calculateTokensForBnb(bnbAmount);
  // Convert from contract format (9 decimals) to readable number
  return Number(tokensAmount) / 10 ** 9;
};

export const useTokenPurchase = () => {
  const { signer, address, isConnected } = useEthers();

  const mutation = useMutation({
    mutationFn: async ({ tokenAmount }: { tokenAmount: number }) => {
      if (!signer || !isConnected || !address) {
        throw new Error("Wallet not connected");
      }

      if (tokenAmount < 1) {
        throw new Error("Minimum purchase is 1 token");
      }

      console.log(`Purchasing ${tokenAmount} $TOD tokens...`);

      try {
        const tokenContract = TorqueDriftToken__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftToken,
          signer
        );

        // Convert token amount to contract format (9 decimals)
        const tokenAmountWei = BigInt(tokenAmount) * BigInt(10 ** 9);

        // Calculate required BNB from contract
        const requiredBnb = await tokenContract.calculateBnbForTokens(tokenAmountWei);
        const requiredBnbEther = Number(requiredBnb) / 10 ** 18;

        console.log(`Required BNB: ${requiredBnbEther} BNB (${requiredBnb.toString()} wei)`);

        // Check if user has enough BNB
        const balance = await signer.provider.getBalance(address);
        if (balance < requiredBnb) {
          throw new Error(`Insufficient BNB balance. Required: ${requiredBnbEther} BNB, Available: ${Number(balance) / 10 ** 18} BNB`);
        }

        // Purchase tokens using contract function
        const purchaseTx = await tokenContract.purchaseTokens(tokenAmountWei, {
          value: requiredBnb
        });

        const receipt = await purchaseTx.wait();

        console.log("Token purchase completed:", receipt?.hash);

        toast.success(`Successfully purchased ${tokenAmount} $TOD tokens!`);

        return {
          transactionHash: receipt?.hash,
          tokenAmount,
          bnbAmount: requiredBnbEther,
          status: "purchased",
        };

      } catch (error: any) {
        console.error("Token purchase failed:", error);

        if (error.code === 'CALL_EXCEPTION') {
          throw new Error("Purchase failed. Contract may be paused or you may not meet requirements.");
        }
        if (error.code === 'INSUFFICIENT_FUNDS') {
          throw new Error("Insufficient BNB balance for purchase.");
        }

        throw error;
      }
    },
    onError: (error, variables) => {
      toast.error(
        `Failed to purchase ${variables.tokenAmount} tokens: ${
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

