import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { GREEN_CHAIN_ID } from "../config/env";
import { greenFieldChain } from "../config/chains";
import toast from "react-hot-toast";

export const useSwitchToGreenfield = () => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const isOnGreenfield = chain?.id === GREEN_CHAIN_ID;

  const switchToGreenfieldNetwork = async () => {
    if (!isOnGreenfield && switchChain) {
      try {
        await switchChain({ chainId: GREEN_CHAIN_ID });
      } catch (error) {
        if (isChainNotAddedError(error)) {
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
            await switchChain({ chainId: GREEN_CHAIN_ID });
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

function isChainNotAddedError(error: unknown): error is { code: number } {
  return error instanceof Error && 'code' in error && error.code === 4902;
}