'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';

interface WalletHook {
  address: string | undefined;
  isConnected: boolean;
  connect: () => void;
  disconnectFunc: () => void;
  error: Error | null;
}

export const useWallet = (): WalletHook => {
  const [error, setError] = useState<Error | null>(null);
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const connect = async () => {
    try {
      setError(null);
      const connector = connectors[0];
      if (connector) {
        await connectAsync({ connector });
      } else {
        setError(new Error('No wallet connector found'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
    }
  };

  const disconnectFunc = async () => {
    try {
      await disconnect(); // Ensures wallet disconnection
      setError(null);
      localStorage.removeItem('wagmi.wallet'); // Clears the wallet cache
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to disconnect wallet'));
      console.error('Disconnect error:', err); // Log errors for debugging
    }
  };
  

  return {
    address,
    isConnected,
    connect,
    disconnectFunc,
    error,
  };
};