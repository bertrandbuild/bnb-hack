import { http, createConfig } from 'wagmi'
import { mainnet, bscTestnet } from 'wagmi/chains'
// TODO: add greenfieldTestnet

export const config = createConfig({
  chains: [mainnet, bscTestnet],
  transports: {
    [mainnet.id]: http(),
    [bscTestnet.id]: http(),
  },
})