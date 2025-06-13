"use client";
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type BetResult = {
  date: string; // ISO string
  res: "banker" | "player" | "tie";
};
type betdata = {
  date: string;
  res: number;
  bet: number;
};
// ตัวอย่างข้อมูล

function groupDataByTimeSlot(data: BetResult[]) {
  const slotMap: Record<
    string,
    { banker: number; player: number; tie: number }
  > = {};

  data.forEach(({ date, res }) => {
    const d = new Date(date);
    const hour = d.getHours();
    const slotStart = Math.floor(hour / 2) * 2;
    const slotLabel = `${String(slotStart).padStart(2, "0")}-${String(
      slotStart + 2
    ).padStart(2, "0")}`;

    if (!slotMap[slotLabel]) {
      slotMap[slotLabel] = { banker: 0, player: 0, tie: 0 };
    }

    slotMap[slotLabel][res]++;
  });

  return slotMap;
}
type barcharprop = {
  data: betdata[];
};
export default function BarChartByTime({ data }: barcharprop) {
const {chartData } = useMemo(() => {
  const grouped = groupDataByTimeSlot(
    data.map((i) => {
      return {
        date: new Date(i.date).toISOString(),
        res:
          i.bet === 0
            ? "tie"
            : i.bet === 1
            ? "player"
            : i.bet === -1
            ? "banker"
            : "tie",
      };
    })
  );
  const sortedLabels = Object.keys(grouped).sort();
  const banker: number[] = [];
  const player: number[] = [];
  const tie: number[] = [];

  sortedLabels.forEach((label) => {
    banker.push(grouped[label].banker);
    player.push(grouped[label].player);
    tie.push(grouped[label].tie);
  });

  return {
    labels: sortedLabels,
    chartData: {
      labels: sortedLabels,
      datasets: [
        {
          label: "Banker",
          data: banker,
          backgroundColor: "#EF4444",
        },
        {
          label: "Player",
          data: player,
          backgroundColor: "#3B82F6",
        },
        {
          label: "Tie",
          data: tie,
          backgroundColor: "#10B981",
        },
      ],
    },
  };
}, [data]); // ✅ ใส่ dependency ให้ useMemo ทำงานเมื่อ data เปลี่ยน


  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            tooltip: { mode: "index" },
          },
          scales: {
            x: {
              title: { display: true, text: "ช่วงเวลา (ชม.)" },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: "จำนวนครั้ง" },
              ticks: { precision: 0 },
            },
          },
        }}
      />
    </div>
  );
}
