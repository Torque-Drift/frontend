import {
  QueryClient,
  QueryCache,
  MutationCache,
  DefaultOptions,
} from "@tanstack/react-query";

const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: "always",
    networkMode: "online",
  },
  mutations: {
    retry: false,
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  },
};

const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error("Query error:", {
      queryKey: query.queryKey,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    });

    // Aqui você pode adicionar lógica para enviar erros para um serviço de monitoramento
  },
});

// Cache de mutations para tratamento global
const mutationCache = new MutationCache({
  onError: (error) => {
    // Log de erros para monitoramento
    console.error("Mutation error:", {
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    });
  },
});

// Cliente de queries configurado
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: defaultQueryOptions,
});

// Keys para queries (padronização)
export const queryKeys = {
  subscription: {
    all: ["subscription"] as const,
    pricing: (months?: number) =>
      [...queryKeys.subscription.all, "pricing", months] as const,
    status: (wallet: string) =>
      [...queryKeys.subscription.all, "status", wallet] as const,
    checkPayment: (wallet: string) =>
      [...queryKeys.subscription.all, "check-payment", wallet] as const,
  },

  donate: {
    all: ["donate"] as const,
    checkPayment: (donorWallet: string, streamerWallet: string) =>
      [
        ...queryKeys.donate.all,
        "check-payment",
        donorWallet,
        streamerWallet,
      ] as const,
    recent: (limit?: number) =>
      [...queryKeys.donate.all, "recent", limit] as const,
    streamer: (streamerWallet: string, page?: number, limit?: number) =>
      [
        ...queryKeys.donate.all,
        "streamer",
        streamerWallet,
        page,
        limit,
      ] as const,
  },

  streamer: {
    all: ["streamer"] as const,
    profile: (wallet: string) =>
      [...queryKeys.streamer.all, "profile", wallet] as const,
    stats: (wallet: string) =>
      [...queryKeys.streamer.all, "stats", wallet] as const,
    donations: (wallet: string, page?: number, limit?: number) =>
      [...queryKeys.streamer.all, "donations", wallet, page, limit] as const,
    wallet: (wallet: string) =>
      [...queryKeys.streamer.all, "wallet", wallet] as const,
  },
};

// Funções utilitárias para invalidação de cache
export const invalidateQueries = {
  // Donate PumpFun Services
  subscription: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all }),

  donate: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.donate.all }),

  streamer: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.streamer.all }),

  // Invalidar tudo
  all: () => queryClient.invalidateQueries(),
};

// Funções utilitárias para remoção de cache
export const removeQueries = {
  // Donate PumpFun Services
  subscription: () =>
    queryClient.removeQueries({ queryKey: queryKeys.subscription.all }),
  donate: () => queryClient.removeQueries({ queryKey: queryKeys.donate.all }),
  streamer: () =>
    queryClient.removeQueries({ queryKey: queryKeys.streamer.all }),
};
