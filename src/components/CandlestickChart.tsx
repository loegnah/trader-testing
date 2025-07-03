import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import type { CandleData } from '../types/candle';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

type CandlestickChartProps = {
  data: CandleData[];
  title?: string;
};

export const CandlestickChart = ({ data, title = "Candlestick Chart" }: CandlestickChartProps) => {
  const chartData = {
    datasets: [
      {
        label: 'Price',
        data: data.map(candle => ({
          x: candle.start.getTime(),
          o: candle.open,
          h: candle.high,
          l: candle.low,
          c: candle.close,
        })),
        borderColor: '#000',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        color: {
          up: '#00C851',
          down: '#ff4444',
          unchanged: '#666',
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: '#fff',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const point = context.parsed;
            return [
              `Open: ${point.o?.toFixed(2)}`,
              `High: ${point.h?.toFixed(2)}`,
              `Low: ${point.l?.toFixed(2)}`,
              `Close: ${point.c?.toFixed(2)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM dd',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Chart type="candlestick" data={chartData} options={options} />
    </div>
  );
}; 