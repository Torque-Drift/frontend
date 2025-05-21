import { cryptoCoinSaleAddress, usdAddress } from "@/constants";
import { CryptoCoinSaleAbi__factory, Usd__factory } from "@/contracts";
import { ethers, toUtf8String } from "ethers";
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
    const basePriorityFee = ethers.parseUnits('40', 'gwei');
    const baseMaxFee = ethers.parseUnits('120', 'gwei');

    try {
      setErrorMessage(null);
      setTransactionSteps(steps => steps.map((step, i) =>
        i === 0 ? { ...step, status: "loading" } : step
      ));

      const usdContract = Usd__factory.connect(usdAddress, signer);

      const allowance = await usdContract.allowance(signer.address, cryptoCoinSaleAddress);
      if (Number(allowance) < to6Decimals(amount)) {
        const approveTx = await usdContract.approve(
          cryptoCoinSaleAddress,
          to6Decimals(amount),
          {
            gasLimit: 100000,
            maxPriorityFeePerGas: basePriorityFee,
            maxFeePerGas: baseMaxFee,
          }
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
      const buyTx = await cryptoCoinSaleContract.buyTokens(amount, {
        gasLimit: 100000,
        maxPriorityFeePerGas: basePriorityFee,
        maxFeePerGas: baseMaxFee,
      });
      const txBuy = await buyTx.wait();
      setTransactionSteps(steps => steps.map((step, i) =>
        i === 1 ? { ...step, status: "success" } : step
      ));

      setTimeout(() => {
        setTransactionSteps(steps => steps.map(step => ({ ...step, status: "pending" })));
      }, 2000);

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
    const provider = await getProvider();
    const signer = await provider.getSigner();

    const cryptoCoinSaleContract = CryptoCoinSaleAbi__factory.connect(
      cryptoCoinSaleAddress,
      signer
    );
    const totalSold = await cryptoCoinSaleContract.tokensSold();
    setTotalSold(Number(totalSold));
    return totalSold;
  }

  return { buyToken, getTotalSold, totalSold, transactionSteps, errorMessage };
}
