import { gpuSaleAddress, rewardAddress } from "@/constants";
import { GpuAbi__factory, RewardAbi__factory } from "@/contracts";
import { ethers } from "ethers";

export function useInventory() {
  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }

  async function openBox(tokenId: number, uri: string, power: number) {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const gpuContract = GpuAbi__factory.connect(
      gpuSaleAddress,
      signer
    );
    const box = await gpuContract.setGPUStatus(tokenId, uri, power, { gasLimit: 100000 });
    return await box.wait();
  }

  async function getBoxes() {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const gpuContract = GpuAbi__factory.connect(
      gpuSaleAddress,
      signer
    );
    /*  const boxes = await gpuContract.get();
     return boxes; */
  }

  async function previewReward(tokenId: number) {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const rewardContract = RewardAbi__factory.connect(
      rewardAddress,
      signer
    );
    return await rewardContract.previewReward(tokenId);
  }

  async function onCollect(tokenId: number) {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const rewardContract = RewardAbi__factory.connect(
      rewardAddress,
      signer
    );
    const reward = await rewardContract.mine(tokenId, { gasLimit: 100000 });
    return await reward.wait();
  }

  return { openBox, getBoxes, previewReward, onCollect };
}

