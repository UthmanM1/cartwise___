'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function AdminBarChart({ data, dataKey = 'value', color = '#c9542c' }: { data: { name: string; value: number }[]; dataKey?: string; color?: string }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#3a3a37" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#95928a' }} tickLine={false} axisLine={{ stroke: '#3a3a37' }} />
          <YAxis tick={{ fontSize: 11, fill: '#95928a' }} tickLine={false} axisLine={false} width={36} />
          <Tooltip contentStyle={{ background: '#161615', border: '1px solid #3a3a37', borderRadius: 4, fontSize: 12, color: '#fff' }} />
          <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
