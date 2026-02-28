"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface UsageChartProps {
  labels: string[];
  data: number[];
}

export default function UsageChart({ labels, data }: UsageChartProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "AI Logs",
              data,
              backgroundColor: "rgba(0, 120, 255, 0.6)",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        }}
      />
    </div>
  );
}
