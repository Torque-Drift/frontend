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

async function statsBuys(): Promise<PurchaseStats> {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  try {
    const contract = TorqueDriftToken__factory.connect(
      CONTRACT_ADDRESSES.TorqueDriftToken,
      provider
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
  return useQuery({
    queryKey: ["purchase-stats"],
    queryFn: () => statsBuys(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
};

