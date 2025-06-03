"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import Button from "@/components/Button";
import NumberInput from "@/components/NumberInput";
import Hero from "@/components/Hero";
import GridSection from "@/components/GridSection";
import { useMysteryBox } from "@/hooks/useMysteryBox";
import { useUser } from "@/hooks/useUser";
import { boxData, gpuRarities, howItWorksSteps } from "@/constants";
import TransactionProgress from "@/components/TransactionProgress";

export default function MysteryBox() {
  const [boxCount, setBoxCount] = useState(1);
  const [referralCode, setReferralCode] = useState("");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const {
    buyMysteryBox,
    transactionSteps,
    checkRefCode,
    referralCodeStatus,
    calculatePrice,
    calculateDiscount
  } = useMysteryBox();
  const { refreshBalance } = useUser();

  useEffect(() => {
    if (referralCode.trim() === "") return;

    const timeoutId = setTimeout(() => {
      checkRefCode(referralCode);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [referralCode]);

  async function handleBuyMysteryBox() {
    setIsTransactionModalOpen(true);
    try {
      await buyMysteryBox(boxCount, referralCode, refreshBalance);
      setTimeout(() => {
        setIsTransactionModalOpen(false);
      }, 2500);
    } catch (error) {
      console.error("Mystery box purchase failed:", error);
      // Keep modal open to show error state
    }
  }

  const getCardStyles = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return {
          cardClass: "bg-green-900/20 border-2 border-green-400 shadow-lg shadow-green-500/20",
          badgeClass: "bg-green-500 text-white",
          textColor: "text-green-400"
        };
      case "Rare":
        return {
          cardClass: "bg-cyan-900/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20",
          badgeClass: "bg-cyan-500 text-white",
          textColor: "text-cyan-400"
        };
      case "Epic":
        return {
          cardClass: "bg-purple-900/20 border-2 border-purple-400 shadow-lg shadow-purple-500/20",
          badgeClass: "bg-purple-500 text-white",
          textColor: "text-purple-400"
        };
      case "Legendary":
        return {
          cardClass: "bg-yellow-900/20 border-2 border-yellow-400 shadow-lg shadow-yellow-500/20",
          badgeClass: "bg-yellow-500 text-black",
          textColor: "text-yellow-400"
        };
      default:
        return {
          cardClass: "bg-gray-900/20 border-2 border-gray-400",
          badgeClass: "bg-gray-500 text-white",
          textColor: "text-gray-400"
        };
    }
  };

  const basePrice = boxData.price;
  const baseTotalPrice = basePrice * boxCount;
  const finalPrice = calculatePrice(basePrice, boxCount, referralCodeStatus.isValid);
  const discountAmount = referralCodeStatus.isValid ? calculateDiscount(basePrice, boxCount) : 0;

  return (
    <>
      <Hero
        title="Mystery GPU Boxes"
        subtitle="Unlock rare and powerful GPU NFTs to supercharge your mining operation"
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
                <div className="relative">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 pr-10"
                  />
                  {referralCodeStatus.isChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                    </div>
                  )}
                  {referralCodeStatus.hasChecked && !referralCodeStatus.isChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {referralCodeStatus.isValid ? (
                        <span className="text-green-500 text-sm">✓</span>
                      ) : (
                        <span className="text-red-500 text-sm">✗</span>
                      )}
                    </div>
                  )}
                </div>
                {referralCodeStatus.hasChecked && !referralCodeStatus.isChecking && (
                  <p className={`text-xs mt-1 ${referralCodeStatus.isValid ? "text-green-500" : "text-red-500"
                    }`}>
                    {referralCodeStatus.isValid
                      ? "✓ Valid referral code! 5% discount applied"
                      : "✗ Invalid referral code"
                    }
                  </p>
                )}
              </div>

              <Card variant="gradient" className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-cyan-300/80">Price per box</span>
                  <span>
                    {basePrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    $CCoin
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-cyan-300/80">Subtotal</span>
                  <span>
                    {baseTotalPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    $CCoin
                  </span>
                </div>
                {referralCodeStatus.isValid && (
                  <div className="flex justify-between mb-2">
                    <span className="text-green-500">Referral Discount (5%)</span>
                    <span className="text-green-500">
                      -{discountAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      $CCoin
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-cyan-800/50">
                  <span className="font-bold">Total</span>
                  <span className={`font-bold ${referralCodeStatus.isValid ? "text-green-400" : ""
                    }`}>
                    {finalPrice.toLocaleString("en-US", {
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
                {referralCodeStatus.isValid && (
                  <span className="ml-2 text-green-400 text-sm">
                    (5% OFF!)
                  </span>
                )}
              </Button>

              <div className="mt-6 text-center text-cyan-300/60 text-sm">
                <p>Boxes will be delivered to your inventory immediately</p>
                <p className="mt-2">
                  You can open them anytime to reveal your GPU NFTs
                </p>
                {referralCodeStatus.isValid && (
                  <p className="mt-2 text-green-400">
                    🎉 You're saving {discountAmount.toFixed(2)} $CCoin with this referral code!
                  </p>
                )}
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
          {gpuRarities.map((gpu, index) => {
            const styles = getCardStyles(gpu.rarity);
            return (
              <motion.div
                key={gpu.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`rounded-lg p-6 relative overflow-hidden ${styles.cardClass}`}>
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2 text-white">{gpu.name}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${styles.badgeClass}`}>
                      {gpu.rarity}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Drop Rate:</span>
                        <span className={`font-bold ${styles.textColor}`}>{gpu.chance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Hash Power:</span>
                        <span className={`font-bold ${styles.textColor}`}>{gpu.hashPower}</span>
                      </div>
                    </div>

                    <div className="relative mx-auto max-w-md mt-4">
                      <video
                        src={gpu.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="rounded-lg w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
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