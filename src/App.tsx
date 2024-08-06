import { useEffect, useState } from 'react';
import { Contract, ethers, TransactionReceipt } from 'ethers';
import { toast } from 'react-hot-toast';

import './App.css'

import TradingViewWidget from './Components/TradingViewWidget'
import { ChatMessage } from './Components/Chat/interface';
import Message from './Components/Chat/Message';
import Loading from './Components/Loading';
import { chatGptVisionABI } from './ABIs/chatgptvision';
import { IS_DEV } from './utils/constant';
import { uploadToIpfs } from './utils/ipfs';


// TODO: add prompt + trade history + strategy from context
const prompt = "Do a technical analysis.";

function App() {
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
          content: "The provided chart displays the price movement of Bitcoin (BTC) against Tether (USDT) using candlestick representation. Additionally, the chart includes a volume indicator below the price chart and the Relative Strength Index (RSI) indicator below that. ### Price Analysis: 1. **Price Movement**: The chart shows a significant downward movement in the price of Bitcoin. The large red candlestick indicates a strong sell-off. 2. **Current Price**: Bitcoin is currently priced at approximately $55,353.57 according to the chart. ### Volume Analysis: - The volume bars show a substantial increase in trading volume corresponding with the price drop, which suggests a strong selling pressure. ### RSI Analysis: - The RSI is displayed at 31.35, which places it near the oversold territory (usually considered oversold under 30). This could indicate that Bitcoin might be reaching a point where an upward correction could occur, as the market perceives it as undervalued. ### Conclusion and Possible Actions: - The market sentiment appears bearish given the sharp decline and the high trading volume. - Since RSI is close to oversold conditions, potential investors might watch for a possible reversal if other market conditions align, such as positive news or changes in market dynamics. - Current holders might consider their risk tolerance and either hold to weather any potential further drops anticipating future gains or limit losses if they believe the price could decrease further. It's important to consider using additional analysis techniques and data to make informed trading decisions, including fundamental analysis and broader market trends.",
          role: "assistant",
          transactionHash: "0x0"
        };
      } else {
        const ipfsHash = await uploadToIpfs(blob);
        llmResponse = await startChatWithImage(ipfsHash, prompt);
      }
      setLlmResult(llmResponse);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('An unknown error occurred');
      setIsLoading(false);
    }
  }

  return (
    <section className='flex flex-row'>
      <div className='w-[50vw] h-[80vh]'>
        <TradingViewWidget />
      </div>
      <div className='w-[50vw] h-[50vh]'>
        {!isLoading && <button className='btn btn-primary' onClick={runStrategy}>Start</button>}
        {screenshot && <img src={screenshot} alt="screenshot" />}
        {isLoading && <Loading />}
        {requestHash && <p>Request Hash: {requestHash}</p>}
        {llmResult && <Message message={llmResult} />}
      </div>
    </section>
  )
}

export default App