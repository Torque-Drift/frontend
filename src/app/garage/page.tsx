"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Street } from "@/components/Street";
import { useUserCars } from "@/hooks/useUserCars";
import type { CarData } from "@/services/car/carService";
import {
  HeaderStats,
  CarAcquisition,
  MiningStats,
  YourCars,
  Garage,
  MaintenanceSection,
  ClaimSection,
  GamblingSection,
} from "@/components/garage";

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

interface MiningStats {
  totalHp: number;
  currentYield: number;
  nextClaimTime: number;
  lockBoost: number;
  globalBaseRate: number;
}

export default function GaragePage() {
  // State management
  const [userBalance, setUserBalance] = useState(1250.5);
  const [todBalance, setTodBalance] = useState(0);
  const [selectedBoxPrice, setSelectedBoxPrice] = useState(100);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [gamblingAmount, setGamblingAmount] = useState(10);

  // Cars data
  const {
    cars: userCars = [],
    carStats,
    isLoading: carsLoading,
    error: carsError,
    hasCars,
  } = useUserCars();

  const [miningStats, setMiningStats] = useState<MiningStats>({
    totalHp: 149,
    currentYield: 9.94,
    nextClaimTime: Date.now() + 3600000,
    lockBoost: 7,
    globalBaseRate: 0.05,
  });

  // Computed values
  const equippedCars = [] as Car[];
  const unequippedCars = [] as Car[];

  // Helper functions
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "text-gray-400";
      case "Uncommon":
        return "text-green-400";
      case "Epic":
        return "text-purple-400";
      case "Legendary":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getMaintenanceStatus = (car: Car) => {
    const now = new Date();
    const dueTime = car.maintenanceDue?.getTime() || 0;
    const daysUntilDue = Math.ceil(
      (dueTime - now.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (car.isBlocked)
      return { text: "OVERDUE - BLOCKED", color: "text-red-400" };
    if (daysUntilDue <= 0) return { text: "Due Now", color: "text-orange-400" };
    if (daysUntilDue <= 2)
      return { text: `${daysUntilDue} days`, color: "text-yellow-400" };
    return { text: `${daysUntilDue} days`, color: "text-green-400" };
  };

  // Action handlers
  /*  const performMaintenance = (carId: string) => {
    const maintenanceCost = 3.0;
    if (todBalance >= maintenanceCost) {
      setTodBalance((prev) => prev - maintenanceCost);
      setCars((prev) =>
        prev.map((car) =>
          car.id === carId
            ? {
                ...car,
                maintenanceDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                isBlocked: false,
              }
            : car
        )
      );
    }
  }; */

  /* const toggleOverclock = (carId: string) => {
    const overclockCost = 5.0;
    if (todBalance >= overclockCost) {
      setTodBalance((prev) => prev - overclockCost);
      setCars((prev) =>
        prev.map((car) =>
          car.id === carId
            ? { ...car, overclockActive: !car.overclockActive }
            : car
        )
      );

      // Simulate overclock failure risk (20% chance)
      if (Math.random() < 0.2) {
        setTimeout(() => {
          setCars((prev) =>
            prev.map((car) =>
              car.id === carId
                ? { ...car, overclockActive: false, isBlocked: true }
                : car
            )
          );
        }, 1000);
      }
    }
  };
 */
  return (
    <div className="flex flex-col bg-[#121113] pt-24 relative overflow-hidden">
      {/* Animated gradient orbs for depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500/4 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </div>

      {/* Content overlay for readability */}
      <div className="flex flex-col relative min-h-screen py-8">
        {/* Compact Header Stats */}
        <HeaderStats
          userBalance={userBalance}
          todBalance={todBalance}
          miningStats={miningStats}
        />

        {/* Main Content - Vertical Flow */}
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-0 w-full mb-6">
          {/* Car Acquisition */}
          <CarAcquisition
            selectedBoxPrice={selectedBoxPrice}
            setSelectedBoxPrice={setSelectedBoxPrice}
          />

          {/* Mining Stats */}
          <MiningStats miningStats={miningStats} />

          <Garage
            equippedCars={equippedCars}
            unequippedCars={unequippedCars}
            getRarityColor={getRarityColor}
            getMaintenanceStatus={getMaintenanceStatus}
          />

          {/* Your Cars */}
          <YourCars
            cars={userCars}
            carStats={carStats}
            isLoading={carsLoading}
            error={carsError}
            hasCars={hasCars}
            getRarityColor={getRarityColor}
          />

          {/* Garage */}

          {/* Actions Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Maintenance & Overclock */}
            <MaintenanceSection
              cars={[]}
              todBalance={todBalance}
              setTodBalance={setTodBalance}
              setCars={() => {}}
              performMaintenance={() => {}}
              toggleOverclock={() => {}}
              getMaintenanceStatus={getMaintenanceStatus}
            />

            {/* Claim & Mint */}
            <ClaimSection
              todBalance={todBalance}
              setTodBalance={setTodBalance}
              equippedCars={equippedCars}
            />

            {/* Gambling */}
            <GamblingSection
              gamblingAmount={gamblingAmount}
              setGamblingAmount={setGamblingAmount}
            />
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>

      <Street />

      {/* Onboarding Modal */}
      {isOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A191B] rounded-xl p-8 border border-[#49474E] max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-[#EEEEF0] mb-4 text-center">
              Welcome to TorqueDrift!
            </h2>
            <p className="text-[#B5B2BC] text-center mb-6">
              Pay a one-time entry fee of 0.3 SOL to unlock your garage and
              start your racing journey!
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-[#121113]/50 rounded-lg p-4">
                <h4 className="text-[#EEEEF0] font-semibold mb-3">
                  Garage Features:
                </h4>
                <ul className="space-y-2 text-sm text-[#B5B2BC]">
                  <li>• Buy mystery boxes with different rarities</li>
                  <li>• Equip up to 5 cars for mining</li>
                  <li>• Maintain cars weekly for optimal performance</li>
                  <li>• Gamble for temporary mining boosts</li>
                  <li>• Claim $TOD rewards from mining</li>
                </ul>
              </div>

              <div className="border-t border-[#49474E] pt-4">
                <h4 className="text-[#EEEEF0] font-semibold mb-3">
                  Box Types:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#B5B2BC]">Street Box:</span>
                    <span className="text-green-400">Commons + Uncommons</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B5B2BC]">Pro Box:</span>
                    <span className="text-blue-400">Uncommons + Epics</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B5B2BC]">Mythic Box:</span>
                    <span className="text-yellow-400">Epics & Legendaries</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOnboarding(false)}
                className="flex-1 bg-[#49474E] hover:bg-[#5A5A5A] text-[#EEEEF0] font-medium py-2 px-4 rounded-md transition-colors"
              >
                Skip
              </button>
              <button className="flex-1 bg-[#6C28FF] hover:bg-[#5B24E3] text-[#EEEEF0] font-medium py-2 px-4 rounded-md transition-colors">
                Pay 0.3 SOL
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
