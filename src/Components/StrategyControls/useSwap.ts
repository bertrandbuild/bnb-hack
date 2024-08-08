import { Contract, ethers } from "ethers";
import { abi as erc20ABI } from '@openzeppelin/contracts/build/contracts/ERC20.json';

import toast from "react-hot-toast";
import { IS_DEV } from "../../utils/constant";

const BSC_MAINNET_CHAIN_ID = 56;
const BSC_TESTNET_CHAIN_ID = 97;

const BSC_JSON_PROVIDER = "https://bsc-dataseed.binance.org/";
const BSC_TESTNET_JSON_PROVIDER = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const REQUIRE_METAMASK_VALIDATION = true;
const USDC_MAINNET_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDC_TESTNET_ADDRESS = "0x64544969ed7EBf5f083679233325356EbE738930";
const PANCAKESWAP_MAINNET_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const PANCAKESWAP_TESTNET_ROUTER = "0x9ac64cc6e4415144c455bd8e4837fea55603e5c3";

const useSwap = () => {
  const checkAndApproveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint
  ) => {
    try {
      console.log("checkAndApproveToken called with:");
      console.log("tokenAddress:", tokenAddress);
      console.log("spenderAddress:", spenderAddress);
      console.log("amount:", amount.toString());

      const provider = new ethers.JsonRpcProvider(BSC_JSON_PROVIDER);
      const wallet = new ethers.Wallet(import.meta.env.VITE_WALLET_PK, provider);
      const tokenContract = new Contract(tokenAddress, erc20ABI, wallet);

      const currentAllowance = await tokenContract.allowance(wallet.address, spenderAddress);
      console.log("Current Allowance:", currentAllowance.toString());

      if (currentAllowance < amount) {
        console.log("Approving token...");
        const approveTx = await tokenContract.approve(spenderAddress, amount);
        const receipt = await approveTx.wait();
        console.log("Token approved, transaction hash:", receipt.transactionHash);
      } else {
        console.log("Token already approved");
      }
    } catch (error) {
      console.error("Error in checkAndApproveToken:", error);
      throw error;
    }
  };

  const executeSwap = async ({from, to, value}: {from: string, to: string, value: string}) => {
    console.log("Starting swap execution...");
    console.log("from:", from);
    console.log("to:", to);
    console.log("value:", value);

    if (!from || !to || !value) {
      throw new Error("Invalid API result");
    }

    try {
      setIsLoading(true);

      const provider = new ethers.JsonRpcProvider(IS_DEV ? BSC_TESTNET_JSON_PROVIDER : BSC_JSON_PROVIDER);
      const wallet = new ethers.Wallet(import.meta.env.VITE_WALLET_PK, provider);

      // Determine the correct USDC address based on the environment
      const usdcAddress = IS_DEV ? USDC_TESTNET_ADDRESS : USDC_MAINNET_ADDRESS;
      console.log("USDC Address:", usdcAddress);

      // Determine the correct PancakeSwap router address based on the environment
      const routerAddress = IS_DEV ? PANCAKESWAP_TESTNET_ROUTER : PANCAKESWAP_MAINNET_ROUTER;
      console.log("Router Address:", routerAddress);

      // Check if this is a USDC to BNB swap (or any ERC20 to BNB swap)
      if (from !== ethers.ZeroAddress) {
        // This is an ERC20 to BNB swap, so we need to check approval
        const spenderAddress = routerAddress; // Use the DEX router address
        const amount = ethers.parseUnits(value, 18);
        console.log("Checking and approving token...");
        await checkAndApproveToken(usdcAddress, spenderAddress, amount);
      }

      const transaction = {
        chainId: IS_DEV ? BSC_TESTNET_CHAIN_ID : BSC_MAINNET_CHAIN_ID,
        to: routerAddress,
        data: "", // Ensure this is correct for your contract
        value: ethers.parseEther(value),
        gasLimit: ethers.toBigInt(300000)
      };

      console.log("Transaction details:", transaction);

      if (REQUIRE_METAMASK_VALIDATION) {
        // Request user to validate on MetaMask
        if (window.ethereum) {
          console.log("Requesting MetaMask validation...");
          const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
          await metamaskProvider.send("eth_requestAccounts", []);
          const signer = metamaskProvider.getSigner();
          const tx = await signer.sendTransaction(transaction);
          const receipt = await tx.wait();

          if (!receipt) {
            throw new Error("Transaction failed");
          }

          console.log("Swap executed successfully with MetaMask:", receipt.hash);
          setIsLoading(false);
          toast.success("Swap completed successfully!");
        } else {
          throw new Error("MetaMask is not installed");
        }
      } else {
        // Auto swap
        console.log("Executing auto swap...");
        const tx = await wallet.sendTransaction(transaction);
        const receipt = await tx.wait();

        if (!receipt) {
          throw new Error("Transaction failed");
        }

        console.log("Swap executed successfully:", receipt.hash);
        setIsLoading(false);
        toast.success("Swap completed successfully!");
      }
    } catch (error) {
      console.error("Swap execution failed:", error);
      setIsLoading(false);
      toast.error("Swap failed. Please try again.");
    }
  };

  return { executeSwap };
};

export default useSwap;