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
        const timeUntilNextClaim = await gameContract.getTimeUntilNextClaim(
          address
        );
        const claimableAmount = Number(ethers.formatUnits(preview[0], 9));
        const baseReward = Number(ethers.formatUnits(preview[1], 9));
        const lockBoost = Number(ethers.formatUnits(preview.lockBoost, 9));
        const referralBoost = Number(
          ethers.formatUnits(preview.referralBoost, 9)
        );
        const userState = await gameContract.getUserInfo();
        const referralInfo = await referralContract.getReferralInfo(address);
        const hashPower = Number(userState.totalHashPower) || 0;
        const lastClaim = Number(userState.lastClaim) || 0;
        const totalClaimed = 0;
        const now = Math.floor(Date.now() / 1000);
        const timeSinceLastClaim = now - lastClaim;
        const optimalClaimTime = 4 * 3600;
        const claimPenalties = await gameContract.checkClaimPenalties(address);
        const hasPenalty = claimPenalties.needsPenalty;

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
        const hourlyReward = Number(ethers.formatUnits(preview[4], 9));
        const referralCount = Number(referralInfo.referralCount_) || 0;
        const referralEarnings =
          Number(ethers.formatUnits(referralInfo.referralEarnings_, 9)) || 0;

        const formatTime = (seconds: number) => {
          if (seconds === 0) return "Ready to claim!";
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          return `${hours}h ${minutes}m until free claim`;
        };
        const timeUntilNextClaimFormatted = formatTime(
          Number(timeUntilNextClaim)
        );

        const penaltyBnb = Number(claimPenalties.bnbRequired) / 1e18;
        const penaltyBurnPercent = Number(claimPenalties.burnPercent) / 100;
        const canClaimWithoutPenalty =
          timeUntilNextClaimFormatted === "Ready to claim!";

        return {
          claimableAmount,
          hashPower,
          lastClaim,
          hasPenalty,
          penaltyDescription,
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
          hoursUntilNoPenalty: Number(timeUntilNextClaim),
          timeUntilNextClaimFormatted,
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
    mutationFn: async () => {
      if (!signer || !isConnected || !address) {
        throw new Error("Wallet not connected or signer not available");
      }
      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );

      const hasPenalty = await gameContract.checkClaimPenalties(address);
      let tx = null;
      if (hasPenalty.needsPenalty) {
        tx = await gameContract.claimTokens({ value: hasPenalty.bnbRequired });
      } else {
        tx = await gameContract.claimTokens();
      }
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
  claimableAmount: number;
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
  equipCountToday: number;
  gambleCountToday: number;
  // Novos campos de penalidade
  canClaimWithoutPenalty: boolean;
  penaltyBnb: number;
  penaltyBurnPercent: number;
  hoursUntilNoPenalty: number;
  timeUntilNextClaimFormatted: string;
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
