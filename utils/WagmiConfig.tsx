import { http, createConfig, WagmiProvider } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [bsc],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: "a1970e69f049bbfc7dec9ed0b818a703" }),
  ],
  transports: {
    [bsc.id]: http(),
  },
});

export default function WagmiConfig({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}