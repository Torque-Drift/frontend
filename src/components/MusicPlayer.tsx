"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";

export default function MusicPlayer() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default volume: 30%
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true; // Loop the music
    }
  }, [volume]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
        // Try to play if not already playing
        if (!isPlaying) {
          audioRef.current.play().catch(() => {
            // Ignore play errors (user interaction required)
          });
        }
      } else {
        audioRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handlePlay = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Ignore play errors (user interaction required)
        });
    }
  };

  const handleMouseEnter = () => {
    setShowVolumeControl(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowVolumeControl(false);
    }, 1000); // Hide after 1 second
  };

  const getVolumeIcon = () => {
    if (isMuted) return VolumeX;
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <>
      {/* Volume slider styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .volume-slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #6C28FF;
            cursor: pointer;
            border: 2px solid #1A191B;
            box-shadow: 0 0 0 2px rgba(108, 40, 255, 0.2);
            transition: transform 0.1s ease;
          }
          .volume-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          .volume-slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #6C28FF;
            cursor: pointer;
            border: 2px solid #1A191B;
            box-shadow: 0 0 0 2px rgba(108, 40, 255, 0.2);
          }
        `,
        }}
      />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/audio/tokyo-drift.mp3"
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating music control */}
      <div
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Volume Control Slider */}
        <div
          className={`absolute bottom-full right-0 mb-2 transition-all duration-300 ease-in-out ${
            showVolumeControl
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <div className="bg-[#1A191B] rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-3">
              <VolumeIcon className="w-4 h-4 text-[#EEEEF0]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer volume-slider"
                style={{
                  background: `linear-gradient(to right, #6C28FF 0%, #6C28FF ${
                    (isMuted ? 0 : volume) * 100
                  }%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`,
                }}
              />
              <span className="text-xs text-gray-400 min-w-[2rem]">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Main Music Button */}
        <button
          onClick={toggleMute}
          onMouseEnter={handlePlay}
          className="bg-[#1A191B] rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 group block cursor-pointer"
          aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
          <div className="relative">
            <VolumeIcon
              className={`w-6 h-6 transition-colors ${
                isMuted || volume === 0
                  ? "text-gray-400 group-hover:text-gray-300"
                  : "text-[#EEEEF0] group-hover:text-white"
              }`}
            />
          </div>
        </button>
      </div>
    </>
  );
}
