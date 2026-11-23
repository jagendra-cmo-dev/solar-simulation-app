'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { YearlyCashflow } from '../../types/solar';
import { formatLakhs } from '../../utils/solarCalculations';

interface CashflowChartProps {
  cashflows: YearlyCashflow[];
  netCostInr?: number;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ cashflows }) => {
  const chartData = cashflows.map((cf) => ({
    year: `Yr ${cf.year}`,
    cumulativeSavings: cf.cumulativeSavingsInr,
    annualSavings: cf.annualSavingsInr,
    gridRate: cf.gridRateInr,
  }));

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">25-Year Cumulative Net Wealth Creation</h4>
          <p className="text-xs text-slate-400">
            Factoring 4% electricity tariff inflation, 0.5% yearly panel degradation & Yr 12 inverter replacement
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} interval={2} />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v}`)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(value: unknown) => [formatLakhs(Number(value)), 'Cumulative Savings']}
            />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Breakeven', fill: '#ef4444', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="cumulativeSavings"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#savingsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
