import { CarInventoryData } from "@/types/cars";

export class CarService {
  private apiClient: any;

  constructor(apiClient?: any) {
    if (apiClient) {
      this.apiClient = apiClient;
    } else {
      throw new Error("apiClient is required for CarService");
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
