"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEthers } from "@/hooks/useEthers";
import { useBurn } from "@/hooks/useBurn";
import { useTokenPurchase } from "@/hooks/useTokenPurchase";
import { CONTRACT_ADDRESSES } from "@/constants";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { Street } from "@/components/Street";
import toast from "react-hot-toast";
import { useTokenBalances } from "@/hooks";
import { RewardModal } from "@/components/garage/RewardModal";
import { TorqueDriftToken__factory } from "@/contracts";

export default function StorePage() {
  const { signer, isConnected } = useEthers();
  const { mutateAsync: openLootbox, isLoading: isOpeningLootbox } = useBurn();
  const { formattedTodBalance: tokenBalance, refetchAll } = useTokenBalances();
  const { mutateAsync: purchaseTokens, isLoading: isPurchasingTokens } =
    useTokenPurchase();

  const [tokenAmount, setTokenAmount] = useState(300);
  const [bnbAmount, setBnbAmount] = useState<string>("0.000000");
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardItem, setRewardItem] = useState(null);

  const handleBuyTokens = async () => {
    if (!signer || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (tokenAmount < 1) {
      toast.error("Minimum purchase is 1 token");
      return;
    }

    try {
      const result = await purchaseTokens({ tokenAmount });
      console.log("Purchase result:", result);
      refetchAll();
    } catch (error) {
      console.error("Failed to purchase tokens:", error);
      // Error is already handled by the hook
    }
  };

  // Update BNB amount when token amount changes
  const updateBnbAmount = async (tokens: number) => {
    if (!signer || tokens < 1) {
      setBnbAmount("0.000000");
      return;
    }

    try {
      const tokenContract = TorqueDriftToken__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftToken,
        signer
      );
      // Convert token amount to contract format (9 decimals)
      const tokenAmountWei = BigInt(tokens) * BigInt(10 ** 9);
      const requiredBnb = await tokenContract.calculateBnbForTokens(tokenAmountWei);
      const bnbEther = Number(requiredBnb) / 10 ** 18;
      setBnbAmount(bnbEther.toFixed(6));
    } catch (error) {
      console.error("Failed to calculate BNB amount:", error);
    }
  };

  // Update BNB amount when token amount changes
  useEffect(() => {
    updateBnbAmount(tokenAmount);
  }, [tokenAmount, signer]);

  const handleOpenLootbox = async () => {
    if (!signer || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (Number(tokenBalance) < 300) {
      toast.error(
        `Insufficient tokens. You have ${tokenBalance} tokens, need 300.`
      );
      return;
    }

    try {
      const result = await openLootbox();
      if (result?.rewardItem) {
        setRewardItem(result.rewardItem);
        setShowRewardModal(true);
      }
      // Refresh balance after opening lootbox
      refetchAll();
    } catch (error) {
      console.error("Failed to open lootbox:", error);
      // Error is already handled by the hook
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[url('/images/hero_bg.png')] bg-contain bg-no-repeat">
      {/* Header */}
      <div className="flex items-center justify-between relative max-w-7xl mx-auto px-4 sm:px-0 w-full pt-24 pb-8">
        <div className="flex flex-col items-start justify-center max-w-2xl w-full">
          <h1 className="text-[52px] font-bold text-[#EEEEF0] leading-none mt-8">
            Torque Drift Store
          </h1>
          <p className="text-[#B5B2BC] text-[20px] mt-4">
            Buy $TOD tokens and open lootboxes to collect rare NFT cars for your
            garage!
          </p>
        </div>
        <Image
          src="/images/big_logo.png"
          alt="Big Logo"
          width={154}
          height={36}
          draggable={false}
          priority={true}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-0 w-full space-y-8 pb-20">
        {/* Token Purchase Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-8 border border-[#49474E]/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#00D4FF] rounded-full"></div>
            <h2 className="text-2xl font-bold text-[#EEEEF0]">Buy Tokens</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[#B5B2BC] mb-4">
                Purchase $TOD tokens to open lootboxes and collect rare NFT
                cars. Each token costs $1 USD and requires BNB payment.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#EEEEF0] mb-2">
                    Number of Tokens
                  </label>
                  <input
                    type="number"
                    value={tokenAmount}
                    onChange={(e) =>
                      setTokenAmount(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                    className="w-full bg-[#121113] border border-[#49474E] rounded-md px-4 py-3 text-[#EEEEF0] focus:border-[#00D4FF] focus:outline-none transition-colors"
                  />
                </div>

                <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#B5B2BC]">$TOD Tokens:</span>
                    <span className="text-[#EEEEF0] font-semibold">
                      {tokenAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#B5B2BC]">Price per token:</span>
                    <span className="text-[#EEEEF0]">$0.12 USD</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#B5B2BC]">BNB required:</span>
                    <span className="text-[#F59E0B]">{bnbAmount} BNB</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#49474E]/50">
                    <span className="text-[#EEEEF0] font-semibold">Total:</span>
                    <span className="text-[#00D4FF] font-bold">
                      ${Number(tokenAmount * 0.12).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleBuyTokens}
                  disabled={isPurchasingTokens || !isConnected}
                  className="w-full"
                >
                  {isPurchasingTokens ? (
                    <>
                      <Loader height={20} width={20} className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Purchase ${tokenAmount} $TOD`
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50">
                <h3 className="text-[#EEEEF0] font-semibold mb-3">
                  Payment Information
                </h3>
                <ul className="text-sm text-[#B5B2BC] space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    BNB payment required
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Secure BNB payment
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#F59E0B] rounded-full mr-3"></span>
                    Tokens minted after payment verification
                  </li>
                </ul>
              </div>

              <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50">
                <h3 className="text-[#EEEEF0] font-semibold mb-3">
                  Token Details
                </h3>
                <ul className="text-sm text-[#B5B2BC] space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Price: $0.12 per token (~0.0001 BNB)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Symbol: $TOD
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Network: Binance Smart Chain
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lootbox Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-8 border border-[#49474E]/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#FF6B6B] rounded-full"></div>
            <h2 className="text-2xl font-bold text-[#EEEEF0]">Open Lootbox</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[#B5B2BC] mb-4">
                Open a lootbox to get a random NFT car! Each lootbox costs 100
                $TOD tokens and gives you one of our rare collectible cars.
              </p>

              <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B5B2BC]">Cost:</span>
                  <span className="text-[#EEEEF0] font-semibold">300 $TOD</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B5B2BC]">Reward:</span>
                  <span className="text-[#EEEEF0]">Random NFT Car</span>
                </div>
                <div className="pt-2 border-t border-[#49474E]/50">
                  <span className="text-[#EEEEF0] font-semibold mb-3 block">
                    Rarity Chances:
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Common Rarity */}
                    <div className="border border-[#EEEEF0]/30 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-[#EEEEF0] rounded-full mr-2"></div>
                        <span className="text-[#EEEEF0] font-semibold text-sm">
                          Common
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#EEEEF0]/70">Vintage</span>
                          <span className="text-[#EEEEF0] font-medium">
                            42%
                          </span>
                        </div>
                        <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                          <div
                            className="bg-[#EEEEF0] h-1.5 rounded-full"
                            style={{ width: "42%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#EEEEF0]/70">Modern</span>
                          <span className="text-[#EEEEF0] font-medium">
                            28%
                          </span>
                        </div>
                        <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                          <div
                            className="bg-[#EEEEF0] h-1.5 rounded-full"
                            style={{ width: "28%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Rare Rarity */}
                    <div className="border border-[#EEEEF0]/30 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-[#EEEEF0] rounded-full mr-2"></div>
                        <span className="text-[#EEEEF0] font-semibold text-sm">
                          Rare
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#EEEEF0]/70">Vintage</span>
                          <span className="text-[#EEEEF0] font-medium">
                            15%
                          </span>
                        </div>
                        <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                          <div
                            className="bg-[#EEEEF0] h-1.5 rounded-full"
                            style={{ width: "15%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#EEEEF0]/70">Modern</span>
                          <span className="text-[#EEEEF0] font-medium">
                            10%
                          </span>
                        </div>
                        <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                          <div
                            className="bg-[#EEEEF0] h-1.5 rounded-full"
                            style={{ width: "10%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Epic Rarity */}
                    <div className="border border-[#EEEEF0]/30 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-[#EEEEF0] rounded-full mr-2"></div>
                        <span className="text-[#EEEEF0] font-semibold text-sm">
                          Epic
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#EEEEF0]/70">Vintage</span>
                          <span className="text-[#EEEEF0] font-medium">
                            2.7%
                          </span>
                        </div>
                        <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                          <div
                            className="bg-[#EEEEF0] h-1.5 rounded-full"
                            style={{ width: "27%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#EEEEF0]/70">Modern</span>
                          <span className="text-[#EEEEF0] font-medium">
                            1.8%
                          </span>
                        </div>
                        <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                          <div
                            className="bg-[#EEEEF0] h-1.5 rounded-full"
                            style={{ width: "18%" }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Legendary Rarity */}
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-yellow-500 font-semibold text-sm">
                          Legendary
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#EEEEF0]/70">Vintage</span>
                          <span className="text-yellow-500 font-medium">
                            0.3%
                          </span>
                        </div>
                        <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                          <div
                            className="bg-yellow-500 h-1.5 rounded-full"
                            style={{ width: "30%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#EEEEF0]/70">Modern</span>
                          <span className="text-yellow-500 font-medium">
                            0.2%
                          </span>
                        </div>
                        <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                          <div
                            className="bg-yellow-500 h-1.5 rounded-full"
                            style={{ width: "20%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOpenLootbox}
                disabled={isOpeningLootbox || !isConnected}
                className="w-full"
              >
                {isOpeningLootbox ? (
                  <>
                    <Loader height={20} width={20} className="mr-2" />
                    Opening Lootbox...
                  </>
                ) : (
                  "Open Lootbox"
                )}
              </Button>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50">
                <h3 className="text-[#EEEEF0] font-semibold mb-3">
                  Lootbox Rewards
                </h3>
                <ul className="text-sm text-[#B5B2BC] space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#FF6B6B] rounded-full mr-3"></span>
                    Random NFT Cars
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#FF6B6B] rounded-full mr-3"></span>
                    Collectible vehicles
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#FF6B6B] rounded-full mr-3"></span>
                    Various rarities available
                  </li>
                </ul>
              </div>

              <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50">
                <h3 className="text-[#EEEEF0] font-semibold mb-3">
                  Requirements
                </h3>
                <ul className="text-sm text-[#B5B2BC] space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#FF6B6B] rounded-full mr-3"></span>
                    300 $TOD tokens required
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#FF6B6B] rounded-full mr-3"></span>
                    Connected wallet
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#FF6B6B] rounded-full mr-3"></span>
                    Sufficient token balance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contract Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-8 border border-[#49474E]/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#00D4FF] rounded-full"></div>
            <h2 className="text-2xl font-bold text-[#EEEEF0]">
              Contract Information
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50">
              <div className="mb-3">
                <span className="text-[#B5B2BC] text-sm">Token Contract:</span>
                <div className="mt-1">
                  <span className="text-[#EEEEF0] font-mono text-xs break-all">
                    {CONTRACT_ADDRESSES.TorqueDriftToken}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[#B5B2BC] text-sm">Game Contract:</span>
                <div className="mt-1">
                  <span className="text-[#EEEEF0] font-mono text-xs break-all">
                    {CONTRACT_ADDRESSES.TorqueDriftGame}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50">
                <h3 className="text-[#EEEEF0] font-semibold mb-3">
                  $TOD Token Details
                </h3>
                <ul className="text-sm text-[#B5B2BC] space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Name: Torque Drift Token
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Ticker: $TOD
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Decimals: 9
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Total Supply: 1,000,000,000
                  </li>
                </ul>
              </div>

              <div className="bg-[#121113] rounded-md p-4 border border-[#49474E]/50">
                <h3 className="text-[#EEEEF0] font-semibold mb-3">
                  Network Information
                </h3>
                <ul className="text-sm text-[#B5B2BC] space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Network: Binance Smart Chain
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Chain ID: 56
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Block Explorer: BscScan
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00D4FF] rounded-full mr-3"></span>
                    Token Price: $0.12 USD
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reward Modal */}
      <RewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        rewardItem={rewardItem}
      />

      {/* Street component at bottom */}
      <Street />
    </div>
  );
}
