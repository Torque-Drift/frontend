"use client";

import { Street } from "@/components/Street";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col bg-[url('/images/hero_bg.png')] bg-cover bg-center pb-8">
      <div className="flex flex-col lg:flex-row items-center lg:justify-between relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-screen py-8 lg:py-0">
        <div className="flex flex-col items-center lg:items-start justify-center max-w-2xl w-full text-center lg:text-left">
          <Image
            src="/images/logo_horizontal.png"
            alt="Logo"
            width={154}
            height={36}
            draggable={false}
            priority={true}
            className="mb-6 lg:mb-0"
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[52px] font-bold text-[#EEEEF0] leading-tight lg:leading-none mt-0 lg:mt-8">
            Mine the Future with NFT Car Power
          </h1>
          <p className="text-[#B5B2BC] text-base sm:text-lg lg:text-[20px] mt-4 max-w-lg lg:max-w-none">
            Collect rare Cars cards, mine virtual resources, and trade your NFTs
            in the ultimate cyberpunk mining simulation.
          </p>
        </div>
        <div className="mt-8 lg:mt-0 flex-shrink-0">
          <Image
            src="/images/big_logo.png"
            alt="Big Logo"
            width={544}
            height={500}
            draggable={false}
            priority={true}
            className="w-full max-w-sm lg:max-w-md xl:max-w-lg h-auto"
          />
        </div>
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
