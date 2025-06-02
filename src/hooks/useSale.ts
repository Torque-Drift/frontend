import { cryptoCoinSaleAddress, usdAddress } from "@/constants";
import { CryptoCoinSaleAbi__factory, Usd__factory } from "@/contracts";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { TransactionStep } from "@/components/TransactionProgress";
import { to6Decimals } from "@/utils/decimals";

export function useSale() {
  const [totalSold, setTotalSold] = useState(0);
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([
    {
      title: "Approve Token Spending",
      description: "Approve USDC spending for the token purchase",
      status: "pending",
    },
    {
      title: "Purchase Tokens",
      description: "Complete the token purchase transaction",
      status: "pending",
    },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getTotalSold();
  }, []);

  async function getOwnProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    return new ethers.JsonRpcProvider("https://1rpc.io/matic");
  }

  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }

  async function buyToken(amount: number) {
    const provider = await getProvider();
    const signer = await provider.getSigner();

    try {
      setErrorMessage(null);
      setTransactionSteps(steps => steps.map((step, i) =>
        i === 0 ? { ...step, status: "loading" } : step
      ));

      const usdContract = Usd__factory.connect(usdAddress, signer);

      const allowance = await usdContract.allowance(signer.address, cryptoCoinSaleAddress);
      if (allowance < to6Decimals(amount)) {
        const approveTx = await usdContract.approve(
          cryptoCoinSaleAddress,
          to6Decimals(amount)
        );
        await approveTx.wait();
      }
      setTransactionSteps(steps => steps.map((step, i) =>
        i === 0 ? { ...step, status: "success" } : step
      ));

      setTransactionSteps(steps => steps.map((step, i) =>
        i === 1 ? { ...step, status: "loading" } : step
      ));

      const cryptoCoinSaleContract = CryptoCoinSaleAbi__factory.connect(
        cryptoCoinSaleAddress,
        signer
      );
      const buyTx = await cryptoCoinSaleContract.buyTokens(amount);
      const txBuy = await buyTx.wait();
      setTransactionSteps(steps => steps.map((step, i) =>
        i === 1 ? { ...step, status: "success" } : step
      ));
      return { txBuy };
    } catch (error: any) {
      setTransactionSteps(steps => steps.map(step =>
        step.status === "loading" ? {
          ...step,
          status: "error",
          description: "Transaction failed, check on Explorer"
        } : step
      ));
      console.error("Transaction failed:", error.message);
      throw new Error(error.message);
    }
  }

  async function getTotalSold() {
    const provider = await getOwnProvider();
    const cryptoCoinSaleContract = CryptoCoinSaleAbi__factory.connect(
      cryptoCoinSaleAddress,
      provider
    );
    const totalSold = await cryptoCoinSaleContract.tokensSold();
    const sold = Number(ethers.formatEther(totalSold))
    setTotalSold(sold);
    return sold;
  }

  return { buyToken, getTotalSold, totalSold, transactionSteps, errorMessage };
}
