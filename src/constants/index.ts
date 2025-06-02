export const cryptoCoinAddress = "0x974C7DF116Ac5e618dB54d03511691fFabfd4128";
export const gpuAddress = "0x9093DC1A2dfdE019E61a9C4CE3849f284ec8e123";
export const cryptoCoinSaleAddress =
  "0x86874c100E46a0709cfADCA66d635478E026471e";
export const gpuSaleAddress = "0xaC1958047bE68F7ce981F0C101FD77E10dC5A8a7";
export const rewardAddress = "0x3AE8196cAbA6c8DcaC278F3B18A0a82B0CA6a847";
export const usdAddress = "0x080457D49031fAA004a1f6242A4c77d43f1f62e6";

export const boxData = {
  price: 400,
  priceRef: 380,
  rarityChances: {
    common: "70%",
    rare: "25%",
    epic: "4.5%",
    legendary: "0.5%",
  },
  contentExamples: [
    { name: "Rule 3434", rarity: "Common", image: "/images/common.png" },
    { name: "Sapphire 1690", rarity: "Rare", image: "/images/rare.png" },
    { name: "Sub Zero 8000", rarity: "Epic", image: "/images/epic.png" },
    {
      name: "EmberGold 6969",
      rarity: "Legendary",
      image: "/images/legendary.png",
    },
  ],
};

export const summaryStats = [
  { label: "Total GPUs", value: 0 },
  { label: "Mining GPUs", value: 0 },
  { label: "Total Hashrate", value: 0 },
  { label: "Total Earnings", value: 0 },
];

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
    q: "What is CryptoCoin (CC)?",
    a: "CryptoCoin is a deflationary ERC-20 token with a maximum supply of 27 million, mined using virtual GPUs within a gamified ecosystem. Its mechanics are inspired by Bitcoin's original supply and halving model.",
  },
  {
    q: "How do I start mining?",
    a: "1) Acquire CC tokens via the private sale or Uniswap. 2) Use CC to buy a GPU directly or open a Mystery Box. 3) Once you own a GPU, it will start mining automatically. 4) You can claim your mined CC at any time.",
  },
  {
    q: "What is a Mystery Box?",
    a: "A Mystery Box is a loot-box-style item that contains a random GPU. There are 4 rarities: Common (Rule 3434) 70%, Rare (Sapphire 1690) 25%, Epic (Subzero 8000) 4.5%, and Legendary (EmberGold6969) 0.5%.",
  },
  {
    q: "How are mining rewards calculated?",
    a: "Mining rewards depend on your GPU's hash power (10-100), time elapsed since last claim, and the global mining rate, which halves as more tokens are mined. More powerful GPUs and longer wait times earn more.",
  },
  {
    q: "What is halving in GPUmine?",
    a: "Halving is a mechanism where mining rewards are reduced by half after key milestones. The first halving happens at 13.5 million CC in circulation, following Bitcoin's pattern to ensure increasing scarcity over time.",
  },
  {
    q: "Can I use multiple GPUs?",
    a: "Yes! You can mine with up to 1 GPUs per transaction. Each GPU will generate its own rewards based on its individual power level.",
  },
  {
    q: "Can I sell or transfer my GPUs?",
    a: "Absolutely! GPUs are NFTs and can be transferred, sold, or traded on any compatible NFT marketplace, giving you full ownership and control.",
  },
  {
    q: "Is the mining really on-chain?",
    a: "Yes! All mining logic, reward distribution, halvings, and GPU ownership are handled 100% on-chain, ensuring complete transparency and decentralization.",
  },
];
