"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import { Street } from "@/components/Street";
import { useCarsInventory } from "@/hooks/useCarsInventory";
import {
  MiningStats,
  YourCars,
  EquipmentSlots,
  ClaimSection,
  ClaimLockSection,
} from "@/components/garage";
import { useInitializeGame } from "@/hooks/useInitializeGame";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { Button } from "@/components/Button";
import { useEthers } from "@/hooks/useEthers";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "@/constants";
import { TorqueDriftReferral__factory } from "@/contracts";
import type { CarInventoryData } from "@/types/cars";
import { notFound } from "next/navigation";

interface MiningStats {
  totalHp: number;
  currentYield: number;
  nextClaimTime: number;
  lockBoost: number;
  globalBaseRate: number;
}

export default function GaragePage() {
  return notFound();
  const [referrerInput, setReferrerInput] = useState("");

  const { provider } = useEthers();

  const { userExists, referrerCode, initializeGame, isInitializing } =
    useInitializeGame();

  const { todBalance } = useTokenBalances();

  // Query to check referral discount
  const {
    data: referralCheck,
    isLoading: checkingReferral,
  } = useQuery({
    queryKey: ["referralCheck", referrerInput, provider],
    queryFn: async () => {
      if (!provider || !referrerInput.trim()) {
        return {
          hasDiscount: false,
          requiredPayment: "0.1",
        };
      }

      try {
        const referralContract = TorqueDriftReferral__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftReferral,
          provider
        );

        const isValid = await referralContract.isValidReferralCode(referrerInput.trim());
        if (!isValid) {
          return {
            hasDiscount: false,
            requiredPayment: "0.1",
          };
        }

        const hasDiscount = await referralContract.discountReferralCodes(referrerInput.trim());

        return {
          hasDiscount,
          requiredPayment: hasDiscount ? "0.09" : "0.1",
        };
      } catch (error) {
        console.error("Error checking referral:", error);
        return {
          hasDiscount: false,
          requiredPayment: "0.1",
        };
      }
    },
    enabled: !!provider && referrerInput.trim().length > 0,
    staleTime: 30000,
  });

  const {
    cars: allCars = [],
    equippedCars,
    unequippedCars,
    carStats,
    equippedSlotsData,
    isLoading: carsLoading,
    error: carsError,
    hasUnequippedCars,
    equip,
    unequip,
    performCarMaintenance,
    getEquippedCount,
    isSlotEquipping,
    isSlotUnequipping,
    refetch: refetchCarsInventory,
    isCarUnderMaintenance,
  } = useCarsInventory();

  useEffect(() => {
    if (userExists) refetchCarsInventory();
  }, [userExists]);

  const convertEquippedToSlots = (): (CarInventoryData | null)[] => {
    if (!equippedSlotsData?.slots) {
      return new Array(5).fill(null);
    }
    return equippedSlotsData.slots.map((slot: any) =>
      slot.isEmpty ? null : slot.car
    );
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
              <span className="text-yellow-500 font-semibold">
                {referralCheck?.requiredPayment || "0.1"} BNB
                {referralCheck?.hasDiscount && (
                  <span className="text-green-400 text-sm ml-2">(discount applied!)</span>
                )}
              </span>{" "}
              to unlock your garage and start your racing journey!
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
                placeholder="Enter referrer code..."
                className="w-full bg-[#121113] border border-[#49474E] rounded-md px-4 py-3 text-[#EEEEF0] placeholder-[#B5B2BC] focus:border-[#00D4FF] focus:outline-none transition-colors"
              />
            </div>
            <Button
              onClick={async () => {
                await initializeGame({
                  referrerPubkey: referrerInput.trim() || undefined,
                });
              }}
              disabled={isInitializing || checkingReferral}
            >
              {isInitializing
                ? "Initializing..."
                : `Pay ${referralCheck?.requiredPayment || "0.1"} BNB & Start Racing`}
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
      <div className="flex flex-col bg-[url('/images/hero_bg.png')] bg-contain bg-no-repeat pt-20 relative overflow-hidden">
        {/* Content overlay for readability */}
        <div className="flex flex-col relative min-h-screen py-8">
          {/* Main Content - Vertical Flow */}
          <div className="space-y-6 px-4 sm:px-0 w-full mb-6">
            <div className="max-w-7xl mx-auto">
              <MiningStats referrerCode={referrerCode} />
            </div>
            <Street />
            {/* Equipment Slots */}
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-[#FF6B6B] rounded-full"></div>
                  <h2 className="text-lg font-semibold text-[#EEEEF0]">
                    Garage
                  </h2>
                  <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded ml-auto">
                    {getEquippedCount()}/5 slots
                  </span>
                </div>

                <EquipmentSlots
                  equippedCars={convertEquippedToSlots()}
                  onEquip={equip}
                  onUnequip={unequip}
                  onPerformMaintenance={performCarMaintenance}
                  getRarityColor={getRarityColor}
                  isSlotEquipping={isSlotEquipping}
                  isSlotUnequipping={isSlotUnequipping}
                  isCarUnderMaintenance={isCarUnderMaintenance}
                />

                <div className="mt-4 text-center">
                  <p className="text-xs text-[#B5B2BC] mb-1">
                    Drag cars from inventory below and drop them into empty
                    slots above
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Your Cars */}
            <div className="max-w-7xl mx-auto">
              <YourCars
                cars={unequippedCars}
                carStats={carStats}
                isLoading={carsLoading}
                error={carsError}
                hasCars={hasUnequippedCars}
                getRarityColor={getRarityColor}
              />
            </div>

            <Street />
            {/* Actions Row */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Claim */}
              <ClaimSection
                todBalance={todBalance}
                equippedCars={equippedCars}
              />

              {/* Claim Lock */}
              <ClaimLockSection />
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
