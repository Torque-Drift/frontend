"use client";
import React from "react";
import Image from "next/image";
import Card from "../Card";
import Button from "../Button";

export interface GPUCardProps {
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
  image: string;
  power?: string;
  owner?: string;
  onClick?: () => void;
  showButton?: boolean;
  buttonText?: string;
  className?: string;
}

const GPUCard: React.FC<GPUCardProps> = ({
  name,
  rarity,
  image,
  power,
  owner,
  onClick,
  showButton = false,
  buttonText = "View Details",
  className = "",
}) => {
  const rarityColors = {
    "Common": "bg-blue-500 text-white",
    "Rare": "bg-purple-500 text-white",
    "Epic": "bg-pink-500 text-white",
    "Legendary": "bg-amber-500 text-white",
    "Mythic": "bg-rose-500 text-white",
  };

  return (
    <Card 
      className={`overflow-hidden bg-gradient-to-b from-black/80 to-cyan-900/10 group hover:scale-105 transition-transform duration-300 ${className}`}
      hover
    >
      <div className="p-4 relative">
        <div
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-bold ${rarityColors[rarity]}`}
        >
          {rarity}
        </div>
        <div className="relative h-40 mb-4">
          <Image
            src={image}
            alt={name}
            fill
            style={{ objectFit: "contain" }}
            className="object-cover rounded"
          />
        </div>
        <h4 className="text-xl font-bold">{name}</h4>
        
        {power && (
          <p className="text-cyan-300 mb-2">Mining Power: {power}</p>
        )}
        
        {owner && (
          <p className="text-cyan-300/70 text-sm">Owner: {owner}</p>
        )}
        
        {showButton && (
          <Button 
            variant="primary" 
            onClick={onClick}
            className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {buttonText}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default GPUCard; 