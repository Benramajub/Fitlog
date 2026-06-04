'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NutritionPlan } from '@/types';

interface Props { plan: NutritionPlan; }

export function MacroPieChart({ plan }: Props) {
  const data = [
    { name: 'โปรตีน', value: Math.round(+plan.proteinG * 4), g: Math.round(+plan.proteinG), color: '#3b82f6' },
    { name: 'คาร์บ', value: Math.round(+plan.carbG * 4), g: Math.round(+plan.carbG), color: '#10b981' },
    { name: 'ไขมัน', value: Math.round(+plan.fatG * 9), g: Math.round(+plan.fatG), color: '#f59e0b' },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip formatter={(val: number) => [`${val} kcal`]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5 mt-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="font-semibold">{d.g}g <span className="text-gray-400">({d.value} kcal)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}
