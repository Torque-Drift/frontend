import { apiClient } from "../index";

export interface BurnInstructionResponse {
  tokenMint: string;
  transaction: string;
}

export interface MintInstructionResponse {
  tokenMint: string;
  transaction: string;
}

export class PurchaseService {
  public async drawLootbox(payload: {
    userWallet: string;
    boxType: string;
    burnTxSignature: string;
  }) {
    try {
      const url = `/api/v1/purchase/nft/draw`;
      const clientSeed = `${payload.userWallet}-${payload.boxType}-${payload.burnTxSignature}`;
      return await apiClient.post(url, { ...payload, clientSeed });
    } catch (error: any) {
      console.error("Erro ao buscar instrução de queima:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Erro interno do servidor"
      );
    }
  }
}
