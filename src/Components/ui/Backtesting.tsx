import React, { useState, useEffect } from "react";
import { loadImage } from "../../utils/imageLoader";
import { backtestingChartes } from "../../utils/backtestingChartes";
import styles from "./Backtesting.module.css";

const Backtesting: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === backtestingChartes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? backtestingChartes.length - 1 : prevIndex - 1
    );
  };

  const toggleZoom = () => {
    setZoom(!zoom);
  };

  // useEffect to manage keyboard-related board effects `shift + right or shift + left`.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === "ArrowRight") {
        handleNext();
      } else if (event.shiftKey && event.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Event cleanup on component destruction
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="tradingview-widget-container carousel">
          {backtestingChartes.map((image, index) => (
            <div
              key={index}
              onClick={toggleZoom}
              style={{
                cursor: zoom ? "zoom-out" : "zoom-in",
                overflow: zoom ? "auto" : "hidden",
              }}
              className={`${styles.carouselItem} ${
                index === currentIndex ? "block" : "hidden"
              }`}
            >
              <img
                src={loadImage(image)}
                className={`w-full ${zoom ? styles.zoomed : ""}`}
                alt={`Image ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center w-full">
        <button
          className="bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
          onClick={handlePrevious}
          id="prevBtn"
        >
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          className="bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
          onClick={handleNext}
          id="nextBtn"
        >
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <div className="text-center m-4 tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </>
  );
};

export default Backtesting;
