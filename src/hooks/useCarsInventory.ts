import { useCallback, useMemo, useState } from "react";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { CAR_CATALOG, CONTRACT_ADDRESSES } from "@/constants";
import {
  TorqueDriftCars__factory,
  TorqueDriftGame__factory,
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
  return (
    CAR_CATALOG.find(
      (car) => car.rarity === rarity && car.version === version
    ) || CAR_CATALOG[0]
  );
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

  const tx = await gameContract["performMaintenance(address)"](carAddress);
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

      const carsContract = TorqueDriftCars__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftCars,
        provider
      );

      const inventory = await carsContract.getUserInventory(address);

      const [ownedCars, totalOwned, totalHashPower] = inventory;

      const cars: CarInventoryData[] = [];
      for (const car of ownedCars) {
        const rarity = Number(car.rarity) || 0;
        const version = Number(car.version) || 0;
        const slotIndex = Number(car.slotIndex);
        const isEquipped = slotIndex !== 255; // 255 means not equipped
        const catalogData = getCarCatalogData(rarity, version);

        cars.push({
          mint: car.mint,
          rarity: rarity as 0 | 1 | 2 | 3,
          version: version as 0 | 1,
          hashPower: Number(car.hashPower) || 0,
          efficiency: Number(car.efficiency) / 100 || 0,
          owner: address || "",
          isEquipped,
          slotIndex: isEquipped ? slotIndex : undefined,
          image: catalogData.image,
          name: catalogData.name,
          description: catalogData.description,
          dailyYield: catalogData.dailyYield,
        });
      }

      // Create equipped slots array based on the cars data
      const equippedSlots = new Array(5).fill(false);
      cars.forEach((car) => {
        if (
          car.isEquipped &&
          car.slotIndex !== undefined &&
          car.slotIndex < 5
        ) {
          equippedSlots[car.slotIndex] = true;
        }
      });

      return {
        cars,
        totalOwned: Number(totalOwned),
        totalInventoryHashPower: Number(totalHashPower),
        totalInventoryHashPowerFormatted: formatHashPower(totalHashPower),
        equippedSlots,
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
  const equippedSlotsData = useMemo(() => {
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
      if (
        error instanceof Error &&
        error.message.includes("user rejected action")
      ) {
        toast.error("User rejected action");
        return;
      } else if (
        error instanceof Error &&
        error.message.includes("Car not found")
      ) {
        toast.error("Car not found");
        return;
      } else if (
        error instanceof Error &&
        error.message.includes("Invalid slot index")
      ) {
        toast.error("Invalid slot index");
        return;
      } else if (
        error instanceof Error &&
        error.message.includes("Wallet not connected")
      ) {
        toast.error("Wallet not connected");
        return;
      }
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
      if (
        error instanceof Error &&
        error.message.includes("user rejected action")
      ) {
        toast.error("User rejected action");
        return;
      } else if (
        error instanceof Error &&
        error.message.includes("Car not found")
      ) {
        toast.error("Car not found");
        return;
      } else if (
        error instanceof Error &&
        error.message.includes("Invalid slot index")
      ) {
        toast.error("Invalid slot index");
        return;
      } else if (
        error instanceof Error &&
        error.message.includes("Wallet not connected")
      ) {
        toast.error("Wallet not connected");
        return;
      }
    },
  });

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
