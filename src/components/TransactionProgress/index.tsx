import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export type TransactionStep = {
  title: string;
  description: string;
  status: "pending" | "loading" | "success" | "error";
};

type TransactionProgressProps = {
  isOpen: boolean;
  onClose: () => void;
  steps: TransactionStep[];
};

export default function TransactionProgress({
  isOpen,
  onClose,
  steps,
}: TransactionProgressProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-cyan-800/50 rounded-lg p-6 w-full max-w-md"
              >
                <Dialog.Title className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                  Transaction Progress
                </Dialog.Title>

                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-lg ${
                        step.status === "error" 
                          ? "bg-rose-900/20 border border-rose-500/20" 
                          : "bg-slate-800/50"
                      }`}
                    >
                      <div className="mt-1">
                        {step.status === "loading" && (
                          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                        )}
                        {step.status === "success" && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                        {step.status === "error" && (
                          <XCircle className="w-6 h-6 text-rose-500" />
                        )}
                        {step.status === "pending" && (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{step.title}</h3>
                        <p className={`text-sm ${
                          step.status === "error" 
                            ? "text-rose-400" 
                            : "text-cyan-300/80"
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 