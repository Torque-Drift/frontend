"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import Button from "@/components/Button";
import NumberInput from "@/components/NumberInput";
import Hero from "@/components/Hero";
import GridSection from "@/components/GridSection";
import { useMysteryBox } from "@/hooks/useMysteryBox";
import { boxData, latestPulls, howItWorksSteps } from "@/constants";
import TransactionProgress from "@/components/TransactionProgress";

export default function MysteryBox() {
  const [boxCount, setBoxCount] = useState(1);
  const [referralCode, setReferralCode] = useState("");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const { buyMysteryBox, transactionSteps } = useMysteryBox();

  async function handleBuyMysteryBox() {
    setIsTransactionModalOpen(true);
    try {
      await buyMysteryBox(boxCount, referralCode);
      setTimeout(() => {
        setIsTransactionModalOpen(false);
      }, 2500);
    } catch (error) {
      console.error("Mystery box purchase failed:", error);
    }
  }

  return (
    <>
      {/* Mystery Box Hero Section */}
      <Hero
        title="Mystery GPU Boxes"
        subtitle="Unlock rare and powerful GPU NFTs to supercharge your mining operation"
        ctaText="Buy Mystery Box"
        backgroundImage="/images/mystery-box-bg.jpg"
      />

      <section className="flex flex-col md:flex-row gap-8 mb-16">
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
                <p className="text-cyan-300">
                  Each box contains one random GPU NFT
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {boxData.contentExamples.map((item, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${item.rarity === "Common"
                        ? "border-green-500 bg-green-900/30"
                        : item.rarity === "Rare"
                          ? "border-cyan-500 bg-cyan-900/20"
                          : item.rarity === "Epic"
                            ? "border-purple-500 bg-purple-900/20"
                            : "border-yellow-500 bg-yellow-900/20"
                      }`}
                  >
                    <div className="relative h-36 mb-3">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        priority
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <h4 className="font-bold text-center">{item.name}</h4>
                    <p
                      className={`text-sm text-center ${item.rarity === "Common"
                          ? "text-green-500"
                          : item.rarity === "Rare"
                            ? "text-cyan-500"
                            : item.rarity === "Epic"
                              ? "text-purple-500"
                              : "text-yellow-500"
                        }`}
                    >
                      {item.rarity}
                    </p>
                  </div>
                ))}
              </div>

              <Card variant="gradient">
                <h3 className="text-lg font-bold mb-2">Drop Rates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-500">Common</span>
                    <span className="text-green-500">
                      {boxData.rarityChances.common}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-500">Rare</span>
                    <span className="text-cyan-500">
                      {boxData.rarityChances.rare}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-500">Epic</span>
                    <span className="text-purple-500">
                      {boxData.rarityChances.epic}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-500">Legendary</span>
                    <span className="text-yellow-500">
                      {boxData.rarityChances.legendary}
                    </span>
                  </div>
                </div>
              </Card>
            </Card>
          </motion.div>
        </div>

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
                    src="/images/box.png"
                    alt="Mystery Box"
                    height={10000}
                    width={10000}
                    priority
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-cyan-500 animate-pulse rounded-lg"></div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-6 text-center">
                Purchase Mystery Boxes
              </h3>

              <NumberInput
                label="Number of boxes"
                value={boxCount}
                max={10}
                onChange={setBoxCount}
                className="mb-6"
              />

              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-200">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <Card variant="gradient" className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-cyan-300/80">Price per box</span>
                  <span>
                    {boxData.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    $CCoin
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-cyan-800/50">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">
                    {(boxCount * boxData.price).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    $CCoin
                  </span>
                </div>
              </Card>

              <Button
                variant="secondary"
                fullWidth
                onClick={handleBuyMysteryBox}
              >
                Buy Now
              </Button>

              <div className="mt-6 text-center text-cyan-300/60 text-sm">
                <p>Boxes will be delivered to your inventory immediately</p>
                <p className="mt-2">
                  You can open them anytime to reveal your GPU NFTs
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <TransactionProgress
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        steps={transactionSteps}
      />

      {/* Latest Pulls Section */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
            Mystery Box GPU Rarities
          </h2>
          <p className="text-cyan-300 max-w-2xl mx-auto">
            Each Mystery Box contains a random GPU with different rarities and hash power levels
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Rule 3434", rarity: "Common", chance: "70%", colorClass: "border-green-500/30 bg-green-900/10", iconClass: "bg-gradient-to-r from-green-500 to-green-700", badgeClass: "bg-green-500/20 text-green-400", hashPower: "10-25" },
            { name: "Sapphire 1690", rarity: "Rare", chance: "25%", colorClass: "border-cyan-500/30 bg-cyan-900/10", iconClass: "bg-gradient-to-r from-cyan-500 to-cyan-700", badgeClass: "bg-cyan-500/20 text-cyan-400", hashPower: "26-50" },
            { name: "Subzero 8000", rarity: "Epic", chance: "4.5%", colorClass: "border-purple-500/30 bg-purple-900/10", iconClass: "bg-gradient-to-r from-purple-500 to-purple-700", badgeClass: "bg-purple-500/20 text-purple-400", hashPower: "51-75" },
            { name: "EmberGold6969", rarity: "Legendary", chance: "0.5%", colorClass: "border-yellow-500/30 bg-yellow-900/10", iconClass: "bg-gradient-to-r from-yellow-500 to-yellow-700", badgeClass: "bg-yellow-500/20 text-yellow-400", hashPower: "76-100" },
          ].map((gpu, index) => (
            <motion.div
              key={gpu.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={gpu.colorClass}>
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${gpu.iconClass} flex items-center justify-center`}>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{gpu.name}</h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${gpu.badgeClass} mb-3`}>
                    {gpu.rarity}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cyan-300/70">Drop Chance:</span>
                      <span className="font-bold">{gpu.chance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-300/70">Hash Power:</span>
                      <span className="font-bold">{gpu.hashPower}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>


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
