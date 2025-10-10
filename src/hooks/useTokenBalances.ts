import { useQuery } from "@tanstack/react-query";
import { useAccount, useBalance } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/constants";
import { TorqueDriftToken__factory } from "@/contracts";
import { useEthers } from "./useEthers";

export interface TokenBalances {
  todBalance: number;
  bnbBalance: number;
  formattedTodBalance: string;
  formattedBnbBalance: string;
}

export const useTokenBalances = () => {
  const { address } = useAccount();
  const { signer, provider } = useEthers();

  const { data: bnbBalanceData, refetch: refetchBnbBalance } = useBalance({
    address,
  });

  const {
    data: todBalanceData,
    isLoading: todLoading,
    error: todError,
    refetch: refetchTodBalance,
  } = useQuery({
    queryKey: ["todBalance", address],
    queryFn: async (): Promise<number> => {
      if (!address || !signer) {
        console.warn("Wallet not connected or signer not available");
        return 0;
      }

      try {
        const tokenContract = TorqueDriftToken__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftToken,
          provider
        );

        const balance = await tokenContract.balanceOf(address);
        return Number(balance) / 10 ** 9;
      } catch (error) {
        console.error("Error fetching TOD balance:", error);
        return 0;
      }
    },
    enabled: !!address && !!signer,
    staleTime: 30000,
    gcTime: 300000,
    retry: 2,
    retryDelay: 1000,
  });

  const todBalance = todBalanceData || 0;
  const bnbBalance = bnbBalanceData
    ? Number(bnbBalanceData.value) / 10 ** 18
    : 0;

  return {
    todBalance,
    bnbBalance,
    formattedTodBalance: formatTodAmount(todBalance),
    formattedBnbBalance: formatBnbAmount(bnbBalance),
    isLoading: todLoading,
    error: todError,
    refetchTodBalance,
    refetchBnbBalance,
    refetchAll: () => {
      refetchTodBalance();
      refetchBnbBalance();
    },
  };
};

function formatTodAmount(amount: number): string {
  if (amount === 0) return "0 $TOD";

  const absAmount = Math.abs(amount);

  if (absAmount < 1e-9) {
    return `${(amount * 1_000_000_000).toFixed(4)} n$TOD`;
  } else if (absAmount < 1e-6) {
    return `${(amount * 1_000_000_000).toFixed(4)} n$TOD`;
  } else if (absAmount < 1e-3) {
    return `${(amount * 1000).toFixed(2)} m$TOD`;
  } else if (absAmount < 1) {
    return `${(amount * 1000).toFixed(2)} m$TOD`;
  } else if (absAmount < 1000) {
    return `${amount.toFixed(4)} $TOD`;
  } else if (absAmount < 1_000_000) {
    return `${(amount / 1000).toFixed(2)}K $TOD`;
  } else {
    return `${(amount / 1_000_000).toFixed(2)}M $TOD`;
  }
}

function formatBnbAmount(amount: number): string {
  if (amount === 0) return "0 BNB";

  if (amount < 0.0001) {
    return `${(amount * 1000000).toFixed(2)} μBNB`;
  } else if (amount < 0.1) {
    return `${(amount * 1000).toFixed(2)} mBNB`;
  } else if (amount < 1000) {
    return `${amount.toFixed(4)} BNB`;
  } else {
    return `${(amount / 1000).toFixed(2)}K BNB`;
  }
}
