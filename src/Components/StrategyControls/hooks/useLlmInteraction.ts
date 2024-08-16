import useChat from "../../chat/hooks/useChat";
import { ChatMessage } from "../../chat/interface";
import toast from "react-hot-toast";

const useLlmInteraction = () => {
  const { startChatWithImage, setLlmResult } = useChat();

  const getLlmResponse = async (
    ipfshash: string,
    prompt: string
  ): Promise<ChatMessage> => {
    try {
      const llmResponse = await startChatWithImage(ipfshash, prompt);

      if (!llmResponse) {
        throw new Error("Failed to get response from LLM");
      }
      setLlmResult(llmResponse);
      toast.success("Received response from LLM");
      return llmResponse;
    } catch (error) {
      toast.error("Error interacting with LLM.");
      throw error;
    }
  };

  return { getLlmResponse };
};

export default useLlmInteraction;
