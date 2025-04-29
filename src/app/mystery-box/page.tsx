"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import Button from "@/components/Button";
import NumberInput from "@/components/NumberInput";
import SectionTitle from "@/components/SectionTitle";
import Hero from "@/components/Hero";
import GridSection from "@/components/GridSection";

export default function MysteryBox() {
  const [boxCount, setBoxCount] = useState(1);
  
  // Mystery box data
  const boxData = {
    price: 10, // in TON
    rarityChances: {
      common: "60%",
      rare: "25%",
      epic: "10%",
      legendary: "5%"
    },
    contentExamples: [
      { name: "RTX 3060", rarity: "Common", image: "/images/gpu.png" },
      { name: "RTX 3080", rarity: "Rare", image: "/images/gpu.png" },
      { name: "RTX 4070", rarity: "Epic", image: "/images/gpu.png" },
      { name: "RTX 4090", rarity: "Legendary", image: "/images/gpu.png" },
    ]
  };

  // Latest legendary pulls data
  const latestPulls = [
    { user: "CryptoMiner84", gpu: "RTX 4090 Ti", time: "2 hours ago", image: "/images/gpu.png" },
    { user: "BlockchainGuru", gpu: "RTX 4090", time: "5 hours ago", image: "/images/gpu.png" },
    { user: "SatoshiFan", gpu: "RTX 4090", time: "12 hours ago", image: "/images/gpu.png" },
    { user: "MiningKing", gpu: "RTX 4080 Ti", time: "1 day ago", image: "/images/gpu.png" },
  ];

  // How it works steps
  const howItWorksSteps = [
    {
      title: "1. Purchase Box",
      description: "Buy mystery boxes using TON cryptocurrency. Each box has a chance to contain GPUs of various rarities.",
      icon: "🛒"
    },
    {
      title: "2. Open Box",
      description: "Go to your inventory and open your mystery boxes to reveal the GPU NFTs inside.",
      icon: "📦"
    },
    {
      title: "3. Use or Trade",
      description: "Use your new GPUs in your mining operation or trade them with other players in the marketplace.",
      icon: "💰"
    },
  ];

  return (
    <>
      {/* Mystery Box Hero Section */}
      <Hero
        title="Mystery GPU Boxes"
        subtitle="Unlock rare and powerful GPU NFTs to supercharge your mining operation"
        ctaText="Buy Mystery Box"
        backgroundImage="/images/mystery-box-bg.jpg"
      />
      
      {/* Mystery Box Content Section */}
      <section className="flex flex-col md:flex-row gap-8 mb-16">
        {/* Left side - box info */}
        <div className="md:w-1/2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                  What's Inside?
                </h2>
                <p className="text-cyan-300">Each box contains one random GPU NFT</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {boxData.contentExamples.map((item, index) => (
                  <div 
                    key={index}
                    className={`border rounded-lg p-4 ${
                      item.rarity === "Common" ? "border-gray-500 bg-gray-900/30" :
                      item.rarity === "Rare" ? "border-cyan-500 bg-cyan-900/20" :
                      item.rarity === "Epic" ? "border-purple-500 bg-purple-900/20" :
                      "border-rose-500 bg-rose-900/20"
                    }`}
                  >
                    <div className="relative h-36 mb-3">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <h4 className="font-bold text-center">{item.name}</h4>
                    <p className={`text-sm text-center ${
                      item.rarity === "Common" ? "text-gray-400" :
                      item.rarity === "Rare" ? "text-cyan-400" :
                      item.rarity === "Epic" ? "text-purple-400" :
                      "text-rose-400"
                    }`}>
                      {item.rarity}
                    </p>
                  </div>
                ))}
              </div>
              
              <Card variant="gradient">
                <h3 className="text-lg font-bold mb-2">Drop Rates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Common</span>
                    <span className="text-gray-400">{boxData.rarityChances.common}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400">Rare</span>
                    <span className="text-cyan-400">{boxData.rarityChances.rare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">Epic</span>
                    <span className="text-purple-400">{boxData.rarityChances.epic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-400">Legendary</span>
                    <span className="text-rose-400">{boxData.rarityChances.legendary}</span>
                  </div>
                </div>
              </Card>
            </Card>
          </motion.div>
        </div>
        
        {/* Right side - purchase form */}
        <div className="md:w-1/2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <div className="flex justify-center mb-8">
                <div className="relative w-60 h-60">
                  <Image
                    src="/images/mystery-box.png"
                    alt="Mystery Box"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-cyan-500/20 animate-pulse-slow rounded-lg"></div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-6 text-center">Purchase Mystery Boxes</h3>
              
              <NumberInput
                label="Number of boxes"
                value={boxCount}
                onChange={setBoxCount}
                className="mb-6"
              />
              
              <Card variant="gradient" className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-cyan-300/80">Price per box</span>
                  <span>{boxData.price} TON</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-cyan-800/50">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">{(boxCount * boxData.price).toFixed(2)} TON</span>
                </div>
              </Card>
              
              <Button variant="secondary" fullWidth>
                Buy Now
              </Button>
              
              <div className="mt-6 text-center text-cyan-300/60 text-sm">
                <p>Boxes will be delivered to your inventory immediately</p>
                <p className="mt-2">You can open them anytime to reveal your GPU NFTs</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
      
      {/* Latest Pulls Section */}
      <GridSection title="Latest Legendary Pulls" columns={4}>
        {latestPulls.map((pull, i) => (
          <div
            key={i}
            className="border border-rose-800 rounded-lg p-4 bg-black/40 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-rose-900/10 z-0"></div>
            <div className="relative z-10">
              <div className="relative h-40 mb-3">
                <Image
                  src={pull.image}
                  alt={pull.gpu}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <h4 className="font-bold text-center text-rose-400">{pull.gpu}</h4>
              <p className="text-center text-sm mb-1">by {pull.user}</p>
              <p className="text-center text-xs text-cyan-300/60">{pull.time}</p>
            </div>
          </div>
        ))}
      </GridSection>
      
      {/* How It Works Section */}
      <GridSection title="How It Works" columns={3}>
        {howItWorksSteps.map((step, i) => (
          <Card key={i}>
            <div className="text-4xl mb-4 text-center">{step.icon}</div>
            <h4 className="text-xl font-bold mb-3 text-center">{step.title}</h4>
            <p className="text-cyan-300/80 text-center">{step.description}</p>
          </Card>
        ))}
      </GridSection>
    </>
  );
} 