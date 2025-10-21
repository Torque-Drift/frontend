import { useState } from "react";
import { CONTRACT_ADDRESSES } from "@/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  TorqueDriftGame__factory,
  TorqueDriftReferral__factory,
} from "@/contracts";
import { useEthers } from "./useEthers";
import { ethers } from "ethers";

interface InitializeGameParams {
  referrerPubkey?: string;
}

async function checkReferralCode(
  referralCode: string,
  provider: ethers.Provider
) {
  if (!referralCode || referralCode.trim() === "") {
    return {
      isValid: false,
      hasDiscount: false,
      requiredPayment: ethers.parseEther("0.1"),
    };
  }

  try {
    const referralContract = TorqueDriftReferral__factory.connect(
      CONTRACT_ADDRESSES.TorqueDriftReferral,
      provider
    );

    const isValid = await referralContract.isValidReferralCode(referralCode);

    if (!isValid) {
      return {
        isValid: false,
        hasDiscount: false,
        requiredPayment: ethers.parseEther("0.1"),
        error: "Código de referral inválido",
      };
    }
    const hasDiscount = await referralContract.discountReferralCodes(
      referralCode
    );

    return {
      isValid: true,
      hasDiscount,
      requiredPayment: hasDiscount
        ? ethers.parseEther("0.09")
        : ethers.parseEther("0.1"),
    };
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return {
      isValid: false,
      hasDiscount: false,
      requiredPayment: ethers.parseEther("0.1"),
      error: "Erro ao verificar código",
    };
  }
}

export const useInitializeGame = () => {
  const { signer, address, isConnected, provider } = useEthers();
  const [isInitializing, setIsInitializing] = useState(false);

  // Query to check if user exists
  const {
    data: userExistsData,
    isLoading: checkingUser,
    error: checkError,
    refetch: refetchUserExists,
  } = useQuery({
    queryKey: ["userExists", address],
    queryFn: async (): Promise<{
      hasGameStarted: boolean;
      referrerCode: string;
    }> => {
      if (!address || !provider) {
        console.warn(
          "Address or provider not available for user existence check"
        );
        return { hasGameStarted: false, referrerCode: "" };
      }

      try {
        const gameContract = TorqueDriftGame__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftGame,
          provider
        );
        const referralContract = TorqueDriftReferral__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftReferral,
          provider
        );

        const started = await gameContract.getUserGameStarted(address);
        console.log(started)
        let referrerCode = "";
        if (started) {
          referrerCode = await referralContract.getUserReferralCode(address);
        }
        return { hasGameStarted: started, referrerCode };
      } catch (error) {
        console.error("Error checking user existence:", error);
        return { hasGameStarted: false, referrerCode: "" };
      }
    },
    enabled: !!address && isConnected && !!provider,
    staleTime: 30000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
  });

  const initializeMutation = useMutation({
    mutationFn: async (params: InitializeGameParams) => {
      if (!signer || !isConnected || !address || !provider) {
        throw new Error("Wallet not connected or signer not available");
      }
      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );
      const referrerCode = params.referrerPubkey ? params.referrerPubkey : "";
      const referralData = await checkReferralCode(referrerCode, provider);
      if (referrerCode && !referralData.isValid) {
        throw new Error("Invalid referral code");
      }
      const value = referralData.requiredPayment;
      const code = referrerCode ? referrerCode : "";
      const tx = await gameContract.initializeStartGame(code, { value });
      await tx.wait();
      await refetchUserExists();
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
      } else if (errorMessage.includes("user rejected action")) {
        toast.error("User rejected action");
      } else if (errorMessage.includes("GAME_STARTED")) {
        toast.error("Game already started");
      } else {
        toast.error(`Failed to initialize game: ${errorMessage}`);
      }
    },
    onSuccess: () => {
      toast.success(
        "Welcome to Torque Drift! Your account has been initialized successfully!"
      );
    },
  });

  const initializeGame = async (params: InitializeGameParams = {}) => {
    return initializeMutation.mutateAsync(params);
  };

  return {
    userExists: userExistsData?.hasGameStarted || false,
    referrerCode: userExistsData?.referrerCode || "",
    checkingUser,
    initializeGame,
    isInitializing,
    initializeError: initializeMutation.error || checkError,
  };
};
