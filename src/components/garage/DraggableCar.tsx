"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CarInventoryData } from "@/types/cars";

interface DraggableCarProps {
  car: CarInventoryData;
  children: React.ReactNode;
}

export const DraggableCar: React.FC<DraggableCarProps> = ({
  car,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `car-${car.mint}`,
      data: { car },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        bg-[#121113]/50 rounded-md p-3 border border-[#49474E]/30
        hover:border-[#6C28FF]/50 hover:shadow-xl hover:shadow-[#6C28FF]/30
        transition-all duration-200 ease-out
        cursor-grab active:cursor-grabbing
        select-none touch-none
        ${
          isDragging
            ? "shadow-2xl shadow-[#6C28FF]/60 scale-110 rotate-1 border-[#6C28FF] bg-[#6C28FF]/8"
            : "hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98]"
        }
      `}
    >
      {/* Drag indicator */}
      <div
        className={`
        absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-dashed
        transition-all duration-300 ease-out flex items-center justify-center
        ${
          isDragging
            ? "border-[#6C28FF] bg-[#6C28FF]/30 shadow-lg shadow-[#6C28FF]/50 animate-pulse scale-110"
            : "border-[#49474E]/40 hover:border-[#6C28FF]/60 hover:bg-[#6C28FF]/10"
        }
      `}
      >
        <div
          className={`
          w-1.5 h-1.5 rounded-full transition-all duration-300 ease-out
          ${isDragging ? "bg-[#6C28FF] scale-125" : "bg-[#49474E]/60"}
        `}
        ></div>
      </div>

      <div
        className={`transition-all duration-200 ${
          isDragging ? "pointer-events-none" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};
