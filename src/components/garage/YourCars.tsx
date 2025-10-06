import React from "react";
import { motion } from "framer-motion";
import type { CarData } from "@/services/car/carService";

interface YourCarsProps {
  cars: CarData[];
  carStats: {
    totalCars: number;
    totalHashPower: number;
    rarityCount: Record<string, number>;
  };
  isLoading: boolean;
  error: Error | null;
  hasCars: boolean;
  getRarityColor: (rarity: string) => string;
}

export const YourCars: React.FC<YourCarsProps> = ({
  cars,
  carStats,
  isLoading,
  error,
  hasCars,
  getRarityColor,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">
          Your Cars
        </h2>
        <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded ml-auto">
          {isLoading ? "Loading..." : `${carStats.totalCars} cars`}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]"></div>
          <span className="ml-2 text-[#B5B2BC]">
            Loading your cars...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">⚠️ Error loading cars</div>
          <p className="text-xs text-[#B5B2BC]">
            {error instanceof Error
              ? error.message
              : "Unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs bg-[#49474E] hover:bg-[#6C28FF]/30 text-[#EEEEF0] px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      ) : !hasCars ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏁</div>
          <h3 className="text-[#EEEEF0] font-medium mb-2">No cars yet</h3>
          <p className="text-xs text-[#B5B2BC]">
            Buy mystery boxes above to get your first cars!
          </p>
        </div>
      ) : (
        <>
          {/* Car Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-[#121113]/50 rounded-md p-2 text-center">
              <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                Total HP
              </p>
              <p className="text-sm font-bold text-[#EEEEF0]">
                {carStats.totalHashPower}
              </p>
            </div>
            <div className="bg-[#121113]/50 rounded-md p-2 text-center">
              <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                Common
              </p>
              <p className="text-sm font-bold text-gray-400">
                {carStats.rarityCount.Common || 0}
              </p>
            </div>
            <div className="bg-[#121113]/50 rounded-md p-2 text-center">
              <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                Uncommon
              </p>
              <p className="text-sm font-bold text-green-400">
                {carStats.rarityCount.Uncommon || 0}
              </p>
            </div>
            <div className="bg-[#121113]/50 rounded-md p-2 text-center">
              <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                Rare+
              </p>
              <p className="text-sm font-bold text-purple-400">
                {(carStats.rarityCount.Epic || 0) +
                  (carStats.rarityCount.Legendary || 0)}
              </p>
            </div>
          </div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cars.map((car: CarData, index: number) => (
              <motion.div
                key={car.mint}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#121113]/50 rounded-md p-3 border border-[#49474E]/30 hover:border-[#6C28FF]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className={`text-xs ${getRarityColor(
                          car.rarity
                        )} font-medium`}
                      >
                        {car.rarity}
                      </span>
                      <span className="text-xs text-[#B5B2BC]">•</span>
                      <span className="text-xs text-[#B5B2BC]">
                        {car.version}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#EEEEF0] truncate">
                      Car #{car.mint.slice(0, 8)}...
                    </h4>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#B5B2BC]">Hash Power:</span>
                    <span className="text-[#EEEEF0] font-medium">
                      {car.hashPower}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#B5B2BC]">Mint:</span>
                    <span className="text-[#EEEEF0] font-medium font-mono text-xs">
                      {car.mint.slice(0, 6)}...{car.mint.slice(-4)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};
