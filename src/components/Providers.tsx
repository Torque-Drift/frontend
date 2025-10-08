import React from "react";
import WalletProviderWrapper from "./WalletProvider";
import { QueryProvider } from "../providers/QueryProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      <WalletProviderWrapper>{children}</WalletProviderWrapper>
    </QueryProvider>
  );
};

export default Providers;
