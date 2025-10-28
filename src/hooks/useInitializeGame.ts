import { useState } from "react";

import { CONTRACT_ADDRESSES } from "@/constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  TorqueDriftGame__factory,
  TorqueDriftReferral__factory,
} from "@/contracts";
import { useEthers } from "./useEthers";
import { ethers } from "ethers";

export const useWhitelistCheck = (addresses?: string[]) => {
  const { provider, address, isConnected } = useEthers();

  const addressesToCheck = addresses || (address ? [address] : []);
  const isSingleAddress = !addresses && !!address;

  return useQuery({
    queryKey: ["whitelistCheck", addressesToCheck],
    queryFn: async (): Promise<{
      // For backward compatibility when checking single address
      isWhitelisted?: boolean;
      // For multiple addresses
      results?: Array<{
        address: string;
        isWhitelisted: boolean;
        error?: string;
      }>;
      summary?: {
        total: number;
        whitelisted: number;
        notWhitelisted: number;
        errors: number;
      };
    }> => {
      if (!provider || !isConnected || addressesToCheck.length === 0) {
        const baseResponse = {
          results: [],
          summary: { total: 0, whitelisted: 0, notWhitelisted: 0, errors: 0 },
        };

        if (isSingleAddress) {
          return { ...baseResponse, isWhitelisted: false };
        }
        return baseResponse;
      }

      // Create referral contract instance (like in the Hardhat script)
      const referralContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TorqueDriftReferral,
        ["function isWhitelisted(address user) external view returns (bool)"],
        provider
      );

      const results = [];
      let whitelistedCount = 0;
      let notWhitelistedCount = 0;
      let errorsCount = 0;

      for (const addr of addressesToCheck) {
        try {
          // Try calling isWhitelisted function
          const isWhitelisted = await referralContract.isWhitelisted(addr);

          results.push({
            address: addr,
            isWhitelisted,
            error: undefined,
          });

          if (isWhitelisted) {
            whitelistedCount++;
          } else {
            notWhitelistedCount++;
          }
        } catch (error) {
          console.error(`Error checking whitelist for ${addr}:`, error);

          // Try low-level call to check if function exists
          try {
            const iface = new ethers.Interface([
              "function isWhitelisted(address) external view returns (bool)",
            ]);
            const data = iface.encodeFunctionData("isWhitelisted", [addr]);

            const result = await provider.call({
              to: CONTRACT_ADDRESSES.TorqueDriftReferral,
              data: data,
            });

            if (result === "0x") {
              // Function exists but returns empty data
              results.push({
                address: addr,
                isWhitelisted: false,
                error:
                  "Function exists but returns empty data - contract may not be properly deployed",
              });
            } else {
              // Try to decode result
              const decoded = iface.decodeFunctionResult(
                "isWhitelisted",
                result
              );
              const isWhitelisted = decoded[0];

              results.push({
                address: addr,
                isWhitelisted,
                error: undefined,
              });

              if (isWhitelisted) {
                whitelistedCount++;
              } else {
                notWhitelistedCount++;
              }
            }
          } catch (lowLevelError) {
            // Function doesn't exist in deployed contract
            const errorMessage =
              lowLevelError instanceof Error
                ? lowLevelError.message
                : String(lowLevelError);
            results.push({
              address: addr,
              isWhitelisted: false,
              error: `Whitelist functionality may not be available in this contract version: ${errorMessage}`,
            });
            errorsCount++;
          }
        }
      }

      const response = {
        results,
        summary: {
          total: addressesToCheck.length,
          whitelisted: whitelistedCount,
          notWhitelisted: notWhitelistedCount,
          errors: errorsCount,
        },
      };

      // For backward compatibility when checking single address
      if (isSingleAddress && results.length > 0) {
        return { ...response, isWhitelisted: results[0].isWhitelisted };
      }

      return response;
    },
    enabled: !!provider && isConnected && addressesToCheck.length > 0,
    staleTime: 30000,
  });
};

// Hook for batch whitelist checking (like the Hardhat script)
export const useBatchWhitelistCheck = () => {
  const { provider, isConnected } = useEthers();

  const checkBatch = async (
    addresses: string[]
  ): Promise<{
    results: Array<{
      address: string;
      isWhitelisted: boolean;
      error?: string;
    }>;
    summary: {
      total: number;
      whitelisted: number;
      notWhitelisted: number;
      errors: number;
    };
  }> => {
    if (!provider || !isConnected) {
      throw new Error("Wallet not connected");
    }

    // Validate addresses
    const validAddresses = addresses.filter((addr) => ethers.isAddress(addr));

    if (validAddresses.length === 0) {
      throw new Error("No valid addresses provided");
    }

    console.log(
      `🔍 Checking whitelist status for ${validAddresses.length} addresses`
    );
    const referralContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TorqueDriftReferral,
      ["function isWhitelisted(address user) external view returns (bool)"],
      provider
    );

    const results = [];
    let whitelistedCount = 0;
    let notWhitelistedCount = 0;
    let errorsCount = 0;

    for (const addr of validAddresses) {
      try {
        const isWhitelisted = await referralContract.isWhitelisted(addr);

        results.push({
          address: addr,
          isWhitelisted,
          error: undefined,
        });

        if (isWhitelisted) {
          whitelistedCount++;
          console.log(
            `✅ ${addr} - WHITELISTED (30% discount on initialization)`
          );
        } else {
          notWhitelistedCount++;
          console.log(`❌ ${addr} - NOT WHITELISTED (full 0.1 BNB payment)`);
        }
      } catch (error) {
        console.error(`⚠️  ${addr} - ERROR calling isWhitelisted():`, error);

        // Try low-level call
        try {
          const iface = new ethers.Interface([
            "function isWhitelisted(address) external view returns (bool)",
          ]);
          const data = iface.encodeFunctionData("isWhitelisted", [addr]);

          const result = await provider.call({
            to: CONTRACT_ADDRESSES.TorqueDriftReferral,
            data: data,
          });

          if (result === "0x") {
            console.log(
              `   ❌ Function exists but returns empty data - contract may not be properly deployed`
            );
            results.push({
              address: addr,
              isWhitelisted: false,
              error:
                "Function exists but returns empty data - contract may not be properly deployed",
            });
          } else {
            const decoded = iface.decodeFunctionResult("isWhitelisted", result);
            const isWhitelisted = decoded[0];
            console.log(`   ✅ Function exists, result: ${isWhitelisted}`);

            results.push({
              address: addr,
              isWhitelisted,
              error: undefined,
            });

            if (isWhitelisted) {
              whitelistedCount++;
            } else {
              notWhitelistedCount++;
            }
          }
        } catch (lowLevelError) {
          const errorMessage =
            lowLevelError instanceof Error
              ? lowLevelError.message
              : String(lowLevelError);
          console.log(
            `   ❌ Function does not exist in deployed contract: ${errorMessage}`
          );
          console.log(
            `   💡 The whitelist functionality may not be available in this contract version`
          );

          results.push({
            address: addr,
            isWhitelisted: false,
            error: `Whitelist functionality may not be available in this contract version: ${errorMessage}`,
          });
          errorsCount++;
        }
      }
    }

    const summary = {
      total: validAddresses.length,
      whitelisted: whitelistedCount,
      notWhitelisted: notWhitelistedCount,
      errors: errorsCount,
    };

    console.log("\n📊 SUMMARY:");
    console.log(`   Total wallets checked: ${summary.total}`);
    console.log(`   ✅ Whitelisted: ${summary.whitelisted}`);
    console.log(`   ❌ Not whitelisted: ${summary.notWhitelisted}`);
    console.log(`   ⚠️  Errors: ${summary.errors}`);

    if (whitelistedCount > 0) {
      console.log(
        "\n💡 Whitelisted wallets get 30% discount: 0.07 BNB instead of 0.1 BNB for game initialization"
      );
    }

    return { results, summary };
  };

  return { checkBatch };
};

interface InitializeGameParams {
  referrerPubkey?: string;
}

async function checkReferralCode(
  referralCode: string,
  provider: ethers.Provider,
  isWhitelisted: boolean = false
) {
  const basePayment = ethers.parseEther("0.1");
  const referralDiscountPayment = ethers.parseEther("0.09");
  const whitelistDiscountPayment = ethers.parseEther("0.07");

  if (!referralCode || referralCode.trim() === "") {
    return {
      isValid: false,
      hasDiscount: false,
      hasWhitelistDiscount: isWhitelisted,
      requiredPayment: isWhitelisted ? whitelistDiscountPayment : basePayment,
    };
  }

  try {
    const referralContract = TorqueDriftReferral__factory.connect(
      CONTRACT_ADDRESSES.TorqueDriftReferral,
      provider
    );

    const isValid = await referralContract.isValidReferralCode(referralCode);

    if (!isValid) {
      return {
        isValid: false,
        hasDiscount: false,
        hasWhitelistDiscount: isWhitelisted,
        requiredPayment: isWhitelisted ? whitelistDiscountPayment : basePayment,
        error: "Código de referral inválido",
      };
    }
    const hasDiscount = await referralContract.discountReferralCodes(
      referralCode
    );

    // Priorizar desconto de whitelist se disponível
    let finalPayment = basePayment;
    if (isWhitelisted) {
      finalPayment = whitelistDiscountPayment;
    } else if (hasDiscount) {
      finalPayment = referralDiscountPayment;
    }

    return {
      isValid: true,
      hasDiscount,
      hasWhitelistDiscount: isWhitelisted,
      requiredPayment: finalPayment,
    };
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return {
      isValid: false,
      hasDiscount: false,
      hasWhitelistDiscount: isWhitelisted,
      requiredPayment: isWhitelisted ? whitelistDiscountPayment : basePayment,
      error: "Erro ao verificar código",
    };
  }
}

export const useInitializeGame = () => {
  const { signer, address, isConnected, provider } = useEthers();
  const [isInitializing, setIsInitializing] = useState(false);
  const { data: whitelistData } = useWhitelistCheck();

  // Query to check if user exists
  const {
    data: userExistsData,
    isLoading: checkingUser,
    error: checkError,
    refetch: refetchUserExists,
  } = useQuery({
    queryKey: ["userExists", address],
    queryFn: async (): Promise<{
      hasGameStarted: boolean;
      referrerCode: string;
    }> => {
      if (!address || !provider) {
        console.warn(
          "Address or provider not available for user existence check"
        );
        return { hasGameStarted: false, referrerCode: "" };
      }

      try {
        const gameContract = TorqueDriftGame__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftGame,
          provider
        );
        const referralContract = TorqueDriftReferral__factory.connect(
          CONTRACT_ADDRESSES.TorqueDriftReferral,
          provider
        );

        const started = await gameContract.getUserGameStarted(address);
        console.log(started);
        let referrerCode = "";
        if (started) {
          referrerCode = await referralContract.getUserReferralCode(address);
        }
        return { hasGameStarted: started, referrerCode };
      } catch (error) {
        console.error("Error checking user existence:", error);
        return { hasGameStarted: false, referrerCode: "" };
      }
    },
    enabled: !!address && isConnected && !!provider,
    staleTime: 30000, // 30 seconds
    retry: 2,
    retryDelay: 1000,
  });

  const initializeMutation = useMutation({
    mutationFn: async (params: InitializeGameParams) => {
      if (!signer || !isConnected || !address || !provider) {
        throw new Error("Wallet not connected or signer not available");
      }
      const referralContract = TorqueDriftReferral__factory.connect(
        CONTRACT_ADDRESSES.TorqueDriftReferral,
        signer
      );
      const referrerCode = params.referrerPubkey ? params.referrerPubkey : "";
      const isWhitelisted = whitelistData?.isWhitelisted || false;
      const referralData = await checkReferralCode(
        referrerCode,
        provider,
        isWhitelisted
      );
      if (referrerCode && !referralData.isValid) {
        throw new Error("Invalid referral code");
      }
      const value = referralData.requiredPayment;
      const code = referrerCode ? referrerCode : "";
      const tx = await referralContract.initializeStartGameWithReferral(code, {
        value,
      });
      await tx.wait();
      await refetchUserExists();
    },
    onSettled: () => {
      setIsInitializing(false);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      console.error("Failed to initialize game:", error);

      if (errorMessage.includes("already initialized")) {
        toast.error("Your account is already initialized!");
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient funds to initialize game");
      } else if (errorMessage.includes("user rejected action")) {
        toast.error("User rejected action");
      } else if (errorMessage.includes("GAME_STARTED")) {
        toast.error("Game already started");
      } else {
        toast.error(`Failed to initialize game: ${errorMessage}`);
      }
    },
    onSuccess: () => {
      toast.success(
        "Welcome to Torque Drift! Your account has been initialized successfully!"
      );
    },
  });

  const initializeGame = async (params: InitializeGameParams = {}) => {
    return initializeMutation.mutateAsync(params);
  };

  return {
    userExists: userExistsData?.hasGameStarted || false,
    referrerCode: userExistsData?.referrerCode || "",
    checkingUser,
    initializeGame,
    isInitializing,
    initializeError: initializeMutation.error || checkError,
  };
};

/**
 * Exemplo de uso do hook useBatchWhitelistCheck em um componente React:
 *
 * ```tsx
 * import { useBatchWhitelistCheck } from "@/hooks";
 *
 * function WhitelistChecker() {
 *   const { checkBatch } = useBatchWhitelistCheck();
 *   const [addresses, setAddresses] = useState('');
 *   const [results, setResults] = useState(null);
 *
 *   const handleCheck = async () => {
 *     const addressList = addresses.split('\n').map(addr => addr.trim()).filter(addr => addr);
 *     try {
 *       const batchResult = await checkBatch(addressList);
 *       setResults(batchResult);
 *     } catch (error) {
 *       console.error('Erro ao verificar whitelist:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <textarea
 *         value={addresses}
 *         onChange={(e) => setAddresses(e.target.value)}
 *         placeholder="Cole os endereços aqui, um por linha"
 *         rows={10}
 *       />
 *       <button onClick={handleCheck}>Verificar Whitelist</button>
 *
 *       {results && (
 *         <div>
 *           <h3>Resultado:</h3>
 *           <p>Total: {results.summary.total}</p>
 *           <p>Whitelisted: {results.summary.whitelisted}</p>
 *           <p>Não whitelisted: {results.summary.notWhitelisted}</p>
 *           <p>Erros: {results.summary.errors}</p>
 *
 *           <ul>
 *             {results.results.map((result, index) => (
 *               <li key={index}>
 *                 {result.isWhitelisted ? '✅' : '❌'} {result.address}
 *                 {result.error && <span style={{color: 'red'}}> - {result.error}</span>}
 *               </li>
 *             ))}
 *           </ul>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

