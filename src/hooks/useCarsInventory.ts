import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { CarService } from "@/services/car/carService";
import { GLOBAL_STATE_ADDRESS, PROGRAM_ID } from "@/constants";
import { CarInventoryData, UseCarsInventoryReturn } from "@/types/cars";

async function onEquipCar(
  provider: AnchorProvider,
  carMint: string,
  slotIndex: number
) {
  if (!provider.wallet.publicKey) throw new Error("Wallet not connected");

  const idl = await Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) throw new Error("IDL not found");

  const program = new Program(idl, provider);

  const userStateAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("user_state"), provider.wallet.publicKey.toBuffer()],
    new PublicKey(PROGRAM_ID)
  )[0];

  try {
    const userStateData = await (program.account as any).userState.fetch(
      userStateAddress
    );
    if (!userStateData.gameStarted) {
      console.error("User has not started the game yet!");
      return;
    }
  } catch (error) {
    console.error("User not found! Initialize first.");
    return;
  }

  const carStatePDA = new PublicKey(carMint);

  try {
    const carStateData = await (program.account as any).carState.fetch(
      carStatePDA
    );
    if (
      carStateData.owner.toString() !== provider.wallet.publicKey.toString()
    ) {
      console.error("This car does not belong to you!");
      return;
    }
  } catch (error) {
    console.error("Error equipping car:", error);
    return;
  }

  try {
    const signature = await program.methods
      .equipCar(slotIndex)
      .accounts({
        user: provider.wallet.publicKey,
        userState: userStateAddress,
        globalState: new PublicKey(GLOBAL_STATE_ADDRESS),
        carState: carStatePDA,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    console.log("Transaction successful:", signature);
    return signature;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

async function onUnequipCar(
  provider: AnchorProvider,
  slotIndex: number,
  carMint: string
) {
  if (!provider.wallet.publicKey) throw new Error("Wallet not connected");

  const idl = await Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) throw new Error("IDL not found");

  const program = new Program(idl, provider);

  const userStateAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("user_state"), provider.wallet.publicKey.toBuffer()],
    new PublicKey(PROGRAM_ID)
  )[0];

  const carStatePDA = new PublicKey(carMint);

  try {
    const signature = await program.methods
      .unequipCar(slotIndex)
      .accounts({
        user: provider.wallet.publicKey,
        userState: userStateAddress,
        globalState: new PublicKey(GLOBAL_STATE_ADDRESS),
        carState: carStatePDA,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    return signature;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

export const useCarsInventory = (): UseCarsInventoryReturn => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  const carService = new CarService();

  const {
    data: cars = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CarInventoryData[]>({
    queryKey: ["carsInventory", publicKey?.toBase58()],
    queryFn: async (): Promise<CarInventoryData[]> => {
      if (!publicKey) throw new Error("Wallet not connected");
      const cars = await carService.getUserCars(publicKey.toBase58());
      return cars;
    },
    enabled: !!publicKey,
    staleTime: 30000,
    gcTime: 300000,
  });

  // Computed values
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

  // Equipment mutations
  const equipMutation = useMutation({
    mutationFn: async ({
      car,
      slotIndex,
    }: {
      car: CarInventoryData;
      slotIndex: number;
    }) => {
      if (!publicKey || !connection || !anchorWallet) {
        throw new Error("Wallet not connected");
      }
      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });
      const equipTxSignature = await onEquipCar(provider, car.mint, slotIndex);
      toast.success(`Car equipped successfully in slot ${slotIndex + 1}!`);
      return { equipTxSignature };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["carsInventory", publicKey?.toString()],
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
    mutationFn: async ({
      slotIndex,
      carMint,
    }: {
      slotIndex: number;
      carMint: string;
    }) => {
      if (!publicKey || !connection || !anchorWallet) {
        throw new Error("Wallet not connected");
      }
      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });
      const unequipTxSignature = await onUnequipCar(
        provider,
        slotIndex,
        carMint
      );

      toast.success(`Car unequipped successfully from slot ${slotIndex + 1}!`);
      return { unequipTxSignature };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["carsInventory", publicKey?.toString()],
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
    (slotIndex: number, carMint: string) => {
      unequipMutation.mutate({ slotIndex, carMint });
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

  return {
    cars,
    equippedCars,
    unequippedCars,

    carStats,

    isLoading,
    error,
    refetch,

    hasCars: cars.length > 0,
    hasEquippedCars: equippedCars.length > 0,
    hasUnequippedCars: unequippedCars.length > 0,

    equip,
    unequip,
    getEquippedCount,
    getTotalHashPower,

    equipData: equipMutation.data,
    unequipData: unequipMutation.data,
    isEquipping: equipMutation.isPending,
    isUnequipping: unequipMutation.isPending,
    equipError: equipMutation.error,
    unequipError: unequipMutation.error,
  };
};
