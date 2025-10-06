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

interface GarageProps {
  equippedCars: Car[];
  unequippedCars: Car[];
  getRarityColor: (rarity: string) => string;
  getMaintenanceStatus: (car: Car) => { text: string; color: string };
}

export const Garage: React.FC<GarageProps> = ({
  equippedCars,
  unequippedCars,
  getRarityColor,
  getMaintenanceStatus,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#FF6B6B] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">Garage</h2>
        <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded ml-auto">
          {equippedCars.length}/5 slots
        </span>
      </div>

      {/* Equipped Cars */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-medium text-[#EEEEF0]">
            Equipped Cars
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {equippedCars.map((car) => (
            <div
              key={car.id}
              className="bg-[#121113]/50 rounded-md p-3 border border-[#49474E]/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`text-xs ${getRarityColor(car.rarity)}`}>
                      {car.rarity}
                    </span>
                    <span className="text-xs text-[#B5B2BC]">•</span>
                    <span className="text-xs text-[#B5B2BC]">{car.version}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#EEEEF0] truncate">
                    {car.name}
                  </h4>
                </div>
                <button className="text-[#B5B2BC] hover:text-red-400 ml-2">
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#B5B2BC]">Hash Range:</span>
                  <span className="text-[#EEEEF0] font-medium">{car.hashRange}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#B5B2BC]">Daily Yield:</span>
                  <span className="text-[#EEEEF0] font-medium">{car.dailyYield}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#B5B2BC]">ROI:</span>
                  <span className="text-[#EEEEF0] font-medium">{car.roi}d</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#B5B2BC]">Status:</span>
                  <div className="flex gap-1">
                    {car.isBlocked && (
                      <span className="text-red-400">🚫</span>
                    )}
                    {car.overclockActive && (
                      <span className="text-yellow-400">⚡</span>
                    )}
                    <span
                      className={`text-xs ${
                        getMaintenanceStatus(car).color
                      }`}
                    >
                      {getMaintenanceStatus(car).text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-[#B5B2BC] rounded-full"></div>
          <span className="text-sm font-medium text-[#EEEEF0]">Inventory</span>
          <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded ml-auto">
            {unequippedCars.length} cars
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {unequippedCars.map((car) => (
            <div
              key={car.id}
              className="bg-[#121113]/50 rounded-md p-3 border border-[#49474E]/30 hover:border-[#6C28FF]/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`text-xs ${getRarityColor(car.rarity)}`}>
                      {car.rarity}
                    </span>
                    <span className="text-xs text-[#B5B2BC]">•</span>
                    <span className="text-xs text-[#B5B2BC]">{car.version}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#EEEEF0] truncate">
                    {car.name}
                  </h4>
                </div>
                <button className="text-green-400 hover:text-green-300 ml-2">
                  +
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#B5B2BC]">Hash Range:</span>
                  <span className="text-[#EEEEF0] font-medium">{car.hashRange}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#B5B2BC]">Daily Yield:</span>
                  <span className="text-[#EEEEF0] font-medium">{car.dailyYield}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#B5B2BC]">ROI:</span>
                  <span className="text-[#EEEEF0] font-medium">{car.roi}d</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#B5B2BC]">Status:</span>
                  <div className="flex gap-1">
                    {car.isBlocked && (
                      <span className="text-red-400">🚫</span>
                    )}
                    {car.overclockActive && (
                      <span className="text-yellow-400">⚡</span>
                    )}
                    <span
                      className={`text-xs ${
                        getMaintenanceStatus(car).color
                      }`}
                    >
                      {getMaintenanceStatus(car).text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
