import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { X } from "lucide-react";

type BoxOpeningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rarity: string;
};

export default function BoxOpeningModal({
  isOpen,
  onClose,
  rarity,
}: BoxOpeningModalProps) {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideoPath = (rarity: string) => {
    let path = `/videos/open_box_${rarity.toLowerCase()}.mp4`;
    if (rarity.toLowerCase() === "mystery") {
      path = `/videos/open_box_rare.mp4`;
    }
    return path;
  };

  const handleVideoEnd = () => {
    onClose();
  };

  const handleVideoError = (e: any) => {
    console.error("Erro no vídeo:", e);
    setVideoError(true);
    setIsVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoError(false);
  };

  const handleCanPlay = () => {
    setIsVideoLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center">
              
              {/* Botão fechar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Loading/Error State */}
              {(isVideoLoading || videoError) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {videoError ? (
                    <div className="text-center">
                      <p className="text-red-400 text-xl mb-4">Erro ao carregar o vídeo</p>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        Fechar
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-white text-lg">Carregando vídeo...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Vídeo */}
              <video
                ref={videoRef}
                src={getVideoPath(rarity)}
                autoPlay
                muted
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                onCanPlay={handleCanPlay}
                className={`w-full h-full object-contain rounded-lg ${isVideoLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                style={{ maxWidth: '90vw', maxHeight: '90vh' }}
              />
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 