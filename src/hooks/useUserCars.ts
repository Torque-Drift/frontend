import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { CarService, CarData } from "@/services/car/carService";
import { PROGRAM_ID } from "@/constants";

export const useUserCars = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const carService = new CarService(connection, PROGRAM_ID);

  const {
    data: cars = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CarData[]>({
    queryKey: ["userCars", publicKey?.toBase58()],
    queryFn: async (): Promise<CarData[]> => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      return await carService.getUserCarsWithAnchor(publicKey.toBase58());
    },
    enabled: !!publicKey, // Só executa se o wallet estiver conectado
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });

  // Estatísticas dos carros
  const carStats = carService.getCarStats(cars);

  return {
    cars,
    carStats,
    isLoading,
    error,
    refetch,
    hasCars: cars.length > 0,
  };
};
