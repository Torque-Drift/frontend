import React from "react";
import { motion } from "framer-motion";

interface MiningStatsProps {
  miningStats: {
    totalHp: number;
    currentYield: number;
    lockBoost: number;
    globalBaseRate: number;
  };
}

export const MiningStats: React.FC<MiningStatsProps> = ({ miningStats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-[#EEEEF0]">
          Mining Stats
        </h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            HP
          </p>
          <p className="text-lg font-bold text-[#EEEEF0]">
            {miningStats.totalHp}
          </p>
        </div>
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            Rate
          </p>
          <p className="text-lg font-bold text-[#EEEEF0]">
            {miningStats.globalBaseRate * 100}%
          </p>
        </div>
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            Boost
          </p>
          <p className="text-lg font-bold text-green-400">
            +{miningStats.lockBoost}%
          </p>
        </div>
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            Yield
          </p>
          <p className="text-lg font-bold text-blue-400">
            {miningStats.currentYield}/h
          </p>
        </div>
        <div className="bg-[#121113]/50 rounded-md p-3 text-center">
          <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
            Claim
          </p>
          <p className="text-lg font-bold text-orange-400">1h 23m</p>
        </div>
      </div>

      {/* Lock Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#EEEEF0]">
            Lock for Boost
          </span>
          <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">
            Power Up
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: "1 hour", boost: 5 },
            { label: "6 hours", boost: 15 },
            { label: "24 hours", boost: 30 },
          ].map((period) => (
            <button
              key={period.label}
              className="bg-[#49474E] hover:bg-[#6C28FF]/30 text-[#EEEEF0] p-3 rounded-md transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#EEEEF0] text-sm font-medium">
                  {period.label}
                </span>
                <span className="text-[#B5B2BC] text-xs">🔒</span>
              </div>
              <div className="text-left mt-1">
                <span className="text-green-400 text-xs font-medium">
                  +{period.boost}% boost
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
