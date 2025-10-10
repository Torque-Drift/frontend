import { useMutation } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES } from "@/constants";
import { TorqueDriftToken__factory } from "@/contracts";
import { useEthers } from "./useEthers";
import toast from "react-hot-toast";

async function burnTokens(
  burnAmount: number,
  signer: any
) {
  if (!signer) {
    throw new Error("Wallet not connected");
  }

  const tokenContract = TorqueDriftToken__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftToken,
    signer
  );
  // Convert amount to wei (assuming 18 decimals for ERC20)
  const amountToBurn = burnAmount * Math.pow(10, 18);

  const tx = await tokenContract.burn(amountToBurn);
  const receipt = await tx.wait();

  console.log("Tokens burned successfully:", receipt?.hash);
  return receipt?.hash;
}

export const useBurn = () => {
  const { signer, address, isConnected } = useEthers();

  const mutation = useMutation({
    mutationFn: async ({
      burnAmount,
      boxType,
    }: {
      burnAmount: number;
      boxType: string;
    }) => {
      if (!signer || !isConnected) {
        throw new Error("Wallet not connected");
      }
      const burnTxSignature = await burnTokens(burnAmount, signer);

      // For now, just return the burn transaction. The lootbox logic would need to be reimplemented for Ethereum
      toast.success(`${boxType} opened successfully! Check your new car.`);

      return { burnTxSignature };
    },
    onError: (error, variables) => {
      toast.error(
        `Failed to open ${variables.boxType}: ${
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
