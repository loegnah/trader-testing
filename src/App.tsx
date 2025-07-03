import { useMemo } from 'react'
import { CandlestickChart } from './components/CandlestickChart'
import { RSIChart } from './components/RSIChart'
import { generateCandleData } from './utils/generateCandleData'
import { calculateRSI } from './utils/rsiCalculator'
import './App.css'

function App() {
  const candleData = useMemo(() => generateCandleData(50), [])
  const rsiData = useMemo(() => calculateRSI(candleData, 14), [candleData])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trading Strategy Tester</h1>
        <p>Candlestick Chart Analysis</p>
      </header>
      
      <main className="app-main">
        <div className="chart-wrapper">
          <CandlestickChart 
            data={candleData} 
            title="Sample Trading Data" 
          />
        </div>
        
        <div className="rsi-wrapper">
          <RSIChart 
            data={rsiData} 
            title="RSI (14)" 
          />
        </div>
        
        <div className="data-info">
          <h3>Data Summary</h3>
          <p>Total Candles: {candleData.length}</p>
          <p>Date Range: {candleData[0]?.start.toLocaleDateString()} - {candleData[candleData.length - 1]?.end.toLocaleDateString()}</p>
          <p>Price Range: ${Math.min(...candleData.map(d => d.low)).toFixed(2)} - ${Math.max(...candleData.map(d => d.high)).toFixed(2)}</p>
          {rsiData.length > 0 && (
            <>
              <p>RSI Data Points: {rsiData.length}</p>
              <p>Current RSI: {rsiData[rsiData.length - 1]?.rsi.toFixed(2)}</p>
              <p>RSI Range: {Math.min(...rsiData.map(d => d.rsi)).toFixed(2)} - {Math.max(...rsiData.map(d => d.rsi)).toFixed(2)}</p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
