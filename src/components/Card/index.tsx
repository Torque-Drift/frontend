"use client";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "outlined";
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  hover = false,
}) => {
  const baseClasses = "rounded-lg p-6 bg-black/40";
  
  const variantClasses = {
    default: "border border-cyan-800",
    gradient: "border border-cyan-800 bg-gradient-to-r from-cyan-900/30 to-purple-900/30",
    outlined: "border-2 border-cyan-800 bg-transparent"
  };
  
  const hoverClasses = hover ? "hover:bg-black/60 transition-colors" : "";
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card; 