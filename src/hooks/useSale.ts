import { cryptoCoinSaleAddress, usdAddress } from "@/constants";
import { CryptoCoinSaleAbi__factory, Usd__factory } from "@/contracts";
import { to18Decimals, to6Decimals } from "@/utils/decimals";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export function useSale() {
  const [totalSold, setTotalSold] = useState(0);

  useEffect(() => {
    getTotalSold();
  }, [])

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

    const usdContract = Usd__factory.connect(
      usdAddress,
      signer
    );
    const approveTx = await usdContract.approve(
      cryptoCoinSaleAddress,
      to6Decimals(amount),
      {
        gasLimit: 100000,
        maxPriorityFeePerGas: basePriorityFee,
        maxFeePerGas: baseMaxFee,
      }
    );
    const txApprove = await approveTx.wait();
    const cryptoCoinSaleContract = CryptoCoinSaleAbi__factory.connect(
      cryptoCoinSaleAddress,
      signer
    );
    const buyTx = await cryptoCoinSaleContract.buyTokens(to18Decimals(amount), {
      gasLimit: 100000,
      maxPriorityFeePerGas: basePriorityFee,
      maxFeePerGas: baseMaxFee,
    });
    const txBuy = await buyTx.wait();
    return { txApprove, txBuy }
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

  return { buyToken, getTotalSold, totalSold };
}
