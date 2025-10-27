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
import { useTokenBalances, usePurchaseStats } from "@/hooks";
import { RewardModal } from "@/components/garage/RewardModal";
import { Countdown } from "@/components/Countdown";
import { TorqueDriftToken__factory } from "@/contracts";
import { ethers } from "ethers";

export default function StorePage() {
  const { signer, isConnected } = useEthers();
  const { mutateAsync: openLootbox, isLoading: isOpeningLootbox } = useBurn();
  const { formattedTodBalance: tokenBalance, refetchAll } = useTokenBalances();
  const { mutateAsync: purchaseTokens, isLoading: isPurchasingTokens } =
    useTokenPurchase();
  const {
    data: purchaseStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = usePurchaseStats();

  const [tokenAmount, setTokenAmount] = useState(300);
  const [bnbAmount, setBnbAmount] = useState<string>("0.000000");
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardItem, setRewardItem] = useState(null);
  const [selectedLootboxAmount, setSelectedLootboxAmount] = useState(1);

  const launchDate = new Date();
  launchDate.setUTCFullYear(2025, 9, 28);
  launchDate.setUTCHours(15, 0, 0, 0);

  // Calculate lootbox costs with discounts
  const getLootboxCost = (amount: number) => {
    const baseCost = 300;
    const totalBase = baseCost * amount;

    if (amount === 5) return Math.floor(totalBase * 0.95); // 5% discount
    if (amount === 10) return Math.floor(totalBase * 0.9); // 10% discount
    return totalBase;
  };

  const currentLootboxCost = getLootboxCost(selectedLootboxAmount);
  const discountPercentage =
    selectedLootboxAmount === 5 ? 5 : selectedLootboxAmount === 10 ? 10 : 0;

  const handleBuyTokens = async () => {
    if (!signer || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const finalTokenAmount = tokenAmount === 0 ? 1 : tokenAmount;
    if (finalTokenAmount < 1) {
      toast.error("Minimum purchase is 1 token");
      return;
    }

    try {
      const result = await purchaseTokens({ tokenAmount: finalTokenAmount });
      console.log("Purchase result:", result);
      refetchAll();
    } catch (error) {
      console.error("Failed to purchase tokens:", error);
      // Error is already handled by the hook
    }
  };

  // Update BNB amount when token amount changes
  const updateBnbAmount = async (tokens: number) => {
    if (tokens <= 0) {
      setBnbAmount("0.000000");
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const tokenContract = TorqueDriftToken__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftToken,
        provider
      );
      const tokenAmountWei = BigInt(tokens) * BigInt(10 ** 9);
      const requiredBnb = await tokenContract.calculateBnbForTokens(
        tokenAmountWei
      );
      const bnbEther = Number(requiredBnb) / 10 ** 18;
      setBnbAmount(bnbEther.toFixed(6));
    } catch (error) {
      console.error("Failed to calculate BNB amount:", error);
    }
  };

  useEffect(() => {
    updateBnbAmount(tokenAmount);
  }, [tokenAmount, signer, updateBnbAmount]);

  const handleOpenLootbox = async () => {
    if (!signer || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (Number(tokenBalance) < currentLootboxCost) {
      toast.error(
        `Insufficient tokens. You have ${tokenBalance} tokens, need ${currentLootboxCost}.`
      );
      return;
    }

    console.log(
      `🎲 Frontend calling openLootbox with amount: ${selectedLootboxAmount}`
    );

    try {
      const result = await openLootbox(selectedLootboxAmount);

      console.log(`🎉 Frontend received result:`, result);
      console.log(`📊 Reward items count: ${result?.rewardItems?.length || 0}`);

      if (result?.rewardItems && result.rewardItems.length > 0) {
        // Show modal with all reward items
        console.log(`🎁 Setting reward items:`, result.rewardItems);
        setRewardItem(result.rewardItems);
        setShowRewardModal(true);
      }

      toast.success(
        `Successfully opened ${selectedLootboxAmount} lootbox${
          selectedLootboxAmount > 1 ? "es" : ""
        }!`
      );

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
            Buy $TOD and open lootboxes to collect rare NFT cars for your
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full mb-12"
      >
        <Countdown targetDate={launchDate} />
      </motion.div>

      {/* Main Content */}
      <div className="hidden max-w-7xl mx-auto px-4 sm:px-0 w-full space-y-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
            <h2 className="text-lg font-bold text-[#EEEEF0]">
              Purchase Statistics
            </h2>
          </div>

          {isLoadingStats ? (
            <div className="flex justify-center items-center py-4">
              <Loader height={24} width={24} className="text-[#00D4FF]" />
              <span className="ml-2 text-[#B5B2BC] text-xs">Loading...</span>
            </div>
          ) : statsError ? (
            <div className="text-center py-4">
              <p className="text-[#F59E0B] text-xs">
                Unable to load statistics
              </p>
            </div>
          ) : purchaseStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Total Tokens Sold */}
              <div className="bg-[#121113] rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#B5B2BC] text-xs">Tokens Sold</span>
                  <div className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#EEEEF0] mb-1">
                  {parseFloat(purchaseStats.totalTokensVendidos).toLocaleString(
                    "en-US",
                    {
                      maximumFractionDigits: 0,
                    }
                  )}
                </div>
                <div className="text-[#B5B2BC] text-xs mb-1.5">
                  of 125,000 $TOD
                </div>
                <div className="w-full bg-[#49474E]/30 rounded-full h-1.5">
                  <div
                    className="bg-[#00D4FF] h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (parseFloat(purchaseStats.totalTokensVendidos) /
                          125000) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Total BNB Received */}
              <div className="bg-[#121113] flex flex-col justify-between rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#B5B2BC] text-xs">BNB Received</span>
                  <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div>
                </div>
                <div className="text-lg font-bold text-[#EEEEF0]">
                  {parseFloat(purchaseStats.totalBnbRecebido).toFixed(4)} BNB
                </div>
              </div>

              {/* Current Price */}
              <div className="bg-[#121113] flex flex-col justify-between rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#B5B2BC] text-xs">Price</span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      purchaseStats.compraHabilitada
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#EEEEF0] mb-1">
                    {parseFloat(purchaseStats.precoAtual).toFixed(8)}
                  </div>
                  <div className="text-[#B5B2BC] text-xs">BNB/$TOD</div>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Token Purchase Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
            <h2 className="text-lg font-bold text-[#EEEEF0]">Buy Tokens</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[#B5B2BC] text-sm mb-3">
                Purchase $TOD tokens to open lootboxes and collect rare NFT
                cars. Each token costs $0.08 USD and requires BNB payment.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#EEEEF0] mb-2">
                    Number of Tokens
                  </label>
                  <input
                    type="number"
                    value={tokenAmount === 0 ? "" : tokenAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setTokenAmount(0);
                      } else {
                        const numValue = parseInt(value) || 0;
                        setTokenAmount(Math.max(0, numValue));
                      }
                    }}
                    onBlur={() => {
                      if (tokenAmount === 0) {
                        setTokenAmount(1);
                      }
                    }}
                    min="1"
                    className="w-full bg-[#121113] border border-[#49474E] rounded-md px-4 py-3 text-[#EEEEF0] focus:border-[#00D4FF] focus:outline-none transition-colors"
                  />
                </div>

                <div className="bg-[#121113] rounded-md p-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[#B5B2BC] text-sm">$TOD Tokens:</span>
                    <span className="text-[#EEEEF0] font-semibold text-sm">
                      {tokenAmount === 0 ? "-" : tokenAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[#B5B2BC] text-sm">
                      Price per token:
                    </span>
                    <span className="text-[#EEEEF0] text-sm">
                      {tokenAmount === 0 ? "-" : "$0.08 USD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[#B5B2BC] text-sm">
                      BNB required:
                    </span>
                    <span className="text-[#F59E0B] text-sm">
                      {tokenAmount === 0 ? "-" : bnbAmount + " BNB"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-[#49474E]/50">
                    <span className="text-[#EEEEF0] font-semibold text-sm">
                      Total:
                    </span>
                    <span className="text-[#00D4FF] font-bold text-sm">
                      {tokenAmount === 0
                        ? "-"
                        : `$${Number(tokenAmount * 0.08).toFixed(2)} USD`}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleBuyTokens}
                  disabled={
                    isPurchasingTokens || !isConnected || tokenAmount === 0
                  }
                  className="w-full"
                >
                  {isPurchasingTokens ? (
                    <>
                      <Loader height={20} width={20} className="mr-2" />
                      Processing...
                    </>
                  ) : tokenAmount === 0 ? (
                    "Enter token amount"
                  ) : (
                    `Purchase ${tokenAmount} $TOD`
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-3">
              <div className="bg-[#121113] rounded-md p-3">
                <h3 className="text-[#EEEEF0] font-semibold text-sm mb-2">
                  Payment Information
                </h3>
                <ul className="text-xs text-[#B5B2BC] space-y-1.5">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    BNB payment required
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Secure BNB payment
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full mr-2"></span>
                    Tokens minted after payment verification
                  </li>
                </ul>
              </div>

              <div className="bg-[#121113] rounded-md p-3">
                <h3 className="text-[#EEEEF0] font-semibold text-sm mb-2">
                  Token Details
                </h3>
                <ul className="text-xs text-[#B5B2BC] space-y-1.5">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Price: $0.08 per token (~0.00008 BNB)
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Symbol: $TOD
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
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
          className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
            <h2 className="text-lg font-bold text-[#EEEEF0]">Open Lootbox</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[#B5B2BC] text-sm mb-3">
                Open lootboxes to get random NFT cars! Choose your pack size and
                save with bulk discounts.
              </p>

              {/* Lootbox Selection Options */}
              <div className="space-y-2 mb-4">
                {/* 1 Lootbox */}
                <div
                  className={`bg-[#121113] rounded-md p-3 cursor-pointer border transition-all ${
                    selectedLootboxAmount === 1
                      ? "border-[#00D4FF] bg-[#00D4FF]/10"
                      : "border-[#49474E]/50 hover:border-[#00D4FF]/50"
                  }`}
                  onClick={() => setSelectedLootboxAmount(1)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[#EEEEF0] font-semibold text-sm">
                        1 Lootbox
                      </span>
                      <div className="text-[#B5B2BC] text-xs">300 $TOD</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#EEEEF0] text-sm">
                        No discount
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5 Lootboxes */}
                <div
                  className={`bg-[#121113] rounded-md p-3 cursor-pointer border transition-all ${
                    selectedLootboxAmount === 5
                      ? "border-[#00D4FF] bg-[#00D4FF]/10"
                      : "border-[#49474E]/50 hover:border-[#00D4FF]/50"
                  }`}
                  onClick={() => setSelectedLootboxAmount(5)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[#EEEEF0] font-semibold text-sm">
                        5 Lootboxes
                      </span>
                      <div className="text-[#B5B2BC] text-xs">1,425 $TOD</div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 text-sm font-semibold">
                        5% OFF
                      </span>
                      <div className="text-[#B5B2BC] text-xs">Save 75 $TOD</div>
                    </div>
                  </div>
                </div>

                {/* 10 Lootboxes */}
                <div
                  className={`bg-[#121113] rounded-md p-3 cursor-pointer border transition-all ${
                    selectedLootboxAmount === 10
                      ? "border-[#00D4FF] bg-[#00D4FF]/10"
                      : "border-[#49474E]/50 hover:border-[#00D4FF]/50"
                  }`}
                  onClick={() => setSelectedLootboxAmount(10)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[#EEEEF0] font-semibold text-sm">
                        10 Lootboxes
                      </span>
                      <div className="text-[#B5B2BC] text-xs">2,700 $TOD</div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 text-sm font-semibold">
                        10% OFF
                      </span>
                      <div className="text-[#B5B2BC] text-xs">
                        Save 300 $TOD
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Pack Summary */}
              <div className="bg-[#121113] rounded-md p-3 mb-4 border border-[#49474E]/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B5B2BC] text-sm">Selected:</span>
                  <span className="text-[#EEEEF0] font-semibold text-sm">
                    {selectedLootboxAmount} Lootbox
                    {selectedLootboxAmount > 1 ? "es" : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B5B2BC] text-sm">Total Cost:</span>
                  <span className="text-[#EEEEF0] font-semibold text-sm">
                    {currentLootboxCost.toLocaleString()} $TOD
                  </span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#B5B2BC] text-sm">Savings:</span>
                    <span className="text-green-400 font-semibold text-sm">
                      {discountPercentage}% OFF
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#B5B2BC] text-sm">Reward:</span>
                  <span className="text-[#EEEEF0] text-sm">
                    {selectedLootboxAmount} Random NFT Car
                    {selectedLootboxAmount > 1 ? "s" : ""}
                  </span>
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
                    Opening Lootbox{selectedLootboxAmount > 1 ? "es" : ""}...
                  </>
                ) : (
                  `Open ${selectedLootboxAmount} Lootbox${
                    selectedLootboxAmount > 1 ? "es" : ""
                  }`
                )}
              </Button>
            </div>

            <div className="flex flex-col justify-center space-y-3">
              <div className="bg-[#121113] rounded-md p-3">
                <h3 className="text-[#EEEEF0] font-semibold text-sm mb-2">
                  Lootbox Rewards
                </h3>
                <ul className="text-xs text-[#B5B2BC] space-y-1.5">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Random NFT Cars
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Collectible vehicles
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Various rarities available
                  </li>
                </ul>
              </div>

              <div className="bg-[#121113] rounded-md p-3">
                <h3 className="text-[#EEEEF0] font-semibold text-sm mb-2">
                  Requirements
                </h3>
                <ul className="text-xs text-[#B5B2BC] space-y-1.5">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    {currentLootboxCost.toLocaleString()} $TOD required
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Connected wallet
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
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
          className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
            <h2 className="text-lg font-bold text-[#EEEEF0]">
              Contract Information
            </h2>
          </div>

          <div className="space-y-3">
            <div className="bg-[#121113] rounded-md p-3 border border-[#49474E]/50">
              <div className="mb-2">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#121113] rounded-md p-3 border border-[#49474E]/50">
                <h3 className="text-[#EEEEF0] font-semibold text-sm mb-2">
                  $TOD Token Details
                </h3>
                <ul className="text-xs text-[#B5B2BC] space-y-1.5">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Name: Torque Drift Token
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Ticker: $TOD
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Decimals: 9
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Total Supply: 27,000,000
                  </li>
                </ul>
              </div>

              <div className="bg-[#121113] rounded-md p-3 border border-[#49474E]/50">
                <h3 className="text-[#EEEEF0] font-semibold text-sm mb-2">
                  Network Information
                </h3>
                <ul className="text-xs text-[#B5B2BC] space-y-1.5">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Network: Binance Smart Chain
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Chain ID: 56
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Block Explorer: BscScan
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full mr-2"></span>
                    Token Price: $0.08 USD
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

