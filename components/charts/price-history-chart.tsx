'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { PricePoint } from '@/lib/types';
import { formatPrice } from '@/lib/utils/format';

export function PriceHistoryChart({ history, currency = 'GBP' }: { history: PricePoint[]; currency?: string }) {
  const data = history.map((h) => ({ date: h.date.slice(5), price: h.price }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#ece9e1" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#726f68' }} tickLine={false} axisLine={{ stroke: '#dbd7cd' }} interval={Math.ceil(data.length / 8)} />
          <YAxis
            tick={{ fontSize: 11, fill: '#726f68' }}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(v) => formatPrice(v, currency)}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip
            formatter={(value: number) => [formatPrice(value, currency), 'Price']}
            contentStyle={{ borderRadius: 4, border: '1px solid #dbd7cd', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="price" stroke="#c9542c" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
