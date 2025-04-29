"use client";
import React from "react";
import Button from "../Button";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  label?: string;
  showLimits?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  className = "",
  label,
  showLimits = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || min;
    onChange(Math.max(min, Math.min(max, val)));
  };

  const increment = () => {
    onChange(Math.min(max, value + step));
  };

  const decrement = () => {
    onChange(Math.max(min, value - step));
  };

  return (
    <div className={className}>
      {label && <label className="block text-cyan-300/80 mb-2">{label}</label>}
      <div className="flex">
        <button
          onClick={decrement}
          className="px-4 py-2 bg-cyan-900/50 text-cyan-300 rounded-l hover:bg-cyan-800/50"
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-black/60 border-y border-cyan-800/50 text-center outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <button
          onClick={increment}
          className="px-4 py-2 bg-cyan-900/50 text-cyan-300 rounded-r hover:bg-cyan-800/50"
        >
          +
        </button>
      </div>
      {showLimits && (
        <div className="text-sm mt-1 text-cyan-300/60 flex justify-between">
          <span>Min: {min}</span>
          <span>Max: {max}</span>
        </div>
      )}
    </div>
  );
};

export default NumberInput; 