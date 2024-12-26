'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';

interface WalletHook {
  address: string | undefined;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  error: Error | null;
}

export const useWallet = (): WalletHook => {
  const [error, setError] = useState<Error | null>(null);
  
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const connect = async () => {
    try {
      setError(null);
      const connector = connectors[0]; // Usually MetaMask/injected
      if (connector) {
        await connectAsync({ connector });
      } else {
        setError(new Error('No wallet connector found'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
    }
  };

  const disconnect = async () => {
    try {
      await disconnectAsync();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to disconnect wallet'));
    }
  };

  return {
    address,
    isConnected,
    connect,
    disconnect,
    error,
  };
};