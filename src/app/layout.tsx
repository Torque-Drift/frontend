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
  title: "TorqueDrift",
  description:
    "Send SOL donations with personalized messages to your favorite streamers. Join the crypto community and show your support!",
  keywords: [
    "meme coin",
    "crypto",
    "solana",
    "donation",
    "streamer",
    "support",
    "pump.fun",
  ],
  authors: [{ name: "TorqueDrift Team" }],
  creator: "TorqueDrift",
  publisher: "TorqueDrift",
  robots: "index, follow",
  openGraph: {
    title: "TorqueDrift",
    description:
      "Send SOL donations with personalized messages to your favorite streamers. Join the crypto community and show your support!",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TorqueDrift",
    description:
      "Send SOL donations with personalized messages to your favorite streamers. Join the crypto community and show your support!",
  },
  icons: {
    icon: [
      { url: "/images/logo.png", sizes: "64x64", type: "image/png" },
      { url: "/images/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/images/logo.png", sizes: "180x180", type: "image/png" },
    ],
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
            duration: 5000,
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-pump)",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
