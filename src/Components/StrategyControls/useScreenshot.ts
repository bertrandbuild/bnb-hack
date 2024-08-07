import { useState, useEffect } from "react";

const useScreenshot = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (screenshot) {
        // cleanup function when component unmounts
        // (because URL.createObjectURL() remains in memory and causes memory leak)
        URL.revokeObjectURL(screenshot);
      }
    };
  }, [screenshot]);

  // Take screenshot of the current tab and crop it to the tradingview widget
  const takeTradingViewScreenshot = async (): Promise<{ blob: Blob, screenshotUrl: string }> => {
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

  return { screenshot, setScreenshot, takeTradingViewScreenshot };
};

export default useScreenshot;