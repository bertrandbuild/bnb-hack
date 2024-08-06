import { TransactionReceipt, Contract, ethers } from "ethers";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { chatGptVisionABI } from "../../ABIs/chatgptvision";
import { IS_DEV } from "../../utils/constant";
import { uploadToIpfs } from "../../utils/ipfs";
import { ChatMessage } from "../Chat/interface";
import Message from "../Chat/Message";
import Loading from "../Loading";

// TODO: add prompt + trade history + strategy from context
const usdcAmount = 100;
const bnbAmount = 0;
const prompt = `You are an asset manager. 
I actually have : ${usdcAmount} USDC and ${bnbAmount} BNB
Do a technical analysis of the chart and provide a recommendation on whether to buy, sell, or hold. 
If we should buy or sell, always follow this format : ACTION: I want to swap {value} {assetFrom} to {assetTo} on Binance Smart Chain`;

const templateLLMResponse = `
Looking at the provided chart for Binance Coin (BNB) against USDT, it shows current data points and indicators that can guide our decision:

Price Movement: BNB has been recently showing an upward trend, as indicated by the rally from around $320 USD to around $488 USD.

Volume: There is a noticeable volume during the price increase, which supports the reliability of the trend.

Moving Average: The price is currently above the Simple Moving Average (SMA) 9 close (537.3), which could indicate a positive momentum. It suggests the market could be bullish in the short term.

Relative Strength Index (RSI): The RSI is at 33.80, which is closer to the lower end of the range but still above the typical 'oversold' threshold of 30. This suggests that there is room for upward movement before the asset becomes overbought.

Recommendation:
Based on the technical analysis, BNB is witnessing a bullish phase with support from both volume indicators and price action consistently remaining above the short-term moving average. Although the RSI is on the lower side indicating the asset is not overbought yet, one should watch for any sudden movements or changes.

However, considering the upward trend and the relatively low level of RSI, it may be a good opportunity to invest in BNB due to potential further price appreciation.

Suggested Action:
ACTION: I want to swap 100 USDC to BNB on Binance Smart Chain.

This action is based on the analysis and the bullish signals from the chart. However, always consider your personal financial situation or consult with a financial advisor to tailor decisions to your individual investment goals and risk tolerance.
`

const ExecuteStrategy = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestHash, setRequestHash] = useState<string | null>(null);
  const [llmResult, setLlmResult] = useState<ChatMessage | null>(null);

  useEffect(() => {
    return () => {
      // cleanup function when component unmounts
      // (because URL.createObjectURL() remains in memory and causes memory leak)
      if (screenshot) {
        URL.revokeObjectURL(screenshot);
      }
    };
  }, [screenshot]);

  const takeScreenshot = async (): Promise<{ blob: Blob, screenshotUrl: string }> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true
      } as DisplayMediaStreamOptions);
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      stream.getTracks().forEach(track => track.stop());

      const element = document.querySelector('.tradingview-widget-container') as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Use offsetWidth and offsetHeight for actual element dimensions
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = element.offsetWidth;
        croppedCanvas.height = element.offsetHeight;

        const croppedCtx = croppedCanvas.getContext('2d');
        if (croppedCtx) {
          const scaleX = video.videoWidth / window.innerWidth;
          const scaleY = video.videoHeight / window.innerHeight;

          croppedCtx.drawImage(
            canvas,
            (rect.left + scrollX) * scaleX,
            (rect.top + scrollY) * scaleY,
            rect.width * scaleX,
            rect.height * scaleY,
            0,
            0,
            element.offsetWidth,
            element.offsetHeight
          );

          return new Promise((resolve, reject) => {
            croppedCanvas.toBlob(blob => {
              if (blob) {
                const screenshotUrl = URL.createObjectURL(blob);
                resolve({ blob, screenshotUrl });
              } else {
                reject(new Error('Failed to create blob'));
              }
            });
          });
        }
      }
    } catch (err) {
      console.error('Error taking screenshot: ', err);
      throw err;
    }
    throw new Error('Failed to take screenshot');
  };

  // TODO: move to utils or chat-utils
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

  const runStrategy = async () => {
    try {
      setIsLoading(true);
      const { blob, screenshotUrl } = await takeScreenshot();
      let llmResponse: ChatMessage | null = null;
      if (IS_DEV) {
        setScreenshot(screenshotUrl); // display image for testing, can be removed
        await new Promise((resolve) => setTimeout(resolve, 1500));
        llmResponse = {
          content: templateLLMResponse,
          role: "assistant",
          transactionHash: "0x0"
        };
      } else {
        const ipfsHash = await uploadToIpfs(blob);
        llmResponse = await startChatWithImage(ipfsHash, prompt);
      }
      setLlmResult(llmResponse);

      const actionRegex = /(?:\*\*ACTION:\*\*|ACTION:)\s*I want to swap\s+(\d+)\s+(\w+)\s+to\s+(\w+)\s+on\s+Binance\s+Smart\s+Chain/;
      const match = llmResponse?.content?.match(actionRegex);

      if (match) {
        const value = match[1];
        const assetFrom = match[2];
        const assetTo = match[3];

        console.log("Value:", value);
        console.log("Asset From:", assetFrom);
        console.log("Asset To:", assetTo);

        // if (!IS_DEV) { // TODO:
        if (IS_DEV) {
          try {
            // await executeSwap({from: assetFrom, to: assetTo, value});
            // TODO: update context with new portfolio values
            console.log('wip: execute swap')
            setIsLoading(false);
          } catch (error) {
            console.error("Error during swap process", error);
            toast.error("An error occurred during the swap process.");
            setIsLoading(false);
          }
        } else {
          // TODO: update context with new portfolio values
          console.log("Swap completed successfully!");
          // toast.success("Swap completed successfully!");
          setIsLoading(false);
        }
      } else {
        console.error("Failed to parse intent");
        console.error("LLM Response Content:", llmResponse?.content); // Debugging line
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast.error('An unknown error occurred');
      setIsLoading(false);
    }
  }
  return (
    <div>
        {!isLoading && <button className='btn btn-primary' onClick={runStrategy}>Start</button>}
        {screenshot && <img src={screenshot} alt="screenshot" />}
        {isLoading && <Loading />}
        {requestHash && <p>Request Hash: {requestHash}</p>}
        {llmResult && <Message message={llmResult} />}
    </div>
  )
};

export default ExecuteStrategy;