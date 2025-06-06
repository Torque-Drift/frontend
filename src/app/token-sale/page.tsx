"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import Button from "@/components/Button";
import NumberInput from "@/components/NumberInput";
import ProgressBar from "@/components/ProgressBar";
import GridSection from "@/components/GridSection";
import { useSale } from "@/hooks/useSale";
import { cryptoCoinAddress, faqItems } from "@/constants";
import TransactionProgress from "@/components/TransactionProgress";

export default function TokenSale() {
  const [amount, setAmount] = useState(1);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const { buyToken, totalSold, transactionSteps } = useSale();

  const tokenData = {
    name: "CryptoCoin",
    symbol: "CC",
    price: 0.125,
    totalSupply: 40000,
    maxSupply: 27000000,
    sold: totalSold,
    minPurchase: 0,
    maxPurchase: 10000,
  };

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  targetDate.setHours(targetDate.getHours() + 12);

  async function handleBuyToken() {
    setIsTransactionModalOpen(true);
    try {
      await buyToken(amount);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  }

  return (
    <>
      <section className="flex flex-col-reverse md:flex-row gap-8 mb-16">
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <div className="mb-6 text-center">
                <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                  {tokenData.name} ({tokenData.symbol}) Pre-Sale
                </h2>
                <p className="text-cyan-300">Deflationary token powering virtual GPU mining</p>
                <a href={`https://amoy.polygonscan.com/address/${cryptoCoinAddress}`} target="_blank" className="text-cyan-300 underline">Token Contract</a>
              </div>

              <div className="space-y-6">
                <div className="border-t border-cyan-800/50 pt-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-cyan-300/80">Token Price</span>
                    <span className="font-bold">{tokenData.price} USDT</span>
                  </div>

                  <div className="flex justify-between mb-3">
                    <span className="text-cyan-300/80">Sale Supply</span>
                    <span className="font-bold">
                      {tokenData.totalSupply.toLocaleString()} $CC
                    </span>
                  </div>
                </div>

                <ProgressBar
                  value={tokenData.sold}
                  max={tokenData.totalSupply}
                  showLabels
                />

                <Card variant="gradient">
                  <h3 className="text-lg font-bold mb-2">CryptoCoin Utility</h3>
                  <ul className="list-disc list-inside space-y-1 text-cyan-300/80">
                    <li>Purchase virtual GPUs for mining</li>
                    <li>Open Mystery Boxes with random GPU drops</li>
                    <li>Earn mining rewards automatically</li>
                    <li>Trade GPUs as NFTs on marketplaces</li>
                    <li>Bitcoin-inspired deflationary mechanics</li>
                    <li>Halving events reduce supply over time</li>
                  </ul>
                </Card>

                <Card variant="gradient" className="mt-4">
                  <h3 className="text-lg font-bold mb-2">Mining Mechanics</h3>
                  <ul className="list-disc list-inside space-y-1 text-cyan-300/80">
                    <li>GPU hash power ranges from 10-100</li>
                    <li>Rewards based on time and GPU power</li>
                    <li>Global mining rate halves at milestones</li>
                    <li>First halving at 13.5M CC in circulation</li>
                    <li>Mine with up to 10 GPUs simultaneously</li>
                    <li>100% on-chain transparency</li>
                  </ul>
                </Card>
              </div>
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
              <h3 className="text-2xl font-bold mb-6">Purchase Tokens</h3>

              <NumberInput
                label="Amount to purchase"
                value={amount}
                onChange={setAmount}
                min={tokenData.minPurchase}
                max={tokenData.maxPurchase}
                className="mb-6"
                showLimits
              />

              <Card variant="gradient" className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-cyan-300/80">Price per token</span>
                  <span>{tokenData.price} USDT</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-cyan-300/80">Amount</span>
                  <span>
                    {amount} {tokenData.symbol}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-cyan-800/50">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">
                    {(amount * tokenData.price)} USDT
                  </span>
                </div>
              </Card>

              <Button
                variant="secondary"
                fullWidth
                onClick={handleBuyToken}
              >
                Buy {tokenData.symbol} Tokens
              </Button>

              <div className="mt-6 text-center text-cyan-300/60 text-sm">
                <p>Tokens will be sent to your connected wallet address</p>
                <p className="mt-2">
                  Use your {tokenData.symbol} tokens to purchase GPUs or Mystery Boxes
                </p>
                <p className="mt-2">
                  By purchasing, you agree to our{" "}
                  <a href="#" className="text-cyan-300 underline">
                    Terms & Conditions
                  </a>
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

      <GridSection title="Frequently Asked Questions" columns={2}>
        {faqItems.map((faq, i) => (
          <Card key={i}>
            <h4 className="text-xl font-bold mb-3 text-rose-500">{faq.q}</h4>
            <p className="text-cyan-300/80">{faq.a}</p>
          </Card>
        ))}
      </GridSection>
    </>
  );
}
