"use client";

import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CarInventoryData } from "@/types/cars";
import { EquipmentSlot } from "./EquipmentSlot";

interface EquipmentSlotsProps {
  equippedCars: (CarInventoryData | null)[];
  onEquip: (car: CarInventoryData, slotIndex: number) => void;
  onUnequip: (slotIndex: number, carMint: string) => void;
  onPerformMaintenance: (carMint: string) => void;
  getRarityColor: (rarity: number) => string;
  isSlotEquipping: (slotIndex: number) => boolean;
  isSlotUnequipping: (slotIndex: number) => boolean;
  isCarUnderMaintenance: (carMint: string) => boolean;
  maxSlots?: number;
}

export const EquipmentSlots: React.FC<EquipmentSlotsProps> = ({
  equippedCars,
  onEquip,
  onUnequip,
  onPerformMaintenance,
  getRarityColor,
  isSlotEquipping,
  isSlotUnequipping,
  isCarUnderMaintenance,
  maxSlots = 5,
}) => {
  const slotIds = Array.from(
    { length: maxSlots },
    (_, index) => `slot-${index}`
  );

  return (
    <SortableContext items={slotIds} strategy={verticalListSortingStrategy}>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: maxSlots }, (_, index) => {
          const car = equippedCars[index];
          return (
            <EquipmentSlot
              key={index}
              id={`slot-${index}`}
              slotIndex={index}
              car={car}
              onEquip={onEquip}
              onUnequip={onUnequip}
              onPerformMaintenance={onPerformMaintenance}
              getRarityColor={getRarityColor}
              isEquipping={isSlotEquipping(index)}
              isUnequipping={isSlotUnequipping(index)}
              isUnderMaintenance={car ? isCarUnderMaintenance(car.mint) : false}
            />
          );
        })}
      </div>
    </SortableContext>
  );
};
