import React from "react";
import { motion } from "framer-motion";
import { usePreviewClaim } from "@/hooks";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

interface MiningStatsProps {
  referrerCode: string;
}

export const MiningStats: React.FC<MiningStatsProps> = ({ referrerCode }) => {
  const { previewData } = usePreviewClaim();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
    >
      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#FF6B6B] rounded-full"></div>
          <h2 className="text-lg font-semibold text-[#EEEEF0]">Mining Stats</h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs">
            Ref Code: <span className="font-bold">{referrerCode}</span>
          </p>
          <Copy
            size={16}
            onClick={() => {
              window.navigator.clipboard.writeText(referrerCode);
              toast.success("Referral code copied to clipboard");
            }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            RP Equipped
          </p>
          <p className="text-lg font-bold text-[#EEEEF0]">
            {previewData?.hashPower ?? 0}
          </p>
        </div>
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            Hourly Reward
          </p>
          <p className="text-lg font-bold text-[#EEEEF0]">
            {previewData?.hourlyReward ?? 0}/hour
          </p>
        </div>
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            Daily Reward
          </p>
          <p className="text-lg font-bold text-blue-400">
            {(Number(previewData?.hourlyReward ?? 0) * 24).toFixed(2)}/day
          </p>
        </div>
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            Boost
          </p>
          <p className="text-lg font-bold text-green-400">
            +{previewData?.totalBoost.toFixed(0) ?? 0}%
          </p>
        </div>

        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            Total Referrals
          </p>
          <p className="text-lg font-bold text-orange-400">
            {previewData?.referralCount ?? 0}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
