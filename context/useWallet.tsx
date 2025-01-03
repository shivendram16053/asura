"use client";

import { useState } from "react";
import { WalletTgSdk } from "@uxuycom/web3-tg-sdk";

const { ethereum } = new WalletTgSdk();

interface WalletHook {
  address: string | undefined;
  isConnected: boolean;
  connect: () => void;
  disconnectFunc: () => void;
  error: Error | null;
}

export const useWallet = (): WalletHook => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      setError(null);
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);

        const currentChainId = await ethereum.request({
          method: "eth_chainId",
        });
        setChainId(currentChainId);

        if (currentChainId !== "0x61") {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x61" }],
          });
        }
      } else {
        setError(new Error("No accounts found"));
      }
    } catch (err) {
      console.error("Error during wallet connection:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to connect wallet")
      );
    }
  };

  // Disconnect the wallet
  const disconnectFunc = async () => {
    try {
      setAddress(undefined);
      setChainId(null);
      setIsConnected(false);
      setError(null);
      localStorage.removeItem("wagmi.wallet"); // Clears the wallet cache
      console.log("Disconnected from wallet");
    } catch (err) {
      console.error("Disconnect error:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to disconnect wallet")
      );
    }
  };

  // Set up event listeners for account and chain changes
  const setupListeners = () => {
    if (ethereum) {
      ethereum.removeAllListeners();
      ethereum.on("accountsChanged", (accounts) => {
        setAddress(accounts[0]);
        console.log("Active account changed:", accounts[0]);
      });
      ethereum.on("chainChanged", (changedChainId) => {
        setChainId(changedChainId);
        console.log("Network changed to:", changedChainId);
      });
    }
  };

  // Call the setupListeners once when the component is mounted
  if (isConnected) {
    setupListeners();
  }

  return {
    address,
    isConnected,
    connect,
    disconnectFunc,
    error,
  };
};
