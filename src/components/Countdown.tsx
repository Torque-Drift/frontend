"use client";

import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, Flame, Rocket } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  targetDate: Date;
}

const CountdownCard = memo(
  ({
    value,
    label,
    icon: Icon,
  }: {
    value: number;
    label: string;
    icon: any;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 200,
        duration: 0.6,
      }}
      className="relative group"
    >
      {/* Main card - matching the page design */}
      <motion.div
        className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-6 border border-[#49474E]/50 text-center"
        whileHover={{
          scale: 1.02,
          borderColor: "#00D4FF",
          transition: { duration: 0.2 },
        }}
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-3"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon className="w-8 h-8 text-[#00D4FF]" />
        </motion.div>

        {/* Value */}
        <motion.div
          key={value} // Re-animate when value changes
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className="text-4xl font-bold text-[#EEEEF0] block mb-1"
            animate={{
              color: ["#EEEEF0", "#00D4FF", "#EEEEF0"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {value.toString().padStart(2, "0")}
          </motion.span>
          <span className="text-sm text-[#B5B2BC] uppercase tracking-wider font-medium">
            {label}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
);

CountdownCard.displayName = "CountdownCard";

export const Countdown: React.FC<CountdownProps> = memo(({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isLaunched, setIsLaunched] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsLaunched(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial calculation

    return () => clearInterval(timer);
  }, [targetDate]);

  // If launched, don't render the component at all
  if (isLaunched) {
    return null;
  }

  const cards = [
    {
      value: timeLeft.days,
      label: "Days",
      icon: Clock,
    },
    {
      value: timeLeft.hours,
      label: "Hours",
      icon: Flame,
    },
    {
      value: timeLeft.minutes,
      label: "Minutes",
      icon: Zap,
    },
    {
      value: timeLeft.seconds,
      label: "Seconds",
      icon: Rocket,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
    >
      {/* Header matching page style */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
        <h2 className="text-xl font-bold text-[#EEEEF0]">Pre-sale Countdown</h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-[#B5B2BC] text-sm mb-1">
          Get ready for the ultimate drifting experience!
        </p>
        <p className="text-[#B5B2BC] text-xs">
          Launching on October 27, 2025 at 15:00 UTC
        </p>
      </div>

      {/* Countdown Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.4 + index * 0.1,
              duration: 0.5,
            }}
          >
            <CountdownCard {...card} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
});

Countdown.displayName = "Countdown";

