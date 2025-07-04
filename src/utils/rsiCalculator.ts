import type { CandleData } from '../types/candle';

export type RSIData = {
  date: Date;
  rsi: number;
};

export const calculateRSI = (candleData: CandleData[], period: number = 14): RSIData[] => {
  if (candleData.length < 2) {
    return [];
  }

  const rsiData: RSIData[] = [];
  
  // Calculate price changes
  const priceChanges: number[] = [];
  for (let i = 1; i < candleData.length; i++) {
    priceChanges.push(candleData[i].close - candleData[i - 1].close);
  }

  // Calculate RSI for each available period
  for (let currentIndex = 1; currentIndex < candleData.length; currentIndex++) {
    // Use available data up to the current index, but limit to period
    const availablePeriod = Math.min(currentIndex, period);
    const startIndex = currentIndex - availablePeriod;
    
    let avgGain = 0;
    let avgLoss = 0;
    
    // Calculate average gain and loss for available period
    for (let i = startIndex; i < currentIndex; i++) {
      if (priceChanges[i] > 0) {
        avgGain += priceChanges[i];
      } else {
        avgLoss += Math.abs(priceChanges[i]);
      }
    }
    
    avgGain /= availablePeriod;
    avgLoss /= availablePeriod;

    // Calculate RSI
    const rs = avgGain / (avgLoss || 1);
    const rsi = 100 - (100 / (1 + rs));
    
    rsiData.push({
      date: candleData[currentIndex].start,
      rsi: Number(rsi.toFixed(2))
    });
  }

  return rsiData;
}; 