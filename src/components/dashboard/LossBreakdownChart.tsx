'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const LossBreakdownChart: React.FC = () => {
  const lossData = [
    { name: 'Thermal & Temperature Derating', value: 8.5, color: '#ef4444' },
    { name: 'Dust & Soiling Loss', value: 3.2, color: '#f59e0b' },
    { name: 'Inverter Efficiency Loss', value: 2.2, color: '#8b5cf6' },
    { name: 'DC & AC Cable Ohmic Loss', value: 1.8, color: '#3b82f6' },
    { name: 'Module Mismatch & Shading', value: 1.5, color: '#ec4899' },
    { name: 'Delivered Useful Energy (PR)', value: 82.8, color: '#10b981' },
  ];

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-slate-100">System Loss & Performance Waterfall</h4>
        <p className="text-xs text-slate-400">Technical loss factors contributing to real-world solar harvest</p>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={lossData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {lossData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(val: unknown) => [`${val}%`, 'Factor']}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', color: '#94a3b8', lineHeight: '18px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
