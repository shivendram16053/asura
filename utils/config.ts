'use client';

import { http, createConfig } from 'wagmi'
import { mainnet, bsc } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID' }),
  ],
  transports: {
    [bsc.id]: http(),
  },
})