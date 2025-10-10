import { useQuery } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES } from "@/constants";
import { TorqueDriftViews__factory } from "@/contracts";
import { useEthers } from "./useEthers";

export interface UserData {
  gameStarted: boolean;
  totalHashPower: number;
  lastClaim: number;
  totalClaimed: number;
  claimableAmount: number;
  timeUntilNextClaim: number;
  nextClaimTime: number;
  formattedClaimable: string;
  formattedHashPower: string;
  formattedTimeUntilNextClaim: string;
  formattedTotalClaimed: string;
}

export const useUserData = () => {
  const { signer, address, isConnected } = useEthers();

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useQuery<UserData>({
    queryKey: ["userData", address],
    queryFn: async (): Promise<UserData> => {
      if (!address || !signer) throw new Error("Wallet not connected");

      const viewsContract = TorqueDriftViews__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftViews,
        signer
      );

      const userInfo = await viewsContract.getUserInfo(address);

      // Extract user data from contract response
      const gameStarted = userInfo.gameStarted || false;
      const totalHashPower = Number(userInfo.totalHashPower) || 0;
      const lastClaim = Number(userInfo.lastClaim) || 0;
      const totalClaimed = 0; // Not available in current contract version

      const now = Math.floor(Date.now() / 1000);
      const timeSinceLastClaim = now - lastClaim;

      // Calculate claimable amount (hashPower * time in hours)
      const claimableAmount = Math.min(
        (totalHashPower * timeSinceLastClaim) / 86400, // 24h in seconds
        totalHashPower * 24 // Max 24h worth
      );

      const nextClaimTime = lastClaim + 86400; // 24h
      const timeUntilNextClaim = Math.max(0, nextClaimTime - now);

      return {
        // Raw contract data
        gameStarted,
        totalHashPower,
        lastClaim,
        totalClaimed,

        // Calculated data for preview
        claimableAmount,
        timeUntilNextClaim,
        nextClaimTime,

        // Formatted data for display
        formattedClaimable: formatTokenAmount(claimableAmount),
        formattedHashPower: formatTokenAmount(totalHashPower),
        formattedTimeUntilNextClaim: formatTime(timeUntilNextClaim),
        formattedTotalClaimed: formatTokenAmount(totalClaimed),
      };
    },
    enabled: !!address && isConnected,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  return {
    data: userData,
    isLoading,
    error,
    refetch,
  };
};

// Helper functions for formatting
function formatTokenAmount(amount: number): string {
  if (amount === 0) return "0 $TOD";

  // For very small amounts, always show in nano tokens for readability
  const absAmount = Math.abs(amount);

  if (absAmount < 1e-9) {
    // Extremely small values
    return `${(amount * 1_000_000_000).toFixed(4)} n$TOD`;
  } else if (absAmount < 1e-6) {
    // Nano $TOD values
    return `${(amount * 1_000_000_000).toFixed(4)} n$TOD`;
  } else if (absAmount < 1e-3) {
    // Micro $TOD values
    return `${(amount * 1000).toFixed(2)} m$TOD`;
  } else if (absAmount < 1) {
    // Milli $TOD values
    return `${(amount * 1000).toFixed(2)} m$TOD`;
  } else if (absAmount < 1000) {
    // Normal values in $TOD
    return `${amount.toFixed(4)} $TOD`;
  } else if (absAmount < 1_000_000) {
    // Thousand values
    return `${(amount / 1000).toFixed(2)}K $TOD`;
  } else {
    // Million values
    return `${(amount / 1_000_000).toFixed(2)}M $TOD`;
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}
