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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getTotalSold();
  }, []);

  async function getOwnProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    return new ethers.JsonRpcProvider("https://polygon-amoy.g.alchemy.com/v2/UTe3D7JmoPvgh36ldqaV-7BlAeQ0oCgx");
  }

  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }

  async function buyToken(amount: number, onBalanceUpdate?: () => void) {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setTransactionSteps([
        {
          title: "Approve Token Spending",
          description: "Approve USDC spending for the token purchase",
          status: "loading",
        },
        {
          title: "Purchase Tokens",
          description: "Complete the token purchase transaction",
          status: "pending",
        },
      ]);

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const usdContract = Usd__factory.connect(usdAddress, signer);

      // Check USDC balance first
      const userBalance = await usdContract.balanceOf(signer.address);
      const requiredAmount = to6Decimals(amount);
      
      if (userBalance < requiredAmount) {
        throw new Error(`Insufficient USDC balance. You need ${amount.toFixed(2)} USDC but only have ${Number(ethers.formatUnits(userBalance, 6)).toFixed(2)} USDC.`);
      }

      const allowance = await usdContract.allowance(signer.address, cryptoCoinSaleAddress);
      if (allowance < requiredAmount) {
        const approveTx = await usdContract.approve(
          cryptoCoinSaleAddress,
          requiredAmount
        );
        await approveTx.wait();
      }
      
      setTransactionSteps(steps => steps.map((step, i) =>
        i === 0 ? { 
          ...step, 
          status: "success",
          description: "USDC spending approved successfully"
        } : step
      ));

      setTransactionSteps(steps => steps.map((step, i) =>
        i === 1 ? { 
          ...step, 
          status: "loading",
          description: "Processing token purchase..."
        } : step
      ));

      const cryptoCoinSaleContract = CryptoCoinSaleAbi__factory.connect(
        cryptoCoinSaleAddress,
        signer
      );
      const buyTx = await cryptoCoinSaleContract.buyTokens(amount);
      const txBuy = await buyTx.wait();
      
      setTransactionSteps(steps => steps.map((step, i) =>
        i === 1 ? { 
          ...step, 
          status: "success",
          description: `Successfully purchased ${amount} CCoin tokens!`
        } : step
      ));

      // Update user balance after successful purchase
      if (onBalanceUpdate) {
        try {
          await onBalanceUpdate();
        } catch (error) {
          console.warn("Failed to update balance after purchase:", error);
        }
      }

      // Refresh total sold amount
      await getTotalSold();

      return { txBuy };
    } catch (error: any) {
      console.error("Token purchase failed:", error);
      
      let errorMessage = "Transaction failed. Please try again later.";
      let errorDescription = "An unexpected error occurred during the purchase.";

      if (error.message?.includes("insufficient funds") || error.message?.includes("Insufficient USDC")) {
        errorMessage = "Insufficient Balance";
        errorDescription = error.message.includes("Insufficient USDC") 
          ? error.message 
          : "You don't have enough USDC to complete this purchase.";
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction Cancelled";
        errorDescription = "You cancelled the transaction.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network Error";
        errorDescription = "Please check your internet connection and try again.";
      } else if (error.message?.includes("gas")) {
        errorMessage = "Transaction Failed";
        errorDescription = "Transaction failed due to gas estimation. Please try again with a higher gas limit.";
      }

      setTransactionSteps(steps => steps.map(step =>
        step.status === "loading" ? {
          ...step,
          status: "error",
          description: errorDescription
        } : step
      ));
      
      setErrorMessage(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function getTotalSold() {
    try {
      const provider = await getOwnProvider();
      const cryptoCoinSaleContract = CryptoCoinSaleAbi__factory.connect(
        cryptoCoinSaleAddress,
        provider
      );
      const totalSold = await cryptoCoinSaleContract.tokensSold();
      const sold = Number(ethers.formatEther(totalSold))
      setTotalSold(sold);
      return sold;
    } catch (error: any) {
      console.error("Error fetching total sold:", error);
      // Don't throw error here as this is background data loading
      return 0;
    }
  }

  return { 
    buyToken, 
    getTotalSold, 
    totalSold, 
    transactionSteps, 
    errorMessage,
    isLoading 
  };
}
