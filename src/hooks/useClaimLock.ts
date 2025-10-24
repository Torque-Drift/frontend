import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEthers } from "./useEthers";
import { TorqueDriftGame__factory } from "@/contracts";
import { CONTRACT_ADDRESSES } from "@/constants";
import toast from "react-hot-toast";
import { ethers } from "ethers";

export interface ClaimLockState {
  hasActiveLock: boolean;
  lockOption?: number;
  unlockTime?: number;
  boostPercent?: number;
  canActivate: boolean;
  canDeactivate: boolean;
  timeRemaining?: number;
  cooldownTime?: number;
  amount?: number;
}

// Available lock options
export const LOCK_OPTIONS = [
  { option: 0, duration: 1, boost: 5, label: "1 Day (+5%)" },
  { option: 1, duration: 3, boost: 10, label: "3 Days (10%)" },
  { option: 2, duration: 7, boost: 20, label: "7 Days (+20%)" },
];

export const useClaimLock = () => {
  const { signer, address, isConnected } = useEthers();
  const queryClient = useQueryClient();

  // Query para verificar estado do claim lock
  const {
    data: lockState,
    isLoading: stateLoading,
    error: stateError,
    refetch: refetchState,
  } = useQuery({
    queryKey: ["claimLockState", address],
    queryFn: async (): Promise<ClaimLockState> => {
      if (!signer || !address) {
        throw new Error("Wallet not connected");
      }

      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );
      try {
        // Check if has active lock
        const hasActiveLock = await gameContract.hasActiveClaimLock(address);

        if (!hasActiveLock) {
          // Check if can activate (not in cooldown)
          const userState = await gameContract.getUserState(address);
          const currentTime = Math.floor(Date.now() / 1000);
          const lastLockTime = Number(userState[8]); // lastLockTime
          const cooldownEnds = lastLockTime + 3600; // 1 hour cooldown

          return {
            hasActiveLock: false,
            canActivate: currentTime >= cooldownEnds,
            canDeactivate: false,
            cooldownTime:
              currentTime < cooldownEnds ? cooldownEnds - currentTime : 0,
          };
        }

        const userState = await gameContract.getUserState(address);
        const now = Math.floor(Date.now() / 1000);
        const isLockActive = Number(userState.lock.unlockTime) > now;
        const amount = Number(userState.lock.amount);
        const unlockTime = Number(userState.lock.unlockTime);
        const boostPercent = Number(userState.lock.boostPercent);
        const timeRemaining = isLockActive
          ? Number(userState.lock.unlockTime) - now
          : 0;

        const currentTime = Math.floor(Date.now() / 1000);
        // Determine option based on boost
        let lockOption: number = 0;
        if (boostPercent >= 1.5 && boostPercent <= 2.5) lockOption = 0; // ~2%
        else if (boostPercent >= 4.5 && boostPercent <= 5.5)
          lockOption = 1; // ~5%
        else if (boostPercent >= 9.5 && boostPercent <= 10.5) lockOption = 2; // ~10%

        return {
          hasActiveLock: true,
          amount,
          boostPercent,
          unlockTime,
          lockOption,
          canActivate: false,
          canDeactivate: currentTime >= unlockTime,
          timeRemaining,
        };
      } catch (error) {
        console.error("Error checking claim lock:", error);
        return {
          hasActiveLock: false,
          canActivate: false,
          canDeactivate: false,
        };
      }
    },
    enabled: !!signer && !!address && isConnected,
    refetchInterval: (data) => {
      // Update every 30 seconds if has active lock
      return data && "hasActiveLock" in data && data.hasActiveLock
        ? 30000
        : false;
    },
  });

  // Mutation to activate claim lock
  const activateMutation = useMutation({
    mutationFn: async (lockOption: number) => {
      if (!signer || !address) {
        throw new Error("Wallet not connected");
      }

      const option = lockOption + 1;

      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );
      const estimatedGas = await gameContract.activateClaimLock.estimateGas(
        option
      );
      const tx = await gameContract.activateClaimLock(option, {
        gasLimit: estimatedGas * BigInt(2),
      });

      const receipt = await tx.wait();
      return receipt;
    },
    onSuccess: () => {
      toast.success("Claim Lock activated successfully!");
      refetchState();
      queryClient.invalidateQueries({ queryKey: ["previewClaim", address] });
      queryClient.refetchQueries({ queryKey: ["claimPreview", address] });
    },
    onError: (error: any) => {
      console.error("Error activating claim lock:", error);

      // Specific error handling
      if (error.message?.includes("Already have active claim lock")) {
        toast.error("You already have an active claim lock!");
      } else if (error.message?.includes("Lock too frequent")) {
        toast.error("Wait 1 hour between claim lock activations.");
      } else if (error.message?.includes("Lock renewal cooldown")) {
        toast.error("Wait 6 hours after the last lock expiration.");
      } else {
        toast.error("Error activating claim lock. Try again.");
      }
    },
  });

  // Mutation to deactivate claim lock
  const deactivateMutation = useMutation({
    mutationFn: async () => {
      if (!signer || !address) throw new Error("Wallet not connected");

      const gameContract = TorqueDriftGame__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftGame,
        signer
      );

      console.log("lockState", lockState);
      const canDeactivate = lockState?.canDeactivate;
      const value = !canDeactivate ? ethers.parseEther("0.01") : BigInt(0);

      const estimatedGas = await gameContract.deactivateClaimLock.estimateGas({
        value,
      });
      console.log("value", value);
      const tx = await gameContract.deactivateClaimLock({
        value,
        gasLimit: estimatedGas * BigInt(2),
      });

      const receipt = await tx.wait();
      return receipt;
    },
    onSuccess: () => {
      toast.success("Claim Lock deactivated successfully!");
      refetchState();
      queryClient.invalidateQueries({ queryKey: ["previewClaim", address] });
      queryClient.refetchQueries({ queryKey: ["claimPreview", address] });
    },
    onError: (error: any) => {
      console.error("Error deactivating claim lock:", error);

      if (error.message?.includes("No active claim lock")) {
        toast.error("You don't have an active claim lock!");
      } else if (error.message?.includes("Claim lock not expired")) {
        toast.error("Claim lock has not expired yet!");
      } else {
        toast.error("Error deactivating claim lock. Try again.");
      }
    },
  });

  // Helper function to format time
  const formatTime = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return "0s";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return {
    // Estado
    lockState,
    isLoading: stateLoading,
    error: stateError,

    // Ações
    activateLock: activateMutation.mutate,
    deactivateLock: deactivateMutation.mutate,
    refetchState,

    // Estados das mutations
    isActivating: activateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,

    // Utilitários
    formatTime,
    lockOptions: LOCK_OPTIONS,
  };
};
