"use client";
import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: Date;
  className?: string;
  alwaysShow?: boolean;
  onComplete?: () => void;
}

const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  className = "",
  alwaysShow = false,
  onComplete,
}) => {
  const [timeRemaining, setTimeRemaining] = useState("00d 00h 00m 00s");

  useEffect(() => {
    let target = new Date(targetDate);
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      if (difference <= 0) {
        if (alwaysShow) {
          // Reset to always show time based on initial duration
          target = new Date();
          const initialDifference = targetDate.getTime() - new Date().getTime();
          
          // Add the initial duration to the current time
          target.setTime(target.getTime() + Math.abs(initialDifference));
        } else {
          setTimeRemaining("00d 00h 00m 00s");
          if (onComplete) {
            onComplete();
          }
          return;
        }
      }
      
      // Calculate days, hours, minutes, seconds
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Format the countdown string
      const formattedTime = `${days}d ${hours < 10 ? '0' + hours : hours}h ${minutes < 10 ? '0' + minutes : minutes}m ${seconds < 10 ? '0' + seconds : seconds}s`;
      setTimeRemaining(formattedTime);
    };
    
    // Update immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [targetDate, alwaysShow, onComplete]);

  return (
    <span className={`font-mono bg-black/30 px-2 py-1 rounded text-rose-500 ${className}`}>
      {timeRemaining}
    </span>
  );
};

export default Countdown; 