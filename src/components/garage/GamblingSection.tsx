import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../Button";

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

  const calculatePotentialReward = (amount: number, option: GamblingOption | null) => {
    if (!option) return 0;
    return amount * (1 + option.percentage / 100);
  };

  const calculatePotentialLoss = (amount: number, option: GamblingOption | null) => {
    if (!option) return 0;
    return amount * (option.failRate / 100);
  };

  const potentialReward = calculatePotentialReward(gamblingAmount, selectedGamblingOption);
  const potentialLoss = calculatePotentialLoss(gamblingAmount, selectedGamblingOption);

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

          {/* Potential Outcomes */}
          {selectedGamblingOption && (
            <div className="border-t border-[#49474E] pt-3 mb-3">
              <h4 className="text-xs font-medium text-[#B5B2BC] mb-2 uppercase tracking-wide">
                Potential Outcomes
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#888]">Win ({selectedGamblingOption.successRate}%):</span>
                  <span className="text-green-400 font-medium">
                    +{potentialReward.toFixed(2)} $TOD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Loss ({selectedGamblingOption.failRate}%):</span>
                  <span className="text-red-400 font-medium">
                    -{potentialLoss.toFixed(2)} $TOD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Expected Value:</span>
                  <span className={`font-medium ${
                    (potentialReward * selectedGamblingOption.successRate / 100) -
                    (potentialLoss * selectedGamblingOption.failRate / 100) > 0
                      ? "text-green-400" : "text-red-400"
                  }`}>
                    {((potentialReward * selectedGamblingOption.successRate / 100) -
                      (potentialLoss * selectedGamblingOption.failRate / 100)).toFixed(2)} $TOD
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            disabled={!selectedGamblingOption}
            className="w-full mb-2"
          >
            {selectedGamblingOption ? "Gamble" : "Select Option First"}
          </Button>
        </div>

        {/* Gambling Options */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">Boost Options</span>
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
                    {option.percentage}% Mining Boost
                  </span>
                  <span className="text-[#B5B2BC] text-xs">🎲</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">Success: {option.successRate}%</span>
                  <span className="text-red-400">Fail: {option.failRate}%</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-[#888]">Duration:</span>
                  <span className="text-[#EEEEF0]">24h</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gambling System Info */}
      <div className="border-t border-[#49474E] pt-4 mt-4">
        <h4 className="text-xs font-medium text-[#B5B2BC] mb-2 uppercase tracking-wide">
          How Gambling Works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#888]">
          <div>
            <p className="font-medium text-[#B5B2BC] mb-1">🎯 Win Condition</p>
            <p>Get temporary mining boost to increase $TOD earnings</p>
          </div>
          <div>
            <p className="font-medium text-[#B5B2BC] mb-1">⚠️ Risk Factor</p>
            <p>Losing reduces your mining power for a short time</p>
          </div>
          <div>
            <p className="font-medium text-[#B5B2BC] mb-1">⏰ Cooldown</p>
            <p>24 hours between gambles. Choose your risk wisely!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
