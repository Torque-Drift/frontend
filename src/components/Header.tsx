"use client";

import React from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";

const Header: React.FC = () => {
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
            href="https://torque-drift.gitbook.io/torque-drift-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-be-vietnam-pro text-[#B5B2BC] hover:text-[#FFFFFF] transition-colors duration-200 text-base"
          >
            Whitepaper
          </Link>
        </div>
        <div className="flex justify-end items-center h-16">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
