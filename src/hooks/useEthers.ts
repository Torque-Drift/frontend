import { useMemo, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";

export const useEthers = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  const provider = useMemo(() => {
    if (!walletClient) return null;
    return new BrowserProvider(walletClient.transport);
  }, [walletClient]);

  useEffect(() => {
    const getSigner = async () => {
      if (!provider || !address) {
        setSigner(null);
        return;
      }

      try {
        const signerInstance = await provider.getSigner(address);
        setSigner(signerInstance);
      } catch (error) {
        console.error("Error getting signer:", error);
        setSigner(null);
      }
    };

    getSigner();
  }, [provider, address]);

  return {
    provider,
    signer,
    address,
    isConnected,
  };
};
