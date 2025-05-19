"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import Button from "@/components/Button";
import NumberInput from "@/components/NumberInput";
import Countdown from "@/components/Countdown";
import ProgressBar from "@/components/ProgressBar";
import GridSection from "@/components/GridSection";
import { useSale } from "@/hooks/useSale";
import { faqItems } from "@/constants";

export default function TokenSale() {
  const [amount, setAmount] = useState(1);
  const { buyToken, totalSold } = useSale();

  const tokenData = {
    name: "$CCoin",
    price: 0.001/*  0.125 */,
    totalSupply: 40000,
    sold: totalSold,
    minPurchase: 0,
    maxPurchase: 10000,
  };

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  targetDate.setHours(targetDate.getHours() + 12);

  return (
    <>
      <section className="flex flex-col md:flex-row gap-8 mb-16">
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <div className="mb-6 text-center">
                <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                  {tokenData.name} Token Sale
                </h2>
                <p className="text-cyan-300">Power your mining operation</p>
              </div>

              <div className="space-y-6">
                <div className="border-t border-cyan-800/50 pt-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-cyan-300/80">Token Price</span>
                    <span className="font-bold">{tokenData.price} USD</span>
                  </div>

                  <div className="flex justify-between mb-3">
                    <span className="text-cyan-300/80">Total Supply</span>
                    <span className="font-bold">
                      {tokenData.totalSupply.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between mb-6">
                    <span className="text-cyan-300/80">Sale Ends In</span>
                    <Countdown targetDate={targetDate} alwaysShow />
                  </div>
                </div>

                <ProgressBar
                  value={tokenData.sold}
                  max={tokenData.totalSupply}
                  showLabels
                />

                <Card variant="gradient">
                  <h3 className="text-lg font-bold mb-2">Token Utility</h3>
                  <ul className="list-disc list-inside space-y-1 text-cyan-300/80">
                    <li>Power up mining operations</li>
                    <li>Upgrade GPU cards</li>
                    <li>Access premium features</li>
                    <li>Participate in governance</li>
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
                  <span>{tokenData.price} USD</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-cyan-300/80">Amount</span>
                  <span>
                    {amount} {tokenData.name}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-cyan-800/50">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">
                    {(amount * tokenData.price).toFixed(2)} USD
                  </span>
                </div>
              </Card>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => buyToken(amount)}
              >
                Buy Tokens
              </Button>

              <div className="mt-6 text-center text-cyan-300/60 text-sm">
                <p>Tokens will be sent to your connected wallet address</p>
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
