import { cryptoCoinAddress } from "@/constants";
import { CryptoCoinAbi__factory } from "@/contracts";
import { ethers } from "ethers";
import { useState, useEffect } from "react";

export function useUser() {
  const [balance, setBalance] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  async function getProvider() {
    if (!window.ethereum) throw new Error("Ethereum provider not found");
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }

  async function getBalance() {
    try {
      setIsLoadingBalance(true);
      setBalanceError(null);
      
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const contract = CryptoCoinAbi__factory.connect(
        cryptoCoinAddress,
        provider
      );
      const balance = await contract.balanceOf(signer.address!);
      const balanceFormatted = Number(ethers.formatEther(balance))
      const balanceFormattedString = balanceFormatted.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
      setBalance(balanceFormattedString);
      return balanceFormattedString;
    } catch (error: any) {
      console.error("Error fetching balance:", error);
      setBalanceError("Failed to load balance. Please try again later.");
      throw new Error("Unable to fetch your CCoin balance. Please check your connection and try again.");
    } finally {
      setIsLoadingBalance(false);
    }
  }

  async function refreshBalance() {
    return await getBalance();
  }

  useEffect(() => {
    getBalance();
  }, []);

  return { 
    balance, 
    isLoadingBalance, 
    balanceError, 
    getBalance, 
    refreshBalance 
  };
}
