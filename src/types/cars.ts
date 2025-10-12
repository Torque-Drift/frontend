// ============================================================================
// CENTRALIZED TYPES FOR CAR-RELATED DATA
// ============================================================================

// Rarity enum values
export type CarRarity = "Common" | "Uncommon" | "Epic" | "Legendary";
export type CarRarityNumber = 0 | 1 | 2 | 3; // Common, Uncommon, Epic, Legendary

// Version enum values
export type CarVersion = "Vintage" | "Modern";
export type CarVersionNumber = 0 | 1; // Vintage, Modern

// ============================================================================
// BLOCKCHAIN TYPES (from Solana program)
// ============================================================================

export interface CarState {
  mint: any; // PublicKey from Solana
  rarity: CarRarityNumber;
  version: CarVersionNumber;
  hashPower: number;
  owner: any; // PublicKey from Solana
}

// ============================================================================
// UI TYPES (simplified for frontend)
// ============================================================================

export interface CarInventoryData {
  mint: string;
  rarity: CarRarityNumber;
  version: CarVersionNumber;
  hashPower: number;
  efficiency: number; // Eficiência em porcentagem (ex: 100.0 para 100%)
  owner: string;
  isEquipped: boolean;
  slotIndex?: number; // Slot position for equipped cars
  image: string;
  name: string;
  description: string;
  dailyYield: number;
  cooldown: number;
  roi: number;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface CarStats {
  totalCars: number;
  equippedCars: number;
  unequippedCars: number;
  totalHashPower: number;
  equippedHashPower: number;
  unequippedHashPower: number;
  rarityCount: Record<string, number>;
}

export interface Car {
  id: string;
  name: string;
  rarity: CarRarity;
  version: CarVersion;
  hp: number;
  hashRange: string;
  cooldown: number;
  dailyYield: number;
  roi: number;
  equipped: boolean;
  maintenanceDue?: Date;
  isBlocked?: boolean;
  overclockActive?: boolean;
}

export interface MiningStats {
  totalHp: number;
  currentYield: number;
  nextClaimTime: number;
  lockBoost: number;
  globalBaseRate: number;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

// Types for equipped slots data
export interface EquippedSlotData {
  slotIndex: number;
  isEmpty: boolean;
  car: CarInventoryData | null;
}

export interface EquippedSlotsData {
  slots: EquippedSlotData[];
  totalEquipped: number;
  totalHashPower: number;
  totalHashPowerFormatted: string;
}

// Types for inventory data
export interface InventoryData {
  cars: CarInventoryData[];
  totalOwned: number;
  totalInventoryHashPower: number;
  totalInventoryHashPowerFormatted: string;
  equippedSlots: boolean[];
}

export interface UseCarsInventoryReturn {
  // Data
  cars: CarInventoryData[];
  equippedCars: CarInventoryData[];
  unequippedCars: CarInventoryData[];

  // Stats
  carStats: CarStats;

  // New structured data
  equippedSlotsData?: EquippedSlotsData | null;
  inventoryData?: InventoryData | null;

  // Legacy compatibility (to be removed after migration)
  totalOwned: number;
  totalInventoryHashPower: number;

  // Loading states
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;

  // Utility booleans
  hasCars: boolean;
  hasEquippedCars: boolean;
  hasUnequippedCars: boolean;

  // Equipment actions
  equip: (car: CarInventoryData, slotIndex: number) => void;
  unequip: (slotIndex: number, carMint?: string) => void;
  performCarMaintenance: (carMint: string) => void;
  getEquippedCount: () => number;
  getTotalHashPower: () => number;
  isSlotEquipping: (slotIndex: number) => boolean;
  isSlotUnequipping: (slotIndex: number) => boolean;
  isSlotOccupied: (slotIndex: number) => boolean;
  isCarUnderMaintenance: (carMint: string) => boolean;

  // Equipment state
  equipData?: any;
  unequipData?: any;
  maintenanceData?: any;
  isEquipping: boolean;
  isUnequipping: boolean;
  isMaintaining: boolean;
  equipError?: Error | null;
  unequipError?: Error | null;
  maintenanceError?: Error | null;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getRarityName = (rarity: CarRarityNumber): CarRarity => {
  const rarityNames: CarRarity[] = ["Common", "Uncommon", "Epic", "Legendary"];
  return rarityNames[rarity] || "Common";
};

export const getVersionName = (version: CarVersionNumber): CarVersion => {
  const versionNames: CarVersion[] = ["Vintage", "Modern"];
  return versionNames[version] || "Vintage";
};

export const convertEquippedToSlots = (
  equippedCars: CarInventoryData[]
): (CarInventoryData | null)[] => {
  const slots: (CarInventoryData | null)[] = new Array(5).fill(null);
  equippedCars.forEach((car, index) => {
    if (index < 5) {
      slots[index] = car;
    }
  });
  return slots;
};
