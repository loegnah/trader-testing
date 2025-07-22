import { useMemo, useRef, useState } from "react";
import {
  EChartsCombined,
  type EChartsCombinedRef,
} from "./components/EChartsCombined";
import { generateCandleData } from "./utils/generateCandleData";
import { calculateRSI } from "./utils/rsiCalculator";
import "./App.css";

type Memo = {
  index: number;
  text: string;
};

function App() {
  const candleData = useMemo(() => generateCandleData(1000), []);
  const rsiData = useMemo(() => calculateRSI(candleData, 14), [candleData]);

  const [rsiLines, setRsiLines] = useState([30, 70]);
  const [rsiLinesInput, setRsiLinesInput] = useState("30, 70");

  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedCandleIndex, setSelectedCandleIndex] = useState<number | null>(
    null,
  );
  const [memoInput, setMemoInput] = useState("");

  const echartsCombinedRef = useRef<EChartsCombinedRef>(null);

  const handleResetZoom = () => {
    echartsCombinedRef.current?.resetZoom();
  };

  const handleRsiLinesChange = () => {
    const lines = rsiLinesInput
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    setRsiLines(lines);
  };

  const handleChartClick = (params: any) => {
    setSelectedCandleIndex(params.dataIndex);
    setMemoInput("");
  };

  const handleAddMemo = () => {
    if (selectedCandleIndex !== null && memoInput.trim() !== "") {
      setMemos((prevMemos) => [
        ...prevMemos,
        { index: selectedCandleIndex, text: memoInput.trim() },
      ]);
      setSelectedCandleIndex(null);
      setMemoInput("");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trading Strategy Tester</h1>
        <p>Candlestick Chart Analysis</p>

        <div className="settings-group">
          <div className="rsi-settings">
            <label htmlFor="rsi-lines-input">RSI Lines:</label>
            <input
              id="rsi-lines-input"
              type="text"
              value={rsiLinesInput}
              onChange={(e) => setRsiLinesInput(e.target.value)}
              placeholder="e.g., 20, 80"
            />
            <button onClick={handleRsiLinesChange}>Apply</button>
          </div>
          {selectedCandleIndex !== null && (
            <div className="memo-settings">
              <label htmlFor="memo-input">
                Memo for{" "}
                {candleData[selectedCandleIndex]?.start.toLocaleDateString()}:
              </label>
              <input
                id="memo-input"
                type="text"
                value={memoInput}
                onChange={(e) => setMemoInput(e.target.value)}
                placeholder="Enter a note"
              />
              <button onClick={handleAddMemo}>Add Memo</button>
              <button
                onClick={() => setSelectedCandleIndex(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <p className="zoom-info">
          Use mouse wheel to zoom, click and drag to pan. Click on a candle to
          add a memo.
        </p>
        <button className="reset-zoom-btn" onClick={handleResetZoom}>
          Reset Zoom
        </button>
      </header>

      <main className="app-main">
        <div className="chart-wrapper">
          <EChartsCombined
            ref={echartsCombinedRef}
            candleData={candleData}
            rsiData={rsiData}
            rsiLines={rsiLines}
            memos={memos}
            title="Sample Trading Data (ECharts)"
            onChartClick={handleChartClick}
          />
        </div>

        <div className="data-info">
          <h3>Data Summary</h3>
          <p>Total Candles: {candleData.length}</p>
          <p>
            Date Range: {candleData[0]?.start.toLocaleDateString()} -{" "}
            {candleData[candleData.length - 1]?.end.toLocaleDateString()}
          </p>
          <p>
            Price Range: ${Math.min(...candleData.map((d) => d.low)).toFixed(2)}{" "}
            - ${Math.max(...candleData.map((d) => d.high)).toFixed(2)}
          </p>
          {rsiData.length > 0 && (
            <>
              <p>RSI Data Points: {rsiData.length}</p>
              <p>Current RSI: {rsiData[rsiData.length - 1]?.rsi.toFixed(2)}</p>
              <p>
                RSI Range: {Math.min(...rsiData.map((d) => d.rsi)).toFixed(2)} -{" "}
                {Math.max(...rsiData.map((d) => d.rsi)).toFixed(2)}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
