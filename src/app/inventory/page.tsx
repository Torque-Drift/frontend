"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInventory } from "@/hooks/useInventory";
import TransactionProgress from "@/components/TransactionProgress";
import BoxOpeningModal from "@/components/BoxOpeningModal";
import Link from "next/link";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isOpenBoxModalOpen, setIsOpenBoxModalOpen] = useState(false);
  const [isBoxOpeningModalOpen, setIsBoxOpeningModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: "collect" | "openBox";
    tokenId: number;
    rarity?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForReveal, setWaitingForReveal] = useState(false);
  const {
    onCollect,
    nfts,
    openBox,
    collectTransactionSteps,
    openBoxTransactionSteps,
    revealedNft,
    clearRevealedNft,
  } = useInventory();

  useEffect(() => {
    if (waitingForReveal && revealedNft && currentAction) {
      setIsOpenBoxModalOpen(false);
      setWaitingForReveal(false);
      const finalRarity = revealedNft.rarity.toLowerCase();
      setCurrentAction({
        type: "openBox",
        tokenId: currentAction.tokenId,
        rarity: finalRarity
      });

      setIsBoxOpeningModalOpen(true);
    }
  }, [revealedNft, waitingForReveal, currentAction]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (waitingForReveal) {
      timeout = setTimeout(() => {
        console.log("Timeout aguardando revelação, resetando...");
        setWaitingForReveal(false);
        setIsProcessing(false);
        setIsOpenBoxModalOpen(false);
        setCurrentAction(null);
      }, 30000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [waitingForReveal]);

  const sortedNfts = [...nfts].sort((a, b) => {
    if (a.rarity === "Mystery" && b.rarity !== "Mystery") return 1;
    if (a.rarity !== "Mystery" && b.rarity === "Mystery") return -1;
    return a.tokenId - b.tokenId;
  });

  const getFilteredNfts = () => {
    let filtered = [...sortedNfts];

    switch (activeTab) {
      case "all":
        break;
      case "gpus":
        filtered = filtered.filter(nft => nft.rarity !== "Mystery");
        break;
      case "mystery":
        filtered = filtered.filter(nft => nft.rarity === "Mystery");
        break;
      case "common":
        filtered = filtered.filter(nft => nft.rarity.toLowerCase() === "common");
        break;
      case "rare":
        filtered = filtered.filter(nft => nft.rarity.toLowerCase() === "rare");
        break;
      case "epic":
        filtered = filtered.filter(nft => nft.rarity.toLowerCase() === "epic");
        break;
      case "legendary":
        filtered = filtered.filter(nft => nft.rarity.toLowerCase() === "legendary");
        break;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(term) ||
        nft.rarity.toLowerCase().includes(term) ||
        nft.tokenId.toString().includes(term)
      );
    }

    return filtered;
  };

  const getCategoryCount = (tabId: string) => {
    switch (tabId) {
      case "all":
        return nfts.length;
      case "gpus":
        return nfts.filter(nft => nft.rarity !== "Mystery").length;
      case "mystery":
        return nfts.filter(nft => nft.rarity === "Mystery").length;
      case "common":
        return nfts.filter(nft => nft.rarity.toLowerCase() === "common").length;
      case "rare":
        return nfts.filter(nft => nft.rarity.toLowerCase() === "rare").length;
      case "epic":
        return nfts.filter(nft => nft.rarity.toLowerCase() === "epic").length;
      case "legendary":
        return nfts.filter(nft => nft.rarity.toLowerCase() === "legendary").length;
      default:
        return 0;
    }
  };

  const filteredNfts = getFilteredNfts();

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "border-green-500 bg-green-500/10";
      case "rare":
        return "border-cyan-500 bg-cyan-500/10";
      case "epic":
        return "border-purple-500 bg-purple-500/10";
      case "legendary":
        return "border-yellow-500 bg-yellow-500/10";
      default:
        return "border-cyan-800 bg-cyan-900/10";
    }
  };

  async function handleCollectRewards(tokenId: number) {
    if (isProcessing) return;
    setIsProcessing(true);
    setCurrentAction({ type: "collect", tokenId });
    setIsCollectModalOpen(true);
    try {
      await onCollect(tokenId);
      setTimeout(() => {
        const hasSuccess = collectTransactionSteps.some(
          (step) => step.status === "success"
        );
        if (hasSuccess) {
          setIsCollectModalOpen(false);
          setCurrentAction(null);
          setIsProcessing(false);
        }
      }, 2500);
    } catch (error) {
      console.error("Collect rewards failed:", error);
      setIsProcessing(false);
    }
  }

  async function handleOpenBox(tokenId: number) {
    if (isProcessing) return;

    setIsProcessing(true);
    setCurrentAction({ type: "openBox", tokenId });
    setIsOpenBoxModalOpen(true);
    setWaitingForReveal(true);

    try {
      await openBox(tokenId);

    } catch (error) {
      console.error("Open box failed:", error);
      setIsProcessing(false);
      setIsOpenBoxModalOpen(false);
      setCurrentAction(null);
      setWaitingForReveal(false);
    }
  }

  function handleCloseBoxOpeningModal() {
    setIsBoxOpeningModalOpen(false);
    setIsOpenBoxModalOpen(false);
    setCurrentAction(null);
    setIsProcessing(false);
    setWaitingForReveal(false);
    clearRevealedNft();
  }

  return (
    <>
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

      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              label: activeTab === "all" ? "Total NFTs" : `Filtered NFTs`,
              value: activeTab === "all" ? nfts.length : filteredNfts.length
            },
            {
              label: "Active GPUs",
              value: nfts.filter((nft) => nft.rarity !== "Mystery").length,
            },
            {
              label: "Mystery Boxes",
              value: nfts.filter((nft) => nft.rarity === "Mystery").length,
            },
            {
              label: "Total to Claim",
              value: `${nfts.reduce((acc, nft) => Number(acc) + Number(nft.reward), 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })} $CC`,
            },
            {
              label: "Total Power",
              value: `${nfts.reduce((acc, nft) => Number(acc) + Number(nft.power), 0)} W`,
            },
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
              { id: "all", label: "All NFTs" },
              { id: "gpus", label: "GPUs" },
              { id: "mystery", label: "Mystery Boxes" },
              { id: "common", label: "Common" },
              { id: "rare", label: "Rare" },
              { id: "epic", label: "Epic" },
              { id: "legendary", label: "Legendary" },
            ].map((tab) => {
              const count = getCategoryCount(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded whitespace-nowrap transition-colors ${activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                    : "border border-cyan-800 bg-black/40 hover:bg-black/60"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.id
                      ? "bg-white/20"
                      : "bg-cyan-500/20 text-cyan-400"
                      }`}>
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search NFTs..."
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

      {/* NFT cards grid */}
      <section className="mb-12">
        {filteredNfts.length === 0 ? (
          <div className="text-center py-12 border border-cyan-800 rounded-lg bg-black/40">
            <p className="text-cyan-300">
              {searchTerm ?
                `No NFTs found matching "${searchTerm}"` :
                activeTab === "all" ?
                  "No NFTs in your inventory" :
                  `No ${activeTab === "gpus" ? "GPU" : activeTab === "mystery" ? "Mystery Box" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} NFTs found`
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNfts.map((nft, index) => (
              <motion.div
                key={nft.tokenId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`border-2 rounded-lg overflow-hidden relative flex flex-col ${getRarityColor(
                  nft.rarity
                )}`}
              >
                <div className="p-4 bg-black/60 flex-shrink-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{nft.name}</h3>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-bold text-white border ${getRarityColor(
                        nft.rarity
                      )}`}
                    >
                      {nft.rarity}
                    </div>
                  </div>

                  {nft.rarity !== "Mystery" && (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`w-2 h-2 rounded-full bg-green-500`}
                        ></div>
                        <span className="text-sm text-cyan-300/80">Mining</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 min-h-[3rem]">
                        <div>
                          <p className="text-xs text-cyan-300/60">Power</p>
                          <p className="font-mono font-bold">{nft.power} W</p>
                        </div>
                      </div>
                    </>
                  )}

                  {nft.rarity === "Mystery" && (
                    <div className="min-h-[7rem] flex justify-start items-start">
                      <p className="text-sm text-cyan-300/80">
                        Click to reveal your GPU!
                      </p>
                    </div>
                  )}
                </div>

                <div className={`relative h-40 bg-black/60 flex-shrink-0`}>
                  <Image
                    src={nft.image_site}
                    alt={nft.name}
                    width={10000}
                    height={10000}
                    className="object-contain w-full h-full"
                  />
                </div>

                <div className="p-4 bg-black/60 border-t border-cyan-800/50 flex-grow flex flex-col justify-end">
                  {nft.rarity !== "Mystery" ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <p className="text-xs text-cyan-300/60">
                            Total to Claim
                          </p>
                          <p className="font-mono font-bold">
                            {nft.reward} GMINE
                          </p>
                        </div>
                        {/* <div>
                          <p className="text-xs text-cyan-300/60">
                            Hours Active
                          </p>
                          <p className="font-mono font-bold">0 hrs</p>
                        </div> */}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCollectRewards(nft.tokenId)}
                          disabled={
                            isProcessing &&
                            currentAction?.tokenId === nft.tokenId
                          }
                          className="flex-1 py-2 px-2 rounded text-sm bg-green-500/20 border border-green-500 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isProcessing &&
                              currentAction?.tokenId === nft.tokenId &&
                              currentAction?.type === "collect" && (
                                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            {isProcessing &&
                              currentAction?.tokenId === nft.tokenId &&
                              currentAction?.type === "collect"
                              ? "Claiming..."
                              : "Claim Rewards"}
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleOpenBox(nft.tokenId)}
                        disabled={
                          isProcessing && currentAction?.tokenId === nft.tokenId
                        }
                        className="flex-1 py-2 px-2 rounded text-sm bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isProcessing &&
                            currentAction?.tokenId === nft.tokenId &&
                            currentAction?.type === "openBox" && (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                          {isProcessing &&
                            currentAction?.tokenId === nft.tokenId &&
                            currentAction?.type === "openBox"
                            ? "Opening..."
                            : "Open Box"}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="border border-cyan-800 rounded-lg p-8 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 text-center">
          <h3 className="text-2xl font-bold mb-4">Need more mining power?</h3>
          <p className="text-cyan-300 mb-6">
            Expand your GPU collection by purchasing from our marketplace
          </p>
          <Link href="/mystery-box">
            <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 rounded font-bold hover:from-rose-600 hover:to-purple-700 transition-colors">
              Visit Marketplace
            </button>
          </Link>
        </div>
      </section>

      {isCollectModalOpen && currentAction && (
        <TransactionProgress
          isOpen={isCollectModalOpen}
          onClose={() => {
            setIsCollectModalOpen(false);
            setCurrentAction(null);
            setIsProcessing(false);
          }}
          steps={collectTransactionSteps}
        />
      )}

      {isOpenBoxModalOpen && currentAction && (
        <TransactionProgress
          isOpen={isOpenBoxModalOpen}
          onClose={() => {
            setIsOpenBoxModalOpen(false);
            setCurrentAction(null);
            setIsProcessing(false);
            setWaitingForReveal(false);
            clearRevealedNft();
          }}
          steps={openBoxTransactionSteps}
        />
      )}

      {isBoxOpeningModalOpen && currentAction && (
        <BoxOpeningModal
          isOpen={isBoxOpeningModalOpen}
          onClose={handleCloseBoxOpeningModal}
          rarity={currentAction.rarity || "mystery"}
        />
      )}
    </>
  );
}
