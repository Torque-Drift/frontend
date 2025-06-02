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
      status: "loading",
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
    } catch (error) {
      console.error("Error checking referral code:", error);
      setReferralCodeStatus({
        isValid: false,
        isChecking: false,
        hasChecked: true,
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

  async function buyMysteryBox(amount: number, referralCode: string = "") {
    try {
      setTransactionSteps(steps => steps.map((step, i) =>
        i === 0 ? { ...step, status: "loading" } : step
      ));

      const provider = await getProvider();
      const signer = await provider.getSigner();

      const baseAmount = amount * 400;
      const hasValidRefCode = referralCodeStatus.isValid && referralCode.trim() !== "";
      const finalAmount = hasValidRefCode ? baseAmount * 0.95 : baseAmount;

      const cryptoCoinContract = CryptoCoinAbi__factory.connect(
        cryptoCoinAddress,
        signer
      );
      const allowance = await cryptoCoinContract.allowance(signer.address, gpuSaleAddress);

      if (allowance < to18Decimals(finalAmount)) {
        const approveTx = await cryptoCoinContract.approve(
          gpuSaleAddress,
          to18Decimals(finalAmount),
        );
        await approveTx.wait();
      }

      setTransactionSteps(steps => steps.map(step =>
        step.title === "Approve CCoin Spending" ? {
          ...step,
          status: "success"
        } : step
      ));

      setTransactionSteps(steps => steps.map(step =>
        step.title === "Purchase Mystery Box" ? {
          ...step,
          status: "loading"
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
          status: "success"
        } : step
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
      console.error("Mystery box purchase failed:", error);
      throw error;
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
