import { useEffect, useState } from 'react';
import './App.css'
import TradingViewWidget from './Components/TradingViewWidget'

function App() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      // cleanup function when component unmounts
      // (because URL.createObjectURL() remains in memory and causes memory leak)
      if (screenshot) {
        URL.revokeObjectURL(screenshot);
      }
    };
  }, [screenshot]);

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true });
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
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

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

          croppedCanvas.toBlob(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setScreenshot(url);
            }
          });
        }
      }
    } catch (err) {
      console.error('Error taking screenshot:', err);
    }
  };

  return (
    <section className='flex flex-row'>
      <div className='w-[50vw] h-[80vh]'>
        <TradingViewWidget />
      </div>
      <div className='w-[50vw] h-[50vh]'>
        <button className='btn btn-primary' onClick={takeScreenshot}>Start</button>
        {screenshot && <img src={screenshot} alt="screenshot" />}
      </div>
    </section>
  )
}

export default App
