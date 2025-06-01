import "./globals.css";
import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import Providers from "@/components/Providers";
import "../../polyfills";

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GPUMINE",
  description: "GPU NFT Mining Game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/images/gpu.png" />
      </head>
      <body className={chakra.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
