import { Chain } from 'wagmi/chains'
import { GREENFIELD_RPC_URL, GREEN_CHAIN_EXPLORER_URL, GREEN_CHAIN_ID } from './env'

export const greenFieldChain = {
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
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  blockExplorers: {
    default: {
      url: GREEN_CHAIN_EXPLORER_URL,
      name: "Greenfield Testnet",
    },
  },
} as const satisfies Chain;