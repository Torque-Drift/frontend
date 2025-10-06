import { useMutation } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createBurnInstruction,
  getAccount,
} from "@solana/spl-token";
import { TOKEN_MINT } from "@/constants";
import { purchaseService } from "@/services";

async function burnTokens(
  burnAmount: number,
  publicKey: PublicKey,
  sendTransaction: (
    transaction: Transaction,
    connection: any
  ) => Promise<string>,
  connection: any
) {
  if (!publicKey || !sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const amountToBurn = burnAmount * Math.pow(10, 9);
  const userTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(TOKEN_MINT),
    publicKey
  );
  try {
    const accountInfo = await getAccount(connection, userTokenAccount);
    if (accountInfo.amount < BigInt(amountToBurn)) {
      throw new Error("Insufficient token balance");
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Account does not exist")
    ) {
      throw new Error(
        "Token account does not exist. You may need to receive tokens first."
      );
    }
    throw error;
  }

  const burnInstruction = createBurnInstruction(
    userTokenAccount,
    new PublicKey(TOKEN_MINT),
    publicKey,
    amountToBurn
  );

  const transaction = new Transaction().add(burnInstruction);
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = publicKey;
  const signature = await sendTransaction(transaction, connection);
  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${confirmation.value.err}`);
  }
  return signature;
}

export const useBurn = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const mutation = useMutation({
    mutationFn: async ({
      burnAmount,
      boxType,
    }: {
      burnAmount: number;
      boxType: string;
    }) => {
      if (!publicKey || !sendTransaction || !connection) {
        throw new Error("Wallet not connected");
      }
      const burnTxSignature = await burnTokens(
        burnAmount,
        publicKey,
        sendTransaction,
        connection
      );
      
      const userWallet = publicKey.toBase58();
      const payload = { userWallet, boxType, burnTxSignature };
      const result = await purchaseService.drawLootbox(payload);

      return { burnTxSignature, result };
    },
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
  };
};
