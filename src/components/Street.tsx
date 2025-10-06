export function Street() {
  return (
    <div className="bg-[#121113] y-16">
      <div className="w-full h-[88px] bg-[#1A191B] border-y-4 border-[#49474E] relative flex items-center justify-between">
        <div className="bg-gradient-to-r from-black to-transparent h-full w-[40%] absolute left-0 top-0" />
        <div className="bg-gradient-to-l from-black to-transparent h-full w-[40%] absolute right-0 top-0" />
        {Array.from({ length: 14 }).map((_, index) => (
          <div
            key={index}
            className="w-[86px] h-[12px] bg-[#6C28FF] rounded-full mx-4"
          />
        ))}
      </div>
    </div>
  );
}
