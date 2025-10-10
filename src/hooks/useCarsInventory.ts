import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESSES } from "@/constants";
import {
  TorqueDriftViews__factory,
  TorqueDriftGame__factory,
  TorqueDriftCars__factory,
} from "@/contracts";
import { useEthers } from "./useEthers";
import { CarInventoryData, UseCarsInventoryReturn } from "@/types/cars";

async function onEquipCar(signer: any, carMint: string, slotIndex: number) {
  if (!signer) throw new Error("Wallet not connected");

  const gameContract = TorqueDriftGame__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftGame,
    signer
  );

  try {
    const tx = await gameContract.equipCar(carMint, slotIndex);
    const receipt = await tx.wait();
    console.log("Car equipped successfully:", receipt?.hash);
    return receipt?.hash || tx.hash;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

async function onUnequipCar(
  signer: any,
  carAddress: string,
  slotIndex: number
) {
  if (!signer) throw new Error("Wallet not connected");

  const gameContract = TorqueDriftGame__factory.connect(
    CONTRACT_ADDRESSES.TorqueDriftGame,
    signer
  );

  try {
    const tx = await gameContract.unequipCar(carAddress, slotIndex);
    const receipt = await tx.wait();
    console.log("Car unequipped successfully:", receipt?.hash);
    return receipt?.hash || tx.hash;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

export const useCarsInventory = (): UseCarsInventoryReturn => {
  const { signer, address, isConnected } = useEthers();
  const queryClient = useQueryClient();

  const [equippingSlots, setEquippingSlots] = useState<Set<number>>(new Set());
  const [unequippingSlots, setUnequippingSlots] = useState<Set<number>>(
    new Set()
  );

  // Query para dados completos do inventário
  const { data: inventoryData } = useQuery({
    queryKey: ["userInventory", address],
    queryFn: async () => {
      if (!address || !signer) throw new Error("Wallet not connected");

      try {
        const provider = signer.provider || (signer as any).provider;
        if (!provider) {
          console.warn("No provider available for inventory query");
          return null;
        }

        const viewsContract = TorqueDriftViews__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftViews,
          provider
        );

        const userInventory = await viewsContract.getUserInventory(address);

        return {
          user: userInventory.user,
          totalOwned: Number(userInventory.totalOwned),
          totalInventoryHashPower: Number(
            userInventory.totalInventoryHashPower
          ),
          equippedSlots: userInventory.equippedSlots.map((slot: bigint) =>
            Number(slot)
          ) as [number, number, number, number, number],
        };
      } catch (error) {
        console.error("Error fetching user inventory data:", error);
        return null;
      }
    },
    enabled: !!address && isConnected,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: cars = [],
    isLoading,
    error,
    refetch: refetchCars,
  } = useQuery<CarInventoryData[]>({
    queryKey: ["carsInventory", address],
    queryFn: async (): Promise<CarInventoryData[]> => {
      if (!address || !signer) throw new Error("Wallet not connected");

      try {
        const provider = signer.provider || (signer as any).provider;
        if (!provider) {
          console.warn("No provider available for inventory query");
          return [];
        }

        const carsContract = TorqueDriftCars__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftCars,
          provider
        );

        const userInventory = await carsContract.getUserInventory(address);

        return userInventory.ownedCars.map((car: any, index: number) => {
          const slotIndex = Number(car.slotIndex);
          const isEquipped = slotIndex !== 255;
          return {
            mint: car.mint || `0x${index.toString().padStart(40, "0")}`,
            rarity: (Number(car.rarity) || 0) as 0 | 1 | 2 | 3,
            version: (Number(car.version) || 0) as 0 | 1,
            hashPower: Number(car.hashPower) || 0,
            owner: address || "",
            isEquipped,
            slotIndex: isEquipped ? slotIndex : undefined,
            image: `/images/cars/${Number(car.rarity) || 0}.png`,
            name: `Car #${index + 1}`,
            description: "A racing car",
            dailyYield: 0, // TODO: Calcular baseado no hashPower
            cooldown: 0,
            roi: 0,
          };
        });
      } catch (error) {
        console.error("Error fetching user inventory:", error);
        // Return empty array on error to prevent breaking the UI
        return [];
      }
    },
    enabled: !!address && isConnected,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const equippedCars = cars.filter((car) => car.isEquipped);
  const unequippedCars = cars.filter((car) => !car.isEquipped);
  const totalHashPower = cars.reduce((sum, car) => sum + car.hashPower, 0);
  const equippedHashPower = equippedCars.reduce(
    (sum, car) => sum + car.hashPower,
    0
  );

  // Car stats
  const carStats = {
    totalCars: cars.length,
    equippedCars: equippedCars.length,
    unequippedCars: unequippedCars.length,
    totalHashPower,
    equippedHashPower,
    unequippedHashPower: totalHashPower - equippedHashPower,
    rarityCount: cars.reduce((acc, car) => {
      const rarityNames = ["Common", "Rare", "Epic", "Legendary"];
      const rarityName = rarityNames[car.rarity] || "Common";
      acc[rarityName] = (acc[rarityName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

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

        if (car.isEquipped) {
          throw new Error("Car is already equipped");
        }

        if (
          inventoryData?.equippedSlots &&
          inventoryData.equippedSlots[slotIndex] === 1
        ) {
          throw new Error("Slot is already occupied");
        }

        const equipTxSignature = await onEquipCar(signer, car.mint, slotIndex);
        await refetchCars();
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
      queryClient.invalidateQueries({
        queryKey: ["carsInventory", address],
      });
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

        const equippedCar = equippedCars.find(
          (car) => car.slotIndex === slotIndex
        );
        if (!equippedCar) {
          throw new Error(`No car equipped in slot ${slotIndex}`);
        }

        const unequipTxSignature = await onUnequipCar(
          signer,
          equippedCar.mint,
          slotIndex
        );
        await refetchCars();
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
      queryClient.invalidateQueries({
        queryKey: ["carsInventory", address],
      });
    },
    onError: (error) => {
      toast.error(
        `Failed to unequip car: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

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

  const getEquippedCount = useCallback(() => {
    return equippedCars.length;
  }, [equippedCars]);

  const getTotalHashPower = useCallback(() => {
    return equippedCars.reduce((total, car) => {
      return total + (car?.hashPower || 0);
    }, 0);
  }, [equippedCars]);

  const isSlotEquipping = useCallback(
    (slotIndex: number) => equippingSlots.has(slotIndex),
    [equippingSlots]
  );

  const isSlotOccupied = useCallback(
    (slotIndex: number) => {
      // First check if we have inventory data with equippedSlots
      if (inventoryData?.equippedSlots) {
        return inventoryData.equippedSlots[slotIndex] === 1;
      }

      // Fallback: check if any car is equipped in this slot
      return equippedCars.some((car) => car.slotIndex === slotIndex);
    },
    [inventoryData?.equippedSlots, equippedCars]
  );

  const isSlotUnequipping = useCallback(
    (slotIndex: number) => unequippingSlots.has(slotIndex),
    [unequippingSlots]
  );

  return {
    cars,
    equippedCars,
    unequippedCars,

    carStats,

    // Dados do inventário completo
    inventoryData,
    totalOwned: inventoryData?.totalOwned || cars.length,
    totalInventoryHashPower:
      inventoryData?.totalInventoryHashPower || totalHashPower,
    equippedSlots: inventoryData?.equippedSlots || [0, 0, 0, 0, 0],

    isLoading,
    error,
    refetch: refetchCars,

    hasCars: cars.length > 0,
    hasEquippedCars: equippedCars.length > 0,
    hasUnequippedCars: unequippedCars.length > 0,

    equip,
    unequip,
    getEquippedCount,
    getTotalHashPower,
    isSlotEquipping,
    isSlotUnequipping,
    isSlotOccupied,

    equipData: equipMutation.data,
    unequipData: unequipMutation.data,
    isEquipping: equipMutation.isPending,
    isUnequipping: unequipMutation.isPending,
    equipError: equipMutation.error,
    unequipError: unequipMutation.error,
  };
};
