import React, { useState } from "react";
import { motion } from "framer-motion";
import { useBurn } from "@/hooks/useBurn";
import { Button } from "../Button";

interface CarAcquisitionProps {
  selectedBoxPrice: number;
  setSelectedBoxPrice: (price: number) => void;
}

export const CarAcquisition: React.FC<CarAcquisitionProps> = ({
  selectedBoxPrice,
  setSelectedBoxPrice,
}) => {
  const { mutate: burn, isLoading: burnLoading, error: burnError } = useBurn();

  const handleBuyBox = () => {
    burn({ burnAmount: selectedBoxPrice, boxType: "STREET" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#FF8C42] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">
          Car Acquisition
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mystery Box */}
        <div className="bg-[#121113]/50 rounded-md p-3 flex flex-col justify-between">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#EEEEF0]">
                Mystery Box
              </span>
              <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">
                Price
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3 pt-4">
              <button
                onClick={() =>
                  setSelectedBoxPrice(Math.max(50, selectedBoxPrice - 50))
                }
                className="w-6 h-6 rounded bg-[#49474E] hover:bg-[#6C28FF]/30 text-[#EEEEF0] text-sm flex items-center justify-center"
                disabled={burnLoading}
              >
                -
              </button>
              <span className="text-[#EEEEF0] font-mono text-sm min-w-[60px] text-center">
                {selectedBoxPrice} $TOD
              </span>
              <button
                onClick={() =>
                  setSelectedBoxPrice(Math.min(500, selectedBoxPrice + 50))
                }
                className="w-6 h-6 rounded bg-[#49474E] hover:bg-[#6C28FF]/30 text-[#EEEEF0] text-sm flex items-center justify-center"
                disabled={burnLoading}
              >
                +
              </button>
            </div>

            {burnError && (
              <div className="text-red-400 text-xs mb-2 text-center">
                {burnError instanceof Error ? burnError.message : "Burn failed"}
              </div>
            )}
          </div>
          <Button onClick={handleBuyBox} disabled={burnLoading}>
            {burnLoading ? "Processing..." : "Buy Mystery Box"}
          </Button>
        </div>

        {/* Rarity Chances */}
        <div className="bg-[#121113]/50 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">
              Rarity Chances
            </span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">
              Stats
            </span>
          </div>
          <div className="space-y-2">
            {[
              { rarity: "Common", chance: "70%", color: "text-gray-400" },
              { rarity: "Uncommon", chance: "25%", color: "text-green-400" },
              { rarity: "Epic", chance: "4.5%", color: "text-purple-400" },
              { rarity: "Legendary", chance: "0.5%", color: "text-yellow-400" },
            ].map((item) => (
              <div
                key={item.rarity}
                className="flex items-center justify-between text-xs"
              >
                <span className={`${item.color} font-medium`}>
                  {item.rarity}
                </span>
                <span className="text-[#EEEEF0] font-semibold">
                  {item.chance}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cars */}
        <div className="bg-[#121113]/50 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">
              Recent Cars
            </span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">
              History
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A191B]/50 rounded p-2 text-center">
                <div className="w-8 h-8 mx-auto bg-[#49474E] rounded mb-1"></div>
                <p className="text-xs text-[#B5B2BC]">Empty</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
