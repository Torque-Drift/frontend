import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { useClaimLock, LOCK_OPTIONS } from "@/hooks/useClaimLock";
import { Button } from "../Button";
import { Loader } from "@/components/Loader";
import { usePreviewClaim } from "@/hooks";

export const ClaimLockSection: React.FC = () => {
  const {
    lockState,
    isLoading,
    isActivating,
    isDeactivating,
    activateLock,
    deactivateLock,
    formatTime,
  } = useClaimLock();

  const { previewData } = usePreviewClaim();

  const lockBoost = previewData?.totalBoost ?? 0;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleActivateLock = (option: number) => {
    const lockOption = LOCK_OPTIONS.find((opt) => opt.option === option);
    if (!lockOption) return;

    activateLock(option);
  };

  const handleDeactivateLock = () => {
    deactivateLock();
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
      >
        <div className="flex items-center justify-center py-8">
          <Loader height={32} width={32} className="text-[#6C28FF]" />
          <span className="ml-2 text-[#B5B2BC]">Loading Claim Lock...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#FF6B6B] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">Claim Lock</h2>
      </div>

      {lockState?.hasActiveLock ? (
        // CLAIM LOCK ACTIVE
        <div className="space-y-4">
          <div className="bg-linear-to-r from-[#ff6b6b]/20 to-[#ee5a24]/20 border border-[#ff4757]/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#EEEEF0]">
                Lock Active
              </h3>
              <span className="px-2 py-1 bg-[#FF6B6B]/20 text-[#FF6B6B] text-xs font-bold rounded-full">
                +{lockBoost.toFixed(0)}% Boost
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#B5B2BC]">Option: </span>
                <span className="text-[#EEEEF0] font-medium">
                  {
                    LOCK_OPTIONS.find(
                      (opt) => opt.boost === Number(lockBoost.toFixed(0))
                    )?.label
                  }
                </span>
              </div>
              <div>
                <span className="text-[#B5B2BC]">Time Remaining: </span>
                <span className="text-[#EEEEF0] font-medium">
                  {formatTime(lockState.timeRemaining)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#121113]/50 rounded-lg border border-[#49474E]/30">
              <p className="text-xs text-[#B5B2BC]">
                During lock you can claim by paying an extra 0.01 BNB fee
              </p>
            </div>
          </div>

          {lockState.canDeactivate ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-[#B5B2BC] text-sm mb-3">
                Your claim lock has expired! Click to deactivate and unlock
                claims.
              </p>
              <Button onClick={handleDeactivateLock} disabled={isDeactivating}>
                {isDeactivating ? (
                  <>
                    <Loader height={16} width={16} className="mr-2" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Deactivate Lock
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <div className="text-center p-4 bg-[#121113]/50 rounded-lg border border-[#49474E]/30">
              <p className="text-[#B5B2BC] text-sm">
                Expires in {formatTime(lockState.timeRemaining)}
              </p>
            </div>
          )}
        </div>
      ) : (
        // NO CLAIM LOCK
        <div className="space-y-4">
          {lockState?.canActivate ? (
            <div className="space-y-3">
              <h4 className="text-[#EEEEF0] font-medium text-sm">
                Choose your option:
              </h4>
              <div className="grid gap-3">
                {LOCK_OPTIONS.map((option) => (
                  <motion.button
                    key={option.option}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOption(option.option)}
                    className={`w-full p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedOption === option.option
                        ? "border-[#6C28FF] bg-[#6C28FF]/10"
                        : "border-[#49474E] bg-[#121113]/50 hover:border-[#6C28FF]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-[#EEEEF0] font-medium text-sm">
                          {option.duration} day{option.duration > 1 ? "s" : ""}
                        </div>
                        <div className="text-[#B5B2BC] text-xs">
                          +{option.boost}% boost on rewards
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#10B981] font-bold text-sm">
                          +{option.boost}%
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={() => handleActivateLock(selectedOption)}
                    disabled={isActivating}
                    className="w-full bg-gradient-to-r from-[#6C28FF] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED]"
                  >
                    {isActivating ? (
                      <>
                        <Loader height={16} width={16} className="mr-2" />
                        Activating Lock...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Activate Claim Lock
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-center p-4 bg-[#ffeaa7]/10 border border-[#fdcb6e]/30 rounded-lg">
              <h4 className="text-[#EEEEF0] font-semibold mb-1">
                Cooldown Active
              </h4>
              <p className="text-[#B5B2BC] text-sm">
                Next activation in {formatTime(lockState?.cooldownTime)}
              </p>
              <p className="text-[#888] text-xs mt-2">
                Wait 6 hours between activations
              </p>
            </div>
          )}

          <div className="border-t border-[#49474E]/50 pt-4 mt-4">
            <h4 className="text-[#EEEEF0] font-medium text-sm mb-3">
              How it works:
            </h4>
            <div className="space-y-2 text-sm text-[#B5B2BC]">
              <p>• Lock your claims for 1, 3 or 7 days</p>
              <p>• Get 5%, 10% or 20% boost on rewards</p>
              <p>• 6 hours cooldown after expiration</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
