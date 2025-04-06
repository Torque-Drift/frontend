"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-cyan-400 overflow-hidden relative">
      {/* Cyberpunk background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 z-0"></div>
      <div className="absolute inset-0 bg-[url('/images/bg-ban.png')] bg-cover opacity-30 z-0"></div>

      {/* Grid lines overlay */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-[radial-gradient(rgba(0,200,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Enhanced epic background effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated cyberpunk gradient background */}
        <div className="absolute inset-0 bg-gradient-conic from-purple-900 via-blue-900 to-cyan-900 opacity-60 animate-slow-rotate"></div>

        {/* Digital noise overlay - usando efeito sem necessidade de imagem externa */}
        <div className="absolute inset-0 bg-black opacity-5 mix-blend-overlay"></div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-700/20 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-cyan-700/20 blur-3xl animate-float-slow-reverse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-rose-700/20 blur-3xl animate-pulse-slow"></div>

        {/* Horizontal scan lines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:4px_4px]"></div>

        {/* Scan line effect */}
        <div className="absolute w-full h-20 bg-cyan-500/5 blur-sm animate-scan"></div>

        {/* Circuito digital no fundo */}
        <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
          <div className="absolute bottom-5 left-10 w-80 h-2 bg-cyber-neon"></div>
          <div className="absolute bottom-5 left-10 w-2 h-20 bg-cyber-neon"></div>
          <div className="absolute bottom-23 left-10 w-20 h-2 bg-cyber-neon"></div>
          <div className="absolute bottom-5 left-88 w-2 h-10 bg-cyber-neon"></div>
          <div className="absolute bottom-14 left-88 w-40 h-2 bg-cyber-neon"></div>
          <div className="absolute bottom-14 right-20 w-2 h-20 bg-cyber-neon"></div>
          <div className="absolute bottom-32 right-20 w-60 h-2 bg-cyber-neon"></div>
        </div>

        {/* Partículas flutuantes */}
        <div className="particles">
          {Array.from({ length: 20 }).map((_, index) => (
            <div
              key={index}
              className="particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 5 + 1}px`,
                height: `${Math.random() * 5 + 1}px`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Matrix-like código caindo */}
        <div className="matrix-code">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="code-line"
              style={{
                left: `${index * 10}%`,
                animationDuration: `${Math.random() * 10 + 5}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Apply CRT effect to entire page */}
      <div className="absolute inset-0 crt pointer-events-none z-20"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 glitch-text">
            GPU<span className="text-rose-500">MINE</span>
          </h1>
          <nav>
            <ul className="flex space-x-6 items-center">
              <li>
                <a
                  href="#about"
                  className="hover:text-cyan-300 transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#cards"
                  className="hover:text-cyan-300 transition-colors"
                >
                  Cards
                </a>
              </li>
              <li>
                <a
                  href="#roadmap"
                  className="hover:text-cyan-300 transition-colors"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 rounded hover:from-rose-600 hover:to-purple-700 transition-colors">
                  Connect Wallet
                </button>
              </li>
            </ul>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center mb-20">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-5xl font-bold mb-6 leading-tight glitch-text">
              Mine the Future with <span className="text-rose-500">NFT</span>{" "}
              GPU Power
            </h2>
            <p className="text-cyan-300 mb-8 text-lg">
              Collect rare GPU cards, mine virtual resources, and trade your
              NFTs in the ultimate cyberpunk mining simulation
            </p>
            <div className="flex space-x-4">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded hover:from-cyan-600 hover:to-blue-600 font-bold transition-colors">
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

        {/* Features */}
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
                        ? "bg-blue-500"
                        : gpu.rarity === "Rare"
                        ? "bg-purple-500"
                        : gpu.rarity === "Epic"
                        ? "bg-pink-500"
                        : "bg-amber-500"
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
                  <p className="text-cyan-300 mb-2">
                    Mining Power: {gpu.power}
                  </p>
                  <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Footer */}
        <footer className="border-t border-cyan-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4">GPUMINE</h4>
              <p className="text-cyan-300/80 mb-4">
                The ultimate cyberpunk NFT mining experience
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-cyan-400 hover:text-cyan-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-cyan-400 hover:text-cyan-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="#" className="text-cyan-400 hover:text-cyan-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472h-15.080c-1.356 0-2.46-1.104-2.46-2.472v-19.056c0-1.368 1.104-2.472 2.46-2.472h15.080zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.204 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h5 className="font-bold mb-4">Resources</h5>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Community</h5>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-cyan-300/80 hover:text-cyan-300">
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-800/50 pt-6 pb-8 text-center text-cyan-300/60 text-sm">
            <p>© 2023 GPUMINE. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Animated glow effect */}
      <div className="pointer-events-none fixed inset-0 z-30 [mask-image:radial-gradient(transparent_30%,black)]">
        <div className="h-full bg-[radial-gradient(circle,rgba(0,200,255,0.12)_8%,transparent_40%)] bg-[size:100%_100%] bg-center"></div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes slow-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-slow-rotate {
          animation: slow-rotate 120s linear infinite;
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }

        @keyframes float-slow-reverse {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(20px) scale(1.05);
          }
        }
        .animate-float-slow-reverse {
          animation: float-slow-reverse 18s ease-in-out infinite;
        }

        /* Glitch effect for headings */
        .glitch-text {
          position: relative;
          text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
            -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
            0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
          animation: glitch 2s infinite;
        }

        @keyframes glitch {
          0% {
            text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
              -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
              0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
          }
          14% {
            text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
              -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
              0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
          }
          15% {
            text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
              0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
              -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          49% {
            text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
              0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
              -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          50% {
            text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
              0.05em 0 0 rgba(0, 255, 0, 0.75),
              0 -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          99% {
            text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
              0.05em 0 0 rgba(0, 255, 0, 0.75),
              0 -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          100% {
            text-shadow: -0.025em 0 0 rgba(255, 0, 0, 0.75),
              -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
              -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
          }
        }

        /* Add cyberpunk background color animation */
        @keyframes bg-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Apply to entire page for extra immersion */
        :global(body) {
          background: linear-gradient(
            -45deg,
            #0d0221,
            #0b1638,
            #091c47,
            #113155
          );
          background-size: 400% 400%;
          animation: bg-shift 15s ease infinite;
        }

        /* Particles flutuantes */
        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .particle {
          position: absolute;
          background-color: #00ffe9;
          border-radius: 50%;
          opacity: 0.6;
          animation: particleFloat linear infinite;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }

        /* Matrix code effect */
        .matrix-code {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .code-line {
          position: absolute;
          top: -300px;
          width: 2px;
          height: 50px;
          background: linear-gradient(
            to bottom,
            rgba(0, 255, 233, 0),
            #00ffe9,
            rgba(0, 255, 233, 0)
          );
          animation: codeFall linear infinite;
        }

        @keyframes codeFall {
          0% {
            transform: translateY(-100vh);
            opacity: 0.5;
            height: 50px;
          }
          70% {
            opacity: 1;
            height: 100px;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
            height: 30px;
          }
        }
      `}</style>
    </div>
  );
}
