import React, { useState } from "react";
import { motion } from "framer-motion";

interface GamblingOption {
  percentage: number;
  successRate: number;
  failRate: number;
  lastUsed?: number;
}

interface GamblingSectionProps {
  gamblingAmount: number;
  setGamblingAmount: (amount: number) => void;
}

const GAMBLING_OPTIONS: GamblingOption[] = [
  { percentage: 5, successRate: 60, failRate: 5 },
  { percentage: 10, successRate: 55, failRate: 4 },
  { percentage: 20, successRate: 50, failRate: 3 },
  { percentage: 30, successRate: 45, failRate: 2 },
  { percentage: 40, successRate: 40, failRate: 2 },
  { percentage: 50, successRate: 35, failRate: 1 },
];

export const GamblingSection: React.FC<GamblingSectionProps> = ({
  gamblingAmount,
  setGamblingAmount,
}) => {
  const [selectedGamblingOption, setSelectedGamblingOption] = useState<GamblingOption | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#FF4444] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">Gambling</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Amount Selector */}
        <div className="bg-[#121113]/50 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">Select Amount</span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">Bet</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() =>
                setGamblingAmount(Math.max(1, gamblingAmount - 1))
              }
              className="w-8 h-8 rounded bg-[#49474E] hover:bg-[#6C28FF]/30 text-[#EEEEF0] text-sm flex items-center justify-center"
            >
              -
            </button>
            <span className="text-[#EEEEF0] font-mono text-sm min-w-[60px] text-center">
              {gamblingAmount} $TOD
            </span>
            <button
              onClick={() =>
                setGamblingAmount(Math.min(1000, gamblingAmount + 1))
              }
              className="w-8 h-8 rounded bg-[#49474E] hover:bg-[#6C28FF]/30 text-[#EEEEF0] text-sm flex items-center justify-center"
            >
              +
            </button>
          </div>
          <button className="w-full bg-red-600 hover:bg-red-700 text-[#EEEEF0] font-medium py-2 px-3 rounded-md transition-colors">
            Gamble
          </button>
        </div>

        {/* Gambling Options */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">Options</span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">Choose</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {GAMBLING_OPTIONS.map((option) => (
              <button
                key={option.percentage}
                onClick={() => setSelectedGamblingOption(option)}
                className={`w-full p-3 rounded-md transition-colors ${
                  selectedGamblingOption?.percentage === option.percentage
                    ? "bg-[#6C28FF]/30 border border-[#6C28FF]/50"
                    : "bg-[#49474E] hover:bg-[#6C28FF]/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#EEEEF0] text-sm font-medium">
                    {option.percentage}% Boost
                  </span>
                  <span className="text-[#B5B2BC] text-xs">🎲</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">Success: {option.successRate}%</span>
                  <span className="text-red-400">Fail: {option.failRate}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
