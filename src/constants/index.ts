export const cryptoCoinAddress = "0xb9D71C79CaBEfEff9aBfD2d480b031ccc248006A";
export const gpuAddress = "0x57Ef644933BDA3dB1B8ab7a4141042Db701F2076";
export const cryptoCoinSaleAddress =
  "0x3c09f81768B9A976dE61aaFEa0FE0FCC56d89553";
export const gpuSaleAddress = "0xd47e3952C1D33ceC0096d2efc58E4f6847095392";
export const rewardAddress = "0xCcA4a9a852E4794e35C626e47543b0EDfD6AEA12";
export const usdAddress = "0x080457D49031fAA004a1f6242A4c77d43f1f62e6"

export const boxData = {
  price: 400,
  priceRef: 380,
  rarityChances: {
    common: "60%",
    rare: "25%",
    epic: "10%",
    legendary: "5%",
  },
  contentExamples: [
    { name: "Rule 3434", rarity: "Common", image: "/images/gpu.png" },
    { name: "Sapphire 1690", rarity: "Rare", image: "/images/gpu.png" },
    { name: "Sub Zero 8000", rarity: "Epic", image: "/images/epic.png" },
    { name: "EmberGold 6969", rarity: "Legendary", image: "/images/legendary.png" },
  ],
};

export const latestPulls = [
  {
    user: "CryptoMiner84",
    gpu: "RTX 4090 Ti",
    time: "2 hours ago",
    image: "/images/gpu.png",
  },
  {
    user: "BlockchainGuru",
    gpu: "RTX 4090",
    time: "5 hours ago",
    image: "/images/gpu.png",
  },
  {
    user: "SatoshiFan",
    gpu: "RTX 4090",
    time: "12 hours ago",
    image: "/images/gpu.png",
  },
  {
    user: "MiningKing",
    gpu: "RTX 4080 Ti",
    time: "1 day ago",
    image: "/images/gpu.png",
  },
];

export const howItWorksSteps = [
  {
    title: "1. Purchase Box",
    description:
      "Buy mystery boxes using MATIC. Each box has a chance to contain GPUs of various rarities.",
    icon: "🛒",
  },
  {
    title: "2. Open Box",
    description:
      "Go to your inventory and open your mystery boxes to reveal the GPU NFTs inside.",
    icon: "📦",
  },
  {
    title: "3. Use or Trade",
    description:
      "Use your new GPUs in your mining operation or trade them with other players in the marketplace.",
    icon: "💰",
  },
];

export const faqItems = [
  {
    q: "What is $CCoin?",
    a: "$CCoin is the utility token of the $CCoin ecosystem. It's used for purchasing GPUs, upgrading hardware, and participating in the platform's governance.",
  },
  {
    q: "How can I use $CCoin?",
    a: "$CCoin can be used to purchase GPUs, upgrading hardware, and participating in the platform's governance.",
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
