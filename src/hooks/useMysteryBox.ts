import { cryptoCoinAddress, cryptoCoinSaleAddress, gpuSaleAddress } from "@/constants";
import { CryptoCoinAbi__factory, GpuSaleAbi__factory } from "@/contracts";
import { ethers } from "ethers";
import { TransactionStep } from "@/components/TransactionProgress";
import { useState } from "react";
import { to18Decimals, to6Decimals } from "@/utils/decimals";

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

  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }

  async function buyMysteryBox(amount: number, referralCode: string = "") {
    try {
      setTransactionSteps([
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

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const amountToPay = amount * 400

      const cryptoCoinContract = CryptoCoinAbi__factory.connect(
        cryptoCoinAddress,
        signer
      );
      const allowance = await cryptoCoinContract.allowance(signer.address, gpuSaleAddress);

      if (allowance < to18Decimals(amountToPay)) {
        const approveTx = await cryptoCoinContract.approve(
          gpuSaleAddress,
          to18Decimals(amountToPay),
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
        ? referralCode
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

  return { buyMysteryBox, transactionSteps };
}
