import { ITradeIntent } from "../interface";

const useTradeIntent = () => {
  const handleIntent = (text: string): ITradeIntent | null => {
    const holdRegex = /HOLD|\*\*HOLD\*\*/i;
    if (holdRegex.test(text)) {
      return null;
    }

    const actionRegex =
      /(?:\*\*ACTION\*\*|ACTION:|\*\*ACTION:\*\*)\s*(BUY|SELL)\s*(?:\n|\r\n|\r)(?:\*\*REASON\*\*|REASON:|\*\*REASON:\*\*)\s*([^\n\r]*)/i;
    const match = text.match(actionRegex);

    // Improved regex to capture BTC prices in various formats
    const priceBTCRegex = /BTC PRICE:\s*(?:approx\.|around|about)?\s*([$€£]?[\d\s,.]+)\s*(USD)?/i;
    const matchPriceBTC = text.match(priceBTCRegex);

    if (!match || !matchPriceBTC) {
      return null;
    }

    const action = match[1];
    const reason = match[2];

    // Clean up and parse the BTC price
    let priceBTC = matchPriceBTC[1]
      .replace(/[^0-9.,]/g, '') // Remove everything except digits, dots, and commas
      .replace(/\s/g, '');      // Remove spaces

    // Identify the position of the decimal separator
    if (priceBTC.includes(',')) {
      const parts = priceBTC.split(',');
      if (parts.length === 2 && parts[1].length === 2) {
        // If the comma is followed by two digits, it is a decimal
        priceBTC = priceBTC.replace(',', '.');
      } else {
        // Otherwise, the comma is a thousands separator
        priceBTC = priceBTC.replace(/,/g, '');
      }
    }

    // Remove dots that are thousands separators
    priceBTC = priceBTC.replace(/\.(?=\d{3,})/g, '');

    // Convert to an integer
    const priceBTCNumber = Math.floor(parseFloat(priceBTC));

    if (isNaN(priceBTCNumber)) {
      return null;
    }

    return { action, reason, priceBTC: priceBTCNumber };
  };

  return { handleIntent };
};

export default useTradeIntent;
