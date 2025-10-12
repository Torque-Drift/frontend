import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../Button";

interface RewardItem {
  hashValue: number;
  image: string;
  id: string;
  name: string;
  rarity: string;
  version: string;
  dailyYield: number;
  cooldown: number;
  roi: number;
  uri: string;
}

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardItem: RewardItem | null;
}

// Memoized rarity config to avoid recalculation
const RARITY_CONFIGS = {
  Common: {
    color: "#9CA3AF",
    bgColor: "#374151",
    borderColor: "#6B7280",
    glowColor: "#9CA3AF",
    particleColor: "#9CA3AF",
  },
  Rare: {
    color: "#10B981",
    bgColor: "#065F46",
    borderColor: "#059669",
    glowColor: "#10B981",
    particleColor: "#10B981",
  },
  Epic: {
    color: "#8B5CF6",
    bgColor: "#5B21B6",
    borderColor: "#7C3AED",
    glowColor: "#8B5CF6",
    particleColor: "#A855F7",
  },
  Legendary: {
    color: "#F59E0B",
    bgColor: "#92400E",
    borderColor: "#D97706",
    glowColor: "#F59E0B",
    particleColor: "#FBBF24",
  },
} as const;

const getRarityConfig = (rarity: string) => {
  return (
    RARITY_CONFIGS[rarity as keyof typeof RARITY_CONFIGS] ||
    RARITY_CONFIGS.Common
  );
};

// Memoized confetti particles to avoid recreation
const CONFETTI_COUNT = 20; // Reduced from 50
const ConfettiParticle = React.memo(
  ({
    index,
    particleColor,
    glowColor,
  }: {
    index: number;
    particleColor: string;
    glowColor: string;
  }) => {
    const randomX = useMemo(
      () =>
        Math.random() *
        (typeof window !== "undefined" ? window.innerWidth : 1920),
      []
    );
    const randomDelay = useMemo(() => Math.random() * 0.3, []);
    const randomDuration = useMemo(() => 2 + Math.random() * 1.5, []);

    return (
      <motion.div
        key={index}
        initial={{
          x: randomX,
          y: -20,
          rotate: 0,
          scale: 0,
        }}
        animate={{
          y: typeof window !== "undefined" ? window.innerHeight + 20 : 1080,
          rotate: 360,
          scale: 1,
        }}
        transition={{
          duration: randomDuration,
          delay: randomDelay,
          ease: "easeOut",
        }}
        className="absolute w-2 h-2 rounded-full"
        style={{
          backgroundColor: particleColor,
          boxShadow: `0 0 6px ${glowColor}`,
        }}
      />
    );
  }
);

ConfettiParticle.displayName = "ConfettiParticle";

export const RewardModal: React.FC<RewardModalProps> = memo(
  ({ isOpen, onClose, rewardItem }) => {
    if (!rewardItem) return null;
    const [showConfetti, setShowConfetti] = useState(false);
    const [showCard, setShowCard] = useState(false);

    // Memoize rarity config to avoid recalculation
    const rarityConfig = useMemo(
      () => getRarityConfig(rewardItem?.rarity || ""),
      [rewardItem?.rarity]
    );
    useEffect(() => {
      if (isOpen && rewardItem) {
        const timer1 = setTimeout(() => setShowConfetti(true), 300);
        const timer2 = setTimeout(() => setShowCard(true), 600);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      } else {
        setShowConfetti(false);
        setShowCard(false);
      }
    }, [isOpen, rewardItem]);

    const handleClose = useCallback(() => {
      setShowConfetti(false);
      setShowCard(false);
      setTimeout(onClose, 200); // Reduced from 300ms
    }, [onClose]);

    if (!rewardItem) return null;
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          >
            {/* Optimized Confetti Animation */}
            <AnimatePresence>
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
                    <ConfettiParticle
                      key={i}
                      index={i}
                      particleColor={rarityConfig.particleColor}
                      glowColor={rarityConfig.glowColor}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 400,
                duration: 0.4,
              }}
              className="relative max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Optimized Glow Effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="absolute inset-0 rounded-2xl blur-xl"
                style={{
                  background: `radial-gradient(circle, ${rarityConfig.glowColor}30 0%, transparent 70%)`,
                }}
              />

              {/* Main Card */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={showCard ? { y: 0, opacity: 1 } : {}}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 400,
                  delay: 0.3,
                }}
                className="relative bg-[#1A191B]/95 backdrop-blur-sm rounded-2xl p-6 border-2 shadow-2xl"
                style={{
                  borderColor: rarityConfig.borderColor,
                  boxShadow: `0 0 30px ${rarityConfig.glowColor}20, 0 0 60px ${rarityConfig.glowColor}10`,
                }}
              >
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#49474E]/80 hover:bg-[#49474E] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#EEEEF0]" />
                </button>

                {/* Success Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-2xl font-bold text-[#EEEEF0] mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-[#B5B2BC] text-sm">
                    You got a new car from the Mystery Box!
                  </p>
                </motion.div>

                {/* Car Card */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                  className="bg-[#121113]/80 rounded-xl p-4 mb-4 border"
                  style={{ borderColor: rarityConfig.borderColor }}
                >
                  {/* Car Image Placeholder */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-full h-40 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: `url(${rewardItem.image}) no-repeat center center`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Rarity Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: "spring" }}
                      className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: rarityConfig.bgColor,
                        color: rarityConfig.color,
                        boxShadow: `0 0 8px ${rarityConfig.glowColor}`,
                      }}
                    >
                      {rewardItem.rarity.toUpperCase()}
                    </motion.div>
                  </motion.div>

                  {/* Car Details */}
                  <div className="space-y-2">
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-lg font-bold text-[#EEEEF0] text-center"
                    >
                      {rewardItem.name}
                    </motion.h3>

                    {/* Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="grid grid-cols-2 gap-3 mt-4"
                    >
                      <div className="text-center">
                        <p className="text-xs text-[#B5B2BC]">Daily Yield</p>
                        <p className="text-sm font-bold text-[#EEEEF0]">
                          {rewardItem.dailyYield} $TOD
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#B5B2BC]">Version</p>
                        <p className="text-sm font-bold text-[#EEEEF0]">
                          {rewardItem.version}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="text-center mt-3 p-2 rounded-lg"
                      style={{
                        backgroundColor: `${rarityConfig.bgColor}30`,
                        border: `1px solid ${rarityConfig.borderColor}`,
                      }}
                    >
                      <p className="text-xs text-[#B5B2BC]">Hash Power</p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: rarityConfig.color }}
                      >
                        {rewardItem.hashValue}HP
                      </p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Action Button */}
                <Button onClick={handleClose} className="w-full">
                  Claim Your Car!
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

RewardModal.displayName = "RewardModal";

