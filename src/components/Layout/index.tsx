"use client";
import { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUser } from "@/hooks/useUser";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { balance } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/token-sale", label: "Token Sale" },
    { href: "/mystery-box", label: "Mystery Box" },
    { href: "/inventory", label: "Inventory" },
    { href: "https://gpumine.gitbook.io/gpumine", label: "Whitepaper", external: true },
    { href: "https://gpumine.gitbook.io/gpumine", label: "Marketplace", external: true },
  ];

  return (
    <div className="min-h-screen bg-black text-cyan-400 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 z-0"></div>
      <div className="absolute inset-0 bg-[url('/images/bg-ban.png')] bg-cover opacity-30 z-0"></div>
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-[radial-gradient(rgba(0,200,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-conic from-purple-900 via-blue-900 to-cyan-900 opacity-60 animate-slow-rotate"></div>
        <div className="absolute inset-0 bg-black opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-700/20 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-cyan-700/20 blur-3xl animate-float-slow-reverse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-rose-700/20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:4px_4px]"></div>
        <div className="absolute w-full h-20 bg-cyan-500/5 blur-sm animate-scan"></div>
      </div>

      <div className="absolute inset-0 crt pointer-events-none z-20"></div>

      <div className="container mx-auto px-4 py-6 lg:py-12 relative z-10">
        <header className="flex justify-between items-center mb-8 lg:mb-16">
          {/* Logo */}
          <h1
            className="text-2xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 glitch-text cursor-pointer"
            onClick={() => {
              router.push("/");
              closeMobileMenu();
            }}
          >
            GPU<span className="text-rose-500">MINE</span>
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-6 items-center">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={`${pathname === item.href ? "text-cyan-300" : "hover:text-cyan-300"
                      } transition-colors`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    return (
                      <div
                        {...(!mounted && {
                          "aria-hidden": true,
                          style: {
                            opacity: 0,
                            pointerEvents: "none",
                            userSelect: "none",
                          },
                        })}
                      >
                        {(() => {
                          if (!mounted || !account || !chain) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 rounded hover:from-rose-600 hover:to-purple-700 transition-colors relative overflow-hidden group"
                              >
                                <span className="relative z-10 text-sm lg:text-base">
                                  Connect Wallet
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:4px_4px]"></div>
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 rounded hover:from-red-600 hover:to-rose-700 transition-colors text-sm lg:text-base"
                              >
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <div className="flex gap-2">
                              <button className="px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded hover:from-cyan-500/30 hover:to-purple-600/30 transition-colors border border-cyan-500/30">
                                <span className="relative z-10 text-sm lg:text-base">
                                  {balance} $CC
                                </span>
                              </button>
                              <button
                                onClick={openChainModal}
                                className="px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded hover:from-cyan-500/30 hover:to-purple-600/30 transition-colors border border-cyan-500/30"
                              >
                                {chain.hasIcon && (
                                  <div className="flex items-center gap-2">
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? "Chain icon"}
                                        src={chain.iconUrl}
                                        className="w-4 h-4"
                                      />
                                    )}
                                    <span className="text-sm lg:text-base">{chain.name}</span>
                                  </div>
                                )}
                              </button>
                              <button
                                onClick={openAccountModal}
                                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 rounded hover:from-rose-600 hover:to-purple-700 transition-colors relative overflow-hidden group"
                              >
                                <span className="relative z-10 text-sm lg:text-base">
                                  {account.displayName}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:4px_4px]"></div>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden z-50 relative p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 relative">
              <span
                className={`absolute top-0 left-0 w-full h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 top-2.5" : ""
                  }`}
              />
              <span
                className={`absolute top-2.5 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                  }`}
              />
              <span
                className={`absolute top-5 left-0 w-full h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 top-2.5" : ""
                  }`}
              />
            </div>
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/80 z-40"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-sm bg-gradient-to-b from-black/95 to-purple-900/95 backdrop-blur-lg transform transition-transform duration-300 z-50 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-6 pt-20">
            {/* Mobile Navigation */}
            <nav className="mb-8">
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      onClick={closeMobileMenu}
                      className={`block py-3 px-4 rounded-lg transition-all ${pathname === item.href
                        ? "text-cyan-300 bg-cyan-500/20 border border-cyan-500/30"
                        : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Wallet Connection */}
            <div className="border-t border-cyan-800 pt-6">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  return (
                    <div
                      {...(!mounted && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!mounted || !account || !chain) {
                          return (
                            <button
                              onClick={() => {
                                openConnectModal();
                                closeMobileMenu();
                              }}
                              className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 rounded-lg hover:from-rose-600 hover:to-purple-700 transition-colors relative overflow-hidden group"
                            >
                              <span className="relative z-10">Connect Wallet</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={() => {
                                openChainModal();
                                closeMobileMenu();
                              }}
                              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 transition-colors"
                            >
                              Wrong network
                            </button>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-lg border border-cyan-500/30">
                              <span className="text-cyan-300">{balance} $CC</span>
                            </button>
                            <button
                              onClick={() => {
                                openChainModal();
                                closeMobileMenu();
                              }}
                              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-lg border border-cyan-500/30"
                            >
                              {chain.hasIcon && (
                                <div className="flex items-center justify-center gap-2">
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? "Chain icon"}
                                      src={chain.iconUrl}
                                      className="w-4 h-4"
                                    />
                                  )}
                                  {chain.name}
                                </div>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                openAccountModal();
                                closeMobileMenu();
                              }}
                              className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 rounded-lg hover:from-rose-600 hover:to-purple-700 transition-colors relative overflow-hidden group"
                            >
                              <span className="relative z-10">{account.displayName}</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>

        <main>{children}</main>

        <footer className="border-t border-cyan-800 pt-8 mt-20">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-6">
              <a href="https://x.com/GPU_mine" target="_blank" className="text-cyan-400 hover:text-cyan-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="https://t.me/GPUmineCommunity" target="_blank" className="text-cyan-400 hover:text-cyan-300">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://discord.gg/wN77AuDn" className="text-cyan-400 hover:text-cyan-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472h-15.080c-1.356 0-2.46-1.104-2.46-2.472v-19.056c0-1.368 1.104-2.472 2.46-2.472h15.080zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.204 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="text-center text-cyan-300/60 text-sm pb-8">
            <p>© 2025 GPUMINE. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <div className="pointer-events-none fixed inset-0 z-30 [mask-image:radial-gradient(transparent_30%,black)]">
        <div className="h-full bg-[radial-gradient(circle,rgba(0,200,255,0.12)_8%,transparent_40%)] bg-[size:100%_100%] bg-center"></div>
      </div>
    </div>
  );
}
