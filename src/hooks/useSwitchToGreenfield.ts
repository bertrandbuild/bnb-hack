import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { GREEN_CHAIN_ID } from "../config/env";
import { greenFieldChain } from "../config/chains";
import toast from "react-hot-toast";

export const useSwitchToGreenfield = () => {
  const { chain } = useAccount();
  const { switchChain, error: switchError } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const isOnGreenfield = chain?.id === GREEN_CHAIN_ID;

  const switchToGreenfieldNetwork = async () => {
    if (!isOnGreenfield && switchChain) {
      switchChain({ chainId: GREEN_CHAIN_ID });
      
      if (switchError) {
        if (isChainNotAddedError(switchError)) {
          if (!walletClient) {
            console.error("Cannot change chain because wallet client is not available");
            return;
          }
          try {
            await walletClient.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${greenFieldChain.id.toString(16)}`,
                  chainName: greenFieldChain.name,
                  nativeCurrency: greenFieldChain.nativeCurrency,
                  rpcUrls: [greenFieldChain.rpcUrls.default.http[0]],
                  blockExplorerUrls: [greenFieldChain.blockExplorers?.default.url],
                },
              ],
            });
            switchChain({ chainId: GREEN_CHAIN_ID });
          } catch (addError) {
            console.error('Error adding the Greenfield network:', addError);
            toast.error('Failed to add the Greenfield network. Please add it manually.');
          }
        } else {
          toast.error('Failed to switch to the Greenfield network.');
        }
      }
    }
  };

  return { isOnGreenfield, switchToGreenfieldNetwork };
};

interface ChainError extends Error {
  code?: number;
}

function isChainNotAddedError(error: ChainError): boolean {
  return 'code' in error && error.code === 4902;
}