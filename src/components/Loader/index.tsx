import Image from "next/image";

export function Loader({
  height = 100,
  width = 100,
  className,
}: {
  height?: number;
  width?: number;
  className?: string;
}) {
  return (
    <Image
      src="/images/logo.png"
      alt="Loader"
      width={width}
      height={height}
      draggable={false}
      priority={true}
      className={`${className} animate-spin`}
    />
  );
}
