"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-4 border-[#49474E] mt-auto bg-[#1A191B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center gap-8">
          {/* Brand */}
          <div className="space-y-4 w-1/3">
            <Image
              src="/images/logo_horizontal.png"
              alt="Logo"
              width={154}
              height={36}
              draggable={false}
              priority={true}
            />
            <p className="text-sm text-foreground-secondary">
              Mine the Future with NFT Car Power Collect rare Cars cards, mine
              virtual resources, and trade your NFTs in the ultimate cyberpunk
              mining simulation.
            </p>
          </div>

          <div className="flex justify-between items-center gap-8 w-1/3">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Links</h3>
              <div className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  href="#about"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors duration-200"
                >
                  About
                </Link>
                <Link
                  href="#support"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors duration-200"
                >
                  Support
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <div className="flex flex-col space-y-2">
                <Link
                  href="#privacy"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#terms"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors duration-200"
                >
                  Terms of Service
                </Link>
                <Link
                  href="#contact"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors duration-200"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t-2 border-[#49474E]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-foreground-tertiary">
              © {currentYear} TorqueDrift. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-foreground-tertiary">
              <span>Powered by TorqueDrift</span>
              <span>•</span>
              <span>Built for Degen Web3</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
