// Test script to verify lootbox hash generation and car diversity
// Run with: node test-lootbox.js

// Mock CAR_CATALOG
const CAR_CATALOG = [
  // Common Vintage (0,0)
  { rarity: 0, version: 0, name: "Common Vintage 1", hashRange: [0, 25], dailyYield: 10, image: "/common_0.jpg", description: "Basic vintage car" },
  { rarity: 0, version: 0, name: "Common Vintage 2", hashRange: [26, 50], dailyYield: 10, image: "/common_0.jpg", description: "Basic vintage car" },

  // Common Modern (0,1)
  { rarity: 0, version: 1, name: "Common Modern 1", hashRange: [51, 75], dailyYield: 12, image: "/common_1.jpg", description: "Basic modern car" },
  { rarity: 0, version: 1, name: "Common Modern 2", hashRange: [76, 100], dailyYield: 12, image: "/common_1.jpg", description: "Basic modern car" },

  // Rare Vintage (1,0)
  { rarity: 1, version: 0, name: "Rare Vintage", hashRange: [0, 100], dailyYield: 25, image: "/rare_0.jpg", description: "Rare vintage car" },

  // Rare Modern (1,1)
  { rarity: 1, version: 1, name: "Rare Modern", hashRange: [0, 100], dailyYield: 28, image: "/rare_1.jpg", description: "Rare modern car" },

  // Epic Vintage (2,0)
  { rarity: 2, version: 0, name: "Epic Vintage", hashRange: [0, 100], dailyYield: 50, image: "/epic_0.jpg", description: "Epic vintage car" },

  // Epic Modern (2,1)
  { rarity: 2, version: 1, name: "Epic Modern", hashRange: [0, 100], dailyYield: 55, image: "/epic_1.jpg", description: "Epic modern car" },

  // Legendary Vintage (3,0)
  { rarity: 3, version: 0, name: "Legendary Vintage", hashRange: [0, 100], dailyYield: 100, image: "/legendary_0.jpg", description: "Legendary vintage car" },

  // Legendary Modern (3,1)
  { rarity: 3, version: 1, name: "Legendary Modern", hashRange: [0, 100], dailyYield: 110, image: "/legendary_1.jpg", description: "Legendary modern car" },
];

// Enums for NFT items
const Rarity = {
  COMMON: "Common",
  RARE: "Rare",
  EPIC: "Epic",
  LEGENDARY: "Legendary",
};

const Version = {
  VINTAGE: "Vintage",
  MODERN: "Modern",
};

// Helper function to create NFTItem from catalog item
function createNFTItem(catalogItem, probability) {
  const rarityMap = {
    0: Rarity.COMMON,
    1: Rarity.RARE,
    2: Rarity.EPIC,
    3: Rarity.LEGENDARY,
  };

  const versionMap = {
    0: Version.VINTAGE,
    1: Version.MODERN,
  };

  return {
    id: `${catalogItem.rarity}-${catalogItem.version}`,
    name: catalogItem.name,
    symbol: `TD${catalogItem.rarity}${catalogItem.version}`,
    uri: `/api/metadata/${catalogItem.rarity}/${catalogItem.version}`,
    rarity: rarityMap[catalogItem.rarity],
    version: versionMap[catalogItem.version],
    probability,
    hashRange: catalogItem.hashRange,
    dailyYield: catalogItem.dailyYield,
  };
}

// Provably Fair function to determine NFT reward based on transaction hash
function getProvablyFairItem(transactionHash) {
  // Convert transaction hash to a number between 0-99
  const hashValue = parseInt(transactionHash.slice(-8), 16) % 100;

  console.log(`🎲 Provably Fair: hashValue = ${hashValue}`);

  let catalogItem;
  let probability;

  // Find the item that matches the hash value using probability ranges
  // Common Vintage: 0-41 (42% chance)
  if (hashValue >= 0 && hashValue <= 41) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 0 && item.version === 0
    );
    probability = 0.42;
    console.log(`🎯 Selected: ${catalogItem.name} (42% chance)`);
  }
  // Common Modern: 42-69 (28% chance)
  else if (hashValue >= 42 && hashValue <= 69) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 0 && item.version === 1
    );
    probability = 0.28;
    console.log(`🎯 Selected: ${catalogItem.name} (28% chance)`);
  }
  // Rare Vintage: 70-84 (15% chance)
  else if (hashValue >= 70 && hashValue <= 84) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 1 && item.version === 0
    );
    probability = 0.15;
    console.log(`🎯 Selected: ${catalogItem.name} (15% chance)`);
  }
  // Rare Modern: 85-94 (10% chance)
  else if (hashValue >= 85 && hashValue <= 94) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 1 && item.version === 1
    );
    probability = 0.1;
    console.log(`🎯 Selected: ${catalogItem.name} (10% chance)`);
  }
  // Epic Vintage: 95-96 (~3% chance)
  else if (hashValue >= 95 && hashValue <= 96) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 2 && item.version === 0
    );
    probability = 0.03;
    console.log(`🎯 Selected: ${catalogItem.name} (~3% chance)`);
  }
  // Epic Modern: 97-98 (~2% chance)
  else if (hashValue >= 97 && hashValue <= 98) {
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 2 && item.version === 1
    );
    probability = 0.02;
    console.log(`🎯 Selected: ${catalogItem.name} (~2% chance)`);
  }
  // Legendary: 99 (~2% chance total) - alternar entre vintage e modern baseado no último dígito
  else if (hashValue === 99) {
    const lastDigit = parseInt(transactionHash.slice(-1), 16) % 2;
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 3 && item.version === lastDigit
    );
    probability = 0.02;
    console.log(`🎯 Selected: ${catalogItem.name} (Legendary - ~2% chance)`);
  } else {
    // Fallback (shouldn't happen with proper ranges 0-99)
    console.warn(
      `⚠️ Unexpected hashValue: ${hashValue}, returning common-vintage`
    );
    catalogItem = CAR_CATALOG.find(
      (item) => item.rarity === 0 && item.version === 0
    );
    probability = 0.42;
  }

  const selectedItem = createNFTItem(catalogItem, probability);
  return selectedItem;
}

// Fisher-Yates shuffle with seed for deterministic results
function shuffleArray(array, seed) {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  // Simple seeded random number generator
  let randomSeed = seed;
  const random = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280;
    return randomSeed / 233280;
  };

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;

    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}

// Function to generate unique hashes for multiple lootboxes
function generateLootboxHashes(burnTxSignature, lootboxAmount) {
  const results = [];

  // For guaranteed diversity, assign different cars directly based on lootbox index
  // This ensures each lootbox gets a unique car from the catalog

  // Get all available cars from the catalog
  const availableCars = CAR_CATALOG.map((car, index) => ({
    ...car,
    catalogIndex: index
  }));

  // Shuffle the cars using the transaction hash as seed for deterministic but random ordering
  const seed = parseInt(burnTxSignature.slice(-8), 16);
  const shuffledCars = shuffleArray(availableCars, seed);

  for (let i = 0; i < lootboxAmount; i++) {
    // Select car based on index, cycling through shuffled catalog if needed
    const carIndex = i % shuffledCars.length;
    const selectedCar = shuffledCars[carIndex];

    // Create NFT item directly from the selected car
    const rewardItem = createNFTItem(selectedCar, 0); // Probability not relevant for guaranteed diversity

    console.log(`🎯 Generating reward ${i + 1}/${lootboxAmount}: ${rewardItem.name} (guaranteed unique car ${carIndex + 1}/${shuffledCars.length})`);
    console.log(`✅ Generated: ${rewardItem.rarity} ${rewardItem.version} - ${rewardItem.name}`);

    results.push({
      index: i + 1,
      carIndex: carIndex + 1,
      totalCars: shuffledCars.length,
      rewardItem: rewardItem
    });
  }

  return results;
}

// Test function
function runTests() {
  console.log('🧪 Running Lootbox Hash Generation Tests\n');

  // Test with different transaction hashes
  const testHashes = [
    '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  ];

  const testAmounts = [1, 5, 10];

  testHashes.forEach((testHash, hashIndex) => {
    console.log(`\n🔄 Testing with Hash ${hashIndex + 1}: ${testHash.slice(0, 20)}...`);

    testAmounts.forEach(amount => {
      console.log(`\n📦 Testing ${amount} lootbox${amount > 1 ? 'es' : ''}:`);

      const results = generateLootboxHashes(testHash, amount);

      // Check for uniqueness
      const carNames = results.map(r => r.rewardItem.name);
      const uniqueNames = new Set(carNames);

      console.log(`\n📊 Results for ${amount} lootbox${amount > 1 ? 'es' : ''}:`);
      console.log(`   Unique cars: ${uniqueNames.size}/${amount}`);
      console.log(`   Car distribution:`, carNames);

      if (uniqueNames.size < amount) {
        console.log(`   ❌ WARNING: Only ${uniqueNames.size} unique cars out of ${amount} lootboxes!`);
      } else {
        console.log(`   ✅ SUCCESS: All ${amount} lootboxes generated unique cars!`);
      }

      // Show car indices
      console.log(`   Car indices:`, results.map(r => `${r.carIndex}/${r.totalCars}`));
    });
  });
}

// Run the tests
runTests();
