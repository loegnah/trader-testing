import { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CandleData } from '../types/candle';

type CandlestickChartEChartsProps = {
  data: CandleData[];
  title?: string;
  onZoom?: (min: number, max: number) => void;
};

export type CandlestickChartEChartsRef = {
  resetZoom: () => void;
  zoomToRange: (min: number, max: number) => void;
};

export const CandlestickChartECharts = forwardRef<CandlestickChartEChartsRef, CandlestickChartEChartsProps>(
  ({ data, title = "Candlestick Chart (ECharts)", onZoom }, ref) => {
    const chartRef = useRef<ReactECharts>(null);
    const debounceTimerRef = useRef<number | null>(null);

    const debouncedOnZoom = useCallback((min: number, max: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onZoom?.(min, max);
      }, 50);
    }, [onZoom]);

    useImperativeHandle(ref, () => ({
      resetZoom: () => {
        const chart = chartRef.current?.getEchartsInstance();
        if (chart) {
          chart.dispatchAction({
            type: 'dataZoom',
            start: 0,
            end: 100
          });
        }
      },
      zoomToRange: (min: number, max: number) => {
        const chart = chartRef.current?.getEchartsInstance();
        if (chart) {
          const totalData = data.length;
          const minIndex = data.findIndex(d => d.start.getTime() >= min);
          const maxIndex = data.findIndex(d => d.start.getTime() >= max);
          
          const startPercent = (minIndex / totalData) * 100;
          const endPercent = (maxIndex / totalData) * 100;
          
          chart.dispatchAction({
            type: 'dataZoom',
            start: startPercent,
            end: endPercent
          });
        }
      }
    }), [data]);

    const chartData = data.map(candle => [
      candle.start.getTime(),
      candle.open,
      candle.close,
      candle.low,
      candle.high
    ]);

    // Calculate Y-axis range based on data
    const allPrices = data.flatMap(candle => [candle.open, candle.close, candle.low, candle.high]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.05; // 5% padding

    const option: EChartsOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#fff'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textStyle: {
          color: '#fff'
        },
        formatter: (params: any) => {
          const param = params[0];
          const data = param.data;
          return [
            `Date: ${new Date(data[0]).toLocaleDateString()}`,
            `Open: ${data[1].toFixed(2)}`,
            `Close: ${data[2].toFixed(2)}`,
            `Low: ${data[3].toFixed(2)}`,
            `High: ${data[4].toFixed(2)}`
          ].join('<br/>');
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisLabel: {
          color: '#fff'
        }
      },
      yAxis: {
        type: 'value',
        min: minPrice - padding,
        max: maxPrice + padding,
        scale: true,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
          }
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        axisLabel: {
          color: '#fff'
        }
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          throttle: 50
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          start: 0,
          end: 100,
          bottom: '5%',
          textStyle: {
            color: '#fff'
          },
          borderColor: 'rgba(255, 255, 255, 0.3)',
          fillerColor: 'rgba(255, 255, 255, 0.1)'
        }
      ],
      series: [
        {
          name: 'Candlestick',
          type: 'candlestick',
          data: chartData,
          itemStyle: {
            color: '#00C851',
            color0: '#ff4444',
            borderColor: '#00C851',
            borderColor0: '#ff4444',
            borderWidth: 1
          }
        }
      ]
    };

    const onEvents = {
      dataZoom: (params: any) => {
        if (params.batch && params.batch[0]) {
          const { start, end } = params.batch[0];
          const totalDataLength = data.length;
          const startIndex = Math.floor((start / 100) * totalDataLength);
          const endIndex = Math.floor((end / 100) * totalDataLength);
          
          if (startIndex < data.length && endIndex < data.length) {
            const startTime = data[startIndex]?.start.getTime() || 0;
            const endTime = data[endIndex]?.start.getTime() || 0;
            
            debouncedOnZoom(startTime, endTime);
          }
        }
      }
    };

    return (
      <div className="chart-container">
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: '400px', width: '100%' }}
          onEvents={onEvents}
        />
      </div>
    );
  }
); 