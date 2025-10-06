import React from "react";
import { motion } from "framer-motion";

interface HeaderStatsProps {
  userBalance: number;
  todBalance: number;
  miningStats: {
    totalHp: number;
  };
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  userBalance,
  todBalance,
  miningStats,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-3 max-w-7xl mx-auto px-4 sm:px-0 w-full mb-6"
    >
      <div className="bg-[#1A191B]/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#49474E]/30 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#6C28FF] rounded-full animate-pulse"></div>
        <span className="text-xs text-[#B5B2BC] font-medium uppercase tracking-wider">
          SOL
        </span>
        <span className="text-sm font-semibold text-[#EEEEF0]">
          {userBalance}
        </span>
      </div>

      <div className="bg-[#1A191B]/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#49474E]/30 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#00D4FF] rounded-full animate-pulse"></div>
        <span className="text-xs text-[#B5B2BC] font-medium uppercase tracking-wider">
          $TOD
        </span>
        <span className="text-sm font-semibold text-[#EEEEF0]">
          {todBalance}
        </span>
      </div>

      <div className="bg-[#1A191B]/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#49474E]/30 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
        <span className="text-xs text-[#B5B2BC] font-medium uppercase tracking-wider">
          HP
        </span>
        <span className="text-sm font-semibold text-[#EEEEF0]">
          {miningStats.totalHp}
        </span>
      </div>

      <div className="bg-[#1A191B]/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#49474E]/30 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-pulse"></div>
        <span className="text-xs text-[#B5B2BC] font-medium uppercase tracking-wider">
          CLAIM
        </span>
        <span className="text-sm font-semibold text-[#EEEEF0]">1h 23m</span>
      </div>
    </motion.div>
  );
};
