//export const IS_DEV=import.meta.env.DEV;
export const IS_DEV=false;

// Wallet private key (need some GAL from the Galadriel faucet)
export const VITE_WALLET_PK = import.meta.env.VITE_WALLET_PK;

// # Galadriel
export const VITE_OPEN_AI_VISION_CONTRACT_ADDRESS = import.meta.env.VITE_OPEN_AI_VISION_CONTRACT_ADDRESS || "";

// BNB Greenfield
export const GRPC_URL = import.meta.env.VITE_GRPC_URL;
export const GREENFIELD_RPC_URL = import.meta.env.VITE_GREENFIELD_RPC_URL;
export const GREEN_CHAIN_ID = parseInt(import.meta.env.VITE_GREEN_CHAIN_ID);
export const BSC_RPC_URL = import.meta.env.VITE_BSC_RPC_URL;
export const BSC_CHAIN_ID = parseInt(import.meta.env.VITE_BSC_CHAIN_ID);

// BNB Greenfield default BUCKET
export const BUCKET_NAME = "test-bnb-hack";
// Web3Modal
export const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
