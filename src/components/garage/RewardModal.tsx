import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Trophy, Zap, TrendingUp } from "lucide-react";
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
  description?: string;
  attributes?: {
    speed?: number;
    acceleration?: number;
    handling?: number;
    durability?: number;
  };
}

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardItem: RewardItem | null;
}

// Enhanced rarity config with more visual effects
const RARITY_CONFIGS = {
  Common: {
    color: "#9CA3AF",
    bgColor: "#374151",
    borderColor: "#6B7280",
    glowColor: "#9CA3AF",
    particleColor: "#9CA3AF",
    shadowColor: "#9CA3AF40",
    accentColor: "#D1D5DB",
    icon: Sparkles,
    celebrationText: "Nice Find!",
    confettiCount: 15,
  },
  Rare: {
    color: "#10B981",
    bgColor: "#065F46",
    borderColor: "#059669",
    glowColor: "#10B981",
    particleColor: "#10B981",
    shadowColor: "#10B98140",
    accentColor: "#34D399",
    icon: Zap,
    celebrationText: "Rare Discovery!",
    confettiCount: 25,
  },
  Epic: {
    color: "#8B5CF6",
    bgColor: "#5B21B6",
    borderColor: "#7C3AED",
    glowColor: "#8B5CF6",
    particleColor: "#A855F7",
    shadowColor: "#8B5CF640",
    accentColor: "#A78BFA",
    icon: Trophy,
    celebrationText: "Epic Achievement!",
    confettiCount: 35,
  },
  Legendary: {
    color: "#F59E0B",
    bgColor: "#92400E",
    borderColor: "#D97706",
    glowColor: "#F59E0B",
    particleColor: "#FBBF24",
    shadowColor: "#F59E0B40",
    accentColor: "#FCD34D",
    icon: TrendingUp,
    celebrationText: "Legendary Prize!",
    confettiCount: 50,
  },
} as const;

const getRarityConfig = (rarity: string) => {
  return (
    RARITY_CONFIGS[rarity as keyof typeof RARITY_CONFIGS] ||
    RARITY_CONFIGS.Common
  );
};

// Enhanced confetti particles with different shapes and effects
const ConfettiParticle = React.memo(
  ({
    index,
    particleColor,
    glowColor,
    shape = "circle",
  }: {
    index: number;
    particleColor: string;
    glowColor: string;
    shape?: "circle" | "square" | "triangle" | "star";
  }) => {
    const randomX = useMemo(
      () =>
        Math.random() *
        (typeof window !== "undefined" ? window.innerWidth : 1920),
      []
    );
    const randomDelay = useMemo(() => Math.random() * 0.5, []);
    const randomDuration = useMemo(() => 3 + Math.random() * 2, []);
    const randomSize = useMemo(() => 2 + Math.random() * 4, []);

    const shapeStyles = {
      circle: "rounded-full",
      square: "rounded-sm",
      triangle: "",
      star: "",
    };

    return (
      <motion.div
        key={index}
        initial={{
          x: randomX,
          y: -20,
          rotate: 0,
          scale: 0,
          opacity: 1,
        }}
        animate={{
          y: typeof window !== "undefined" ? window.innerHeight + 20 : 1080,
          rotate: 360 + Math.random() * 180,
          scale: [0, 1, 0.8, 1],
          opacity: [1, 1, 0.8, 0],
        }}
        transition={{
          duration: randomDuration,
          delay: randomDelay,
          ease: [0.25, 0.1, 0.25, 1],
          times: [0, 0.2, 0.8, 1],
        }}
        className={`absolute ${shapeStyles[shape]}`}
        style={{
          width: `${randomSize}px`,
          height: `${randomSize}px`,
          backgroundColor: particleColor,
          boxShadow: `0 0 8px ${glowColor}`,
          clipPath:
            shape === "triangle"
              ? "polygon(50% 0%, 0% 100%, 100% 100%)"
              : shape === "star"
              ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
              : undefined,
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
    const [showStats, setShowStats] = useState(false);
    const [celebrationPhase, setCelebrationPhase] = useState(0);

    // Memoize rarity config to avoid recalculation
    const rarityConfig = useMemo(
      () => getRarityConfig(rewardItem?.rarity || ""),
      [rewardItem?.rarity]
    );

    useEffect(() => {
      if (isOpen && rewardItem) {
        const timer1 = setTimeout(() => setShowConfetti(true), 200);
        const timer2 = setTimeout(() => setShowCard(true), 500);
        const timer3 = setTimeout(() => setShowStats(true), 1000);
        const timer4 = setTimeout(() => setCelebrationPhase(1), 1500);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
          clearTimeout(timer4);
        };
      } else {
        setShowConfetti(false);
        setShowCard(false);
        setShowStats(false);
        setCelebrationPhase(0);
      }
    }, [isOpen, rewardItem]);

    const handleClose = useCallback(() => {
      setShowConfetti(false);
      setShowCard(false);
      setShowStats(false);
      setCelebrationPhase(0);
      setTimeout(onClose, 300);
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
            {/* Enhanced Confetti Animation with different shapes */}
            <AnimatePresence>
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from(
                    { length: rarityConfig.confettiCount },
                    (_, i) => {
                      const shapes: Array<
                        "circle" | "square" | "triangle" | "star"
                      > = ["circle", "square", "triangle", "star"];
                      const shape = shapes[i % shapes.length];
                      return (
                        <ConfettiParticle
                          key={i}
                          index={i}
                          particleColor={rarityConfig.particleColor}
                          glowColor={rarityConfig.glowColor}
                          shape={shape}
                        />
                      );
                    }
                  )}
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
                damping: 25,
                stiffness: 200,
                duration: 0.6,
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

                {/* Enhanced Success Header */}
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring", damping: 20, stiffness: 300 }}
                  className="text-center mb-6 relative"
                >
                  <motion.h2
                    className="text-2xl font-bold text-[#EEEEF0] mb-2"
                    animate={
                      celebrationPhase === 1
                        ? {
                            textShadow: `0 0 20px ${rarityConfig.glowColor}`,
                          }
                        : {}
                    }
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.6, 1] }}
                  >
                    {celebrationPhase === 1
                      ? rarityConfig.celebrationText
                      : "Congratulations!"}
                  </motion.h2>
                  <motion.p
                    className="text-[#B5B2BC] text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    You got a new car from the Mystery Box!
                  </motion.p>
                </motion.div>

                {/* Enhanced Car Card */}
                <motion.div
                  initial={{ x: -50, opacity: 0, scale: 0.9 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", damping: 22, stiffness: 200 }}
                  className="bg-[#121113]/80 rounded-xl p-4 mb-4 border relative overflow-hidden"
                  style={{
                    borderColor: rarityConfig.borderColor,
                    boxShadow: `inset 0 0 20px ${rarityConfig.shadowColor}`,
                  }}
                >
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-20"
                    animate={{
                      background: [
                        `radial-gradient(circle at 20% 20%, ${rarityConfig.glowColor}20 0%, transparent 50%)`,
                        `radial-gradient(circle at 80% 80%, ${rarityConfig.glowColor}20 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, ${rarityConfig.glowColor}20 0%, transparent 50%)`,
                        `radial-gradient(circle at 80% 20%, ${rarityConfig.glowColor}20 0%, transparent 50%)`,
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Car Image with enhanced styling */}
                  <motion.div
                    className="w-full h-60 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: `url(${rewardItem.image}) no-repeat center center`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Gradient overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    />

                    {/* Rarity Badge with enhanced styling */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.9,
                        type: "spring",
                        damping: 18,
                        stiffness: 280,
                      }}
                      className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{
                        backgroundColor: rarityConfig.bgColor,
                        color: rarityConfig.color,
                        boxShadow: `0 0 12px ${rarityConfig.glowColor}`,
                        border: `1px solid ${rarityConfig.accentColor}`,
                      }}
                    >
                      {rewardItem.rarity.toUpperCase()}
                    </motion.div>
                  </motion.div>

                  {/* Enhanced Car Details */}
                  <div className="space-y-3 relative z-10">
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.8,
                        type: "spring",
                        damping: 20,
                        stiffness: 200,
                      }}
                      className="text-lg font-bold text-[#EEEEF0] text-center"
                      style={{
                        textShadow: `0 0 10px ${rarityConfig.glowColor}40`,
                      }}
                    >
                      {rewardItem.name}
                    </motion.h3>

                    {/* Description if available */}
                    {rewardItem.description && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="text-xs text-[#B5B2BC] text-center italic"
                      >
                        {rewardItem.description}
                      </motion.p>
                    )}

                    {/* Enhanced Stats Grid */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={showStats ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        delay: 1.0,
                        type: "spring",
                        damping: 18,
                        stiffness: 220,
                      }}
                      className="grid grid-cols-2 gap-3 mt-4"
                    >
                      <motion.div
                        className="text-center p-2 rounded-lg bg-[#1A191B]/60 border"
                        style={{ borderColor: `${rarityConfig.borderColor}30` }}
                      >
                        <p className="text-xs text-[#B5B2BC] mb-1">
                          Daily Yield
                        </p>
                        <p className="text-sm font-bold text-[#EEEEF0]">
                          {rewardItem.dailyYield} $TOD
                        </p>
                      </motion.div>
                      <motion.div
                        className="text-center p-2 rounded-lg bg-[#1A191B]/60 border"
                        style={{ borderColor: `${rarityConfig.borderColor}30` }}
                      >
                        <p className="text-xs text-[#B5B2BC] mb-1">Version</p>
                        <p className="text-sm font-bold text-[#EEEEF0]">
                          {rewardItem.version}
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Attributes if available */}
                    {rewardItem.attributes && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={showStats ? { opacity: 1, scale: 1 } : {}}
                        transition={{
                          delay: 1.1,
                          type: "spring",
                          stiffness: 300,
                        }}
                        className="grid grid-cols-2 gap-2 mt-3"
                      >
                        {Object.entries(rewardItem.attributes).map(
                          ([key, value], index) => (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 1.2 + index * 0.1,
                                type: "spring",
                                damping: 20,
                                stiffness: 180
                              }}
                              className="flex justify-between items-center text-xs p-1 rounded"
                              style={{
                                backgroundColor: `${rarityConfig.bgColor}20`,
                              }}
                            >
                              <span className="text-[#B5B2BC] capitalize">
                                {key}:
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: rarityConfig.color }}
                              >
                                {value}
                              </span>
                            </motion.div>
                          )
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Enhanced Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, type: "spring", damping: 20, stiffness: 200 }}
                  className="mt-6"
                >
                  <motion.div>
                    <Button
                      onClick={handleClose}
                      className="w-full relative overflow-hidden group"
                      style={{
                        background: `linear-gradient(135deg, ${rarityConfig.bgColor} 0%, ${rarityConfig.borderColor} 100%)`,
                        border: `2px solid ${rarityConfig.accentColor}`,
                        boxShadow: `0 0 20px ${rarityConfig.shadowColor}`,
                      }}
                    >
                      {/* Animated shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Button content */}
                      <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                        Claim Your Car!
                      </span>

                      {/* Pulsing glow */}
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: [
                            `0 0 0 ${rarityConfig.glowColor}00`,
                            `0 0 20px ${rarityConfig.glowColor}60`,
                            `0 0 0 ${rarityConfig.glowColor}00`,
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: [0.4, 0, 0.6, 1],
                        }}
                      />
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

RewardModal.displayName = "RewardModal";

