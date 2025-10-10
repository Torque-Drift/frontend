"use client";

import React from "react";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { bscTestnet, bsc, hardhat } from "wagmi/chains";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "Torque Drift",
  projectId: "development-project-id",
  chains: [hardhat, bscTestnet, bsc],
  ssr: true,
});

interface WalletProviderWrapperProps {
  children: React.ReactNode;
}

const WalletProviderWrapper: React.FC<WalletProviderWrapperProps> = ({
  children,
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider coolMode={true} theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WalletProviderWrapper;
