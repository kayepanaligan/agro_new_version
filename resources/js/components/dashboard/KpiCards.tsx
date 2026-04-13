import { Users, Map, MapPin } from 'lucide-react';
import { KpiData } from '@/types/dashboard';

interface KpiCardsProps {
  data: KpiData;
}

export default function KpiCards({ data }: KpiCardsProps) {
  const kpis = [
    {
      title: 'Total Farmers',
      value: data.total_farmers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Farms',
      value: data.total_farms.toLocaleString(),
      icon: Map,
      color: 'bg-green-500',
    },
    {
      title: 'Total Parcels',
      value: data.total_parcels.toLocaleString(),
      icon: MapPin,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Farm Area',
      value: `${Number(data.total_farm_area).toFixed(2)} ha`,
      icon: MapPin,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.title} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{kpi.title}</p>
                <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
              </div>
              <div className={`rounded-full ${kpi.color} p-3 text-white`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
