import { useState, useEffect } from "react";
import { CONTRACT_ADDRESSES } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { TorqueDriftGame__factory } from "@/contracts";
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

      try {
        // 1. Pegar preview do contrato (JÁ INCLUI TODOS OS BOOSTS!)
        const preview = await gameContract.previewClaim(address);

        // 2. Pegar estado global para baseRate
        const globalState = await gameContract.globalState();

        console.log("🔍 Preview data (raw):", {
          claimableAmount: preview.claimableAmount.toString(),
          baseReward: preview.baseReward.toString(),
          lockBoost: preview.lockBoost.toString(),
          referralBoost: preview.referralBoost.toString(),
          baseRate: globalState.baseRate.toString(),
        });

        // ✅ CORREÇÃO: Converter de wei para tokens (9 decimais)
        const claimableAmount = Number(
          ethers.formatUnits(preview.claimableAmount, 9)
        ); // Já convertido!
        console.log("🔍 Claimable amount:", claimableAmount);
        const baseReward = Number(preview.baseReward) / 1e9;
        const lockBoost = Number(preview.lockBoost) / 1e9;
        const referralBoost = Number(preview.referralBoost) / 1e9;

        // 3. Pegar dados do usuário
        const userState = await gameContract.getUserState(address);
        const referralInfo = await gameContract.getReferralInfo(address);

        const hashPower = Number(userState.totalHashPower) || 0;
        const lastClaim = Number(userState.lastClaim) || 0;
        const totalClaimed = Number(userState.totalClaimed) / 1e9 || 0; // Também converter

        // ✅ CORREÇÃO: Base rate em tokens por hora
        const baseRate = Number(globalState.baseRate) / 1e9; // Converter wei para tokens

        console.log("📊 Processed data:", {
          claimableAmount,
          hashPower,
          baseRate,
          lastClaim: new Date(lastClaim * 1000).toLocaleString(),
        });

        // 4. Calcular penalidades
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

        // 5. Calcular porcentagens de boost
        const lockBoostPercent =
          baseReward > 0 ? (lockBoost / baseReward) * 100 : 0;
        const referralBoostPercent =
          baseReward > 0 ? (referralBoost / baseReward) * 100 : 0;
        const totalBoostPercent = lockBoostPercent + referralBoostPercent;

        // 6. Calcular recompensa por hora (estimativa)
        const hourlyReward =
          (hashPower * baseRate * (1 + totalBoostPercent / 100)) / 1e9; // Converter de wei para tokens

        // 7. Dados de referral
        const referralCount = Number(referralInfo.referralCount_) || 0;
        const referralEarnings =
          Number(referralInfo.referralEarnings_) / 1e9 || 0;

        return {
          claimableAmount, // ✅ JÁ CONVERTIDO PARA TOKENS!
          hashPower,
          lastClaim,
          hasPenalty,
          penaltyDescription,
          baseRate,
          hourlyReward: formatTokenAmount(hourlyReward),
          lockBoost: lockBoostPercent,
          referralBoost: referralBoostPercent,
          totalBoost: totalBoostPercent,
          totalClaimed,
          referralCount,
          referralEarnings,
          equipCountToday: 0,
          gambleCountToday: 0,
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
  // Calculate derived values
  const canClaim = previewData ? !previewData.hasPenalty : false;

  const now = Math.floor(Date.now() / 1000);
  const timeSinceLastClaim = previewData ? now - previewData.lastClaim : 0;
  const optimalClaimTime = 4 * 3600; // 4 hours
  const remainingTimeSeconds = Math.max(
    0,
    optimalClaimTime - timeSinceLastClaim
  );
  const remainingTimeMinutes = Math.floor(remainingTimeSeconds / 60);

  const formattedPotentialReward = formatTokenAmount(previewData?.claimableAmount || 0);

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

