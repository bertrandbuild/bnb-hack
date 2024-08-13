import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { WagmiProvider } from 'wagmi'
import { bscTestnet, Chain, mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WALLET_CONNECT_PROJECT_ID, GREENFIELD_RPC_URL, GREEN_CHAIN_ID } from './env'

const queryClient = new QueryClient()

const projectId = WALLET_CONNECT_PROJECT_ID

const metadata = {
  name: 'bnb-hack',
  description: 'Bnb Hackathon - Backtesting',
  url: 'http://localhost:5173', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const greenFieldChain = {
  id: GREEN_CHAIN_ID,
  rpcUrls: {
    default: {
      http: [GREENFIELD_RPC_URL],
    },
    public: {
      http: [GREENFIELD_RPC_URL],
    },
  },
  name: 'greenfield',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
} as const satisfies Chain;

const chains = [mainnet, bscTestnet, greenFieldChain] as const
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

createWeb3Modal({
  metadata,
  wagmiConfig: config,
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
