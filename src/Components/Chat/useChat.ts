import { useState } from "react";
import { TransactionReceipt, Contract, ethers } from "ethers";
import { chatGptVisionABI } from "../../abis/chatgptvision";
import { ChatMessage } from "./interface";
import { IS_DEV } from "../../config/env";

const useChat = () => {
  const [requestHash, setRequestHash] = useState<string | null>(null);
  const [llmResult, setLlmResult] = useState<ChatMessage | null>(null);

  function getChatId(receipt: TransactionReceipt, contract: Contract) {
    let chatId;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "ChatCreated") {
          // Second event argument
          chatId = ethers.toNumber(parsedLog.args[1]);
        }
      } catch (error) {
        // This log might not have been from your contract, or it might be an anonymous log
        console.error("Could not parse log:", log);
      }
    }
    return chatId;
  }

  const startChatWithImage = async (imgIpfsHash: string, prompt: string): Promise<ChatMessage> => {
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://devnet.galadriel.com"
      );
      const wallet = new ethers.Wallet(
        import.meta.env.VITE_WALLET_PK,
        provider
      );
      const signer = wallet;
      const contract = new Contract(
        import.meta.env.VITE_OPEN_AI_VISION_CONTRACT_ADDRESS || "",
        chatGptVisionABI,
        signer
      );
      const gasPrice = ethers.parseUnits("1", "gwei"); // 1 Gwei
      const gasLimit = 5000000; // large gas limit 5,000,000

      const tx = await contract.startChat(
        prompt,
        ["ipfs://" + imgIpfsHash],
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        }
      );
      const receipt = await tx.wait();
      setRequestHash(receipt.hash);
      const chatId = getChatId(receipt, contract);
      if (receipt && receipt.status) {
        if (chatId) {
          while (true) {
            const newMessages: ChatMessage[] = await contract.getMessageHistory(
              chatId
            );
            if (newMessages) {
              const lastMessage = newMessages.at(-1);
              if (lastMessage && lastMessage.role === "assistant") {
                let content: string | undefined;
                for (const message of newMessages) {
                  const target_copy = JSON.parse(JSON.stringify(message));
                  if (target_copy[0] === "assistant") {
                    if (IS_DEV) {
                      console.log(target_copy);
                      console.log(target_copy[1][0][1]);
                    }
                    content = target_copy[1][0][1];
                    break;
                  }
                }
                if (content) return {
                  content,
                  role: "assistant",
                  transactionHash: receipt.hash
                };
              }
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      throw error;
    }
    throw new Error("Failed to request llm result");
  };

  return { requestHash, setRequestHash, llmResult, setLlmResult, startChatWithImage };
};

export default useChat;