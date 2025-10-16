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
import Image from "next/image";
import { Button } from "../Button";

interface EquipmentSlotProps {
  id: string;
  slotIndex: number;
  car: CarInventoryData | null;
  onEquip: (car: CarInventoryData, slotIndex: number) => void;
  onUnequip: (slotIndex: number, carMint: string) => void;
  onPerformMaintenance: (carMint: string) => void;
  getRarityColor: (rarity: number) => string;
  isEquipping: boolean;
  isUnequipping: boolean;
  isUnderMaintenance: boolean;
}

export const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  id,
  slotIndex,
  car,
  onEquip,
  onUnequip,
  onPerformMaintenance,
  getRarityColor,
  isEquipping,
  isUnequipping,
  isUnderMaintenance,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: car !== null,
  });

  const isLoading = isEquipping || isUnequipping || isUnderMaintenance;

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
              {isEquipping
                ? "Equipping..."
                : isUnequipping
                ? "Unequipping..."
                : "Maintaining..."}
            </span>
          </div>
        </div>
      )}
      {car ? (
        <div className="h-full flex flex-col ">
          {/* Car Image */}
          <div className="relative ">
            <div className="aspect-square flex items-center justify-center overflow-hidden">
              <Image
                src={`${car.image}`}
                alt={`${car.rarity} ${car.version} car`}
                className="w-full h-full object-cover scale-125"
                width={100}
                height={100}
                draggable={false}
                priority={true}
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
                <div className="flex items-center gap-1 mb-1 text-[10px] sm:text-xs">
                  <span className={`${getRarityColor(car.rarity)} font-medium`}>
                    {getRarityName(car.rarity)}
                  </span>
                  <span className="text-[#B5B2BC]">•</span>
                  <span className="text-[#B5B2BC]">
                    {getVersionName(car.version)}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#EEEEF0] truncate">
                  {car.name}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-[10px] sm:text-xs">
              <div>
                <span className="text-[#B5B2BC]">Hash Power:</span>
                <div className="text-[#EEEEF0] font-bold text-sm">
                  {car.hashPower}
                </div>
              </div>
              <div>
                <span className="text-[#B5B2BC]">Efficiency:</span>
                <div
                  className={`font-medium text-sm ${
                    car.efficiency >= 90
                      ? "text-green-400"
                      : car.efficiency >= 70
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {car.efficiency.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Maintenance Button */}
            <div className="mt-2 flex gap-2">
              <Button
                onClick={() => onPerformMaintenance(car.mint)}
                disabled={isUnderMaintenance || Number(car.efficiency) < 100}
                className="w-full h-8 py-2"
                title="Perform maintenance to restore efficiency"
              >
                {isUnderMaintenance ? "Maintaining..." : "Repair"}
              </Button>
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
