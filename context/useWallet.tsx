"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextProps {
  address: string | undefined;
  chainId: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  ethereum: any;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ethereum, setEthereum] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize SDK only on client side
  useEffect(() => {
    if (!isClient) return;

    const initializeSDK = async () => {
      try {
        // Dynamically import the SDK
        const { WalletTgSdk } = await import('@uxuycom/web3-tg-sdk');
        const { ethereum: eth } = new WalletTgSdk();
        setEthereum(eth);
      } catch (error) {
        console.error("Failed to initialize wallet SDK:", error);
      }
    };

    initializeSDK();
  }, [isClient]);

  const connect = async () => {
    if (!ethereum) {
      console.error("Wallet SDK not initialized");
      return;
    }

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
    if (!ethereum || !isClient) return;

    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    const onChainChanged = (changedChainId: string) => {
      setChainId(changedChainId);
    };

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged", onChainChanged);

    return () => {
      if (ethereum && ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", onAccountsChanged);
        ethereum.removeListener("chainChanged", onChainChanged);
      }
    };
  }, [ethereum, isClient]);

  // Show nothing until we're on the client side
  if (!isClient) {
    return null;
  }

  return (
    <WalletContext.Provider value={{ 
      address, 
      chainId, 
      isConnected, 
      connect, 
      disconnect, 
      ethereum 
    }}>
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