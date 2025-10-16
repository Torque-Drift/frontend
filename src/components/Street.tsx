export function Street() {
  return (
    <div className="bg-[#121113] py-8 lg:py-16">
      <div className="w-full h-[60px] sm:h-[80px] lg:h-[88px] bg-[#1A191B] border-y-2 sm:border-y-4 border-[#49474E] relative flex items-center justify-center overflow-hidden">
        <div className="bg-gradient-to-r from-black to-transparent h-full w-[30%] sm:w-[40%] absolute left-0 top-0" />
        <div className="bg-gradient-to-l from-black to-transparent h-full w-[30%] sm:w-[40%] absolute right-0 top-0" />
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 animate-pulse">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="w-[40px] sm:w-[60px] lg:w-[86px] h-[8px] sm:h-[10px] lg:h-[12px] bg-[#6C28FF] rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
