import React from "react";
import { motion } from "framer-motion";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">
          Claim & Mint
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Claim Info */}
        <div className="bg-[#121113]/50 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">Claim $TOD</span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">Collect</span>
          </div>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Available:</span>
              <span className="text-green-400 font-medium">
                27.5 $TOD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Cooldown:</span>
              <span className="text-orange-400 font-medium">
                1h 23m
              </span>
            </div>
          </div>

          <button
            disabled={true || equippedCars.some((car) => car.isBlocked)}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-[#49474E] disabled:cursor-not-allowed text-[#EEEEF0] font-medium py-2 px-3 rounded-md transition-colors"
          >
            Claim $TOD
          </button>

          {equippedCars.some((car) => car.isBlocked) && (
            <div className="text-xs text-red-400 text-center bg-red-500/10 rounded-md p-2">
              🚫 Cars blocked from claims
            </div>
          )}
        </div>

        {/* Mint Info */}
        <div className="bg-[#121113]/50 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">Mint New Car</span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">Create</span>
          </div>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Cost:</span>
              <span className="text-orange-400 font-medium">50 $TOD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Time:</span>
              <span className="text-blue-400 font-medium">2 hours</span>
            </div>
          </div>

          <button
            disabled={todBalance < 50}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-[#49474E] disabled:cursor-not-allowed text-[#EEEEF0] font-medium py-2 px-3 rounded-md transition-colors"
          >
            Start Minting
          </button>

          <div className="text-xs text-[#B5B2BC] text-center bg-[#121113]/30 rounded-md p-2 mt-2">
            Burn tokens to create new cars
          </div>
        </div>
      </div>
    </motion.div>
  );
};
