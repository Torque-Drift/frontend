import { cryptoCoinAddress, gpuSaleAddress } from "@/constants";
import { CryptoCoinAbi__factory, GpuSaleAbi__factory } from "@/contracts";
import { ethers } from "ethers";
import { TransactionStep } from "@/components/TransactionProgress";
import { useState } from "react";
import { to18Decimals } from "@/utils/decimals";

export function useMysteryBox() {
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([
    {
      title: "Approve CCoin Spending",
      description: "Approve CCoin spending for the token purchase",
      status: "pending",
    },
    {
      title: "Purchase Mystery Box",
      description: "Complete the mystery box purchase",
      status: "pending",
    },
  ]);

  const [referralCodeStatus, setReferralCodeStatus] = useState<{
    isValid: boolean;
    isChecking: boolean;
    hasChecked: boolean;
    error?: string;
  }>({
    isValid: false,
    isChecking: false,
    hasChecked: false,
  });

  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }

  async function checkRefCode(referralCode: string) {
    if (!referralCode || referralCode.trim() === "") {
      setReferralCodeStatus({
        isValid: false,
        isChecking: false,
        hasChecked: false,
      });
      return false;
    }

    setReferralCodeStatus({
      isValid: false,
      isChecking: true,
      hasChecked: false,
    });

    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const gpuSaleContract = GpuSaleAbi__factory.connect(
        gpuSaleAddress,
        signer
      );

      const refCode = referralCode.trim();
      const refCodeExists = await gpuSaleContract.getRefCode(refCode);
      const isValid = refCodeExists !== ethers.ZeroAddress;

      setReferralCodeStatus({
        isValid,
        isChecking: false,
        hasChecked: true,
      });

      return isValid;
    } catch (error: any) {
      console.error("Error checking referral code:", error);
      let errorMessage = "Failed to verify referral code. Please try again.";
      
      if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was cancelled by user.";
      }

      setReferralCodeStatus({
        isValid: false,
        isChecking: false,
        hasChecked: true,
        error: errorMessage,
      });
      return false;
    }
  }

  function calculatePrice(basePrice: number, amount: number, hasValidRefCode: boolean): number {
    const totalPrice = basePrice * amount;
    if (hasValidRefCode) {
      return totalPrice * 0.95; // 5% discount
    }
    return totalPrice;
  }

  function calculateDiscount(basePrice: number, amount: number): number {
    return (basePrice * amount) * 0.05; // 5% discount amount
  }

  async function buyMysteryBox(amount: number, referralCode: string = "", onBalanceUpdate?: () => void) {
    try {
      setTransactionSteps([
        {
          title: "Approve CCoin Spending",
          description: "Approve CCoin spending for the mystery box purchase",
          status: "loading",
        },
        {
          title: "Purchase Mystery Box",
          description: "Complete the mystery box purchase",
          status: "pending",
        },
      ]);

      const provider = await getProvider();
      const signer = await provider.getSigner();

      const baseAmount = amount * 400;
      const hasValidRefCode = referralCodeStatus.isValid && referralCode.trim() !== "";
      const finalAmount = hasValidRefCode ? baseAmount * 0.95 : baseAmount;

      const cryptoCoinContract = CryptoCoinAbi__factory.connect(
        cryptoCoinAddress,
        signer
      );
      
      // Check balance first
      const userBalance = await cryptoCoinContract.balanceOf(signer.address);
      const requiredAmount = to18Decimals(finalAmount);
      
      if (userBalance < requiredAmount) {
        throw new Error(`Insufficient CCoin balance. You need ${finalAmount.toFixed(2)} CCoin but only have ${Number(ethers.formatEther(userBalance)).toFixed(2)} CCoin.`);
      }

      const allowance = await cryptoCoinContract.allowance(signer.address, gpuSaleAddress);

      if (allowance < requiredAmount) {
        const approveTx = await cryptoCoinContract.approve(
          gpuSaleAddress,
          requiredAmount,
        );
        await approveTx.wait();
      }

      setTransactionSteps(steps => steps.map(step =>
        step.title === "Approve CCoin Spending" ? {
          ...step,
          status: "success",
          description: "CCoin spending approved successfully"
        } : step
      ));

      setTransactionSteps(steps => steps.map(step =>
        step.title === "Purchase Mystery Box" ? {
          ...step,
          status: "loading",
          description: "Processing mystery box purchase..."
        } : step
      ));

      const gpuSaleContract = GpuSaleAbi__factory.connect(gpuSaleAddress, signer);

      const refCode = referralCode && referralCode.trim() !== ""
        ? referralCode.trim()
        : '0';

      const buyTx = await gpuSaleContract.buy(String(amount), refCode);
      const txBuy = await buyTx.wait();

      setTransactionSteps(steps => steps.map(step =>
        step.title === "Purchase Mystery Box" ? {
          ...step,
          status: "success",
          description: `Successfully purchased ${amount} mystery box${amount > 1 ? 'es' : ''}!`
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

      return { txBuy };
    } catch (error: any) {
      console.error("Mystery box purchase failed:", error);
      
      let errorMessage = "Transaction failed. Please try again later.";
      let errorDescription = "An unexpected error occurred during the purchase.";

      if (error.message?.includes("insufficient funds") || error.message?.includes("Insufficient CCoin")) {
        errorMessage = "Insufficient Balance";
        errorDescription = error.message.includes("Insufficient CCoin") 
          ? error.message 
          : "You don't have enough CCoin to complete this purchase.";
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

      throw new Error(errorMessage);
    }
  }

  return {
    buyMysteryBox,
    transactionSteps,
    checkRefCode,
    referralCodeStatus,
    calculatePrice,
    calculateDiscount
  };
}
