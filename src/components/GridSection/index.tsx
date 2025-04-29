"use client";
import React from "react";
import SectionTitle from "../SectionTitle";

interface GridSectionProps {
  title?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  variant?: "cyan-purple" | "rose-amber";
  glitch?: boolean;
}

const GridSection: React.FC<GridSectionProps> = ({
  title,
  children,
  columns = 3,
  className = "",
  variant = "cyan-purple",
  glitch = false,
}) => {
  const columnsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className={`mb-20 ${className}`}>
      {title && <SectionTitle variant={variant} glitch={glitch}>{title}</SectionTitle>}
      
      <div className={`grid ${columnsClass[columns]} gap-6`}>
        {children}
      </div>
    </section>
  );
};

export default GridSection; 