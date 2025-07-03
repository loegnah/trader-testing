import type { CandleData } from '../types/candle';

export const generateCandleData = (count: number = 50): CandleData[] => {
  const data: CandleData[] = [];
  let currentPrice = 100; // Starting price
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < count; i++) {
    const start = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000); // Daily candles
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    
    // Generate realistic price movement
    const volatility = 0.02; // 2% volatility
    const trend = (Math.random() - 0.5) * 0.01; // Small trend component
    
    const open = currentPrice;
    const priceChange = currentPrice * (trend + (Math.random() - 0.5) * volatility);
    const close = Math.max(0.1, open + priceChange);
    
    // Generate high and low based on open and close
    const maxPrice = Math.max(open, close);
    const minPrice = Math.min(open, close);
    
    const high = maxPrice + Math.random() * currentPrice * 0.01;
    const low = Math.max(0.1, minPrice - Math.random() * currentPrice * 0.01);
    
    data.push({
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      start,
      end
    });
    
    currentPrice = close;
  }
  
  return data;
}; 