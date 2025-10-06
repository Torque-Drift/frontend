import {
  Connection,
  PublicKey,
  GetProgramAccountsFilter,
  Keypair,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";

// Tipos para o CarState (baseado na estrutura mencionada)
export interface CarState {
  mint: PublicKey;
  rarity: "Common" | "Uncommon" | "Epic" | "Legendary";
  version: "Vintage" | "Modern";
  hashPower: number;
  owner: PublicKey;
}

// Interface simplificada para exibição na UI
export interface CarData {
  mint: string;
  rarity: "Common" | "Uncommon" | "Epic" | "Legendary";
  version: "Vintage" | "Modern";
  hashPower: number;
  owner: string;
}

export class CarService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection, programId: string) {
    this.connection = connection;
    this.programId = new PublicKey(programId);
  }

  async getUserCarsWithAnchor(ownerPubkey: string): Promise<CarData[]> {
    try {
      const owner = new PublicKey(ownerPubkey);
      const provider = new AnchorProvider(this.connection, {} as any, {
        commitment: "confirmed",
      });
      const idl = await Program.fetchIdl(this.programId, provider);
      const program = new Program(idl, provider);
      const carStates = await (program.account as any).carState.all([
        { memcmp: { offset: 8, bytes: owner.toBase58() } },
      ]);

      console.log(
        carStates.map((carState: any) => ({
          mint: carState.account.mint.toBase58(),
          rarity: carState.account.rarity,
          version: carState.account.version,
          hashPower: Number(carState.account.hashPower),
          owner: carState.account.owner.toBase58(),
        }))
      );

      return carStates.map((carState: any) => ({
        mint: carState.account.mint.toBase58(),
        rarity: carState.account.rarity,
        version: carState.account.version,
        hashPower: Number(carState.account.hashPower),
        owner: carState.account.owner.toBase58(),
      }));
    } catch (error) {
      console.error("Erro ao buscar carros com Anchor:", error);
      throw new Error("Falha ao buscar carros do usuário");
    }
  }

  getCarStats(cars: CarData[]) {
    const totalHashPower = cars.reduce((sum, car) => sum + car.hashPower, 0);
    const rarityCount = cars.reduce((acc, car) => {
      acc[car.rarity] = (acc[car.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCars: cars.length,
      totalHashPower,
      rarityCount,
    };
  }
}
