import { cryptoCoinAddress, gpuSaleAddress } from "@/constants";
import { CryptoCoinAbi__factory, GpuSaleAbi__factory } from "@/contracts";
import { ethers } from "ethers";

export function useMysteryBox() {
  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }

  async function getRefCode(code: string) {
    const provider = await getProvider();
    const gpuSaleContract = GpuSaleAbi__factory.connect(
      gpuSaleAddress,
      provider
    );
    const refCode = await gpuSaleContract.getRefCode(code);
    return refCode;
  }

  async function buyMysteryBox(amount: number, refCode?: string) {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const cryptoCoinContract = CryptoCoinAbi__factory.connect(
      cryptoCoinAddress,
      signer
    );
    const approveTx = await cryptoCoinContract.approve(
      gpuSaleAddress,
      ethers.parseEther(amount.toString()),
      { gasLimit: 100000 }
    );
    const txApprove = await approveTx.wait();
    const gpuSaleContract = GpuSaleAbi__factory.connect(gpuSaleAddress, signer);
    if (!refCode) refCode = "0x0";
    const buyTx = await gpuSaleContract.buy(amount, refCode, {
      gasLimit: 100000,
    });
    const txBuy = await buyTx.wait();
    return { txApprove, txBuy }
  }

  return {
    getRefCode,
    buyMysteryBox,
  };
}
