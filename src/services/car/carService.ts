import { CarInventoryData } from "@/types/cars";

export class CarService {
  private apiClient: any;

  constructor(apiClient?: any) {
    // Allow dependency injection to avoid circular imports
    if (apiClient) {
      this.apiClient = apiClient;
    } else {
      // Lazy import to avoid circular dependency
      const { apiClient: defaultApiClient } = require("../index");
      this.apiClient = defaultApiClient;
    }
  }

  public async getUserCars(ownerPubkey: string): Promise<CarInventoryData[]> {
    try {
      const cars = await this.apiClient.get(
        `api/v1/inventory/${ownerPubkey}/cars`
      );
      return cars.cars;
    } catch (error) {
      console.error("Erro ao buscar carros:", error);
      throw new Error("Falha ao buscar carros do usuário");
    }
  }
}
