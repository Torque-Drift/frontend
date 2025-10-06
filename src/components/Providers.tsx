import React from "react";
import WalletProviderWrapper from "./WalletProvider";
import { QueryProvider } from "../providers/QueryProvider";
import { WebSocketProvider } from "../providers/WebSocketProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      <WalletProviderWrapper>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </WalletProviderWrapper>
    </QueryProvider>
  );
};

export default Providers;
