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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#FF8C42] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">
          Maintenance
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Maintenance Info */}
        <div className="bg-[#121113]/50 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#EEEEF0]">Weekly Maintenance</span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">Required</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Cost:</span>
              <span className="text-orange-400 font-medium">
                ~30% yield
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B5B2BC]">Fee:</span>
              <span className="text-blue-400 font-medium">
                ~5% yield
              </span>
            </div>
          </div>
        </div>

        {/* Car Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#EEEEF0]">Car Status</span>
            <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded">Monitor</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {cars.map((car) => {
              const maintenanceStatus = getMaintenanceStatus(car);
              return (
                <div
                  key={car.id}
                  className="bg-[#121113]/50 rounded-md p-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#EEEEF0] font-medium text-xs truncate max-w-[100px]">
                      {car.name}
                    </span>
                    <span
                      className={`text-xs ${maintenanceStatus.color}`}
                    >
                      {maintenanceStatus.text}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => performMaintenance(car.id)}
                      disabled={todBalance < 3.0 || !car.isBlocked}
                      className={`flex-1 text-xs py-1 px-2 rounded ${
                        car.isBlocked
                          ? "bg-green-600 hover:bg-green-700 text-[#EEEEF0]"
                          : "bg-red-600 hover:bg-red-700 text-[#EEEEF0]"
                      } ${
                        car.isBlocked
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Maintain
                    </button>
                    <button
                      onClick={() => toggleOverclock(car.id)}
                      disabled={todBalance < 5.0}
                      className={`flex-1 text-xs py-1 px-2 rounded ${
                        car.overclockActive
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                    >
                      {car.overclockActive ? "⚡" : "Boost"} (5)
                    </button>
                  </div>
                  <div className="text-xs text-[#B5B2BC] text-center bg-[#121113]/30 rounded-md p-2">
                    {car.overclockActive
                      ? "• Failed overclock damages car temporarily"
                      : "One use per burn cycle"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
