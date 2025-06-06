"use client";
import { gpuAddress, rewardAddress } from "@/constants";
import { GpuAbi__factory, RewardAbi__factory } from "@/contracts";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import boxMetadata from "../../public/metadata/box.json";
import { INFT } from "@/interfaces";
import axios from "axios";
import { TransactionStep } from "@/components/TransactionProgress";

const gpuMetadataCache = new Map();

export function useInventory() {
  const [nfts, setNfts] = useState<INFT[]>([]);
  const [rewards, setRewards] = useState<Map<number, string>>(new Map());
  const [revealedNft, setRevealedNft] = useState<INFT | null>(null);
  const { address } = useAccount();
  const [collectTransactionSteps, setCollectTransactionSteps] = useState<
    TransactionStep[]
  >([
    {
      title: "Claim Rewards",
      description: "Claiming your mining rewards",
      status: "loading",
    },
  ]);
  const [openBoxTransactionSteps, setOpenBoxTransactionSteps] = useState<
    TransactionStep[]
  >([
    {
      title: "Opening Mystery Box",
      description: "Generating your GPU NFT",
      status: "loading",
    },
    {
      title: "Minting NFT",
      description: "Minting your new GPU NFT",
      status: "pending",
    },
  ]);

  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    return new ethers.BrowserProvider(window.ethereum);
  }

  async function getOwnProvider() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }
    return new ethers.JsonRpcProvider("https://rpc-mainnet.matic.quiknode.pro/");
  }

  async function openBox(tokenId: number) {
    try {
      setOpenBoxTransactionSteps([
        {
          title: "Opening Mystery Box",
          description: "Generating your GPU NFT",
          status: "loading",
        },
        {
          title: "Minting NFT",
          description: "Minting your new GPU NFT",
          status: "pending",
        },
      ]);

      const { data } = await axios.post("/api/generate", { tokenId });
      console.log(data);
      setOpenBoxTransactionSteps((steps) =>
        steps.map((step) =>
          step.title === "Opening Mystery Box"
            ? {
              ...step,
              status: "success",
              description: "GPU NFT generated successfully!"
            }
            : step
        )
      );

      setOpenBoxTransactionSteps((steps) =>
        steps.map((step) =>
          step.title === "Minting NFT"
            ? {
              ...step,
              status: "loading",
              description: "Minting your GPU NFT to the blockchain..."
            }
            : step
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setOpenBoxTransactionSteps((steps) =>
        steps.map((step) =>
          step.title === "Minting NFT"
            ? {
              ...step,
              status: "success",
              description: "GPU NFT minted successfully!"
            }
            : step
        )
      );

      const refreshedMetadata = await refreshTokenMetadata(tokenId);
      console.log("refreshedMetadata", refreshedMetadata);
      const updatedNfts = await getBoxes();
      console.log("updatedNfts", updatedNfts);

      const revealed = updatedNfts?.find(nft =>
        nft.tokenId === tokenId && nft.rarity !== "Mystery"
      );
      if (revealed) setRevealedNft(revealed);

      return { ...data, metadata: refreshedMetadata };
    } catch (error: any) {
      console.error("Error opening box:", error);
      
      let errorMessage = "Failed to open mystery box. Please try again later.";
      
      if (error.response?.status === 500) {
        errorMessage = "Server error while generating GPU. Please try again in a few moments.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid mystery box. Please refresh your inventory and try again.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      setOpenBoxTransactionSteps((steps) =>
        steps.map((step) =>
          step.status === "loading"
            ? {
              ...step,
              status: "error",
              description: errorMessage,
            }
            : step
        )
      );
      throw new Error(errorMessage);
    }
  }

  async function batchFetchGpuMetadata(tokenIds: number[]) {
    const uncachedTokens = tokenIds.filter((id) => !gpuMetadataCache.has(id));

    if (uncachedTokens.length > 0) {
      const fetchPromises = uncachedTokens.map(async (tokenId) => {
        try {
          const response = await fetch(`/api/metadata/${tokenId}`);
          if (response.ok) {
            const metadata = await response.json();
            gpuMetadataCache.set(tokenId, metadata);
            console.log(`Metadata fetched for token ${tokenId}:`, metadata.rarity);
            return { tokenId, metadata };
          } else {
            console.warn(`Failed to fetch metadata for token ${tokenId}: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error fetching metadata for token ${tokenId}:`, error);
        }
        return { tokenId, metadata: null };
      });

      await Promise.all(fetchPromises);
    }
  }

  async function getBoxes() {
    try {
      if (!address) return;
      const provider = await getOwnProvider();
      const gpuContract = GpuAbi__factory.connect(gpuAddress, provider);
      const boxes = await gpuContract.userInventory(address);
      const [tokenIds, uris] = boxes;
      const gpuTokenIds: number[] = [];
      tokenIds.forEach((tokenId: bigint, index: number) => {
        const uri = uris[index] || "";
        const isRevealedGpu = uri.includes("/api/metadata/") ||
          uri.includes("/metadata/gpu/") ||
          uri.includes("gpu-mine.com/api/metadata/");

        if (isRevealedGpu) {
          gpuTokenIds.push(Number(tokenId));
        }
      });

      if (gpuTokenIds.length > 0) {
        console.log(`Fetching metadata for ${gpuTokenIds.length} GPU tokens:`, gpuTokenIds);
        await batchFetchGpuMetadata(gpuTokenIds);
      }

      const formattedNfts = tokenIds.map((tokenId: bigint, index: number) => {
        const uri = uris[index] || "";
        let metadata = null;
        const tokenIdNum = Number(tokenId);

        const isRevealedGpu = uri.includes("/api/metadata/") ||
          uri.includes("/metadata/gpu/") ||
          uri.includes("gpu-mine.com/api/metadata/");

        if (isRevealedGpu) {
          metadata = gpuMetadataCache.get(tokenIdNum);
          if (!metadata) {
            console.warn(`No cached metadata found for GPU token ${tokenIdNum}`);
            metadata = {
              name: `GPU Miner #${tokenIdNum}`,
              description: "A powerful GPU NFT for mining operations",
              image: "https://gpu-mine.com/images/common.png",
              image_site: "/images/common.png",
              animation_site: "/videos/common.mp4",
              animation_url: "https://gpu-mine.com/videos/common.mp4",
              power: 0,
              rarity: "Loading...",
              attributes: [
                { trait_type: "Token ID", value: tokenIdNum },
                { trait_type: "Status", value: "Loading..." }
              ],
            };
          }
        } else {
          metadata = {
            name: boxMetadata.name,
            description: boxMetadata.description,
            image: boxMetadata.image,
            image_site: boxMetadata.image_site,
            animation_site: boxMetadata.animation_site,
            animation_url: boxMetadata.animation_url,
            power: 0,
            rarity: "Mystery",
            attributes: boxMetadata.attributes,
          };
        }

        return {
          tokenId: tokenIdNum,
          uri,
          name: metadata?.name || `GPU #${tokenIdNum}`,
          description: metadata?.description || "",
          image: metadata?.image || "",
          image_site: metadata?.image_site || "",
          animation_site: metadata?.animation_site || "",
          animation_url: metadata?.animation_url || "",
          power: metadata?.power || 0,
          rarity: metadata?.rarity || "Unknown",
          attributes: metadata?.attributes || [],
          reward: "0",
          metadata,
        };
      });

      setNfts(formattedNfts);
      return formattedNfts;
    } catch (error) {
      console.error("Error in getBoxes:", error);
      return [];
    }
  }

  async function refreshTokenMetadata(tokenId: number) {
    try {
      gpuMetadataCache.delete(tokenId);

      const response = await fetch(`/api/metadata/${tokenId}`);
      console.log("response", response);
      if (response.ok) {
        const metadata = await response.json();
        console.log("metadata", metadata);
        gpuMetadataCache.set(tokenId, metadata);
        console.log(`Refreshed metadata for token ${tokenId}`);
        return metadata;
      }
    } catch (error) {
      console.error(`Error refreshing metadata for token ${tokenId}:`, error);
    }
    return null;
  }

  async function loadRewards() {
    try {
      if (!nfts.length) return;

      const gpuNfts = nfts.filter((nft) => nft.rarity !== "Mystery");
      if (gpuNfts.length === 0) return;

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const rewardContract = RewardAbi__factory.connect(rewardAddress, signer);

      const rewardPromises = gpuNfts.map(async (nft) => {
        try {
          const reward = await rewardContract.previewReward(nft.tokenId);
          return { tokenId: nft.tokenId, reward: Number(reward).toString() };
        } catch (error) {
          console.log(`Error fetching reward for token ${nft.tokenId}:`, error);
          return { tokenId: nft.tokenId, reward: "0" };
        }
      });

      const rewardResults = await Promise.all(rewardPromises);
      const newRewards = new Map();
      rewardResults.forEach(({ tokenId, reward }) => {
        const formattedReward = ethers.formatEther(reward);
        newRewards.set(tokenId, Number(formattedReward).toFixed(4));
      });

      setRewards(newRewards);
    } catch (error) {
      console.log("Error loading rewards:", error);
    }
  }

  useEffect(() => {
    getBoxes();
  }, [address]);

  useEffect(() => {
    if (nfts.length > 0) {
      loadRewards();
    }
  }, [nfts.length]);

  async function previewReward(tokenId: number) {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const rewardContract = RewardAbi__factory.connect(rewardAddress, signer);
    const reward = await rewardContract.previewReward(tokenId);
    return Number(reward);
  }

  async function onCollect(tokenId: number, onBalanceUpdate?: () => void) {
    try {
      setCollectTransactionSteps([
        {
          title: "Claim Rewards",
          description: "Claiming your mining rewards...",
          status: "loading",
        },
      ]);

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const rewardContract = RewardAbi__factory.connect(rewardAddress, signer);
      
      // Check if there are rewards to claim
      const previewReward = await rewardContract.previewReward(tokenId);
      if (previewReward === BigInt(0)) {
        throw new Error("No rewards available to claim for this GPU.");
      }

      const tx = await rewardContract.mine(tokenId);
      const result = await tx.wait();

      setCollectTransactionSteps([
        {
          title: "Claim Rewards",
          description: `Successfully claimed ${Number(ethers.formatEther(previewReward)).toFixed(4)} CCoin!`,
          status: "success",
        },
      ]);

      // Update user balance after successful claim
      if (onBalanceUpdate) {
        try {
          await onBalanceUpdate();
        } catch (error) {
          console.warn("Failed to update balance after claim:", error);
        }
      }

      await loadRewards();
      return result;
    } catch (error: any) {
      console.error("Error collecting rewards:", error);
      
      let errorMessage = "Failed to claim rewards. Please try again later.";
      let errorDescription = "An unexpected error occurred while claiming your rewards.";

      if (error.message?.includes("No rewards available")) {
        errorMessage = "No Rewards Available";
        errorDescription = error.message;
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction Cancelled";
        errorDescription = "You cancelled the reward claim transaction.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network Error";
        errorDescription = "Please check your internet connection and try again.";
      } else if (error.message?.includes("gas")) {
        errorMessage = "Transaction Failed";
        errorDescription = "Transaction failed due to gas estimation. Please try again.";
      }

      setCollectTransactionSteps([
        {
          title: "Claim Rewards",
          description: errorDescription,
          status: "error",
        },
      ]);
      
      throw new Error(errorMessage);
    }
  }

  const nftsWithRewards = nfts.map((nft) => ({
    ...nft,
    reward: rewards.get(nft.tokenId) || "0",
  }));

  const clearRevealedNft = () => {
    setRevealedNft(null);
  };

  // Force refresh all NFTs metadata and inventory
  async function refreshInventory() {
    try {
      console.log("Refreshing complete inventory...");

      // Clear all cached metadata to force fresh fetch
      gpuMetadataCache.clear();

      // Fetch fresh inventory
      const updatedNfts = await getBoxes();

      // Reload rewards for all GPUs
      if (updatedNfts && updatedNfts.length > 0) {
        await loadRewards();
      }

      console.log("Inventory refreshed successfully");
      return updatedNfts;
    } catch (error) {
      console.error("Error refreshing inventory:", error);
      throw error;
    }
  }

  return {
    openBox,
    getBoxes,
    previewReward,
    onCollect,
    nfts: nftsWithRewards,
    loadRewards,
    collectTransactionSteps,
    openBoxTransactionSteps,
    revealedNft,
    clearRevealedNft,
    refreshTokenMetadata,
    refreshInventory,
  };
}
