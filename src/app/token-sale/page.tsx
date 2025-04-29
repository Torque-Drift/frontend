"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/Card";
import Button from "@/components/Button";
import NumberInput from "@/components/NumberInput";
import Countdown from "@/components/Countdown";
import ProgressBar from "@/components/ProgressBar";
import FAQ from "@/components/FAQ";
import GridSection from "@/components/GridSection";

export default function TokenSale() {
  const [amount, setAmount] = useState(1);
  
  // Token sale data
  const tokenData = {
    name: "GMINE",
    price: 0.05, // in TON
    totalSupply: 40000,
    sold: 4450,
    minPurchase: 1,
    maxPurchase: 10000,
  };

  // Set the initial time (3 days and 12 hours from now)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  targetDate.setHours(targetDate.getHours() + 12);

  // FAQ data
  const faqItems = [
    {
      q: "What is GMINE token?",
      a: "GMINE is the utility token of the GPUMINE ecosystem. It's used for purchasing GPUs, upgrading hardware, and participating in the platform's governance.",
    },
    {
      q: "How can I use GMINE tokens?",
      a: "GMINE tokens can be used to purchase GPU NFTs, upgrade your mining operation, boost mining rewards, and participate in platform decisions.",
    },
    {
      q: "When will trading begin?",
      a: "Trading will begin immediately after the token sale concludes. We plan to list on multiple exchanges shortly after.",
    },
    {
      q: "Is there a vesting period?",
      a: "Yes, tokens purchased during the sale will have a 3-month vesting period with 25% unlocked immediately and the rest unlocked monthly.",
    },
  ];

  return (
    <>
      {/* Token Sale Section */}
      <section className="flex flex-col md:flex-row gap-8 mb-16">
        {/* Left side - token info */}
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
                    <span className="font-bold">{tokenData.price} TON</span>
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
                
                {/* Progress bar */}
                <ProgressBar 
                  value={tokenData.sold} 
                  max={tokenData.totalSupply}
                  showLabels
                />
                
                {/* Token utility info */}
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
        
        {/* Right side - purchase form */}
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
                  <span>{tokenData.price} TON</span>
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
                    {(amount * tokenData.price).toFixed(2)} TON
                  </span>
                </div>
              </Card>
              
              <Button variant="secondary" fullWidth>
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
      
      {/* FAQ Section */}
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
