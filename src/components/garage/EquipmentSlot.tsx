"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  getRarityName,
  getVersionName,
  type CarInventoryData,
} from "@/types/cars";
import { API_BASE_URL } from "@/services";
import { Loader } from "@/components/Loader";

interface EquipmentSlotProps {
  id: string;
  slotIndex: number;
  car: CarInventoryData | null;
  onEquip: (car: CarInventoryData, slotIndex: number) => void;
  onUnequip: (slotIndex: number, carMint: string) => void;
  getRarityColor: (rarity: number) => string;
  isEquipping: boolean;
  isUnequipping: boolean;
}

export const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  id,
  slotIndex,
  car,
  onEquip,
  onUnequip,
  getRarityColor,
  isEquipping,
  isUnequipping,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    // Only consider this droppable if the slot is empty
    disabled: car !== null,
  });

  const isLoading = isEquipping || isUnequipping;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative bg-[#121113]/50 rounded-lg border-2 min-h-[220px]
        transition-all duration-300 ease-out cursor-pointer group
        ${isLoading ? "opacity-75" : ""}
        ${
          isOver
            ? "border-[#6C28FF] bg-[#6C28FF]/15 scale-110 shadow-2xl shadow-[#6C28FF]/30 border-dashed animate-pulse"
            : car
            ? "border-[#49474E]/50 hover:border-[#6C28FF]/50 hover:shadow-xl hover:shadow-[#6C28FF]/20 hover:scale-[1.02] overflow-hidden"
            : "border-[#49474E]/30 hover:border-[#6C28FF]/40 hover:bg-[#6C28FF]/8 hover:shadow-lg border-dashed hover:shadow-[#6C28FF]/15 hover:scale-[1.02]"
        }
      `}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#121113]/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader height={32} width={32} className="animate-spin" />
            <span className="text-xs text-[#EEEEF0] font-medium">
              {isEquipping ? "Equipping..." : "Unequipping..."}
            </span>
          </div>
        </div>
      )}
      {car ? (
        <div className="h-full flex flex-col ">
          {/* Car Image */}
          <div className="relative ">
            <div className="aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={`${API_BASE_URL}${car.image}`}
                alt={`${car.rarity} ${car.version} car`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => onUnequip(slotIndex, car.mint)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              title="Unequip car"
            >
              ✕
            </button>
          </div>

          {/* Car Info */}
          <div className="space-y-2 flex-1 p-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className={`text-xs ${getRarityColor(
                      car.rarity
                    )} font-medium`}
                  >
                    {getRarityName(car.rarity)}
                  </span>
                  <span className="text-xs text-[#B5B2BC]">•</span>
                  <span className="text-xs text-[#B5B2BC]">
                    {getVersionName(car.version)}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-[#EEEEF0] truncate">
                  {car.name}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#B5B2BC]">Hash Power:</span>
                <div className="text-[#EEEEF0] font-medium">
                  {car.hashPower}
                </div>
              </div>
              <div>
                <span className="text-[#B5B2BC]">Slot:</span>
                <div className="text-[#6C28FF] font-medium">
                  #{slotIndex + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Drag Handle */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-[#B5B2BC] text-xs">⋮⋮</div>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div
            className={`
              text-xs mb-1 transition-all duration-300
              ${isOver ? "text-[#6C28FF] font-semibold" : "text-[#B5B2BC]"}
            `}
          >
            Slot #{slotIndex + 1}
          </div>
          <div
            className={`
              text-xs transition-all duration-300
              ${
                isOver
                  ? "text-[#6C28FF] font-medium animate-pulse"
                  : "text-[#49474E]"
              }
            `}
          >
            {isOver ? "Drop here!" : "Drop car here"}
          </div>

          {/* Drop zone indicator */}
          {isOver && (
            <div className="absolute inset-0 rounded-lg border-4 border-[#6C28FF]/50 animate-ping"></div>
          )}
        </div>
      )}
    </div>
  );
};
