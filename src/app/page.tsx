"use client";

import { Street } from "@/components/Street";
import Image from "next/image";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import { EquipmentSlot } from "@/components/garage";
import type { CarInventoryData } from "@/types/cars";

// Car catalog data for the featured cars section
const CAR_CATALOG = [
  {
    rarity: 0,
    version: 0,
    name: "Chevrolet Bel Air 1955",
    description:
      "The classic American beauty from the 1950s. This rock 'n' roll era icon combines vintage elegance with reliable performance.",
    image: "/images/common_0.png",
    hashRange: [10, 18],
    cooldown: 12,
    dailyYield: 0.931,
    roi: 12.53,
  },
  {
    rarity: 0,
    version: 1,
    name: "UNO With Stairs",
    description:
      "A modern and creative take on the classic Fiat Uno. This compact urban vehicle features external stairs for easy rooftop access.",
    image: "/images/common_1.png",
    hashRange: [15, 25],
    cooldown: 11,
    dailyYield: 1.33,
    roi: 8.77,
  },
  {
    rarity: 1,
    version: 0,
    name: "Rare Vintage Car",
    description:
      "A rare gem from the vintage collection. This classic vehicle has been meticulously restored with attention to original details.",
    image: "/images/rare_1.png", // Using available image
    hashRange: [26, 40],
    cooldown: 9,
    dailyYield: 2.194,
    roi: 5.32,
  },
  {
    rarity: 1,
    version: 1,
    name: "Golf GTI 2025",
    description:
      "The ultimate evolution of the sporty hatchback. With cutting-edge technology and aerodynamic design.",
    image: "/images/rare_1.png",
    hashRange: [34, 50],
    cooldown: 8,
    dailyYield: 2.792,
    roi: 4.18,
  },
  {
    rarity: 2,
    version: 0,
    name: "Epic Vintage Car",
    description:
      "A masterpiece of vintage engineering. This legendary vehicle combines classic elegance with modern modifications.",
    image: "/images/epic_1.png", // Using available image
    hashRange: [51, 63],
    cooldown: 6,
    dailyYield: 3.79,
    roi: 3.08,
  },
  {
    rarity: 2,
    version: 1,
    name: "Red Car",
    description:
      "A fiery red speedster that turns heads wherever it goes. Its vibrant color symbolizes passion and speed.",
    image: "/images/epic_1.png",
    hashRange: [60, 75],
    cooldown: 5,
    dailyYield: 4.488,
    roi: 2.6,
  },
  {
    rarity: 3,
    version: 0,
    name: "Impala 67",
    description:
      "The ultimate muscle car from the classic era. This 1967 Impala represents the pinnacle of American power.",
    image: "/images/legendary_0.png",
    hashRange: [76, 88],
    cooldown: 4,
    dailyYield: 5.452,
    roi: 2.14,
  },
  {
    rarity: 3,
    version: 1,
    name: "Dodge Challenger Black 2023",
    description:
      "Absolute darkness meets maximum speed. This midnight black Challenger combines muscle car heritage with cutting-edge technology.",
    image: "/images/legendary_1.png",
    hashRange: [84, 100],
    cooldown: 3,
    dailyYield: 6.117,
    roi: 1.91,
  },
];

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col pb-8">
      <div className="bg-[url('/images/hero_bg.png')] bg-cover bg-center w-full">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between relative max-w-7xl mx-auto px-4 sm:px-0 w-full min-h-screen py-8 lg:py-0">
          <div className="flex flex-col items-center lg:items-start justify-center max-w-2xl w-full text-center lg:text-left mt-16 sm:mt-20">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[52px] font-bold text-[#EEEEF0] leading-tight lg:leading-none mt-0 lg:mt-8">
              Mine the Future with NFT Car Power
            </h1>
            <p className="text-[#B5B2BC] text-sm sm:text-base lg:text-lg xl:text-[20px] mt-3 sm:mt-4 max-w-lg lg:max-w-none leading-relaxed">
              Collect rare Cars cards, mine virtual resources, and trade your
              NFTs in the ultimate cyberpunk mining simulation.
            </p>

            <Button
              className="mt-4 lg:mt-10 w-full sm:w-auto lg:w-1/4 self-center lg:self-start px-6 py-3"
              onClick={() => router.push("/garage")}
            >
              Go to Garage
            </Button>
          </div>
          <div className="mt-8 lg:mt-0 flex-shrink-0 order-first lg:order-last">
            <Image
              src="/images/big_logo.png"
              alt="Big Logo"
              width={544}
              height={500}
              draggable={false}
              priority={true}
              className="w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg h-auto"
            />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-t from-black to-transparent h-[20%] w-full absolute left-0 bottom-0" />

      <Street />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-20">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EEEEF0] text-center">
          Car Mining Experience
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
          <div className="bg-[url('/images/card_bg.png')] bg-[#1A191B] bg-cover bg-center rounded-xl aspect-[4/3] sm:aspect-[3/2] p-4 sm:p-6 flex flex-col items-start gap-3 sm:gap-4 justify-end">
            <h1 className="text-xl sm:text-2xl font-bold text-[#EEEEF0]">
              Collect Rare Cars
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              Own unique NFT graphics cards with different mining capabilities
              and rarities
            </p>
          </div>

          <div className="bg-[url('/images/card_bg.png')] bg-[#1A191B] bg-cover bg-center rounded-xl aspect-[4/3] sm:aspect-[3/2] p-4 sm:p-6 flex flex-col items-start gap-3 sm:gap-4 justify-end">
            <h1 className="text-xl sm:text-2xl font-bold text-[#EEEEF0]">
              Mine & Earn
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              Put your GPUs to work mining cryptocurrency in a futuristic
              virtual environment
            </p>
          </div>

          <div className="bg-[url('/images/card_bg.png')] bg-[#1A191B] bg-cover bg-center rounded-xl aspect-[4/3] sm:aspect-[3/2] p-4 sm:p-6 flex flex-col items-start gap-3 sm:gap-4 justify-end">
            <h1 className="text-xl sm:text-2xl font-bold text-[#EEEEF0]">
              Invite Friends
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              Earn $TOD tokens by inviting friends to the platform
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16 sm:my-20">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EEEEF0] text-center">
          Featured Amazing Cars
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {CAR_CATALOG.map((car, index) => {
            const rarityColors = {
              0: "text-gray-400",
              1: "text-blue-400",
              2: "text-purple-400",
              3: "text-yellow-400",
            };

            const rarityNames = {
              0: "Common",
              1: "Rare",
              2: "Epic",
              3: "Legendary",
            };

            return (
              <div
                key={index}
                className="bg-[#1A191B] rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-gray-600 transition-colors duration-200"
              >
                <div className="aspect-square relative mb-3 sm:mb-4 rounded-lg overflow-hidden bg-gray-800">
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[#EEEEF0] truncate flex-1">
                      {car.name}
                    </h3>
                    <span
                      className={`text-xs sm:text-sm font-medium shrink-0 ${
                        rarityColors[car.rarity as keyof typeof rarityColors]
                      }`}
                    >
                      {rarityNames[car.rarity as keyof typeof rarityNames]}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {car.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="">
                      <span className="text-gray-400 block">Race Power:</span>
                      <span className="text-[#EEEEF0] font-medium">
                        {car.hashRange[0]}-{car.hashRange[1]}
                      </span>
                    </div>
                    <div className="">
                      <span className="text-gray-400 block">Daily Yield:</span>
                      <span className="text-[#EEEEF0] font-medium">
                        {car.dailyYield.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-full flex justify-center items-center mt-8 sm:mt-10">
          <Button
            onClick={() => router.push("/garage")}
            className="w-full max-w-xs px-6 py-3"
          >
            Join the garage!
          </Button>
        </div>
      </div>

      <Street />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16 sm:my-20 w-full">
        <div className="bg-[url('/images/bg_footer.png')] rounded-lg bg-cover bg-center py-12 sm:py-16 lg:py-20 flex items-center justify-center flex-col w-full min-h-[250px] sm:min-h-[300px]">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EEEEF0] text-center mb-4">
            Join the Mining Revolution
          </h1>
          <p className="text-[#B5B2BC] text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto text-center leading-relaxed">
            Be among the first to experience the future of GPU NFT mining
          </p>
          <Button
            onClick={() => router.push("/garage")}
            className="w-full max-w-xs px-6 py-3"
          >
            Join the garage!
          </Button>
        </div>
      </div>
    </div>
  );
}
