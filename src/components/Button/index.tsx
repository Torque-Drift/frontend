"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
}

const getButtonClasses = (
  variant: ButtonProps["variant"] = "primary",
  size: ButtonProps["size"] = "default",
  fullWidth: boolean = false
): string => {
  const baseClasses = "font-medium rounded transition-colors focus:outline-none";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600",
    secondary: "bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-lg shadow-purple-700/30",
    outline: "border-2 border-cyan-500 hover:bg-cyan-500/20",
    ghost: "bg-transparent hover:bg-cyan-900/30 border border-cyan-800",
  };
  
  const sizeClasses = {
    sm: "text-sm px-3 py-1",
    default: "px-4 py-2 text-base",
    lg: "text-lg px-6 py-3 font-bold",
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", fullWidth = false, children, ...props }, ref) => {
    const buttonClasses = getButtonClasses(variant, size, fullWidth);
    
    return (
      <button
        className={`${buttonClasses} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
