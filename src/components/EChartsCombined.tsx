import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import type { CandleData } from "../types/candle";
import type { RSIData } from "../utils/rsiCalculator";

const upColor = "#00C851";
const downColor = "#ff4444";
const zoomRange = { start: 0, end: 100 };
const dynamicSizes = {
  rsiSymbol: 10,
  rsiFont: 6,
  memoSymbol: 30,
  memoFont: 8,
};

type Memo = {
  index: number;
  text: string;
};

type EChartsCombinedProps = {
  candleData: CandleData[];
  rsiData: RSIData[];
  rsiLines?: number[];
  memos?: Memo[];
  title?: string;
  onChartClick?: (params: any) => void;
};

export type EChartsCombinedRef = {
  resetZoom: () => void;
};

export const EChartsCombined = forwardRef<
  EChartsCombinedRef,
  EChartsCombinedProps
>(
  (
    {
      candleData,
      rsiData,
      rsiLines = [30, 70],
      memos = [],
      title = "Trading Data (ECharts)",
      onChartClick,
    },
    ref,
  ) => {
    const chartRef = useRef<ReactECharts>(null);

    useImperativeHandle(
      ref,
      () => ({
        resetZoom: () => {
          chartRef.current?.getEchartsInstance()?.dispatchAction({
            type: "dataZoom",
            start: 0,
            end: 100,
          });
        },
      }),
      [],
    );

    const { categoryData, candleValues, rsiValues, markPoints } =
      useMemo(() => {
        const categoryData = candleData.map((item) =>
          item.start.toLocaleDateString(),
        );
        const candleValues = candleData.map((item) => [
          item.open,
          item.close,
          item.low,
          item.high,
        ]);
        const rsiValues = rsiData.map((item) => item.rsi);

        const allPrices = candleData.flatMap((candle) => [
          candle.low,
          candle.high,
        ]);
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        const padding = (maxPrice - minPrice) * 0.02;

        const markPoints: any[] = [];

        if (
          rsiLines &&
          rsiLines.length > 0 &&
          rsiData.length > 1 &&
          candleData.length > 1
        ) {
          for (let i = 1; i < rsiData.length; i++) {
            const prevRsi = rsiData[i - 1].rsi;
            const currentRsi = rsiData[i].rsi;

            rsiLines.forEach((line) => {
              if (prevRsi > line && currentRsi <= line) {
                markPoints.push({
                  name: "Sell Signal",
                  coord: [i, candleData[i].high + padding * 0.5],
                  value: line,
                  symbol:
                    "path://M 0 0 L -2 -2 L -5 -2 L -5 -10 L 5 -10 L 5 -2 L 2 -2 Z",
                  symbolSize: dynamicSizes.rsiSymbol,
                  itemStyle: { color: "#ff4444" },
                  label: {
                    show: true,
                    formatter: "{c}",
                    fontSize: dynamicSizes.rsiFont,
                    position: "inside",
                    color: "#fff",
                  },
                });
              }
              if (prevRsi < line && currentRsi >= line) {
                markPoints.push({
                  name: "Buy Signal",
                  coord: [i, candleData[i].low - padding * 0.5],
                  value: line,
                  symbol:
                    "path://M 0 0 L -2 2 L -5 2 L -5 10 L 5 10 L 5 2 L 2 2 Z",
                  symbolSize: dynamicSizes.rsiSymbol,
                  itemStyle: { color: "#00C851" },
                  label: {
                    show: true,
                    formatter: "{c}",
                    fontSize: dynamicSizes.rsiFont,
                    position: "inside",
                    color: "#fff",
                  },
                });
              }
            });
          }
        }

        memos.forEach((memo) => {
          if (candleData[memo.index]) {
            const textLengthOffset =
              Math.max(memo.text.length - 5, 0) * padding * 0.1;
            const baseOffset = padding * 0.6;
            const memoPosition =
              candleData[memo.index].high + baseOffset + textLengthOffset;
            const pointerPosition = candleData[memo.index].high + padding * 0.2;

            markPoints.push({
              name: "Memo",
              coord: [memo.index, memoPosition],
              value: memo.text,
              symbol: "pin",
              symbolSize: dynamicSizes.memoSymbol,
              itemStyle: { color: "transparent" },
              label: {
                show: true,
                formatter: "{c}",
                fontSize: dynamicSizes.memoFont,
                color: "#fff",
                offset: [0, -2],
              },
            });

            markPoints.push({
              name: "Memo Pointer",
              coord: [memo.index, pointerPosition],
              symbol: "triangle",
              symbolSize: 8,
              symbolRotate: 180,
              itemStyle: { color: "#fff" },
              label: { show: false },
            });
          }
        });

        return { categoryData, candleValues, rsiValues, markPoints };
      }, [candleData, rsiData, rsiLines, memos]);

    const option: EChartsOption = useMemo(() => {
      return {
        animation: false,
        backgroundColor: "#000000",
        title: {
          text: title,
          left: "center",
          textStyle: {
            color: "#fff",
          },
        },
        legend: {
          bottom: 30,
          left: "center",
          data: ["Candlestick", "RSI"],
          textStyle: {
            color: "#fff",
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          textStyle: {
            color: "#fff",
          },
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          formatter: (params: any) => {
            const candleParams = params.find(
              (p: any) => p.seriesType === "candlestick",
            );
            const rsiParams = params.find((p: any) => p.seriesName === "RSI");

            if (!candleParams) return "";

            let res = `Date: ${candleParams.axisValue}<br/>`;

            const data = candleParams.data;
            res += `Open: ${data[1].toFixed(2)}<br/>`;
            res += `Close: ${data[2].toFixed(2)}<br/>`;
            res += `Low: ${data[3].toFixed(2)}<br/>`;
            res += `High: ${data[4].toFixed(2)}<br/>`;

            if (rsiParams) {
              res += `RSI: ${rsiParams.data.toFixed(2)}<br/>`;
            }

            return res;
          },
        },
        axisPointer: {
          link: [
            {
              xAxisIndex: "all",
            },
          ],
          label: {
            backgroundColor: "#777",
          },
        },
        grid: [
          {
            left: "10%",
            right: "8%",
            height: "50%",
          },
          {
            left: "10%",
            right: "8%",
            top: "68%",
            height: "16%",
          },
        ],
        xAxis: [
          {
            type: "category",
            data: categoryData,
            boundaryGap: false,
            axisLine: { onZero: false, lineStyle: { color: "#fff" } },
            splitLine: { show: false },
            min: "dataMin",
            max: "dataMax",
            axisPointer: {
              z: 100,
            },
          },
          {
            type: "category",
            gridIndex: 1,
            data: categoryData,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: "dataMin",
            max: "dataMax",
          },
        ],
        yAxis: [
          {
            scale: true,
            splitArea: {
              show: false,
            },
            axisLine: {
              lineStyle: { color: "#fff" },
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: "#fff",
            },
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            splitArea: { show: false },
          },
        ],
        dataZoom: [
          {
            type: "inside",
            xAxisIndex: [0, 1],
            start: zoomRange.start,
            end: zoomRange.end,
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: "slider",
            top: "90%",
            start: zoomRange.start,
            end: zoomRange.end,
            textStyle: { color: "#fff" },
          },
        ],
        series: [
          {
            name: "Candlestick",
            type: "candlestick",
            data: candleValues,
            itemStyle: {
              color: upColor,
              color0: downColor,
              borderColor: upColor,
              borderColor0: downColor,
            },
            markPoint: {
              data: markPoints,
            },
          },
          {
            name: "RSI",
            type: "line",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: rsiValues,
            smooth: true,
            lineStyle: {
              width: 2,
              color: "#f0b90b",
            },
            markLine: {
              silent: true,
              data: rsiLines.map((line) => ({
                yAxis: line,
                lineStyle: {
                  color: line > 50 ? "#00C851" : "#ff4444",
                  type: "dashed",
                },
                label: {
                  formatter: `(${line})`,
                },
              })),
            },
          },
        ],
      };
    }, [categoryData, candleValues, rsiValues, markPoints, rsiLines, title]);

    const onEvents = useMemo(
      () => ({
        click: (params: any) => {
          if (params.seriesType === "candlestick") {
            onChartClick?.(params);
          }
        },
      }),
      [onChartClick],
    );

    return (
      <div className="chart-container" style={{ height: "600px" }}>
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: "100%", width: "100%" }}
          onEvents={onEvents}
        />
      </div>
    );
  },
);
