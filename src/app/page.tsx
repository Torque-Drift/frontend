"use client";

import { Street } from "@/components/Street";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col bg-[url('/images/hero_bg.png')] bg-cover bg-center pb-8">
      <div className="flex items-center justify-between relative max-w-7xl mx-auto px-4 sm:px-0 w-full min-h-screen">
        <div className="flex flex-col items-start justify-center max-w-2xl w-full">
          <Image
            src="/images/logo_horizontal.png"
            alt="Logo"
            width={154}
            height={36}
            draggable={false}
            priority={true}
          />
          <h1 className="text-[52px] font-bold text-[#EEEEF0] leading-none mt-8">
            Mine the Future with NFT Car Power
          </h1>
          <p className="text-[#B5B2BC] text-[20px] mt-4">
            Collect rare Cars cards, mine virtual resources, and trade your NFTs
            in the ultimate cyberpunk mining simulation.
          </p>
        </div>
        <Image
          src="/images/big_logo.png"
          alt="Big Logo"
          width={544}
          height={500}
          draggable={false}
          priority={true}
        />
      </div>
      <div className="bg-gradient-to-t from-black to-transparent h-[20%] w-full absolute left-0 bottom-0" />

      <Street />

     {/*  <div>
        <h1>Next-Gen Mining Experience</h1>

        <div className="bg-[#1A191B] rounded-xl">

        </div>
      </div> */}
    </div>
  );
}
