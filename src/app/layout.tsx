import Providers from "../components/Providers";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { Metadata } from "next";
import "./globals.css";
import { Sora, Be_Vietnam_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "react-hot-toast";

const sora = Sora({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Torque Drift - Racing Game on EVM",
  description:
    "Torque Drift - Race, upgrade and earn $TOD tokens in this exciting EVM-based racing game. Connect your wallet and start your engine!",
  keywords: [
    "ethereum",
    "evm",
    "polygon",
    "blockchain",
    "gaming",
    "racing",
    "crypto",
    "web3",
    "nft",
    "decentralized",
    "dapp",
    "torque drift",
    "tod token",
  ],
  authors: [{ name: "TorqueDrift Team" }],
  creator: "TorqueDrift",
  publisher: "TorqueDrift",
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    title: "Torque Drift - Racing Game on EVM",
    description:
      "Race, upgrade and earn $TOD tokens in this exciting EVM-based racing game. Connect your wallet and start your engine!",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/hero_bg.png",
        width: 1200,
        height: 630,
        alt: "Torque Drift Racing Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Torque Drift - Racing Game on EVM",
    description:
      "Race, upgrade and earn $TOD tokens in this exciting EVM-based racing game. Connect your wallet and start your engine!",
    images: ["/images/hero_bg.png"],
  },
  icons: {
    icon: [
      { url: "/images/logo.png", sizes: "64x64", type: "image/png" },
      { url: "/images/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/logo.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "ethereum:site": "https://torquedrift.com",
    "ethereum:title": "Torque Drift",
    "ethereum:description": "Racing Game on EVM",
    "ethereum:image": "https://torquedrift.com/images/hero_bg.png",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`scroll-smooth antialiased ${sora.variable} ${beVietnamPro.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/logo.png" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1A191B",
              color: "#EEEEF0",
              border: "1px solid #49474E",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(108, 40, 255, 0.2)",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              style: {
                background: "#1A191B",
                color: "#EEEEF0",
                border: "1px solid #10B981",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)",
              },
              iconTheme: {
                primary: "#10B981",
                secondary: "#EEEEF0",
              },
            },
            error: {
              style: {
                background: "#1A191B",
                color: "#EEEEF0",
                border: "1px solid #EF4444",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.2)",
              },
              iconTheme: {
                primary: "#EF4444",
                secondary: "#EEEEF0",
              },
            },
            loading: {
              style: {
                background: "#1A191B",
                color: "#EEEEF0",
                border: "1px solid #6C28FF",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(108, 40, 255, 0.3)",
              },
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
