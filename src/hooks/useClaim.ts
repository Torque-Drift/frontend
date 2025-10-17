import { useState, useEffect } from "react";
import { CONTRACT_ADDRESSES } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  TorqueDriftGame__factory,
  TorqueDriftReferral__factory,
} from "@/contracts";
import { useEthers } from "./useEthers";
import { ethers } from "ethers";

export const usePreviewClaim = () => {
  const { signer, address, isConnected } = useEthers();

  const {
    data: previewData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["claimPreview", address],
    queryFn: async (): Promise<PreviewClaimData> => {
      if (!address || !signer) throw new Error("Wallet not connected");

      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );
      const referralContract = TorqueDriftReferral__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftReferral,
        signer
      );

      try {
        const preview = await gameContract.previewClaim(address);
        const globalState = await gameContract.globalState();
        console.log("preview data:", preview);
        console.log("preview hourlyReward:", preview.hourlyReward);
        const claimableAmount = Number(ethers.formatUnits(preview[0], 9));
        console.log("🔍 Claimable amount:", claimableAmount);
        const baseReward = Number(preview.baseReward) / 1e9;
        const lockBoost = Number(preview.lockBoost) / 1e9;
        const referralBoost = Number(preview.referralBoost) / 1e9;
        const userState = await gameContract.getUserState(address);
        const referralInfo = await referralContract.getReferralInfo(address);
        console.log("🔍 Referral info:", referralInfo);

        const hashPower = Number(userState.totalHashPower) || 0;
        const lastClaim = Number(userState.lastClaim) || 0;
        const totalClaimed = Number(userState.totalClaimed) / 1e9 || 0;
        const baseRate = Number(globalState.baseRate) / 1e9;
        const now = Math.floor(Date.now() / 1000);
        const timeSinceLastClaim = now - lastClaim;
        const optimalClaimTime = 4 * 3600; // 4 hours
        const hasPenalty = timeSinceLastClaim < optimalClaimTime;

        let penaltyDescription = "";
        if (hasPenalty) {
          const remainingTime = optimalClaimTime - timeSinceLastClaim;
          const hours = Math.floor(remainingTime / 3600);
          const minutes = Math.floor((remainingTime % 3600) / 60);
          penaltyDescription = `Early claim penalty: ${hours}h ${minutes}m remaining`;
        }

        const lockBoostPercent =
          baseReward > 0 ? (lockBoost / baseReward) * 100 : 0;
        const referralBoostPercent =
          baseReward > 0 ? (referralBoost / baseReward) * 100 : 0;
        const totalBoostPercent = lockBoostPercent + referralBoostPercent;
        const hourlyReward = Number(preview.hourlyReward) / 1e9;
        console.log("🔍 Hourly reward:", hourlyReward);
        const referralCount = Number(referralInfo.referralCount_) || 0;
        const referralEarnings =
          Number(referralInfo.referralEarnings_) / 1e9 || 0;

        // Calcular penalidades baseado no tempo que FALTA até poder claim sem penalidade
        const hoursSinceLastClaim = timeSinceLastClaim / 3600;
        const hoursUntilNoPenalty = Math.max(0, 4 - hoursSinceLastClaim);
        let penaltyBnb = 0;
        let penaltyBurnPercent = 0;
        let canClaimWithoutPenalty = hoursSinceLastClaim >= 4; // 4 horas mínimo

        if (!canClaimWithoutPenalty) {
          // Penalidades baseadas no tempo que FALTA para completar o cooldown de 4h
          if (hoursUntilNoPenalty > 3) {
            // Faltam mais de 3 horas (se passaram menos de 1 hora) - PENALTY_4H
            penaltyBnb = 0.05; // 0.05 BNB
            penaltyBurnPercent = 10; // 10% burn
          } else if (hoursUntilNoPenalty > 2) {
            // Faltam 2-3 horas (se passaram 1-2 horas) - PENALTY_3H
            penaltyBnb = 0.04; // 0.04 BNB
            penaltyBurnPercent = 7.5; // 7.5% burn
          } else if (hoursUntilNoPenalty > 1) {
            // Faltam 1-2 horas (se passaram 2-3 horas) - PENALTY_2H
            penaltyBnb = 0.025; // 0.025 BNB
            penaltyBurnPercent = 5; // 5% burn
          } else {
            // Faltam 0-1 hora (se passaram 3-4 horas) - PENALTY_1H
            penaltyBnb = 0.01; // 0.01 BNB
            penaltyBurnPercent = 2.5; // 2.5% burn
          }
        }

        return {
          claimableAmount,
          hashPower,
          lastClaim,
          hasPenalty,
          penaltyDescription,
          baseRate,
          hourlyReward: hourlyReward.toFixed(4),
          lockBoost: lockBoostPercent,
          referralBoost: referralBoostPercent,
          totalBoost: totalBoostPercent,
          totalClaimed,
          referralCount,
          referralEarnings,
          equipCountToday: 0,
          gambleCountToday: 0,
          canClaimWithoutPenalty,
          penaltyBnb,
          penaltyBurnPercent,
          hoursUntilNoPenalty,
        };
      } catch (error) {
        console.error("Error fetching claim preview:", error);
        throw error;
      }
    },
    enabled: !!address && isConnected,
    staleTime: 30000, // 30 seconds - dados base mudam menos frequentemente
    gcTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
  const canClaim = previewData ? !previewData.hasPenalty : false;
  const now = Math.floor(Date.now() / 1000);
  const timeSinceLastClaim = previewData ? now - previewData.lastClaim : 0;
  const optimalClaimTime = 4 * 3600;
  const remainingTimeSeconds = Math.max(
    0,
    optimalClaimTime - timeSinceLastClaim
  );
  const remainingTimeMinutes = Math.floor(remainingTimeSeconds / 60);

  const formattedPotentialReward = formatTokenAmount(
    previewData?.claimableAmount || 0
  );

  return {
    previewData,
    isLoading,
    canClaim,
    formattedPotentialReward,
    remainingTimeMinutes,
    error,
  };
};

export const useClaim = () => {
  const { signer, address, isConnected } = useEthers();
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);

  const claimMutation = useMutation({
    mutationFn: async (penaltyBnb: number) => {
      if (!signer || !isConnected || !address) {
        throw new Error("Wallet not connected or signer not available");
      }

      const penaltyAmount = ethers.parseEther(penaltyBnb.toString());
      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );

      const tx = await gameContract.claimTokens({ value: penaltyAmount });
      await tx.wait();

      return { success: true };
    },
    onMutate: () => {
      setIsClaiming(true);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["carsInventory", address],
      });
      queryClient.invalidateQueries({
        queryKey: ["userData", address],
      });
      await queryClient.refetchQueries({
        queryKey: ["userData", address],
      });
      await queryClient.refetchQueries({
        queryKey: ["claimPreview", address],
      });
      toast.success("$TOD tokens claimed successfully!");
    },
    onSettled: () => {
      setIsClaiming(false);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("User not connected")) {
        toast.error("Please connect your wallet first.");
      } else if (errorMessage.includes("user rejected action")) {
        toast.error("User rejected action");
      } else {
        toast.error(`Failed to claim tokens: ${errorMessage}`);
      }
    },
  });

  return {
    onClaim: claimMutation.mutateAsync,
    isLoading: claimMutation.isPending,
    isClaiming,
    error: claimMutation.error,
    mutate: claimMutation.mutate,
  };
};

// Interface for preview claim data
export interface PreviewClaimData {
  claimableAmount: number; // Já convertido para tokens (não wei!)
  hashPower: number;
  lastClaim: number;
  hasPenalty: boolean;
  penaltyDescription: string;
  hourlyReward: string;
  lockBoost: number;
  referralBoost: number;
  totalBoost: number;
  totalClaimed: number;
  referralCount: number;
  referralEarnings: number;
  baseRate: number;
  equipCountToday: number;
  gambleCountToday: number;
  // Novos campos de penalidade
  canClaimWithoutPenalty: boolean;
  penaltyBnb: number;
  penaltyBurnPercent: number;
  hoursUntilNoPenalty: number;
}

// Helper function for formatting token amounts
function formatTokenAmount(amount: number): string {
  if (amount === 0) return "0 $TOD";
  if (isNaN(amount)) return "0 $TOD";

  // Format with appropriate decimal places
  if (amount < 0.000001) {
    return `${amount.toFixed(8)} $TOD`;
  } else if (amount < 0.1) {
    return `${amount.toFixed(6)} $TOD`;
  } else if (amount < 1) {
    return `${amount.toFixed(4)} $TOD`;
  } else if (amount < 1000) {
    return `${amount.toFixed(2)} $TOD`;
  } else {
    return `${amount.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })} $TOD`;
  }
}

