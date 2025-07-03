import type { CandleData } from '../types/candle';

export type RSIData = {
  date: Date;
  rsi: number;
};

export const calculateRSI = (candleData: CandleData[], period: number = 14): RSIData[] => {
  if (candleData.length < period + 1) {
    return [];
  }

  const rsiData: RSIData[] = [];
  
  // Calculate price changes
  const priceChanges: number[] = [];
  for (let i = 1; i < candleData.length; i++) {
    priceChanges.push(candleData[i].close - candleData[i - 1].close);
  }

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    if (priceChanges[i] > 0) {
      avgGain += priceChanges[i];
    } else {
      avgLoss += Math.abs(priceChanges[i]);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;

  // Calculate first RSI
  const rs = avgGain / (avgLoss || 1);
  const firstRSI = 100 - (100 / (1 + rs));
  
  rsiData.push({
    date: candleData[period].start,
    rsi: Number(firstRSI.toFixed(2))
  });

  // Calculate subsequent RSI values using smoothed averages
  for (let i = period; i < priceChanges.length; i++) {
    const change = priceChanges[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    // Smoothed averages (Wilder's smoothing)
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;

    const rs = avgGain / (avgLoss || 1);
    const rsi = 100 - (100 / (1 + rs));
    
    rsiData.push({
      date: candleData[i + 1].start,
      rsi: Number(rsi.toFixed(2))
    });
  }

  return rsiData;
}; 