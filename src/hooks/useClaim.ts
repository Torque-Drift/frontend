import { GLOBAL_STATE_ADDRESS, PROGRAM_ID, TOKEN_MINT } from "@/constants";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useClaim = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!publicKey || !connection || !anchorWallet) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });

      const idl = await Program.fetchIdl(PROGRAM_ID, provider);
      if (!idl) throw new Error("IDL not found");

      const program = new Program(idl, provider);

      console.log(`👤 Usuário: ${publicKey.toString()}`);

      // User state PDA
      const userStateAddress = PublicKey.findProgramAddressSync(
        [Buffer.from("user_state"), publicKey.toBuffer()],
        new PublicKey(PROGRAM_ID)
      )[0];

      console.log(`📋 User State PDA: ${userStateAddress.toString()}`);
      console.log(`📋 Global State: ${GLOBAL_STATE_ADDRESS}`);
      console.log(`🪙 Token Mint: ${TOKEN_MINT}`);

      // Verificar se usuário iniciou o jogo
      let userStateData;
      try {
        userStateData = await (program.account as any).userState.fetch(
          userStateAddress
        );
        if (!userStateData.gameStarted) {
          throw new Error("User has not started the game yet");
        }
      } catch (error) {
        throw new Error("User not found or game not started");
      }

      console.log("📊 Status do usuário:");
      console.log(
        `⚡ Hash Power total: ${userStateData.totalHashPower.toNumber()}`
      );
      console.log(
        `🚗 Carros equipados: ${
          userStateData.slots.filter((slot: any) => slot !== null).length
        }/5`
      );

      // Calcular tempo desde último claim
      const now = Math.floor(Date.now() / 1000);
      const timeSinceLastClaim = now - userStateData.lastClaim;
      const hoursSinceLastClaim = Math.floor(timeSinceLastClaim / 3600);
      const minutesSinceLastClaim = Math.floor(
        (timeSinceLastClaim % 3600) / 60
      );

      console.log(
        `🕒 Último claim: ${new Date(
          userStateData.lastClaim * 1000
        ).toLocaleString()}`
      );
      console.log(
        `⏱️  Tempo desde último claim: ${hoursSinceLastClaim}h ${minutesSinceLastClaim}m`
      );

      if (timeSinceLastClaim < 3600) {
        const remainingMinutes = Math.ceil((3600 - timeSinceLastClaim) / 60);
        throw new Error(
          `Cooldown active. Wait ${remainingMinutes} more minutes to claim`
        );
      }

      console.log("✅ Pronto para claim!");

      // Create user token account address
      const userTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(TOKEN_MINT),
        publicKey
      );

      // Mint authority PDA
      const mintAuthority = PublicKey.findProgramAddressSync(
        [Buffer.from("mint_authority")],
        new PublicKey(PROGRAM_ID)
      )[0];

      console.log(`👑 Mint Authority: ${mintAuthority.toString()}`);
      console.log(`🏦 User Token Account: ${userTokenAccount.toString()}`);

      // Verificar saldo antes do claim
      let balanceBefore = 0;
      try {
        const tokenAccountInfo =
          await provider.connection.getTokenAccountBalance(userTokenAccount);
        balanceBefore = parseFloat(
          tokenAccountInfo.value.uiAmountString || "0"
        );
        console.log(`💰 Saldo antes: ${balanceBefore} $TOD`);
      } catch (error) {
        console.log("📝 Token account não existe, será criada automaticamente");
      }

      await onClaim(
        provider,
        userTokenAccount,
        userStateAddress,
        publicKey,
        mintAuthority
      );

      // Verificar saldo após o claim
      try {
        const tokenAccountInfo =
          await provider.connection.getTokenAccountBalance(userTokenAccount);
        const balanceAfter = parseFloat(
          tokenAccountInfo.value.uiAmountString || "0"
        );
        const claimedAmount = balanceAfter - balanceBefore;

        console.log(`💰 Saldo após: ${balanceAfter} $TOD`);
        console.log(`🎁 Tokens claimados: ${formatTokenAmount(claimedAmount)}`);

        if (claimedAmount > 0) {
          toast.success(
            `$TOD tokens claimed successfully! ${formatTokenAmount(
              claimedAmount
            )} received.`
          );
        } else {
          toast.success("$TOD tokens claimed successfully!");
        }
      } catch (error) {
        console.log("⚠️  Não foi possível verificar saldo após claim");
        toast.success("$TOD tokens claimed successfully!");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userCars", publicKey?.toBase58()],
      });
      queryClient.invalidateQueries({
        queryKey: ["claimPreview", publicKey?.toBase58()],
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("Cooldown active")) {
        toast.error(`Cooldown active: ${errorMessage}`);
      } else if (errorMessage.includes("User not found")) {
        toast.error("User not found. Please initialize your account first.");
      } else if (errorMessage.includes("game not started")) {
        toast.error("Game not started. Please initialize your account first.");
      } else {
        toast.error(`Failed to claim tokens: ${errorMessage}`);
      }
    },
  });

  return {
    onClaim: claimMutation.mutateAsync,
    isLoading: claimMutation.isPending,
    error: claimMutation.error,
    mutate: claimMutation.mutate,
  };
};

async function onClaim(
  provider: AnchorProvider,
  userTokenAccount: PublicKey,
  userStateAddress: PublicKey,
  authority: PublicKey,
  mintAuthority: PublicKey
) {
  if (!provider.wallet.publicKey) throw new Error("Wallet not connected");

  const idl = await Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) throw new Error("IDL not found");

  const program = new Program(idl, provider);
  let tokenAccountExists = false;
  try {
    const tokenAccountInfo = await provider.connection.getAccountInfo(
      userTokenAccount
    );
    if (tokenAccountInfo) {
      tokenAccountExists = true;
      console.log("✅ Token account já existe");
    }
  } catch (error) {
    console.log("📝 Token account não existe, será criada automaticamente");
  }

  console.log("🎁 Executando claim_tokens...");

  const instructions = [];

  // Se token account não existe, adicionar instrução para criá-la
  if (!tokenAccountExists) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey, // payer
        userTokenAccount, // associated token account
        authority, // owner
        new PublicKey(TOKEN_MINT) // mint
      )
    );
    console.log("📝 Adicionando instrução para criar token account...");
  }

  // Executar a transação
  const tx = await program.methods
    .claimTokens()
    .accounts({
      user: provider.wallet.publicKey,
      userState: userStateAddress,
      globalState: new PublicKey(GLOBAL_STATE_ADDRESS),
      tokenMint: new PublicKey(TOKEN_MINT),
      userTokenAccount: userTokenAccount,
      mintAuthority: mintAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .preInstructions(instructions)
    .rpc({ skipPreflight: true });

  console.log("✅ Claim executado com sucesso!");
  console.log(`📋 Transação: ${tx}`);

  // Aguardar confirmação
  await provider.connection.confirmTransaction(tx, "confirmed");
}

// Funções auxiliares para formatar valores
function formatTokenAmount(amount: number): string {
  if (amount === 0) return "0 $TOD";

  // Para valores muito pequenos, sempre mostrar em nano tokens para legibilidade
  const absAmount = Math.abs(amount);

  if (absAmount < 1e-9) {
    // Valores extremamente pequenos
    return `${(amount * 1_000_000_000).toFixed(4)} n$TOD`;
  } else if (absAmount < 1e-6) {
    // Valores em nano $TOD
    return `${(amount * 1_000_000_000).toFixed(4)} n$TOD`;
  } else if (absAmount < 1e-3) {
    // Valores em micro $TOD
    return `${(amount * 1000).toFixed(2)} m$TOD`;
  } else if (absAmount < 1) {
    // Valores em mili $TOD
    return `${(amount * 1000).toFixed(2)} m$TOD`;
  } else {
    // Valores normais em $TOD
    return `${amount.toFixed(2)} $TOD`;
  }
}

function formatMicroTokens(amount: number): string {
  if (amount === 0) return "0 μ$TOD";

  if (amount < 1) {
    return `${amount.toFixed(2)} μ$TOD`;
  } else {
    return `${amount.toFixed(0)} μ$TOD`;
  }
}

export interface ClaimPreviewData {
  hashPower: number;
  lastClaim: number;
  timeSinceLastClaim: number;
  hoursSinceLastClaim: number;
  minutesSinceLastClaim: number;
  canClaim: boolean;
  remainingTimeMinutes: number | null;
  potentialReward: number;
  potentialRewardInTokens: number;
  hourlyReward: number;
  hourlyRewardInTokens: number;
  projectedReward: number | null;
  projectedRewardInTokens: number | null;
  totalClaimed?: number;
  formatted: {
    potentialReward: string;
    potentialRewardMicro: string;
    hourlyReward: string;
    hourlyRewardMicro: string;
    projectedReward: string | null;
    projectedRewardMicro: string | null;
  };
}

async function fetchUserStateForPreview(
  connection: any,
  publicKey: PublicKey,
  anchorWallet: any
): Promise<any> {
  const provider = new AnchorProvider(connection, anchorWallet, {
    commitment: "confirmed",
  });

  const idl = await Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) throw new Error("IDL not found");

  const program = new Program(idl, provider);
  const userStateAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("user_state"), publicKey.toBuffer()],
    new PublicKey(PROGRAM_ID)
  )[0];

  const userStateData = await (program.account as any).userState.fetch(
    userStateAddress
  );

  return userStateData;
}

export const usePreviewClaim = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const {
    data: previewData,
    isLoading,
    error,
    refetch,
  } = useQuery<ClaimPreviewData>({
    queryKey: ["claimPreview", publicKey?.toBase58()],
    queryFn: async (): Promise<ClaimPreviewData> => {
      if (!publicKey || !connection || !anchorWallet) {
        throw new Error("Wallet not connected");
      }

      try {
        const userStateData = await fetchUserStateForPreview(
          connection,
          publicKey,
          anchorWallet
        );

        if (!userStateData.gameStarted) {
          throw new Error("User has not started the game yet");
        }

        const hashPower = userStateData.totalHashPower.toNumber();
        const lastClaim = userStateData.lastClaim.toNumber();
        const totalClaimed = userStateData.totalClaimed?.toNumber() || 0;

        // Calcular tempo desde último claim
        const now = Math.floor(Date.now() / 1000);
        const timeSinceLastClaim = now - lastClaim;
        const hoursSinceLastClaim = timeSinceLastClaim / 3600;
        const minutesSinceLastClaim = Math.floor(
          (timeSinceLastClaim % 3600) / 60
        );

        // Verificar se pode fazer claim (cooldown de 1 hora)
        const canClaim = timeSinceLastClaim >= 3600;
        const remainingTimeMinutes = canClaim
          ? null
          : Math.ceil((3600 - timeSinceLastClaim) / 60);

        // Cálculo da recompensa baseado na fórmula do código
        const baseRate = 291667; // valor atualizado do código (= 0.07 TOD/dia por HP)

        // Recompensa potencial baseada no tempo decorrido
        const potentialReward =
          (hashPower * baseRate * hoursSinceLastClaim) / 100_000_000;
        const potentialRewardInTokens = potentialReward / 1_000_000; // converter para tokens completos

        // Taxa por hora
        const hourlyReward = (hashPower * baseRate * 1) / 100_000_000;
        const hourlyRewardInTokens = hourlyReward / 1_000_000;

        // Projeção para quando o cooldown acabar (se não puder claimar agora)
        let projectedReward: number | null = null;
        let projectedRewardInTokens: number | null = null;

        if (!canClaim) {
          const remainingHours = (3600 - timeSinceLastClaim) / 3600;
          projectedReward =
            (hashPower * baseRate * remainingHours) / 100_000_000;
          projectedRewardInTokens = projectedReward / 1_000_000;
        }

        return {
          hashPower,
          lastClaim,
          timeSinceLastClaim,
          hoursSinceLastClaim,
          minutesSinceLastClaim,
          canClaim,
          remainingTimeMinutes,
          potentialReward,
          potentialRewardInTokens,
          hourlyReward,
          hourlyRewardInTokens,
          projectedReward,
          projectedRewardInTokens,
          totalClaimed,
          formatted: {
            potentialReward: formatTokenAmount(potentialRewardInTokens),
            potentialRewardMicro: formatMicroTokens(potentialReward),
            hourlyReward: formatTokenAmount(hourlyRewardInTokens),
            hourlyRewardMicro: formatMicroTokens(hourlyReward),
            projectedReward: projectedRewardInTokens
              ? formatTokenAmount(projectedRewardInTokens)
              : null,
            projectedRewardMicro: projectedReward
              ? formatMicroTokens(projectedReward)
              : null,
          },
        };
      } catch (error) {
        console.error("Error fetching claim preview:", error);
        throw error;
      }
    },
    enabled: !!publicKey && !!connection && !!anchorWallet,
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });

  return {
    previewData,
    isLoading,
    error,
    refetch,
    canClaim: previewData?.canClaim ?? false,
    hashPower: previewData?.hashPower ?? 0,
    potentialReward: previewData?.potentialRewardInTokens ?? 0,
    formattedPotentialReward:
      previewData?.formatted.potentialReward ?? "0 $TOD",
    remainingTimeMinutes: previewData?.remainingTimeMinutes ?? null,
  };
};

// Hook para verificar se usuário existe e inicializar se necessário
export const useInitializeGame = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  // Verificar se usuário existe
  const {
    data: userExists,
    isLoading: checkingUser,
    error: checkError,
    refetch: refetchUserCheck,
  } = useQuery<boolean>({
    queryKey: ["userExists", publicKey?.toBase58()],
    queryFn: async (): Promise<boolean> => {
      if (!publicKey || !connection || !anchorWallet) {
        return false;
      }

      try {
        const provider = new AnchorProvider(connection, anchorWallet, {
          commitment: "confirmed",
        });

        const idl = await Program.fetchIdl(PROGRAM_ID, provider);
        if (!idl) throw new Error("IDL not found");

        const program = new Program(idl, provider);
        const userStateAddress = PublicKey.findProgramAddressSync(
          [Buffer.from("user_state"), publicKey.toBuffer()],
          new PublicKey(PROGRAM_ID)
        )[0];

        const userStateData = await (program.account as any).userState.fetch(
          userStateAddress
        );

        return userStateData.gameStarted;
      } catch (error) {
        // Se der erro, usuário não existe ou não iniciou o jogo
        return false;
      }
    },
    enabled: !!publicKey && !!connection && !!anchorWallet,
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });

  // Mutation para inicializar o jogo
  const initializeMutation = useMutation({
    mutationFn: async ({ referrerPubkey }: { referrerPubkey?: string }) => {
      if (!publicKey || !connection || !anchorWallet) {
        throw new Error("Wallet not connected");
      }

      // Usar Anchor's provider como no script
      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });

      const idl = await Program.fetchIdl(PROGRAM_ID, provider);
      if (!idl) throw new Error("IDL not found");

      const program = new Program(idl, provider);
      const authorityPubkey = publicKey;

      // Verificação adicional: checar se já está inicializado (cache local)
      if (userExists) {
        throw new Error("User already initialized and game already started");
      }

      console.log("🚀 Inicializando usuário e iniciando jogo...");

      // Verificar saldo antes da transação (como no script)
      const balance = await provider.connection.getBalance(authorityPubkey);
      const balanceInSOL = balance / 1_000_000_000;
      console.log(`💰 Saldo atual: ${balanceInSOL} SOL`);

      if (balanceInSOL < 0.3) {
        throw new Error(
          "Insufficient SOL balance. You need at least 0.3 SOL to initialize the game."
        );
      }

      // Treasury wallet
      const TREASURY_WALLET = new PublicKey(
        "FonqvQ2kFpBFLyNddupwJwuDUcfhHctrbJif43mPqEau"
      );

      console.log(`🏦 Treasury: ${TREASURY_WALLET.toString()}`);
      console.log(`💰 Taxa de entrada: 0.3 SOL`);

      // Verificar se foi fornecido um referrer
      const referrerPk = referrerPubkey ? new PublicKey(referrerPubkey) : null;
      console.log(
        `🎯 Referrer: ${referrerPk ? referrerPk.toString() : "None"}`
      );

      // Verificar se usuário já foi inicializado (como no script)
      const userStateAddress = PublicKey.findProgramAddressSync(
        [Buffer.from("user_state"), authorityPubkey.toBuffer()],
        new PublicKey(PROGRAM_ID)
      )[0];

      try {
        const userStateData = await (program.account as any).userState.fetch(
          userStateAddress
        );
        if (userStateData.gameStarted) {
          console.log(
            "⚠️  Usuário já foi inicializado e jogo já foi iniciado!"
          );
          console.log(
            `🚗 Carro NFT equipado: ${
              userStateData.slots.find((slot: any) => slot !== null) || "Nenhum"
            }`
          );
          console.log(
            `⚡ Hash Power total: ${userStateData.totalHashPower.toNumber()}`
          );
          throw new Error("User already initialized and game already started");
        }
      } catch (error) {
        // User state não existe ainda, pode prosseguir
        console.log("📝 Usuário não inicializado, prosseguindo...");
      }

      const carState = PublicKey.findProgramAddressSync(
        [Buffer.from("car_state"), authorityPubkey.toBuffer()],
        new PublicKey(PROGRAM_ID)
      )[0];

      const referrerState = referrerPk
        ? PublicKey.findProgramAddressSync(
            [Buffer.from("user_state"), referrerPk.toBuffer()],
            new PublicKey(PROGRAM_ID)
          )[0]
        : null;

      const baseAccounts: any = {
        user: authorityPubkey,
        globalState: new PublicKey(GLOBAL_STATE_ADDRESS),
        userState: userStateAddress,
        carState: carState,
        referrerState: referrerState,
        systemProgram: SystemProgram.programId,
      };

      const tx = await program.methods
        .initializeStartGame(referrerPk)
        .accounts(baseAccounts)
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      console.log("✅ Usuário inicializado e jogo iniciado com sucesso!");
      console.log(`📋 Transação: ${tx}`);

      // Aguardar confirmação (como no script)
      await provider.connection.confirmTransaction(tx, "confirmed");

      // Verificar resultado (como no script)
      const userStateData = await (program.account as any).userState.fetch(
        userStateAddress
      );

      console.log("\n📊 Resultado:");
      console.log(`✅ Game Started: ${userStateData.gameStarted}`);
      console.log(`⚡ Hash Power: ${userStateData.totalHashPower.toNumber()}`);
      console.log(`🚗 Carro starter: Criado automaticamente`);

      const balanceAfter = await provider.connection.getBalance(
        authorityPubkey
      );
      const balanceAfterInSOL = balanceAfter / 1_000_000_000;
      console.log(`💰 Saldo após: ${balanceAfterInSOL} SOL`);

      console.log(
        "\n🎉 Bem-vindo ao Torque Drift! Você agora pode usar todas as funcionalidades!"
      );

      return { tx };
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ["userExists", publicKey?.toBase58()],
      });
      queryClient.invalidateQueries({
        queryKey: ["claimPreview", publicKey?.toBase58()],
      });
      queryClient.invalidateQueries({
        queryKey: ["equippedCars", publicKey?.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["userCars", publicKey?.toBase58()],
      });
    },
  });

  return {
    userExists: userExists ?? false,
    checkingUser,
    checkError,
    refetchUserCheck,
    initializeGame: initializeMutation.mutateAsync,
    isInitializing: initializeMutation.isPending,
    initializeError: initializeMutation.error,
    initializeData: initializeMutation.data,
  };
};
