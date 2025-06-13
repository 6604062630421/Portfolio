'use client'
import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Line } from 'react-chartjs-2'

ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

type Bet = {
  date: string // ISO date string
  res: number  // สิ่งที่เราแทง (1 = player, -1 = banker, 0 = tie)
  bet: number  // ผลที่ออกจริง
}

type Props = {
  data: Bet[]
}

function groupAndCalculateWinRatePerHour(data: Bet[]) {
  const hourlyStats: Record<string, { total: number; wins: number }> = {}

  data.forEach(({ date, res, bet }) => {
    if(bet===0)return;
    const d = new Date(date)
    d.setMinutes(0, 0, 0) // ปัดลงเป็นต้นชั่วโมง
    const hourKey = d.toISOString()

    if (!hourlyStats[hourKey]) {
      hourlyStats[hourKey] = { total: 0, wins: 0 }
    }

    hourlyStats[hourKey].total += 1
    if (res === bet) {
      hourlyStats[hourKey].wins += 1
    }
  })

  // คำนวณ winrate
  const points = Object.entries(hourlyStats)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([time, stat]) => ({
      x: time,
      y: stat.total > 0 ? stat.wins / stat.total : 0,
    }))

  return points
}

export default function WinRateLineChart({ data }: Props) {
  const chartData = useMemo(() => {
    const points = groupAndCalculateWinRatePerHour(data)

    return {
      datasets: [
        {
          label: 'Winrate รายชั่วโมง',
          data: points,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          fill: true,
          tension: 0.3,
        },
      ],
    }
  }, [data])

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: 'auto' }}>
      <h2 className="text-xl mb-4">กราฟ Winrate ตามเวลา (รายชั่วโมง)</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `Winrate: ${(ctx.parsed.y * 100).toFixed(2)}%`,
              },
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour',
                tooltipFormat: 'MMM d, HH:mm',
              },
              title: { display: true, text: 'เวลา (รายชั่วโมง)' },
            },
            y: {
              min: 0,
              max: 1,
              ticks: {
                callback: (value) => `${(value as number * 100).toFixed(0)}%`,
              },
              title: { display: true, text: 'Winrate (%)' },
            },
          },
        }}
      />
    </div>
  )
}
