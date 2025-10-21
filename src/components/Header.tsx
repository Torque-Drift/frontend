"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { Button } from "./Button";
import { useTokenBalances } from "@/hooks/useTokenBalances";

const Header: React.FC = () => {
  const { formattedTodBalance, formattedBnbBalance, isLoading } =
    useTokenBalances();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full fixed top-4 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <div className="bg-[#1A191B]/80 backdrop-blur-sm rounded-[20px] flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
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
           {/*  <Link
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
            </Link> */}
          </div>

          {/* Wallet Connection */}
          <div className="hidden flex justify-end items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#B5B2BC] hover:text-[#FFFFFF] p-2 lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
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
                          <Button
                            onClick={openConnectModal}
                            type="button"
                            className="text-sm px-3 py-2"
                          >
                            Connect
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            type="button"
                            className="bg-red-500 hover:bg-red-600 text-sm px-3 py-2"
                          >
                            Wrong network
                          </Button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Token Balances Display - Hidden on mobile */}
                          <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg">
                            <div className="flex flex-col items-center">
                              <span className="text-white font-medium text-xs">
                                {isLoading ? "..." : formattedTodBalance}
                              </span>
                            </div>
                            <div className="w-px h-4 bg-[#49474E]"></div>
                            <div className="flex flex-col items-center">
                              <span className="text-yellow-500 font-medium text-xs">
                                {account.displayBalance ||
                                  (isLoading ? "..." : formattedBnbBalance)}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={openChainModal}
                            type="button"
                            className="p-2"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 20,
                                  height: 20,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl}
                                    style={{ width: 20, height: 20 }}
                                  />
                                )}
                              </div>
                            )}
                          </Button>

                          <Button
                            onClick={openAccountModal}
                            type="button"
                            className="text-sm px-3 py-2"
                          >
                            <span className="hidden sm:inline">
                              {account.displayName}
                            </span>
                            <span className="sm:hidden">Account</span>
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-2 bg-[#1A191B]/95 backdrop-blur-sm rounded-[20px] border border-[#49474E]/50">
            <div className="flex flex-col py-4">
              <Link
                href="/"
                className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base px-6 py-3 hover:bg-[#49474E]/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
             {/*  <Link
                href="/garage"
                className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base px-6 py-3 hover:bg-[#49474E]/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Garage
              </Link>
              <Link
                href="/store"
                className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base px-6 py-3 hover:bg-[#49474E]/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Store
              </Link>
              <Link
                href="https://torque-drift.gitbook.io/torque-drift-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base px-6 py-3 hover:bg-[#49474E]/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Whitepaper
              </Link> */}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
