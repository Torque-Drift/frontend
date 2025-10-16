"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-4 border-[#49474E] mt-auto bg-[#1A191B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/images/logo_horizontal.png"
              alt="Logo"
              width={154}
              height={36}
              draggable={false}
              priority={true}
            />
            <p className="text-sm text-[#B5B2BC]">
              Mine the Future with NFT Car Power. Collect rare Cars cards, mine
              virtual resources, and trade your NFTs in the ultimate cyberpunk
              mining simulation.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#EEEEF0]">Links</h3>
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-sm text-[#B5B2BC] hover:text-[#EEEEF0] transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/garage"
                className="text-sm text-[#B5B2BC] hover:text-[#EEEEF0] transition-colors duration-200"
              >
                Garage
              </Link>
              <Link
                href="/store"
                className="text-sm text-[#B5B2BC] hover:text-[#EEEEF0] transition-colors duration-200"
              >
                Store
              </Link>
              <Link
                href="https://torque-drift.gitbook.io/torque-drift-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#B5B2BC] hover:text-[#EEEEF0] transition-colors duration-200"
              >
                Whitepaper
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#EEEEF0]">Legal</h3>
            <div className="flex flex-col space-y-2">
              <Link
                href="#privacy"
                className="text-sm text-[#B5B2BC] hover:text-[#EEEEF0] transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="#terms"
                className="text-sm text-[#B5B2BC] hover:text-[#EEEEF0] transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="#contact"
                className="text-sm text-[#B5B2BC] hover:text-[#EEEEF0] transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t-2 border-[#49474E]">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-[#B5B2BC]">
              © {currentYear} TorqueDrift. All rights reserved.
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-[#B5B2BC] text-center">
              <span>Powered by TorqueDrift</span>
              <span className="hidden sm:inline">•</span>
              <span>Built for Degen Web3</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
