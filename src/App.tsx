import { useMemo, useRef, useCallback, useState } from 'react'
import { CandlestickChart, type CandlestickChartRef } from './components/CandlestickChart'
import { EChartsCombined, type EChartsCombinedRef } from './components/EChartsCombined'
import { RSIChart, type RSIChartRef } from './components/RSIChart'
import { generateCandleData } from './utils/generateCandleData'
import { calculateRSI } from './utils/rsiCalculator'
import './App.css'

function App() {
  const [chartType, setChartType] = useState<'chartjs' | 'echarts'>('chartjs')
  const candleData = useMemo(() => generateCandleData(50), [])
  const rsiData = useMemo(() => calculateRSI(candleData, 14), [candleData])
  
  const candleChartRef = useRef<CandlestickChartRef>(null)
  const echartsCombinedRef = useRef<EChartsCombinedRef>(null)
  const rsiChartRef = useRef<RSIChartRef>(null)
  const isUpdatingRef = useRef<string | null>(null)

  const handleCandleZoom = useCallback((min: number, max: number) => {
    if (isUpdatingRef.current === 'candle') return
    
    isUpdatingRef.current = 'rsi'
    if (rsiChartRef.current) {
      rsiChartRef.current.zoomToRange(min, max)
    }
    
    setTimeout(() => {
      isUpdatingRef.current = null
    }, 200)
  }, [])

  const handleRsiZoom = useCallback((min: number, max: number) => {
    if (isUpdatingRef.current === 'rsi') return
    
    isUpdatingRef.current = 'candle'
    if (candleChartRef.current) {
      candleChartRef.current.zoomToRange(min, max)
    }
    
    setTimeout(() => {
      isUpdatingRef.current = null
    }, 200)
  }, [])

  const handleResetZoom = () => {
    if (chartType === 'chartjs') {
      candleChartRef.current?.resetZoom()
      rsiChartRef.current?.resetZoom()
    } else {
      echartsCombinedRef.current?.resetZoom()
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trading Strategy Tester</h1>
        <p>Candlestick Chart Analysis</p>
        
        <div className="chart-selector">
          <button 
            className={`chart-selector-btn ${chartType === 'chartjs' ? 'active' : ''}`}
            onClick={() => setChartType('chartjs')}
          >
            Chart.js
          </button>
          <button 
            className={`chart-selector-btn ${chartType === 'echarts' ? 'active' : ''}`}
            onClick={() => setChartType('echarts')}
          >
            ECharts
          </button>
        </div>
        
        <p className="zoom-info">Use mouse wheel to zoom, click and drag to pan</p>
        <button className="reset-zoom-btn" onClick={handleResetZoom}>
          Reset Zoom
        </button>
      </header>
      
      <main className="app-main">
        {chartType === 'chartjs' ? (
          <>
            <div className="chart-wrapper">
              <CandlestickChart 
                ref={candleChartRef}
                data={candleData} 
                title="Sample Trading Data (Chart.js)"
                onZoom={handleCandleZoom}
              />
            </div>
            <div className="rsi-wrapper">
              <RSIChart 
                ref={rsiChartRef}
                data={rsiData} 
                title="RSI (14)"
                onZoom={handleRsiZoom}
              />
            </div>
          </>
        ) : (
          <div className="chart-wrapper">
            <EChartsCombined
              ref={echartsCombinedRef}
              candleData={candleData}
              rsiData={rsiData}
              title="Sample Trading Data (ECharts)"
            />
          </div>
        )}
        
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
