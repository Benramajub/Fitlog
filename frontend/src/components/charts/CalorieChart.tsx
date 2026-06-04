'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';
import { DailyCalorieLog } from '@/types';

interface Props {
  data: DailyCalorieLog[];
  target: number;
}

export function CalorieChart({ data, target }: Props) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">ยังไม่มีข้อมูล</div>;
  }

  const chartData = data.map(d => ({
    date: dayjs(d.logDate).format('DD/MM'),
    แคลอรี่: Math.round(d.caloriesConsumed),
    เป้าหมาย: Math.round(target),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(val: number, name: string) => [`${val.toLocaleString()} kcal`, name]}
          labelFormatter={(l) => `วันที่ ${l}`}
        />
        <ReferenceLine y={target} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `เป้า ${Math.round(target)}`, position: 'right', fontSize: 10, fill: '#ef4444' }} />
        <Bar dataKey="แคลอรี่" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
