import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import type { RSIData } from '../utils/rsiCalculator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type RSIChartProps = {
  data: RSIData[];
  title?: string;
};

export const RSIChart = ({ data, title = "RSI (14)" }: RSIChartProps) => {
  const chartData = {
    datasets: [
      {
        label: 'RSI',
        data: data.map(item => ({
          x: item.date.getTime(),
          y: item.rsi,
        })),
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
        tension: 0.1,
      },
      // Overbought line (70)
      {
        label: 'Overbought (70)',
        data: data.map(item => ({
          x: item.date.getTime(),
          y: 70,
        })),
        borderColor: 'rgba(255, 68, 68, 0.6)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
      // Oversold line (30)
      {
        label: 'Oversold (30)',
        data: data.map(item => ({
          x: item.date.getTime(),
          y: 30,
        })),
        borderColor: 'rgba(0, 200, 81, 0.6)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
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
        font: {
          size: 14,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return `RSI: ${context.parsed.y.toFixed(2)}`;
            }
            return undefined;
          },
        },
        filter: (tooltipItem: any) => tooltipItem.datasetIndex === 0,
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
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
          stepSize: 20,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="rsi-chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
}; 