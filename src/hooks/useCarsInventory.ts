import { useCallback, useMemo, useState } from "react";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "@/constants";
import {
  TorqueDriftGame__factory,
  TorqueDriftViews__factory,
} from "@/contracts";
import { useEthers } from "./useEthers";
import { CarInventoryData, UseCarsInventoryReturn } from "@/types/cars";

// ==========================================
// 🎨 UTILITY FUNCTIONS
// ==========================================

function formatHashPower(hashPower: bigint | number): string {
  const numHashPower =
    typeof hashPower === "bigint" ? Number(hashPower) : hashPower;
  const billions = numHashPower / 1_000_000_000;
  if (billions >= 1) return `${billions.toFixed(2)}B HP`;
  const millions = numHashPower / 1_000_000;
  if (millions >= 1) return `${millions.toFixed(2)}M HP`;
  return `${numHashPower.toLocaleString()} HP`;
}

function getCarCatalogData(rarity: number, version: number) {
  const catalogMap: Record<string, any> = {
    "0-0": {
      name: "Chevrolet Bel Air 1955",
      description:
        "The classic American beauty from the 1950s. This rock 'n' roll era icon combines vintage elegance with reliable performance.",
      image: "/images/common_0.png",
      hashRange: [10, 18],
      cooldown: 12,
      dailyYield: 0.931,
      roi: 12.53,
    },
    "0-1": {
      name: "UNO With Stairs",
      description:
        "A modern and creative take on the classic Fiat Uno. This compact urban vehicle features external stairs for easy rooftop access.",
      image: "/images/common_1.png",
      hashRange: [15, 25],
      cooldown: 11,
      dailyYield: 1.33,
      roi: 8.77,
    },
    "1-0": {
      name: "Rare Vintage Car",
      description:
        "A rare gem from the vintage collection. This classic vehicle has been meticulously restored with attention to original details.",
      image: "/images/rare_0.png",
      hashRange: [26, 40],
      cooldown: 9,
      dailyYield: 2.194,
      roi: 5.32,
    },
    "1-1": {
      name: "Golf GTI 2025",
      description:
        "The ultimate evolution of the sporty hatchback. With cutting-edge technology and aerodynamic design.",
      image: "/images/rare_1.png",
      hashRange: [34, 50],
      cooldown: 8,
      dailyYield: 2.792,
      roi: 4.18,
    },
    "2-0": {
      name: "Epic Vintage Car",
      description:
        "A masterpiece of vintage engineering. This legendary vehicle combines classic elegance with modern modifications.",
      image: "/images/epic_0.png",
      hashRange: [51, 63],
      cooldown: 6,
      dailyYield: 3.79,
      roi: 3.08,
    },
    "2-1": {
      name: "Red Car",
      description:
        "A fiery red speedster that turns heads wherever it goes. Its vibrant color symbolizes passion and speed.",
      image: "/images/epic_1.png",
      hashRange: [60, 75],
      cooldown: 5,
      dailyYield: 4.488,
      roi: 2.6,
    },
    "3-0": {
      name: "Chevrolet Impala 1967",
      description:
        "The ultimate muscle car from the classic era. This 1967 Impala represents the pinnacle of American power.",
      image: "/images/legendary_0.png",
      hashRange: [76, 88],
      cooldown: 4,
      dailyYield: 5.452,
      roi: 2.14,
    },
    "3-1": {
      name: "Dodge Challenger Black 2023",
      description:
        "Absolute darkness meets maximum speed. This midnight black Challenger combines muscle car heritage with cutting-edge technology.",
      image: "/images/legendary_1.png",
      hashRange: [84, 100],
      cooldown: 3,
      dailyYield: 6.117,
      roi: 1.91,
    },
  };

  const key = `${rarity}-${version}`;
  return catalogMap[key] || catalogMap["0-0"];
}

// ==========================================
// 🔄 CONTRACT INTERACTIONS
// ==========================================

async function equipCar(signer: any, carMint: string, slotIndex: number) {
  if (!signer) throw new Error("Wallet not connected");

  const gameContract = TorqueDriftGame__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftGame,
    signer
  );

  const tx = await gameContract.equipCar(carMint, slotIndex);
  const receipt = await tx.wait();
  return receipt?.hash || tx.hash;
}

async function unequipCar(signer: any, carAddress: string, slotIndex: number) {
  if (!signer) throw new Error("Wallet not connected");

  const gameContract = TorqueDriftGame__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftGame,
    signer
  );

  const tx = await gameContract.unequipCar(carAddress, slotIndex);
  const receipt = await tx.wait();
  return receipt?.hash || tx.hash;
}

async function performMaintenance(signer: any, carAddress: string) {
  if (!signer) throw new Error("Wallet not connected");

  const gameContract = TorqueDriftGame__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftGame,
    signer
  );

  const tx = await gameContract.performMaintenance(carAddress);
  const receipt = await tx.wait();
  return receipt?.hash || tx.hash;
}

export const useCarsInventory = (): UseCarsInventoryReturn => {
  const { signer, address, isConnected } = useEthers();
  const queryClient = useQueryClient();

  const [equippingSlots, setEquippingSlots] = useState<Set<number>>(new Set());
  const [unequippingSlots, setUnequippingSlots] = useState<Set<number>>(
    new Set()
  );
  const [maintainingCars, setMaintainingCars] = useState<Set<string>>(
    new Set()
  );

  // ==========================================
  // 📦 INVENTORY QUERY
  // ==========================================
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useQuery({
    queryKey: ["userInventory", address],
    queryFn: async () => {
      if (!address || !signer) throw new Error("Wallet not connected");

      const provider = signer.provider || (signer as any).provider;
      if (!provider) {
        return {
          cars: [],
          totalOwned: 0,
          totalInventoryHashPower: 0,
          totalInventoryHashPowerFormatted: "0 HP",
          equippedSlots: [false, false, false, false, false],
        };
      }

      const views = TorqueDriftViews__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftViews,
        provider
      );

      const userInventoryViews = await views.getUserInventory(address);
      const [
        user,
        ownedCars,
        carsEfficiency,
        totalOwned,
        totalInventoryHashPower,
        equippedSlots,
      ] = userInventoryViews;

      const cars: CarInventoryData[] = [];
      for (const car of ownedCars) {
        const rarity = Number(car.rarity) || 0;
        const version = Number(car.version) || 0;
        const catalogData = getCarCatalogData(rarity, version);
        const slotIndexNum = Number(car.slotIndex);
        const isEquipped = slotIndexNum < 5;

        cars.push({
          mint: car.mint,
          rarity: rarity as 0 | 1 | 2 | 3,
          version: version as 0 | 1,
          hashPower: Number(car.hashPower) || 0,
          efficiency: Number(car.efficiency) / 100 || 0,
          owner: address || "",
          isEquipped,
          slotIndex: isEquipped ? slotIndexNum : undefined,
          image: catalogData.image,
          name: catalogData.name,
          description: catalogData.description,
          dailyYield: catalogData.dailyYield,
          cooldown: catalogData.cooldown,
          roi: catalogData.roi,
        });
      }

      return {
        cars,
        totalOwned: Number(totalOwned),
        totalInventoryHashPower: Number(totalInventoryHashPower),
        totalInventoryHashPowerFormatted: formatHashPower(
          totalInventoryHashPower
        ),
        equippedSlots: equippedSlots.map((slot) => Number(slot) === 1),
      };
    },
    enabled: !!address && isConnected,
    staleTime: 30000,
    gcTime: 300000,
    retry: 2,
    retryDelay: 1000,
  });

  // ==========================================
  // 🎯 EQUIPPED SLOTS DATA
  // ==========================================
  const equippedSlotsData = React.useMemo(() => {
    if (!inventoryData?.cars) {
      return {
        slots: new Array(5).fill(null).map((_, i) => ({
          slotIndex: i,
          isEmpty: true,
          car: null,
        })),
        totalEquipped: 0,
        totalHashPower: 0,
        totalHashPowerFormatted: "0 HP",
      };
    }

    const slots: any[] = new Array(5).fill(null).map((_, i) => ({
      slotIndex: i,
      isEmpty: true,
      car: null,
    }));

    const equippedCars = inventoryData.cars.filter((car) => car.isEquipped);

    equippedCars.forEach((car) => {
      if (
        car.slotIndex !== undefined &&
        car.slotIndex >= 0 &&
        car.slotIndex < 5
      ) {
        slots[car.slotIndex] = {
          slotIndex: car.slotIndex,
          isEmpty: false,
          car: car,
        };
      }
    });

    const totalHashPower = equippedCars.reduce(
      (sum, car) => sum + car.hashPower,
      0
    );

    return {
      slots,
      totalEquipped: equippedCars.length,
      totalHashPower,
      totalHashPowerFormatted: formatHashPower(totalHashPower),
    };
  }, [inventoryData?.cars]);

  // ==========================================
  // 📊 CAR STATISTICS
  // ==========================================
  const allCars = inventoryData?.cars || [];
  const equippedCars = allCars.filter((car) => car.isEquipped);
  const unequippedCars = allCars.filter((car) => !car.isEquipped);

  const carStats = useMemo(
    () => ({
      totalCars: allCars.length,
      equippedCars: equippedCars.length,
      unequippedCars: unequippedCars.length,
      totalHashPower: inventoryData?.totalInventoryHashPower || 0,
      equippedHashPower: equippedSlotsData?.totalHashPower || 0,
      unequippedHashPower:
        (inventoryData?.totalInventoryHashPower || 0) -
        (equippedSlotsData?.totalHashPower || 0),
      rarityCount: allCars.reduce((acc, car) => {
        acc[car.rarity] = (acc[car.rarity] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    }),
    [
      allCars,
      equippedCars.length,
      unequippedCars.length,
      inventoryData?.totalInventoryHashPower,
      equippedSlotsData?.totalHashPower,
    ]
  );
  
  const equipMutation = useMutation({
    mutationFn: async ({
      car,
      slotIndex,
    }: {
      car: CarInventoryData;
      slotIndex: number;
    }) => {
      setEquippingSlots((prev) => new Set([...prev, slotIndex]));
      try {
        if (!signer || !isConnected || !address) {
          throw new Error("Wallet not connected or signer not available");
        }

        if (equippedSlotsData?.slots[slotIndex]?.isEmpty === false) {
          throw new Error("Slot is already occupied");
        }

        const equipTxSignature = await equipCar(signer, car.mint, slotIndex);
        await refetchInventory();
        toast.success(`Car equipped successfully in slot ${slotIndex + 1}!`);
        return { equipTxSignature };
      } finally {
        setEquippingSlots((prev) => {
          const newSet = new Set(prev);
          newSet.delete(slotIndex);
          return newSet;
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInventory", address] });
    },
    onError: (error) => {
      toast.error(
        `Failed to equip car: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  const unequipMutation = useMutation({
    mutationFn: async ({ slotIndex }: { slotIndex: number }) => {
      setUnequippingSlots((prev) => new Set([...prev, slotIndex]));
      try {
        if (!signer || !isConnected || !address) {
          throw new Error("Wallet not connected or signer not available");
        }

        const equippedCar = equippedSlotsData?.slots[slotIndex]?.car;
        if (!equippedCar) {
          throw new Error(`No car equipped in slot ${slotIndex}`);
        }

        const unequipTxSignature = await unequipCar(
          signer,
          equippedCar.mint,
          slotIndex
        );
        await refetchInventory();
        toast.success(
          `Car unequipped successfully from slot ${slotIndex + 1}!`
        );

        return { unequipTxSignature };
      } finally {
        setUnequippingSlots((prev) => {
          const newSet = new Set(prev);
          newSet.delete(slotIndex);
          return newSet;
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInventory", address] });
    },
    onError: (error) => {
      toast.error(
        `Failed to unequip car: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  // ==========================================
  // 🔧 MAINTENANCE MUTATION
  // ==========================================
  const maintenanceMutation = useMutation({
    mutationFn: async ({ carMint }: { carMint: string }) => {
      setMaintainingCars((prev) => new Set([...prev, carMint]));
      try {
        if (!signer || !isConnected || !address) {
          throw new Error("Wallet not connected or signer not available");
        }

        const maintenanceTxSignature = await performMaintenance(
          signer,
          carMint
        );
        await refetchInventory();
        toast.success("Car maintenance completed successfully!");
        return { maintenanceTxSignature };
      } finally {
        setMaintainingCars((prev) => {
          const newSet = new Set(prev);
          newSet.delete(carMint);
          return newSet;
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInventory", address] });
    },
    onError: (error) => {
      toast.error(
        `Failed to perform maintenance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  // ==========================================
  // 🎯 CALLBACK FUNCTIONS
  // ==========================================
  const equip = useCallback(
    (car: CarInventoryData, slotIndex: number) => {
      equipMutation.mutate({ car, slotIndex });
    },
    [equipMutation]
  );

  const unequip = useCallback(
    (slotIndex: number) => {
      unequipMutation.mutate({ slotIndex });
    },
    [unequipMutation]
  );

  const isSlotEquipping = useCallback(
    (slotIndex: number) => equippingSlots.has(slotIndex),
    [equippingSlots]
  );

  const isSlotOccupied = useCallback(
    (slotIndex: number) =>
      equippedSlotsData?.slots[slotIndex]?.isEmpty === false,
    [equippedSlotsData]
  );

  const isSlotUnequipping = useCallback(
    (slotIndex: number) => unequippingSlots.has(slotIndex),
    [unequippingSlots]
  );

  const performCarMaintenance = useCallback(
    (carMint: string) => {
      maintenanceMutation.mutate({ carMint });
    },
    [maintenanceMutation]
  );

  const isCarUnderMaintenance = useCallback(
    (carMint: string) => maintainingCars.has(carMint),
    [maintainingCars]
  );

  // ==========================================
  // 📤 RETURN OBJECT
  // ==========================================
  return {
    // Car collections
    cars: allCars,
    equippedCars,
    unequippedCars,

    // Statistics
    carStats,
    equippedSlotsData,

    // Inventory totals
    inventoryData,
    totalOwned: inventoryData?.totalOwned || 0,
    totalInventoryHashPower: inventoryData?.totalInventoryHashPower || 0,

    // State management
    isLoading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,

    // Boolean flags
    hasCars: allCars.length > 0,
    hasEquippedCars: equippedCars.length > 0,
    hasUnequippedCars: unequippedCars.length > 0,

    // Actions
    equip,
    unequip,
    performCarMaintenance,
    getEquippedCount: () => equippedSlotsData?.totalEquipped || 0,
    getTotalHashPower: () => equippedSlotsData?.totalHashPower || 0,

    // Slot states
    isSlotEquipping,
    isSlotUnequipping,
    isSlotOccupied,
    isCarUnderMaintenance,

    // Mutation states
    equipData: equipMutation.data,
    unequipData: unequipMutation.data,
    maintenanceData: maintenanceMutation.data,
    isEquipping: equipMutation.isPending,
    isUnequipping: unequipMutation.isPending,
    isMaintaining: maintenanceMutation.isPending,
    equipError: equipMutation.error,
    unequipError: unequipMutation.error,
    maintenanceError: maintenanceMutation.error,
  };
};

