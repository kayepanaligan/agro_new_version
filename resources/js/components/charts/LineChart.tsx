import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors } from '@/hooks/use-chart-colors';

interface LineChartProps {
  data: Array<{ month: string; count: number }>;
  title?: string;
  color?: string;
}

export default function LineChartComponent({ data, title, color }: LineChartProps) {
  const colors = useChartColors();
  const stroke = color || colors.primary;

  if (!data || data.length === 0) {
    return (
      <div className="glass-surface flex h-64 items-center justify-center rounded-xl">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="glass-surface relative overflow-hidden rounded-xl p-4">
      <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.04]" />
      {title && <h3 className="relative mb-4 font-semibold">{title}</h3>}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} strokeOpacity={0.4} />
            <XAxis dataKey="month" tick={{ fill: colors.muted, fontSize: 12 }} axisLine={{ stroke: colors.gridColor }} tickLine={{ stroke: colors.gridColor }} />
            <YAxis tick={{ fill: colors.muted, fontSize: 12 }} axisLine={{ stroke: colors.gridColor }} tickLine={{ stroke: colors.gridColor }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
                color: 'var(--popover-foreground)',
                borderRadius: '0.75rem',
                fontSize: '0.8rem',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.75rem', color: colors.muted }} />
            <Line type="monotone" dataKey="count" stroke={stroke} strokeWidth={2.5} dot={{ fill: stroke, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: stroke, stroke: 'var(--background)', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
