import React from "react";
import { motion } from "framer-motion";
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

interface MaintenanceSectionProps {
  cars: Car[];
  todBalance: number;
  setTodBalance: (balance: number | ((prev: number) => number)) => void;
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
  performMaintenance: (carId: string) => void;
  toggleOverclock: (carId: string) => void;
  getMaintenanceStatus: (car: Car) => { text: string; color: string };
}

export const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({
  cars,
  todBalance,
  setTodBalance,
  setCars,
  performMaintenance,
  toggleOverclock,
  getMaintenanceStatus,
}) => {
  const carsNeedingMaintenance = cars.filter((car) => car.isBlocked).length;
  const carsWithOverclock = cars.filter((car) => car.overclockActive).length;
  const totalMaintenanceCost = carsNeedingMaintenance * 3.0;
  const totalOverclockCost = carsWithOverclock * 5.0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#FF8C42] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">Maintenance</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Maintenance Info */}
        <div className="bg-[#121113]/50 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">
              Weekly Maintenance
            </span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">
              Required
            </span>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Cost per car:</span>
              <span className="text-orange-400 font-medium">3.0 $TOD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Overclock cost:</span>
              <span className="text-purple-400 font-medium">5.0 $TOD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Frequency:</span>
              <span className="text-blue-400 font-medium">Weekly</span>
            </div>
          </div>

          {/* Maintenance Stats */}
          <div className="border-t border-[#49474E] pt-3 mb-3">
            <h4 className="text-xs font-medium text-[#B5B2BC] mb-2 uppercase tracking-wide">
              Fleet Status
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#888]">Total Cars:</span>
                <span className="text-[#EEEEF0]">{cars.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Need Maintenance:</span>
                <span className="text-red-400">{carsNeedingMaintenance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Overclocked:</span>
                <span className="text-yellow-400">{carsWithOverclock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Total Cost:</span>
                <span className="text-orange-400">
                  {(totalMaintenanceCost + totalOverclockCost).toFixed(1)} $TOD
                </span>
              </div>
            </div>
          </div>

          {carsNeedingMaintenance > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2 mb-3">
              <p className="text-red-400 text-xs text-center">
                🚨 {carsNeedingMaintenance} car
                {carsNeedingMaintenance > 1 ? "s" : ""} need maintenance!
              </p>
            </div>
          )}

          <div className="text-xs text-[#888] leading-relaxed">
            <p>• Maintenance keeps cars running optimally</p>
            <p>• Overclock gives temporary power boost</p>
            <p>• Skip maintenance = reduced mining power</p>
          </div>
        </div>
      </div>

      {/* Maintenance System Info */}
      <div className="border-t border-[#49474E] pt-4 mt-4">
        <h4 className="text-xs font-medium text-[#B5B2BC] mb-3 uppercase tracking-wide">
          Maintenance System
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#888]">
          <div>
            <p className="font-medium text-[#B5B2BC] mb-1">🔧 Weekly Care</p>
            <p>Keep your cars maintained for optimal mining performance</p>
          </div>
          <div>
            <p className="font-medium text-[#B5B2BC] mb-1">⚡ Overclock</p>
            <p>Temporary power boost with risk of car damage</p>
          </div>
          <div>
            <p className="font-medium text-[#B5B2BC] mb-1">💰 Cost Effective</p>
            <p>Regular maintenance prevents expensive repairs</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
