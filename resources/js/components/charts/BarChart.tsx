import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartColors } from '@/hooks/use-chart-colors';

interface BarChartProps {
  data: Array<{ name: string; count: number }>;
  title?: string;
  color?: string;
}

export default function BarChartComponent({ data, title, color }: BarChartProps) {
  const colors = useChartColors();

  if (!data || data.length === 0) {
    return (
      <div className="glass-surface flex h-64 items-center justify-center rounded-xl">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const fill = color || colors.primary;

  return (
    <div className="glass-surface relative overflow-hidden rounded-xl p-4">
      <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.04]" />
      {title && <h3 className="relative mb-4 font-semibold">{title}</h3>}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} strokeOpacity={0.4} />
            <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 12 }} axisLine={{ stroke: colors.gridColor }} tickLine={{ stroke: colors.gridColor }} />
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
            <Bar dataKey="count" fill={fill} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
