import { http, createConfig } from 'wagmi'
import { mainnet, bsc } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: 'a1970e69f049bbfc7dec9ed0b818a703' }),
  ],
  transports: {
    [bsc.id]: http(),
  },
})