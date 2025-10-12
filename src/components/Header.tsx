"use client";

import React from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { Button } from "./Button";
import { useTokenBalances } from "@/hooks/useTokenBalances";

const Header: React.FC = () => {
  const { formattedTodBalance, formattedBnbBalance, isLoading } =
    useTokenBalances();

  return (
    <header className="w-full fixed top-4 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#1A191B]/80 backdrop-blur-sm rounded-[20px] flex justify-between items-center">
        <div className="flex items-center gap-4 h-16">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={32}
            height={32}
            draggable={false}
            priority={true}
          />
          <Link
            href="/"
            className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base"
          >
            Home
          </Link>

          <Link
            href="/garage"
            className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base"
          >
            Garage
          </Link>
          <Link
            href="/store"
            className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base"
          >
            Store
          </Link>
          <Link
            href="https://torque-drift.gitbook.io/torque-drift-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base"
          >
            Whitepaper
          </Link>
        </div>
        <div className="flex justify-end items-center h-16">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== "loading";
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === "authenticated");

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button onClick={openConnectModal} type="button">
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          type="button"
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Wrong network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-3">
                        {/* Token Balances Display */}
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                          <div className="flex flex-col items-center">
                            <span className="text-white font-medium text-sm">
                              {isLoading ? "..." : formattedTodBalance}
                            </span>
                          </div>
                          <div className="w-px h-6 bg-[#49474E]"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-yellow-500 font-medium text-sm">
                              {account.displayBalance ||
                                (isLoading ? "..." : formattedBnbBalance)}
                            </span>
                          </div>
                        </div>

                        <Button onClick={openChainModal} type="button">
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 24,
                                height: 24,
                                borderRadius: 999,
                                overflow: "hidden",
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 24, height: 24 }}
                                />
                              )}
                            </div>
                          )}
                        </Button>

                        <Button onClick={openAccountModal} type="button">
                          {account.displayName}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
};

export default Header;
