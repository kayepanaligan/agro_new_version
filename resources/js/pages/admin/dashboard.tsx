import { AnalyticsData } from '@/types/dashboard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import KpiCards from '@/components/dashboard/KpiCards';
import Section from '@/components/dashboard/Section';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import GeographicMap from '@/components/charts/GeographicMap';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface AdminDashboardProps {
    analytics: AnalyticsData;
}

export default function AdminDashboard({ analytics }: AdminDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Comprehensive analytics and insights for farmer management, allocation tracking, and crop monitoring.
                    </p>
                </div>

                {/* KPI Cards */}
                <KpiCards data={analytics.kpis} />

                {/* Farmer Demographics Overview */}
                <Section title="Farmer Demographics Overview">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <BarChart data={analytics.demographics.livelihood} title="By Main Livelihood" />
                        <PieChart data={analytics.demographics.is_4ps} title="4Ps Beneficiaries" />
                        <PieChart data={analytics.demographics.gender} title="Gender Distribution" />
                        <PieChart data={analytics.demographics.civil_status} title="Civil Status" />
                        <PieChart data={analytics.demographics.is_ip} title="IP vs Non-IP" />
                    </div>
                </Section>

                {/* Geographic Distribution */}
                <Section title="Geographic Distribution">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <GeographicMap data={analytics.geographic} title="Farmers per Barangay" />
                        <BarChart data={analytics.geographic.top_barangays.map((b) => ({ name: b.barangay, count: b.farmer_count }))} title="Top 10 Barangays by Farmer Count" />
                    </div>
                </Section>

                {/* Farm Size Distribution */}
                <Section title="Farm Size Distribution">
                    <BarChart data={analytics.farm_size_distribution} title="By Size Category" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        Small (&lt;2 ha), Medium (2-5 ha), Large (&gt;5 ha) - Critical for proportional and priority policies
                    </p>
                </Section>

                {/* Crop / Commodity Distribution */}
                <Section title="Crop / Commodity Distribution">
                    <div className="grid gap-4 md:grid-cols-2">
                        <PieChart data={analytics.crop_distribution.by_commodity} title="By Commodity" />
                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <h3 className="mb-4 font-semibold">Commodity Distribution per Barangay</h3>
                            <p className="text-muted-foreground text-sm">
                                Data available: {analytics.crop_distribution.per_barangay.length} records
                            </p>
                            <div className="mt-4 max-h-64 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-2 py-2 text-left">Barangay</th>
                                            <th className="px-2 py-2 text-left">Commodity</th>
                                            <th className="px-2 py-2 text-right">Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.crop_distribution.per_barangay.slice(0, 20).map((item, idx) => (
                                            <tr key={idx} className="border-b">
                                                <td className="px-2 py-2">{item.barangay}</td>
                                                <td className="px-2 py-2">{item.commodity}</td>
                                                <td className="px-2 py-2 text-right">{item.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Parcel-Level Insights */}
                <Section title="Parcel-Level Insights">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <h3 className="mb-4 font-semibold">Average Parcel Size</h3>
                            <p className="text-4xl font-bold text-blue-600">{analytics.parcel_insights.avg_size} ha</p>
                            <p className="mt-2 text-sm text-muted-foreground">Per farmer average</p>
                        </div>
                        <BarChart
                            data={analytics.parcel_insights.count_distribution.map((d) => ({
                                name: `${d.parcels} parcel${d.parcels > 1 ? 's' : ''}`,
                                count: d.farmers,
                            }))}
                            title="Parcels per Farmer Distribution"
                        />
                    </div>
                </Section>

                {/* Registration Status Monitoring */}
                <Section title="Registration Status Monitoring">
                    <BarChart data={analytics.registration_status} title="Status Distribution" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        Operational tracking - ensures data quality before DSS runs
                    </p>
                </Section>

                {/* Allocation Coverage */}
                <Section title="Allocation Coverage (Farmer Perspective)">
                    <div className="grid gap-4 md:grid-cols-2">
                        <PieChart data={analytics.allocation_coverage.received} title="Received vs Not Received" />
                        <LineChart data={analytics.allocation_coverage.trend} title="Beneficiaries Over Time" />
                    </div>
                </Section>

                {/* Crop Damage Insights */}
                <Section title="Crop Damage Insights">
                    <div className="grid gap-4 md:grid-cols-2">
                        <PieChart data={analytics.crop_damage.severity} title="Damage Severity Distribution" />
                        <LineChart data={analytics.crop_damage.trend} title="Damage Reports Over Time" />
                    </div>
                </Section>

                {/* Farmer Registration Trends */}
                <Section title="Farmer Growth / Registration Trends">
                    <LineChart data={analytics.registration_trends} title="Farmers Registered Over Time" />
                    <p className="mt-2 text-sm text-muted-foreground">System adoption tracking</p>
                </Section>
            </div>
        </AppLayout>
    );
}
