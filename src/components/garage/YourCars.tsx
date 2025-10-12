import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DraggableCar } from "./DraggableCar";
import { CarInventoryData, getRarityName, getVersionName } from "@/types/cars";
import { Loader } from "../Loader";

interface YourCarsProps {
  cars: CarInventoryData[];
  carStats: {
    totalCars: number;
    totalHashPower: number;
    rarityCount: Record<string, number>;
  };
  isLoading: boolean;
  error: Error | null;
  hasCars: boolean;
  getRarityColor: (rarity: number) => string;
}

type RarityFilter = "all" | 0 | 1 | 2 | 3;
type StatusFilter = "all" | "equipped" | "unequipped";
type VersionFilter = "all" | 0 | 1;

export const YourCars: React.FC<YourCarsProps> = ({
  cars,
  carStats,
  isLoading,
  error,
  hasCars,
  getRarityColor,
}) => {
  // Filter states
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [versionFilter, setVersionFilter] = useState<VersionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [displayLimit, setDisplayLimit] = useState(6);
  const [showFilters, setShowFilters] = useState(false);

  const initialDisplayLimit = 6;

  // Filtered and searched cars
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Rarity filter
      if (rarityFilter !== "all" && car.rarity !== rarityFilter) return false;

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "equipped" && !car.isEquipped) return false;
        if (statusFilter === "unequipped" && car.isEquipped) return false;
      }

      // Version filter
      if (versionFilter !== "all" && car.version !== versionFilter)
        return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = car.name.toLowerCase().includes(query);
        const rarityMatch = getRarityName(car.rarity)
          .toLowerCase()
          .includes(query);
        const versionMatch = getVersionName(car.version)
          .toLowerCase()
          .includes(query);
        if (!nameMatch && !rarityMatch && !versionMatch) return false;
      }

      return true;
    });
  }, [cars, rarityFilter, statusFilter, versionFilter, searchQuery]);

  // Cars to display (with pagination)
  const displayedCars = filteredCars.slice(0, displayLimit);
  const hasMoreCars = filteredCars.length > displayLimit;

  const handleShowMore = () => {
    setDisplayLimit((prev) => prev + 6);
  };

  const handleShowLess = () => {
    setDisplayLimit(initialDisplayLimit);
  };

  const clearFilters = () => {
    setRarityFilter("all");
    setStatusFilter("all");
    setVersionFilter("all");
    setSearchQuery("");
    setDisplayLimit(initialDisplayLimit);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#1A191B]/80 backdrop-blur-sm rounded-lg p-4 border border-[#49474E]/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-[#00D4FF] rounded-full"></div>
        <h2 className="text-lg font-semibold text-[#EEEEF0]">Your Cars</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-xs bg-[#49474E] hover:bg-[#6C28FF]/30 text-[#EEEEF0] px-2 py-1 rounded transition-colors"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
        <span className="text-xs text-[#B5B2BC] bg-[#49474E] px-2 py-1 rounded ml-auto">
          {isLoading
            ? "Loading..."
            : `${filteredCars.length}${
                filteredCars.length !== cars.length ? `/${cars.length}` : ""
              } cars`}
        </span>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-4 space-y-3 overflow-hidden"
        >
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search cars by name, rarity, or version..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121113] border border-[#49474E] rounded-md px-3 py-2 text-sm text-[#EEEEF0] placeholder-[#B5B2BC] focus:border-[#00D4FF] focus:outline-none"
            />
          </div>

          {/* Filter Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Rarity Filter */}
            <div>
              <label className="block text-xs text-[#B5B2BC] mb-1">
                Rarity
              </label>
              <div className="flex gap-1">
                {[
                  { value: "all", label: "All", color: "bg-gray-600" },
                  { value: 0, label: "Common", color: "bg-gray-400" },
                  { value: 1, label: "Rare", color: "bg-green-500" },
                  { value: 2, label: "Epic", color: "bg-purple-500" },
                  { value: 3, label: "Legendary", color: "bg-yellow-500" },
                ].map(({ value, label, color }) => (
                  <button
                    key={String(value)}
                    onClick={() => setRarityFilter(value as RarityFilter)}
                    className={`flex-1 text-xs px-2 py-2 rounded-lg font-medium transition-all duration-200 ${
                      rarityFilter === value
                        ? "bg-gradient-to-b from-[#6C28FF] to-[#9A51FF] text-[#EEEEF0] shadow-xs border-b-2 border-[#554282]"
                        : "bg-[#49474E] text-[#EEEEF0] hover:bg-gradient-to-b hover:from-[#6C28FF]/80 hover:to-[#9A51FF]/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs text-[#B5B2BC] mb-1">
                Status
              </label>
              <div className="flex gap-1">
                {[
                  { value: "all", label: "All" },
                  { value: "equipped", label: "Equipped" },
                  { value: "unequipped", label: "Unequipped" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value as StatusFilter)}
                    className={`flex-1 text-xs px-2 py-2 rounded-lg font-medium transition-all duration-200 ${
                      statusFilter === value
                        ? "bg-gradient-to-b from-[#6C28FF] to-[#9A51FF] text-[#EEEEF0] shadow-xs border-b-2 border-[#554282]"
                        : "bg-[#49474E] text-[#EEEEF0] hover:bg-gradient-to-b hover:from-[#6C28FF]/80 hover:to-[#9A51FF]/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Version Filter */}
            <div>
              <label className="block text-xs text-[#B5B2BC] mb-1">
                Version
              </label>
              <div className="flex gap-1">
                {[
                  { value: "all", label: "All" },
                  { value: 0, label: "Vintage" },
                  { value: 1, label: "Modern" },
                ].map(({ value, label }) => (
                  <button
                    key={String(value)}
                    onClick={() => setVersionFilter(value as VersionFilter)}
                    className={`flex-1 text-xs px-2 py-2 rounded-lg font-medium transition-all duration-200 ${
                      versionFilter === value
                        ? "bg-gradient-to-b from-[#6C28FF] to-[#9A51FF] text-[#EEEEF0] shadow-xs border-b-2 border-[#554282]"
                        : "bg-[#49474E] text-[#EEEEF0] hover:bg-gradient-to-b hover:from-[#6C28FF]/80 hover:to-[#9A51FF]/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(rarityFilter !== "all" ||
            statusFilter !== "all" ||
            versionFilter !== "all" ||
            searchQuery) && (
            <div className="flex justify-center">
              <button
                onClick={clearFilters}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader height={32} width={32} />
          <span className="ml-2 text-[#B5B2BC]">Loading your cars...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">⚠️ Error loading cars</div>
          <p className="text-xs text-[#B5B2BC]">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs bg-[#49474E] hover:bg-[#6C28FF]/30 text-[#EEEEF0] px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      ) : !hasCars ? (
        <div className="text-center py-8">
          <h3 className="text-[#EEEEF0] font-medium mb-2">No cars yet</h3>
          <p className="text-xs text-[#B5B2BC]">
            Buy mystery boxes above to get your first cars!
          </p>
        </div>
      ) : (
        <>
          {/* Car Stats Summary - Only show when no filters are active */}
          {rarityFilter === "all" &&
            statusFilter === "all" &&
            versionFilter === "all" &&
            !searchQuery && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="bg-[#121113]/50 rounded-md p-2 text-center">
                  <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                    Total HP
                  </p>
                  <p className="text-sm font-bold text-[#EEEEF0]">
                    {carStats.totalHashPower}
                  </p>
                </div>
                <div className="bg-[#121113]/50 rounded-md p-2 text-center">
                  <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                    Common
                  </p>
                  <p className="text-sm font-bold text-gray-400">
                    {carStats.rarityCount[0] || 0}
                  </p>
                </div>
                <div className="bg-[#121113]/50 rounded-md p-2 text-center">
                  <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                    Rare
                  </p>
                  <p className="text-sm font-bold text-green-400">
                    {carStats.rarityCount[1] || 0}
                  </p>
                </div>
                <div className="bg-[#121113]/50 rounded-md p-2 text-center">
                  <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                    Epic
                  </p>
                  <p className="text-sm font-bold text-purple-400">
                    {carStats.rarityCount[2] || 0}
                  </p>
                </div>
                <div className="bg-[#121113]/50 rounded-md p-2 text-center">
                  <p className="text-xs text-[#B5B2BC] uppercase tracking-wider mb-1">
                    Legendary
                  </p>
                  <p className="text-sm font-bold text-purple-400">
                    {carStats.rarityCount[3] || 0}
                  </p>
                </div>
              </div>
            )}

          {/* Filtered Results Info */}
          {(rarityFilter !== "all" ||
            statusFilter !== "all" ||
            versionFilter !== "all" ||
            searchQuery) && (
            <div className="mb-4 p-3 bg-[#121113]/50 rounded-md border border-[#49474E]/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#EEEEF0]">
                  Showing{" "}
                  <span className="font-medium text-[#00D4FF]">
                    {filteredCars.length}
                  </span>{" "}
                  of <span className="font-medium">{cars.length}</span> cars
                  {rarityFilter !== "all" && (
                    <span className="ml-2 text-xs text-[#B5B2BC]">
                      • {getRarityName(rarityFilter as 0 | 1 | 2 | 3)} only
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span className="ml-2 text-xs text-[#B5B2BC]">
                      •{" "}
                      {statusFilter === "equipped" ? "Equipped" : "Unequipped"}{" "}
                      only
                    </span>
                  )}
                  {versionFilter !== "all" && (
                    <span className="ml-2 text-xs text-[#B5B2BC]">
                      • {getVersionName(versionFilter as 0 | 1)} only
                    </span>
                  )}
                  {searchQuery && (
                    <span className="ml-2 text-xs text-[#B5B2BC]">
                      • Search: "{searchQuery}"
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedCars.map((car: CarInventoryData) => (
              <DraggableCar key={car.mint} car={car}>
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className={`text-xs ${getRarityColor(
                          car.rarity
                        )} font-medium`}
                      >
                        {getRarityName(car.rarity)}
                      </span>
                      <span className="text-xs text-[#B5B2BC]">•</span>
                      <span className="text-xs text-[#B5B2BC]">
                        {getVersionName(car.version)}
                      </span>
                      {car.isEquipped && (
                        <>
                          <span className="text-xs text-[#B5B2BC]">•</span>
                          <span className="text-xs text-[#00D4FF] font-medium">
                            Slot {car.slotIndex! + 1}
                          </span>
                        </>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#EEEEF0] truncate">
                      {car.name}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#B5B2BC]">Hash Power:</span>
                    <span className="text-[#EEEEF0] font-medium">
                      {car.hashPower}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#B5B2BC]">Efficiency:</span>
                    <span
                      className={`font-medium ${
                        car.efficiency >= 90
                          ? "text-green-400"
                          : car.efficiency >= 70
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {car.efficiency.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#B5B2BC]">Mint:</span>
                    <span className="text-[#EEEEF0] font-medium font-mono text-xs">
                      {car.mint.slice(0, 6)}...{car.mint.slice(-4)}
                    </span>
                  </div>
                </div>
              </DraggableCar>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredCars.length > 0 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              {displayLimit > initialDisplayLimit && (
                <button
                  onClick={handleShowLess}
                  className="text-xs bg-[#49474E] hover:bg-gradient-to-b hover:from-[#6C28FF]/80 hover:to-[#9A51FF]/80 text-[#EEEEF0] px-3 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Show Less
                </button>
              )}
              {hasMoreCars && (
                <button
                  onClick={handleShowMore}
                  className="text-xs bg-gradient-to-b from-[#6C28FF] to-[#9A51FF] text-[#EEEEF0] shadow-xs border-b-2 border-[#554282] px-3 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Show More ({filteredCars.length - displayLimit} remaining)
                </button>
              )}
            </div>
          )}

          {/* No results message */}
          {filteredCars.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="text-[#EEEEF0] font-medium mb-2">
                No cars found
              </div>
              <p className="text-xs text-[#B5B2BC] mb-4">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="text-xs bg-[#49474E] hover:bg-gradient-to-b hover:from-[#6C28FF]/80 hover:to-[#9A51FF]/80 text-[#EEEEF0] px-3 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

