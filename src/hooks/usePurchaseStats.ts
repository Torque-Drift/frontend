import { useQuery } from "@tanstack/react-query";
import { ethers, JsonRpcSigner } from "ethers";
import { CONTRACT_ADDRESSES } from "@/constants";
import TorqueDriftTokenABI from "@/constants/abis/TorqueDriftToken.json";
import { TorqueDriftToken__factory } from "@/contracts";
import { useEthers } from "./useEthers";

interface PurchaseStats {
  totalTokensVendidos: string;
  totalBnbRecebido: string;
  compraHabilitada: boolean;
  precoAtual: string;
}

async function statsBuys(signer: JsonRpcSigner | null): Promise<PurchaseStats> {
  if (!signer) {
    throw new Error("Signer not found");
  }

  try {
    const contract = TorqueDriftToken__factory.connect(
      CONTRACT_ADDRESSES.TorqueDriftToken,
      signer
    );

    const [totalTokens, totalBnb, compraEnabled, precoAtual] =
      await contract.getPurchaseStats();

    return {
      totalTokensVendidos: ethers.formatUnits(totalTokens, 9),
      totalBnbRecebido: ethers.formatEther(totalBnb),
      compraHabilitada: compraEnabled,
      precoAtual: ethers.formatEther(precoAtual),
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw error;
  }
}

export const usePurchaseStats = () => {
  const { signer } = useEthers();
  return useQuery({
    queryKey: ["purchase-stats"],
    queryFn: () => statsBuys(signer),
    enabled: !!signer,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};

