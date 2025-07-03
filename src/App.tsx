import { useMemo } from 'react'
import { CandlestickChart } from './components/CandlestickChart'
import { generateCandleData } from './utils/generateCandleData'
import './App.css'

function App() {
  const candleData = useMemo(() => generateCandleData(50), [])

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
        
        <div className="data-info">
          <h3>Data Summary</h3>
          <p>Total Candles: {candleData.length}</p>
          <p>Date Range: {candleData[0]?.start.toLocaleDateString()} - {candleData[candleData.length - 1]?.end.toLocaleDateString()}</p>
          <p>Price Range: ${Math.min(...candleData.map(d => d.low)).toFixed(2)} - ${Math.max(...candleData.map(d => d.high)).toFixed(2)}</p>
        </div>
      </main>
    </div>
  )
}

export default App
