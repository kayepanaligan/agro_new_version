import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartColors } from '@/hooks/use-chart-colors';

interface PieChartProps {
  data: Array<{ name: string; count: number }>;
  title?: string;
}

export default function PieChartComponent({ data, title }: PieChartProps) {
  const colors = useChartColors();

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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill={colors.primary}
              dataKey="count"
              stroke={colors.border}
              strokeWidth={1}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
                color: 'var(--popover-foreground)',
                borderRadius: '0.75rem',
                fontSize: '0.8rem',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '0.75rem', color: colors.muted }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
