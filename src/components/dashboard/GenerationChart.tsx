'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MonthlyData } from '../../types/solar';

interface GenerationChartProps {
  data: MonthlyData[];
}

export const GenerationChart: React.FC<GenerationChartProps> = ({ data }) => {
  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">Monthly Solar Generation vs. Consumption</h4>
          <p className="text-xs text-slate-400">Comparing expected rooftop generation with current electricity usage</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="shortMonth" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kWh" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(value: unknown, name: unknown) => [
                `${Number(value).toLocaleString('en-IN')} kWh`,
                name === 'solarGenerationKwh' ? 'Solar Yield' : 'Grid Consumption',
              ]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              formatter={(value) => (value === 'solarGenerationKwh' ? 'Solar Generation (kWh)' : 'Current Consumption (kWh)')}
            />
            <Bar dataKey="solarGenerationKwh" fill="#f59e0b" radius={[4, 4, 0, 0]} name="solarGenerationKwh" />
            <Bar dataKey="gridConsumptionKwh" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.65} name="gridConsumptionKwh" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
