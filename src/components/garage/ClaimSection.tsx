import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useClaim, usePreviewClaim } from "@/hooks/useClaim";
import { useClaimLock } from "@/hooks/useClaimLock";
import { Button } from "../Button";
import { Loader } from "@/components/Loader";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { CarInventoryData } from "@/types/cars";
import Image from "next/image";
import { X } from "lucide-react";

// Função auxiliar para formatar valores de token
function formatTokenAmount(amount: number): string {
  if (amount === 0) return "0 $TOD";
  return `${amount.toFixed(8)} $TOD`;
}

interface ClaimSectionProps {
  todBalance: number;
  equippedCars: CarInventoryData[];
}

export const ClaimSection: React.FC<ClaimSectionProps> = ({ equippedCars }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState<string>("");
  const [liveClaimableAmount, setLiveClaimableAmount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const {
    previewData,
    isLoading: previewLoading,
    canClaim,
    remainingTimeMinutes,
    error: previewError,
  } = usePreviewClaim();

  const { lockState } = useClaimLock();

  useEffect(() => {
    if (!previewData) return;
    const calculateLiveAmount = () => {
      const now = Date.now();
      const timeElapsed = (now - startTime) / 1000;
      const hourlyReward = parseFloat(previewData.hourlyReward || "0");
      const tokensPerSecond = hourlyReward / 3600;
      const additionalTokens = tokensPerSecond * timeElapsed;
      const newLiveAmount = previewData.claimableAmount + additionalTokens;
      setLiveClaimableAmount(Math.max(0, newLiveAmount));
    };
    calculateLiveAmount();
    const interval = setInterval(calculateLiveAmount, 1000);
    return () => clearInterval(interval);
  }, [previewData, startTime]);

  useEffect(() => {
    if (previewData) {
      setStartTime(Date.now());
    }
  }, [previewData]);

  const { onClaim, isLoading: claimLoading, isClaiming } = useClaim();
  const hasActiveLock = lockState?.hasActiveLock ?? false;
  const hasPenalty = previewData?.hasPenalty ?? false;
  const isClaimDisabled = isClaiming || hasActiveLock;

  const handleRefreshData = async () => {
    if (!address) return;

    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ["claimPreview", address],
      });
      await queryClient.invalidateQueries({
        queryKey: ["userData", address],
      });
      await queryClient.invalidateQueries({
        queryKey: ["carsInventory", address],
      });

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["claimPreview", address] }),
        queryClient.refetchQueries({ queryKey: ["userData", address] }),
        queryClient.refetchQueries({ queryKey: ["carsInventory", address] }),
      ]);
    } catch (error) {
      console.error("Error refreshing claim data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (previewLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
          <h2 className="text-lg font-semibold text-[#EEEEF0]">Claim & Mint</h2>
        </div>
        <div className="text-center text-[#B5B2BC] py-8">
          Loading claim preview...
        </div>
      </motion.div>
    );
  }

  if (previewError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
          <h2 className="text-lg font-semibold text-[#EEEEF0]">Claim & Mint</h2>
        </div>
        <div className="text-center text-red-400 py-8">
          Error loading claim data: {previewError.message}
        </div>
      </motion.div>
    );
  }
  const cooldownText = previewData?.timeUntilNextClaimFormatted ?? "0h 0m";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 relative ${
        isClaiming ? "opacity-75" : ""
      }`}
    >
      {isClaiming && (
        <div className="absolute inset-0 bg-[#121113]/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader height={40} width={40} className="animate-spin" />
            <span className="text-sm text-[#EEEEF0] font-medium">
              Claiming $TOD tokens...
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">Claim & Mint</h2>
      </div>

      <div className="">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#EEEEF0]">Claim $TOD</span>
          <span
            className={`text-xs bg-[#49474E] px-2 py-1 rounded ${
              canClaim && !hasPenalty
                ? "text-green-400"
                : canClaim && hasPenalty
                ? "text-yellow-400"
                : "text-orange-400"
            }`}
          >
            {canClaim && !hasPenalty
              ? "Ready"
              : canClaim && hasPenalty
              ? "Early Claim"
              : "Wait"}
          </span>
        </div>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Available Now:</span>
            <span className="text-green-400 font-medium">
              {formatTokenAmount(
                liveClaimableAmount >= 0 ? liveClaimableAmount : 0
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Status:</span>
            <span
              className={`font-medium ${
                canClaim && !hasPenalty
                  ? "text-green-400"
                  : canClaim && hasPenalty
                  ? "text-yellow-400"
                  : "text-orange-400"
              }`}
            >
              {cooldownText}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Race Power:</span>
            <span className="text-blue-400 font-medium">
              {previewData?.hashPower ?? 0} RP
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">$TOD/Hour:</span>
            <span className="text-purple-400 font-medium">
              {previewData?.hourlyReward ?? "0"}
            </span>
          </div>
          {!previewData?.canClaimWithoutPenalty && (
            <div className="">
              <div className="flex justify-between text-sm">
                <span className="text-[#B5B2BC]">BNB Penalty:</span>
                <span className="text-red-400 font-medium">
                  {previewData?.penaltyBnb?.toFixed(3) ?? 0} BNB
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-[#B5B2BC]">Token Burn:</span>
                <span className="text-red-400 font-medium">
                  {previewData?.penaltyBurnPercent ?? 0}% of claim
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Lock Boost:</span>
            <span className="text-cyan-400 font-medium">
              +{previewData?.lockBoost.toFixed(0) ?? 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Referral Boost:</span>
            <span className="text-cyan-400 font-medium">
              +{previewData?.referralBoost?.toFixed(0) ?? 0}%
            </span>
          </div>
          <div className="flex justify-between border-t border-[#49474E] pt-2 mt-2">
            <span className="text-[#EEEEF0] font-medium">Total Boost:</span>
            <span className="text-green-400 font-bold">
              +{previewData?.totalBoost?.toFixed(0) ?? 0}%
            </span>
          </div>
        </div>

        {/* Mensagem explicativa quando há lock ativo */}
        {hasActiveLock && (
          <div className="mb-3 p-3 bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-lg">
            <p className="text-sm text-[#ff6b6b] text-center">
              Claim is locked due to active Claim Lock.
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4 h-full">
          <Button
            disabled={isClaimDisabled}
            className="flex-1"
            onClick={async () => {
              await onClaim();
              if (liveClaimableAmount > 0) {
                setClaimedAmount(
                  formatTokenAmount(
                    liveClaimableAmount >= 0 ? liveClaimableAmount : 0
                  )
                );
                setShowSuccess(true);
              }
            }}
          >
            {isClaiming
              ? "Claiming..."
              : hasActiveLock
              ? "Claim Locked"
              : claimLoading
              ? "Processing..."
              : hasPenalty
              ? "Claim Early"
              : "Claim $TOD"}
          </Button>

          <Button
            disabled={isRefreshing}
            onClick={handleRefreshData}
            className="rounded-md w-1/3"
          >
            {isRefreshing ? (
              <Loader height={16} width={16} className="animate-spin" />
            ) : (
              <Image
                src="/images/logo.png"
                alt="Loader"
                width={16}
                height={16}
                draggable={false}
                priority={true}
              />
            )}
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-3 bg-green-500/10 rounded-md text-center relative"
          >
            <X
              size={20}
              onClick={() => setShowSuccess(false)}
              className="text-green-300 absolute right-2 cursor-pointer"
            />
            <p className="text-green-300 text-sm">
              You claimed <span className="font-semibold">{claimedAmount}</span>
            </p>
          </motion.div>
        )}

        {/* Mining Stats */}
        <div className="border-t border-[#49474E] pt-3 mb-3">
          <h4 className="text-xs font-medium text-[#B5B2BC] mb-2 uppercase tracking-wide">
            Mining Stats
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#888]">Last Claim:</span>
              <span className="text-[#EEEEF0]">
                {previewData?.lastClaim
                  ? new Date(previewData?.lastClaim * 1000).toLocaleDateString(
                      "en-US",
                      {
                        minute: "2-digit",
                        second: "2-digit",
                        hour: "2-digit",
                      }
                    )
                  : "Never"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Referrals:</span>
              <span className="text-[#EEEEF0]">
                {previewData?.referralCount ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Referral Boost:</span>
              <span className="text-[#EEEEF0]">
                {previewData?.referralEarnings?.toFixed(2) ?? "0"}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Total Boost:</span>
              <span className="text-[#EEEEF0]">
                {previewData?.totalBoost?.toFixed(0) ?? "0"}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Equipped Cars:</span>
              <span className="text-[#EEEEF0]">
                {equippedCars.filter((car) => car !== null).length ?? 0}/5
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
