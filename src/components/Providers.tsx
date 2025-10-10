import React from "react";
import WalletProviderWrapper from "./WalletProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <WalletProviderWrapper>{children}</WalletProviderWrapper>;
};

export default Providers;
