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

  const switchToBscTestnet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Attempt to switch to the BSC Testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }], // BSC Testnet chain ID
        });
        console.log('Successfully switched to BSC Testnet');
      } catch (switchError: any) {
        console.error('Error while switching network:', switchError);
        // Handle the case where the network is not added to the wallet
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x61',
                  chainName: 'Binance Smart Chain Testnet',
                  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                  nativeCurrency: {
                    name: 'Binance Coin',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://testnet.bscscan.com'],
                },
              ],
            });
            console.log('BSC Testnet successfully added and switched');
          } catch (addError) {
            console.error('Failed to add BSC Testnet:', addError);
            setError(
              addError instanceof Error ? addError : new Error('Failed to add network')
            );
          }
        } else {
          setError(
            switchError instanceof Error ? switchError : new Error('Failed to switch network')
          );
        }
      }
    } else {
      const errMsg = 'MetaMask or any compatible wallet is not installed.';
      console.error(errMsg);
      setError(new Error(errMsg));
    }
  };

  const connect = async () => {
    try {
      setError(null);
      const connector = connectors[0];
      if (connector) {
        await connectAsync({ connector });
        await switchToBscTestnet(); // Automatically switch to BSC Testnet after connecting
      } else {
        setError(new Error('No wallet connector found'));
      }
    } catch (err) {
      console.error('Error during wallet connection:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect wallet'));
    }
  };

  const disconnectFunc = async () => {
    try {
      await disconnect(); // Ensures wallet disconnection
      setError(null);
      localStorage.removeItem('wagmi.wallet'); // Clears the wallet cache
    } catch (err) {
      console.error('Disconnect error:', err);
      setError(err instanceof Error ? err : new Error('Failed to disconnect wallet'));
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
