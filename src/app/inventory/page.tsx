"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample GPU data for the inventory
  const gpus = [
    {
      id: "1",
      name: "CyberMiner X1",
      rarity: "Common",
      hashrate: 120,
      power: 35,
      efficiency: 3.4,
      level: 1,
      image: "/images/gpu.png",
      mining: true,
      stats: {
        mined: 56.23,
        hours: 48,
        upgradeCost: 25
      }
    },
    {
      id: "2",
      name: "NeonRig 3080",
      rarity: "Rare",
      hashrate: 240,
      power: 55,
      efficiency: 4.4,
      level: 2,
      image: "/images/gpu.png",
      mining: true,
      stats: {
        mined: 143.56,
        hours: 72,
        upgradeCost: 50
      }
    },
    {
      id: "3",
      name: "Quantum RTX",
      rarity: "Epic",
      hashrate: 350,
      power: 70,
      efficiency: 5.0,
      level: 3,
      image: "/images/gpu.png",
      mining: false,
      stats: {
        mined: 87.32,
        hours: 24,
        upgradeCost: 100
      }
    },
    {
      id: "4",
      name: "NightBlade 9000",
      rarity: "Legendary",
      hashrate: 500,
      power: 90,
      efficiency: 5.5,
      level: 5,
      image: "/images/gpu.png",
      mining: false,
      stats: {
        mined: 230.18,
        hours: 36,
        upgradeCost: 200
      }
    },
    {
      id: "5",
      name: "CyberMiner X2",
      rarity: "Common",
      hashrate: 130,
      power: 38,
      efficiency: 3.4,
      level: 2,
      image: "/images/gpu.png",
      mining: true,
      stats: {
        mined: 76.45,
        hours: 58,
        upgradeCost: 25
      }
    },
  ];

  // Filter GPUs based on active tab and search term
  const filteredGpus = gpus.filter(gpu => {
    const matchesSearch = gpu.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "mining") return gpu.mining && matchesSearch;
    if (activeTab === "idle") return !gpu.mining && matchesSearch;
    
    // Filter by rarity
    return gpu.rarity.toLowerCase() === activeTab.toLowerCase() && matchesSearch;
  });

  // Card color based on rarity
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common": return "border-blue-500 bg-blue-500/10";
      case "rare": return "border-purple-500 bg-purple-500/10";
      case "epic": return "border-pink-500 bg-pink-500/10";
      case "legendary": return "border-amber-500 bg-amber-500/10";
      case "mythic": return "border-rose-500 bg-rose-500/10";
      default: return "border-cyan-800 bg-cyan-900/10";
    }
  };

  // Badge color based on rarity
  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common": return "bg-blue-500";
      case "rare": return "bg-purple-500";
      case "epic": return "bg-pink-500";
      case "legendary": return "bg-amber-500";
      case "mythic": return "bg-rose-500";
      default: return "bg-cyan-800";
    }
  };

  return (
    <>
      {/* Hero section */}
      <section className="mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-4 leading-tight glitch-text text-center"
        >
          GPU <span className="text-rose-500">Inventory</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-cyan-300 text-center max-w-2xl mx-auto"
        >
          Manage and upgrade your GPU NFTs to maximize mining efficiency
        </motion.p>
      </section>

      {/* Stats summary */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total GPUs", value: gpus.length },
            { label: "Mining GPUs", value: gpus.filter(g => g.mining).length },
            { label: "Total Hashrate", value: `${gpus.reduce((acc, gpu) => acc + (gpu.mining ? gpu.hashrate : 0), 0)} H/s` },
            { label: "Total Earnings", value: `${gpus.reduce((acc, gpu) => acc + gpu.stats.mined, 0).toFixed(2)} GMINE` },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border border-cyan-800 rounded-lg p-4 bg-black/40"
            >
              <p className="text-cyan-300/80 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Filter and search */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: "all", label: "All GPUs" },
              { id: "mining", label: "Mining" },
              { id: "idle", label: "Idle" },
              { id: "common", label: "Common" },
              { id: "rare", label: "Rare" },
              { id: "epic", label: "Epic" },
              { id: "legendary", label: "Legendary" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                    : "border border-cyan-800 bg-black/40 hover:bg-black/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search GPUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-black/60 border border-cyan-800/50 rounded outline-none focus:ring-1 focus:ring-cyan-500 text-cyan-300"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute right-3 top-2.5 text-cyan-300/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* GPU cards grid */}
      <section className="mb-12">
        {filteredGpus.length === 0 ? (
          <div className="text-center py-12 border border-cyan-800 rounded-lg bg-black/40">
            <p className="text-cyan-300">No GPUs found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGpus.map((gpu, index) => (
              <motion.div
                key={gpu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`border-2 rounded-lg overflow-hidden relative ${getRarityColor(gpu.rarity)}`}
              >
                {/* GPU Card header */}
                <div className="p-4 bg-black/60">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{gpu.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getRarityBadgeColor(gpu.rarity)}`}>
                      {gpu.rarity}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${gpu.mining ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-cyan-300/80">{gpu.mining ? 'Mining' : 'Idle'}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-cyan-300/60">Hashrate</p>
                      <p className="font-mono font-bold">{gpu.hashrate} H/s</p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-300/60">Power</p>
                      <p className="font-mono font-bold">{gpu.power} W</p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-300/60">Efficiency</p>
                      <p className="font-mono font-bold">{gpu.efficiency}</p>
                    </div>
                  </div>
                </div>
                
                {/* GPU Image */}
                <div className="relative h-40 bg-gradient-to-b from-black/20 to-black/60">
                  <Image
                    src={gpu.image}
                    alt={gpu.name}
                    width={200}
                    height={120}
                    className="object-contain w-full h-full p-4"
                  />
                  
                  {/* Level indicator */}
                  <div className="absolute bottom-2 right-2 bg-black/80 rounded-full px-2 py-1 text-xs font-bold border border-cyan-400">
                    LVL {gpu.level}
                  </div>
                </div>
                
                {/* Stats and actions */}
                <div className="p-4 bg-black/60 border-t border-cyan-800/50">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-cyan-300/60">Total Mined</p>
                      <p className="font-mono font-bold">{gpu.stats.mined.toFixed(2)} GMINE</p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-300/60">Hours Active</p>
                      <p className="font-mono font-bold">{gpu.stats.hours} hrs</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className={`flex-1 py-2 px-2 rounded text-sm ${gpu.mining ? 'bg-red-500/20 border border-red-500 hover:bg-red-500/30' : 'bg-green-500/20 border border-green-500 hover:bg-green-500/30'}`}>
                      {gpu.mining ? 'Stop Mining' : 'Start Mining'}
                    </button>
                    <button className="flex-1 py-2 px-2 rounded text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                      Upgrade ({gpu.stats.upgradeCost} GMINE)
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
      
      {/* Marketplace CTA */}
      <section>
        <div className="border border-cyan-800 rounded-lg p-8 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 text-center">
          <h3 className="text-2xl font-bold mb-4">Need more mining power?</h3>
          <p className="text-cyan-300 mb-6">Expand your GPU collection by purchasing from our marketplace</p>
          <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 rounded font-bold hover:from-rose-600 hover:to-purple-700 transition-colors">
            Visit Marketplace
          </button>
        </div>
      </section>
    </>
  );
} 