import { useState } from "react";
import { CONTRACT_ADDRESSES } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { TorqueDriftGame__factory, TorqueDriftViews__factory } from "@/contracts";
import { useEthers } from "./useEthers";

export const useClaim = () => {
  const { signer, address, isConnected } = useEthers();
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!signer || !isConnected || !address) {
        throw new Error("Wallet not connected or signer not available");
      }

      console.log(`👤 Usuário: ${address}`);
      console.log(`📋 Contract: ${CONTRACT_ADDRESSES.TorqueDriftGame}`);

      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );

      const tx = await gameContract.claimTokens();
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

      // Invalidar dados do usuário (que inclui claim preview)
      queryClient.invalidateQueries({
        queryKey: ["userData", address],
      });

      // Forçar refetch dos dados mais críticos
      await queryClient.refetchQueries({
        queryKey: ["userData", address],
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
}

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
      
      const viewsContract = TorqueDriftViews__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftViews,
        signer
      );

      try {
        // Get claim preview from contract
        const claimPreview = await viewsContract.getClaimPreview(address);
        console.log("claimPreview", claimPreview);
        const userInfo = await viewsContract.getUserInfo(address);

        // Get referral info
        const referralInfo = await viewsContract.getReferralInfo(address);

        const hashPower = Number(userInfo.totalHashPower) || 0;
        const lastClaim = Number(userInfo.lastClaim) || 0;
        const totalClaimed = 0; // Not available in contract, set to 0 for now

        const now = Math.floor(Date.now() / 1000);
        const timeSinceLastClaim = now - lastClaim;
        const hoursSinceLastClaim = timeSinceLastClaim / 3600;

        // Calculate base hourly reward (simplified calculation)
        const baseRate = 291667; // Base rate per hash power unit
        const baseHourlyReward = (hashPower * baseRate) / 100_000_000;

        // Get boosts from claim preview
        const lockBoost = Number(claimPreview.lockBoost) || 0;
        const referralBoost = Number(claimPreview.referralBoost) || 0;
        const totalBoost = lockBoost + referralBoost;

        // Calculate boosted hourly reward
        const boostedHourlyReward = baseHourlyReward * (1 + totalBoost / 100);

        // Check for penalty (claiming too early - before 4 hours)
        const optimalClaimTime = 4 * 3600; // 4 hours in seconds
        const hasPenalty = timeSinceLastClaim < optimalClaimTime;

        let penaltyDescription = "";
        if (hasPenalty) {
          const remainingTime = optimalClaimTime - timeSinceLastClaim;
          const hours = Math.floor(remainingTime / 3600);
          const minutes = Math.floor((remainingTime % 3600) / 60);
          penaltyDescription = `Early claim penalty: ${hours}h ${minutes}m remaining`;
        }

        // Referral data
        const referralCount = Number(referralInfo.referralCount) || 0;
        const referralEarnings = Number(referralInfo.referralEarnings) || 0;

        // Activity counts (these would need to be tracked separately, using placeholder values for now)
        const equipCountToday = 0; // TODO: Implement daily activity tracking
        const gambleCountToday = 0; // TODO: Implement daily activity tracking

        return {
          hashPower,
          lastClaim,
          hasPenalty,
          penaltyDescription,
          hourlyReward: formatTokenAmount(boostedHourlyReward),
          lockBoost,
          referralBoost,
          totalBoost,
          totalClaimed,
          referralCount,
          referralEarnings,
          equipCountToday,
          gambleCountToday,
        };
      } catch (error) {
        console.error("Error fetching claim preview:", error);
        throw error;
      }
    },
    enabled: !!address && isConnected,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Calculate derived values
  const canClaim = previewData ? !previewData.hasPenalty : false;

  const now = Math.floor(Date.now() / 1000);
  const timeSinceLastClaim = previewData ? now - previewData.lastClaim : 0;
  const optimalClaimTime = 4 * 3600; // 4 hours
  const remainingTimeSeconds = Math.max(0, optimalClaimTime - timeSinceLastClaim);
  const remainingTimeMinutes = Math.floor(remainingTimeSeconds / 60);

  // Calculate potential reward
  const baseRate = 291667;
  const hoursSinceLastClaim = timeSinceLastClaim / 3600;
  const potentialReward = previewData
    ? (previewData.hashPower * baseRate * hoursSinceLastClaim * (1 + previewData.totalBoost / 100)) / 100_000_000
    : 0;

  const formattedPotentialReward = formatTokenAmount(potentialReward);

  return {
    previewData,
    isLoading,
    canClaim,
    formattedPotentialReward,
    remainingTimeMinutes,
    error,
  };
};

// Helper function for formatting token amounts
function formatTokenAmount(amount: number): string {
  if (amount === 0) return "0 $TOD";

  // Format with up to 6 decimal places for tokens with 9 digits
  if (amount < 0.000001) {
    return `${amount.toFixed(8)} $TOD`;
  } else if (amount < 0.1) {
    return `${amount.toFixed(6)} $TOD`;
  } else if (amount < 1) {
    return `${amount.toFixed(4)} $TOD`;
  } else {
    return `${amount.toFixed(2)} $TOD`;
  }
}
