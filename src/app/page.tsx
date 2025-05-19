"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center mb-20">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-5xl font-bold mb-6 leading-tight glitch-text">
            Mine the Future with <span className="text-rose-500">NFT</span> GPU
            Power
          </h2>
          <p className="text-cyan-300 mb-8 text-lg">
            Collect rare GPU cards, mine virtual resources, and trade your NFTs
            in the ultimate cyberpunk mining simulation
          </p>
          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded hover:from-cyan-600 hover:to-blue-600 text-black font-bold transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 border-2 border-cyan-500 rounded hover:bg-cyan-500/20 transition-colors">
              Learn More
            </button>
          </div>
        </div>
        <div className="md:w-1/2 relative">
          <div className="animate-pulse-slow relative mx-auto max-w-md">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 blur-xl opacity-30 animate-pulse"></div>
            <video
              src="/videos/gpu.mp4"
              autoPlay
              muted
              loop
              className="rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(0,200,255,0.5)]"
            ></video>
          </div>
        </div>
      </section>

      <section id="about" className="mb-20">
        <h3 className="text-3xl font-bold mb-10 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 glitch-text">
            Next-Gen Mining Experience
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Collect Rare GPUs",
              desc: "Own unique NFT graphics cards with different mining capabilities and rarities",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              ),
            },
            {
              title: "Mine & Earn",
              desc: "Put your GPUs to work mining cryptocurrency in a futuristic virtual environment",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
            },
            {
              title: "Upgrade & Trade",
              desc: "Enhance your GPU cards and trade them on our marketplace for real crypto",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              ),
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="border border-cyan-800 rounded-lg p-6 bg-black/40 hover:bg-black/60 transition-colors group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:from-cyan-400 group-hover:to-blue-500 transition-colors">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
              <p className="text-cyan-300/80">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GPU Cards */}
      <section id="cards" className="mb-20">
        <h3 className="text-3xl font-bold mb-10 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 glitch-text">
            Featured GPU Cards
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              name: "CyberMiner X1",
              rarity: "Common",
              power: "120 H/s",
              img: "/images/gpu.png",
            },
            {
              name: "NeonRig 3080",
              rarity: "Rare",
              power: "240 H/s",
              img: "/images/gpu.png",
            },
            {
              name: "Quantum RTX",
              rarity: "Epic",
              power: "350 H/s",
              img: "/images/gpu.png",
            },
            {
              name: "NightBlade 9000",
              rarity: "Legendary",
              power: "500 H/s",
              img: "/images/gpu.png",
            },
          ].map((gpu, i) => (
            <div
              key={i}
              className="border border-cyan-800 rounded-lg overflow-hidden bg-gradient-to-b from-black/80 to-cyan-900/10 group hover:scale-105 transition-transform duration-300"
            >
              <div className="p-4 relative">
                <div
                  className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full text-white font-bold ${
                    gpu.rarity === "Common"
                      ? "bg-gray-500"
                      : gpu.rarity === "Rare"
                      ? "bg-blue-500"
                      : gpu.rarity === "Epic"
                      ? "bg-purple-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {gpu.rarity}
                </div>
                <Image
                  src={gpu.img}
                  alt={gpu.name}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded mb-4"
                />
                <h4 className="text-xl font-bold">{gpu.name}</h4>
                <p className="text-cyan-300 mb-2">Mining Power: {gpu.power}</p>
                <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded mt-2 opacity-0 group-hover:opacity-100 text-black transition-opacity">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded hover:from-purple-700 hover:to-blue-700 font-bold transition-colors">
            Explore All GPUs
          </button>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="mb-16">
        <h3 className="text-3xl font-bold mb-10 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-500 glitch-text">
            Development Roadmap
          </span>
        </h3>
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-500 to-purple-600"></div>
          {[
            {
              phase: "Phase 1",
              title: "Genesis Launch",
              desc: "Initial GPU NFT collection release and marketplace",
              date: "Q1 2023",
            },
            {
              phase: "Phase 2",
              title: "Mining Simulation",
              desc: "Full mining ecosystem with rewards and upgrades",
              date: "Q2 2023",
            },
            {
              phase: "Phase 3",
              title: "Mobile App",
              desc: "Mobile app with cross-platform capabilities",
              date: "Q3 2023",
            },
            {
              phase: "Phase 4",
              title: "Metaverse",
              desc: "Virtual mining farms in the metaverse",
              date: "Q4 2023",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`relative mb-12 ${
                i % 2 === 0 ? "pr-1/2 text-right" : "pl-1/2"
              }`}
            >
              <div className={`${i % 2 === 0 ? "mr-8" : "ml-8"}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 z-10 shadow-[0_0_8px_rgba(80,199,255,0.6)]"></div>
                <span className="text-sm text-cyan-400 font-mono">
                  {item.date}
                </span>
                <h4 className="text-xl font-bold mb-2">
                  <span className="text-rose-500">{item.phase}:</span>{" "}
                  {item.title}
                </h4>
                <p className="text-cyan-300/80">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-16 py-12 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl border border-cyan-800">
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4">
            Join the Mining Revolution
          </h3>
          <p className="text-cyan-300 mb-6 max-w-xl mx-auto">
            Be among the first to experience the future of GPU NFT mining
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-rose-500 to-purple-600 rounded hover:from-rose-600 hover:to-purple-700 font-bold transition-colors">
            Pre-Register Now
          </button>
        </div>
      </section>
    </>
  );
}
