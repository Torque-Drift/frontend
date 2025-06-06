export const cryptoCoinAddress = "0x9d9C13A7b5f86Dff1680987d0C5c9A191e0b62c7";
export const gpuAddress = "0x5750Db1171e17bB133afbE45471e714a7BB773BB";
export const cryptoCoinSaleAddress =
  "0xfaD8A6C8c8f9e4B7AD1F7736c681D295A6fC5B2E";
export const gpuSaleAddress = "0xCfD40e440384A0d411946bBBb8aA7b43F35EB989";
export const rewardAddress = "0xBC404C1B8fae99A7983f7fDA6A67a06271d4b5d0";
export const usdAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

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

export const gpuRarities = [
  {
    name: "Rule 3434",
    rarity: "Common",
    chance: "70%",
    colorClass: "border-green-400/60 bg-gradient-to-br from-green-800/40 to-green-900/30 shadow-lg shadow-green-500/25 hover:shadow-green-400/40 transition-all duration-300",
    badgeClass: "bg-gradient-to-r from-green-500/40 to-green-500/40 text-green-200 border border-green-400/50",
    hashPower: "10-25",
    video: "/videos/common.mp4"
  },
  {
    name: "Sapphire 1690",
    rarity: "Rare",
    chance: "25%",
    colorClass: "border-cyan-400/60 bg-gradient-to-br from-cyan-800/40 to-cyan-900/30 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-300",
    badgeClass: "bg-gradient-to-r from-cyan-500/40 to-cyan-500/40 text-cyan-200 border border-cyan-400/50",
    hashPower: "26-50",
    video: "/videos/rare.mp4"
  },
  {
    name: "Subzero 8000",
    rarity: "Epic",
    chance: "4.5%",
    colorClass: "border-purple-400/60 bg-gradient-to-br from-purple-800/40 to-purple-900/30 shadow-lg shadow-purple-500/25 hover:shadow-purple-400/40 transition-all duration-300",
    badgeClass: "bg-gradient-to-r from-purple-500/40 to-purple-500/40 text-purple-200 border border-purple-400/50",
    hashPower: "51-75",
    video: "/videos/epic.mp4"
  },
  {
    name: "EmberGold6969",
    rarity: "Legendary",
    chance: "0.5%",
    colorClass: "border-yellow-400/60 bg-gradient-to-br from-yellow-800/40 to-yellow-900/30 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-400/40 transition-all duration-300",
    badgeClass: "bg-gradient-to-r from-yellow-500/40 to-yellow-500/40 text-yellow-200 border border-yellow-400/50",
    hashPower: "76-100",
    video: "/videos/legendary.mp4"
  },
]

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
