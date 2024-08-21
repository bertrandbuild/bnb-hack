import { renderHook, act } from "@testing-library/react";
import useLlmInteraction from "../useLlmInteraction";
import toast from "react-hot-toast";
import { ChatMessage } from "../../../chat/interface";
import useChat from "../../../chat/hooks/useChat";

jest.mock("../../../../config/env", () => ({
  VITE_WALLET_PK: 'mocked-wallet-pk',
  VITE_OPEN_AI_VISION_CONTRACT_ADDRESS: 'mocked-contract-address',
}));

jest.mock("../../../chat/hooks/useChat");
jest.mock("react-hot-toast");

describe("useLlmInteraction", () => {
  let startChatWithImageMock: jest.Mock;
  let setLlmResultMock: jest.Mock;

  beforeEach(() => {
    const chatHook = useChat as jest.MockedFunction<typeof useChat>;
    startChatWithImageMock = jest.fn();
    setLlmResultMock = jest.fn();

    chatHook.mockReturnValue({
      requestHash: null,
      setRequestHash: jest.fn(),
      llmResult: null,
      setLlmResult: setLlmResultMock,
      startChatWithImage: startChatWithImageMock,
    });

    toast.success = jest.fn();
    toast.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return LLM response and set it correctly", async () => {
    const mockResponse: ChatMessage = {
      content: "Mock response",
      role: "assistant",
      transactionHash: "mocked-transaction-hash",
    };

    startChatWithImageMock.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLlmInteraction());

    let response;
    await act(async () => {
      response = await result.current.getLlmResponse(
        "mock-ipfs-hash",
        "mock-prompt"
      );
    });

    expect(startChatWithImageMock).toHaveBeenCalledWith(
      "mock-ipfs-hash",
      "mock-prompt"
    );
    expect(setLlmResultMock).toHaveBeenCalledWith(mockResponse);
    expect(response).toEqual(mockResponse);
    expect(toast.success).toHaveBeenCalledWith("Received response from LLM");
  });

  it("Should handle errors when LLM response fails", async () => {
    startChatWithImageMock.mockRejectedValue(new Error("LLM error"));

    const { result } = renderHook(() => useLlmInteraction());

    await act(async () => {
      await expect(
        result.current.getLlmResponse("mock-ipfs-hash", "mock-prompt")
      ).rejects.toThrow("LLM error"); // Correction pour matcher l'erreur réelle
    });

    expect(startChatWithImageMock).toHaveBeenCalledWith(
      "mock-ipfs-hash",
      "mock-prompt"
    );
    expect(setLlmResultMock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Error interacting with LLM.");
  });
});
