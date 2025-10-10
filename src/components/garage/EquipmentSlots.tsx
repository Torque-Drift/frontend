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
  getRarityColor: (rarity: number) => string;
  isSlotEquipping: (slotIndex: number) => boolean;
  isSlotUnequipping: (slotIndex: number) => boolean;
  maxSlots?: number;
}

export const EquipmentSlots: React.FC<EquipmentSlotsProps> = ({
  equippedCars,
  onEquip,
  onUnequip,
  getRarityColor,
  isSlotEquipping,
  isSlotUnequipping,
  maxSlots = 5,
}) => {
  const slotIds = Array.from(
    { length: maxSlots },
    (_, index) => `slot-${index}`
  );

  return (
    <SortableContext items={slotIds} strategy={verticalListSortingStrategy}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: maxSlots }, (_, index) => (
          <EquipmentSlot
            key={index}
            id={`slot-${index}`}
            slotIndex={index}
            car={equippedCars[index]}
            onEquip={onEquip}
            onUnequip={onUnequip}
            getRarityColor={getRarityColor}
            isEquipping={isSlotEquipping(index)}
            isUnequipping={isSlotUnequipping(index)}
          />
        ))}
      </div>
    </SortableContext>
  );
};
