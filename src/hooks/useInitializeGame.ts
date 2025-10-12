import { useState, useEffect } from "react";
import { CONTRACT_ADDRESSES } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { TorqueDriftGame__factory } from "@/contracts";
import { useEthers } from "./useEthers";
import { ethers } from "ethers";

interface InitializeGameParams {
  referrerPubkey?: string;
}

export const useInitializeGame = () => {
  const { signer, address, isConnected, provider } = useEthers();
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState(false);

  // Query to check if user exists
  const {
    data: userExists,
    isLoading: checkingUser,
    error: checkError,
  } = useQuery({
    queryKey: ["userExists", address],
    queryFn: async (): Promise<boolean> => {
      if (!address || !provider) {
        console.warn(
          "Address or provider not available for user existence check"
        );
        return false;
      }

      try {
        const gameContract = TorqueDriftGame__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftGame,
          provider
        );

        const userState = await gameContract.getUserState(address);
        console.log("userState", userState);
        return Boolean(userState[20]) || false; // Index 20 is gameStarted
      } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
      }
    },
    enabled: !!address && isConnected && !!provider,
    staleTime: 30000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
  });

  // Mutation to initialize game
  const initializeMutation = useMutation({
    mutationFn: async (params: InitializeGameParams) => {
      if (!signer || !isConnected || !address) {
        throw new Error("Wallet not connected or signer not available");
      }

      console.log(`👤 Initializing game for user: ${address}`);

      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );

      let referrerAddress = "0x1111111111111111111111111111111111111112";

      if (params.referrerPubkey) {
        if (
          params.referrerPubkey.startsWith("0x") &&
          params.referrerPubkey.length === 42
        ) {
          referrerAddress = params.referrerPubkey;
        }
      }

      const tx = await gameContract.initializeStartGame(referrerAddress, {
        value: ethers.parseEther("0.1"),
      });
      await tx.wait();

      return { success: true };
    },
    onMutate: () => {
      setIsInitializing(true);
    },
    onSuccess: async () => {
      // Invalidate user existence check
      queryClient.invalidateQueries({
        queryKey: ["userExists", address],
      });

      // Invalidate user data
      queryClient.invalidateQueries({
        queryKey: ["userData", address],
      });

      // Force refetch of user data
      await queryClient.refetchQueries({
        queryKey: ["userData", address],
      });

      toast.success("Game initialized successfully!");
    },
    onSettled: () => {
      setIsInitializing(false);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      console.error("Failed to initialize game:", error);

      if (errorMessage.includes("already initialized")) {
        toast.error("Your account is already initialized!");
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient funds to initialize game");
      } else {
        toast.error(`Failed to initialize game: ${errorMessage}`);
      }
    },
  });

  const initializeGame = async (params: InitializeGameParams = {}) => {
    return initializeMutation.mutateAsync(params);
  };

  return {
    userExists: userExists || false,
    checkingUser,
    initializeGame,
    isInitializing,
    initializeError: initializeMutation.error || checkError,
  };
};
