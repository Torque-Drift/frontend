import { cryptoCoinAddress } from "@/constants";
import { CryptoCoinAbi__factory } from "@/contracts";
import { ethers } from "ethers";
import { useState, useEffect } from "react";

export function useUser() {
  const [balance, setBalance] = useState("");

  async function getProvider() {
    if (!window.ethereum) throw new Error("Ethereum provider not found");
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }

  async function getBalance() {
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
  }

  useEffect(() => {
    getBalance();
  }, []);

  return { balance };
}
