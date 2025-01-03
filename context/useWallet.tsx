// WalletContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { WalletTgSdk } from "@uxuycom/web3-tg-sdk";

const { ethereum } = new WalletTgSdk();

interface WalletContextProps {
  address: string | undefined;
  chainId: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);

        const currentChainId = await ethereum.request({ method: "eth_chainId" });
        setChainId(currentChainId);

        if (currentChainId !== "0x61") {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x61" }],
          });
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnect = () => {
    setAddress(undefined);
    setChainId(null);
    setIsConnected(false);
    localStorage.removeItem("wagmi.wallet");
  };

  useEffect(() => {
    const setupListeners = () => {
      ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      });

      ethereum.on("chainChanged", (changedChainId) => {
        setChainId(changedChainId);
      });
    };

    setupListeners();
    return () => {
      ethereum.removeAllListeners();
    };
  }, []);

  return (
    <WalletContext.Provider value={{ address, chainId, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
