import React from "react";
import { motion } from "framer-motion";
import { useClaim, usePreviewClaim } from "@/hooks/useClaim";
import { useClaimLock } from "@/hooks/useClaimLock";
import { Button } from "../Button";
import { Loader } from "@/components/Loader";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { CarInventoryData } from "@/types/cars";
import Image from "next/image";

// Função auxiliar para formatar valores de token
function formatTokenAmount(amount: number): string {
  if (amount === 0) return "0 $TOD";
  return `${amount.toFixed(8)} $TOD`;
}

interface ClaimSectionProps {
  todBalance: number;
  setTodBalance: (balance: number | ((prev: number) => number)) => void;
  equippedCars: CarInventoryData[];
}

export const ClaimSection: React.FC<ClaimSectionProps> = ({ equippedCars }) => {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [claimedAmount, setClaimedAmount] = React.useState<string>("");
  const [liveEstimate, setLiveEstimate] = React.useState<number>(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const queryClient = useQueryClient();
  const { address } = useAccount();

  const {
    previewData,
    isLoading: previewLoading,
    canClaim,
    formattedPotentialReward,
    remainingTimeMinutes,
    error: previewError,
  } = usePreviewClaim();

  const { lockState } = useClaimLock();

  // Estimativa ao vivo que aumenta com o tempo
  React.useEffect(() => {
    if (!previewData?.hashPower || !previewData?.lastClaim) return;

    const updateLiveEstimate = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeSinceLastClaim = now - previewData.lastClaim;
      const baseRate = 291667;
      const hoursSinceLastClaim = timeSinceLastClaim / 3600;
      const estimateInTokens =
        (previewData.hashPower * baseRate * hoursSinceLastClaim) / 100_000_000;

      setLiveEstimate(estimateInTokens);
    };
    updateLiveEstimate();
    const interval = setInterval(updateLiveEstimate, 1000);
    return () => clearInterval(interval);
  }, [previewData?.hashPower, previewData?.lastClaim]);

  const { onClaim, isLoading: claimLoading, isClaiming } = useClaim();

  // Controle de claim lock
  const hasActiveLock = lockState?.hasActiveLock ?? false;
  const isClaimDisabled = isClaiming || hasActiveLock;

  // Informações de penalidade
  const hasPenalty = previewData?.hasPenalty ?? false;
  const penaltyDescription = previewData?.penaltyDescription ?? "";

  // Function to refresh claim data
  const handleRefreshData = async () => {
    if (!address) return;

    setIsRefreshing(true);
    try {
      // Invalidate and refetch claim-related queries
      await queryClient.invalidateQueries({
        queryKey: ["claimPreview", address],
      });
      await queryClient.invalidateQueries({
        queryKey: ["userData", address],
      });
      await queryClient.invalidateQueries({
        queryKey: ["carsInventory", address],
      });

      // Force refetch
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

  // Mostrar sucesso temporário após claim
  React.useEffect(() => {
    if (!isClaiming && !claimLoading && showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setClaimedAmount("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isClaiming, claimLoading, showSuccess]);

  if (previewLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
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
        className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
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

  // Texto do cooldown considerando penalidades
  const getCooldownText = () => {
    if (remainingTimeMinutes) {
      return `${Math.floor(remainingTimeMinutes / 60)}h ${
        remainingTimeMinutes % 60
      }m Until Free Claim`;
    }
    return "Ready (4h cooldown recommended)";
  };

  const cooldownText = getCooldownText();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50 relative ${
        isClaiming ? "opacity-75" : ""
      }`}
    >
      {/* Loading overlay */}
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

      {/* Claim Info */}
      <div className="bg-[#121113]/50 rounded-md p-3">
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
              {formatTokenAmount(liveEstimate)}
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
          {previewData?.hashPower && (
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Hash Power:</span>
              <span className="text-blue-400 font-medium">
                {previewData.hashPower} HP
              </span>
            </div>
          )}
          {previewData?.hourlyReward && (
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">$TOD/Hour:</span>
              <span className="text-purple-400 font-medium">
                {previewData?.hourlyReward ?? "0"}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Lock Boost:</span>
            <span className="text-cyan-400 font-medium">
              +{previewData?.lockBoost ?? 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Referral Boost:</span>
            <span className="text-cyan-400 font-medium">
              +{previewData?.referralBoost ?? 0}%
            </span>
          </div>
          {(previewData?.totalBoost ?? 0) > 0 && (
            <div className="flex justify-between border-t border-[#49474E] pt-2 mt-2">
              <span className="text-[#EEEEF0] font-medium">Total Boost:</span>
              <span className="text-green-400 font-bold">
                +{previewData?.totalBoost.toFixed(2) ?? 0}%
              </span>
            </div>
          )}
        </div>

        {/* Mensagem explicativa quando há lock ativo */}
        {hasActiveLock && (
          <div className="mb-3 p-3 bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-lg">
            <p className="text-sm text-[#ff6b6b]">
              Claim is locked due to active Claim Lock. Normal claims are
              disabled during lock period.
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4 h-full">
          <Button
            disabled={isClaimDisabled}
            className="flex-1"
            onClick={async () => {
              try {
                await onClaim();
                if (
                  formattedPotentialReward &&
                  formattedPotentialReward !== "0 $TOD"
                ) {
                  setClaimedAmount(formattedPotentialReward);
                  setShowSuccess(true);
                }
              } catch (error) {
                // Erro já é tratado pelo hook
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
            className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-green-400 text-lg">✅</span>
              <span className="text-green-400 font-medium">
                Claim Successful!
              </span>
            </div>
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
            {previewData?.lastClaim && (
              <div className="flex justify-between">
                <span className="text-[#888]">Last Claim:</span>
                <span className="text-[#EEEEF0]">
                  {new Date(previewData.lastClaim * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
            {previewData?.totalClaimed !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#888]">Total Claimed:</span>
                <span className="text-[#EEEEF0]">
                  {previewData.totalClaimed?.toFixed(2) || "0"} $TOD
                </span>
              </div>
            )}
            {previewData?.referralCount !== undefined &&
              previewData.referralCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Referrals:</span>
                  <span className="text-[#EEEEF0]">
                    {previewData.referralCount}
                  </span>
                </div>
              )}
            {previewData?.referralEarnings !== undefined &&
              previewData.referralEarnings > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Referral Boost:</span>
                  <span className="text-[#EEEEF0]">
                    {previewData.referralEarnings?.toFixed(2) || "0"}%
                  </span>
                </div>
              )}
            {previewData?.totalBoost !== undefined &&
              previewData.totalBoost > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#888]">Total Boost:</span>
                  <span className="text-[#EEEEF0]">
                    {previewData.totalBoost?.toFixed(2) || "0"}%
                  </span>
                </div>
              )}
            {previewData?.gambleCountToday !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#888]">Gambles Today:</span>
                <span className="text-[#EEEEF0]">
                  {previewData.gambleCountToday}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#888]">Equipped Cars:</span>
              <span className="text-[#EEEEF0]">
                {equippedCars.filter((car) => car !== null).length}/5
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

