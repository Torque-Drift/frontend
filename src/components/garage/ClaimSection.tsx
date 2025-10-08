import React from "react";
import { motion } from "framer-motion";
import { useClaim, usePreviewClaim } from "@/hooks/useClaim";
import { Button } from "../Button";

interface Car {
  id: string;
  name: string;
  rarity: "Common" | "Uncommon" | "Epic" | "Legendary";
  version: "Vintage" | "Modern";
  hp: number;
  hashRange: string;
  cooldown: number;
  dailyYield: number;
  roi: number;
  equipped: boolean;
  maintenanceDue?: Date;
  isBlocked?: boolean;
  overclockActive?: boolean;
}

interface ClaimSectionProps {
  todBalance: number;
  setTodBalance: (balance: number | ((prev: number) => number)) => void;
  equippedCars: Car[];
}

export const ClaimSection: React.FC<ClaimSectionProps> = ({
  todBalance,
  setTodBalance,
  equippedCars,
}) => {
  const {
    previewData,
    isLoading: previewLoading,
    canClaim,
    formattedPotentialReward,
    remainingTimeMinutes,
    error: previewError,
  } = usePreviewClaim();

  const { onClaim, isLoading: claimLoading } = useClaim();

  // Se preview está carregando
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

  // Se há erro no preview, mostrar erro
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

  const cooldownText = remainingTimeMinutes
    ? `${Math.floor(remainingTimeMinutes / 60)}h ${remainingTimeMinutes % 60}m`
    : "Ready";

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

      {/* Claim Info */}
      <div className="bg-[#121113]/50 rounded-md p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#EEEEF0]">Claim $TOD</span>
          <span
            className={`text-xs bg-[#49474E] px-2 py-1 rounded ${
              canClaim ? "text-green-400" : "text-orange-400"
            }`}
          >
            {canClaim ? "Ready" : "Cooldown"}
          </span>
        </div>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Available:</span>
            <span className="text-green-400 font-medium">
              {formattedPotentialReward}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B5B2BC]">Cooldown:</span>
            <span
              className={`font-medium ${
                canClaim ? "text-green-400" : "text-orange-400"
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
          {previewData?.formatted.hourlyReward && (
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Per Hour:</span>
              <span className="text-purple-400 font-medium">
                {previewData.formatted.hourlyReward}
              </span>
            </div>
          )}
        </div>

        <Button
          disabled={!canClaim || equippedCars.some((car) => car.isBlocked)}
          className="w-full mb-4"
          onClick={() => onClaim()}
        >
          {claimLoading ? "Processing..." : "Claim $TOD"}
        </Button>

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
                  {previewData.totalClaimed?.toFixed(4) || "0"} $TOD
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

        {equippedCars.some((car) => car.isBlocked) && (
          <div className="mt-3 text-xs text-red-400 text-center bg-red-500/10 rounded-md p-2">
            Cars blocked from claims
          </div>
        )}
      </div>
    </motion.div>
  );
};
