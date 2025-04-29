"use client";
import React from "react";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  variant?: "cyan-purple" | "rose-amber";
  glitch?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  className = "",
  variant = "cyan-purple",
  glitch = false,
}) => {
  const baseClasses = "text-3xl font-bold mb-10 text-center";
  
  const gradientClasses = {
    "cyan-purple": "from-cyan-400 to-purple-600",
    "rose-amber": "from-rose-400 to-amber-400",
  };
  
  const glitchClass = glitch ? "glitch-text" : "";
  
  return (
    <h3 className={`${baseClasses} ${className}`}>
      <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientClasses[variant]} ${glitchClass}`}>
        {children}
      </span>
    </h3>
  );
};

export default SectionTitle; 