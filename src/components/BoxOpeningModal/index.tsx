import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles, Gift } from "lucide-react";

type BoxOpeningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rarity: string;
  revealedNft?: {
    name: string;
    image_site: string;
    rarity: string;
    power: number;
  } | null;
};

export default function BoxOpeningModal({
  isOpen,
  onClose,
  rarity,
  revealedNft,
}: BoxOpeningModalProps) {
  const [phase, setPhase] = useState<"opening" | "revealing" | "revealed">("opening");
  const [showVideo, setShowVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPhase("opening");
      setShowVideo(true);
    }
  }, [isOpen]);

  const handleVideoEnd = () => {
    setShowVideo(false);
    setPhase("revealing");
    setTimeout(() => {
      setPhase("revealed");
    }, 1000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "from-green-500 to-green-700";
      case "rare":
        return "from-cyan-500 to-cyan-700";
      case "epic":
        return "from-purple-500 to-purple-700";
      case "legendary":
        return "from-yellow-500 to-yellow-700";
      default:
        return "from-cyan-500 to-blue-700";
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "shadow-green-500/50";
      case "rare":
        return "shadow-cyan-500/50";
      case "epic":
        return "shadow-purple-500/50";
      case "legendary":
        return "shadow-yellow-500/50";
      default:
        return "shadow-cyan-500/50";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
          />

          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="w-full h-full flex items-center justify-center">
              
              {/* Video Phase */}
              {showVideo && phase === "opening" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <video
                    ref={videoRef}
                    src={`/videos/open_box_${rarity.toLowerCase()}.mp4`}
                    autoPlay
                    muted
                    onEnded={handleVideoEnd}
                    className="max-w-4xl max-h-4xl object-contain"
                    style={{ filter: "drop-shadow(0 0 20px rgba(0, 255, 255, 0.3))" }}
                  />
                  
                  {/* Particle effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                        initial={{
                          x: "50vw",
                          y: "50vh",
                          scale: 0,
                        }}
                        animate={{
                          x: Math.random() * window.innerWidth,
                          y: Math.random() * window.innerHeight,
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: Math.random() * 1,
                          repeat: Infinity,
                          repeatDelay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Revealing Phase */}
              {phase === "revealing" && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring", damping: 10 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                    }}
                    className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center mb-4"
                  >
                    <Gift className="w-16 h-16 text-white" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600"
                  >
                    Revealing...
                  </motion.h2>
                </motion.div>
              )}

              {/* Revealed Phase */}
              {phase === "revealed" && revealedNft && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, type: "spring", damping: 8 }}
                  className="relative max-w-2xl mx-auto p-8"
                >
                  {/* Background glow */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${getRarityColor(revealedNft.rarity)} opacity-20 blur-xl`}
                  />

                  <div className={`relative border-4 border-gradient-to-r ${getRarityColor(revealedNft.rarity)} rounded-3xl overflow-hidden bg-black/80 backdrop-blur-sm`}>
                    {/* Header */}
                    <div className="text-center p-6 border-b border-white/10">
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-2 mb-2"
                      >
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                        <h3 className="text-3xl font-bold text-white">CONGRATULATIONS!</h3>
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-cyan-300"
                      >
                        You've unlocked a new GPU!
                      </motion.p>
                    </div>

                    {/* NFT Display */}
                    <div className="p-8">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7, type: "spring", damping: 10 }}
                        className="text-center"
                      >
                        {/* NFT Image */}
                        <div className={`relative mx-auto w-64 h-64 rounded-2xl overflow-hidden mb-6 shadow-2xl ${getRarityGlow(revealedNft.rarity)}`}>
                          <Image
                            src={revealedNft.image_site}
                            alt={revealedNft.name}
                            width={256}
                            height={256}
                            className="object-contain w-full h-full bg-black/60"
                          />
                          
                          {/* Rarity Badge */}
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 1, type: "spring" }}
                            className={`absolute top-4 right-4 px-3 py-1 rounded-full font-bold text-white text-sm bg-gradient-to-r ${getRarityColor(revealedNft.rarity)}`}
                          >
                            {revealedNft.rarity.toUpperCase()}
                          </motion.div>
                        </div>

                        {/* NFT Info */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.9 }}
                        >
                          <h4 className="text-2xl font-bold text-white mb-2">{revealedNft.name}</h4>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                            <span className="text-cyan-300">Power:</span>
                            <span className="font-bold text-white">{revealedNft.power} W</span>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Close Button */}
                    <div className="p-6 border-t border-white/10">
                      <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        onClick={onClose}
                        className={`w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r ${getRarityColor(revealedNft.rarity)} hover:scale-105 transition-transform shadow-lg`}
                      >
                        Continue Mining!
                      </motion.button>
                    </div>
                  </div>

                  {/* Floating particles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-1 h-1 bg-gradient-to-r ${getRarityColor(revealedNft.rarity)} rounded-full`}
                        initial={{
                          x: Math.random() * 500,
                          y: Math.random() * 500,
                          scale: 0,
                        }}
                        animate={{
                          y: [null, -100],
                          scale: [0, 1, 0],
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 3,
                          delay: Math.random() * 2,
                          repeat: Infinity,
                          repeatDelay: Math.random() * 3,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 