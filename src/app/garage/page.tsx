"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { Street } from "@/components/Street";
import { useCarsInventory } from "@/hooks/useCarsInventory";
import {
  HeaderStats,
  CarAcquisition,
  MiningStats,
  YourCars,
  EquipmentSlots,
  MaintenanceSection,
  ClaimSection,
  GamblingSection,
} from "@/components/garage";
import { useInitializeGame } from "@/hooks/useInitializeGame";
import toast from "react-hot-toast";
import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import type { CarInventoryData } from "@/types/cars";

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
  const [userBalance, setUserBalance] = useState(1250.5);
  const [todBalance, setTodBalance] = useState(0);
  const [selectedBoxPrice, setSelectedBoxPrice] = useState(100);
  const [gamblingAmount, setGamblingAmount] = useState(10);
  const [referrerInput, setReferrerInput] = useState("");

  // Hook para verificar e inicializar usuário
  const {
    userExists,
    checkingUser,
    initializeGame,
    isInitializing,
    initializeError,
  } = useInitializeGame();

  const {
    cars: allCars = [],
    equippedCars,
    unequippedCars,
    carStats,
    isLoading: carsLoading,
    error: carsError,
    hasUnequippedCars,
    equip,
    unequip,
    getEquippedCount,
    getTotalHashPower,
    isSlotEquipping,
    isSlotUnequipping,
  } = useCarsInventory();

  const [miningStats, setMiningStats] = useState<MiningStats>({
    totalHp: getTotalHashPower(),
    currentYield: getTotalHashPower() * 0.05, // Base rate calculation
    nextClaimTime: Date.now() + 3600000,
    lockBoost: 7,
    globalBaseRate: 0.05,
  });

  // Helper function to convert equipped cars to slots format (5 positions)
  const convertEquippedToSlots = (
    equippedCars: CarInventoryData[]
  ): (CarInventoryData | null)[] => {
    const slots: (CarInventoryData | null)[] = new Array(5).fill(null);

    // Place each car in its correct slot based on slotIndex
    equippedCars.forEach((car) => {
      if (
        car.slotIndex !== undefined &&
        car.slotIndex >= 0 &&
        car.slotIndex < 5
      ) {
        slots[car.slotIndex] = car;
      }
    });

    return slots;
  };

  const getRarityColor = (rarity: number) => {
    const rarityNames = [
      "text-gray-400",
      "text-green-400",
      "text-purple-400",
      "text-yellow-400",
    ];
    return rarityNames[rarity] || "text-gray-400";
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const moveDistance = Math.sqrt(delta.x ** 2 + delta.y ** 2);

    if (moveDistance < 30) return;

    if (activeId.startsWith("car-") && overId.startsWith("slot-")) {
      const carMint = activeId.replace("car-", "");
      const slotIndex = parseInt(overId.replace("slot-", ""));

      const car = allCars.find((c) => c.mint === carMint);
      if (car) {
        equip(car, slotIndex);
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }
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

  if (checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader height={100} width={100} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#EEEEF0] mb-2">
            Checking Account Status...
          </h2>
          <p className="text-[#B5B2BC]">Verifying your Torque Drift account</p>
        </motion.div>
      </div>
    );
  }

  if (!userExists) {
    return (
      <div className="min-h-screen bg-[#121113] flex flex-col items-center justify-center h-full">
        <div className="container mx-auto px-4 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-4xl font-bold text-[#EEEEF0] mb-4">
              Welcome to Torque Drift!
            </h1>

            <p className="text-[#B5B2BC] text-lg mb-8 max-w-md mx-auto">
              Pay a one-time entry fee of{" "}
              <span className="text-yellow-500 font-semibold">0.1 BNB</span> to
              unlock your garage and start your racing journey!
            </p>

            {/* Referral Input */}
            <div className="max-w-md mx-auto mb-6">
              <label className="block text-sm font-medium text-[#EEEEF0] mb-2 text-left">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referrerInput}
                onChange={(e) => setReferrerInput(e.target.value)}
                placeholder="Enter referrer wallet address..."
                className="w-full bg-[#121113] border border-[#49474E] rounded-md px-4 py-3 text-[#EEEEF0] placeholder-[#B5B2BC] focus:border-[#00D4FF] focus:outline-none transition-colors"
              />
              <p className="text-xs text-[#B5B2BC] text-left mt-1">
                Get bonus rewards if someone referred you!
              </p>
            </div>

            {initializeError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4 mb-6 max-w-md mx-auto">
                <p className="text-red-400 text-sm">
                  {initializeError.message}
                </p>
              </div>
            )}
            <Button
              onClick={async () => {
                if (isInitializing) return; // Prevent double clicks

                try {
                  await initializeGame({
                    referrerPubkey: referrerInput.trim() || undefined,
                  });
                  toast.success(
                    "Welcome to Torque Drift! Your account has been initialized successfully!"
                  );
                } catch (error) {
                  console.error("Failed to initialize game:", error);

                  // Check for specific transaction errors
                  const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                  if (errorMessage.includes("already been processed")) {
                    toast.error(
                      "Transaction already processed. Please wait a moment and try again."
                    );
                  } else if (errorMessage.includes("already initialized")) {
                    toast.error("Your account is already initialized!");
                  } else {
                    toast.error(
                      `Failed to initialize account: ${errorMessage}`
                    );
                  }
                }
              }}
              disabled={isInitializing}
            >
              {isInitializing
                ? "Initializing..."
                : "Pay 0.1 BNB & Start Racing"}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col bg-[#121113] pt-24 relative overflow-hidden">
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

            {/* Equipment Slots */}
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
                  {getEquippedCount()}/5 slots
                </span>
              </div>

              <EquipmentSlots
                equippedCars={convertEquippedToSlots(equippedCars)}
                onEquip={equip}
                onUnequip={unequip}
                getRarityColor={getRarityColor}
                isSlotEquipping={isSlotEquipping}
                isSlotUnequipping={isSlotUnequipping}
              />

              <div className="mt-4 text-center">
                <p className="text-xs text-[#B5B2BC] mb-1">
                  Drag cars from inventory below and drop them into empty slots
                  above
                </p>
              </div>
            </motion.div>

            {/* Your Cars */}
            <YourCars
              cars={unequippedCars}
              carStats={carStats}
              isLoading={carsLoading}
              error={carsError}
              hasCars={hasUnequippedCars}
              getRarityColor={getRarityColor}
            />

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
      </div>
    </DndContext>
  );
}
