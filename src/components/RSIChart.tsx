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
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import type { RSIData } from '../utils/rsiCalculator';
import { useRef, forwardRef, useImperativeHandle, useCallback } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

type RSIChartProps = {
  data: RSIData[];
  title?: string;
  onZoom?: (min: number, max: number) => void;
};

export type RSIChartRef = {
  resetZoom: () => void;
  zoomToRange: (min: number, max: number) => void;
};

export const RSIChart = forwardRef<RSIChartRef, RSIChartProps>(({ data, title = "RSI (14)", onZoom }, ref) => {
  const chartRef = useRef<any>(null);
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
      if (chartRef.current) {
        chartRef.current.resetZoom();
      }
    },
    zoomToRange: (min: number, max: number) => {
      if (chartRef.current) {
        chartRef.current.zoomScale('x', { min, max }, 'none');
      }
    }
  }), []);
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
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
          onZoom: (context: any) => {
            if (context.chart.scales.x) {
              const { min, max } = context.chart.scales.x;
              debouncedOnZoom(min, max);
            }
          },
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
          onPan: (context: any) => {
            if (context.chart.scales.x) {
              const { min, max } = context.chart.scales.x;
              debouncedOnZoom(min, max);
            }
          },
        },
        limits: {
          x: {
            min: 'original' as const,
            max: 'original' as const,
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
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}); 