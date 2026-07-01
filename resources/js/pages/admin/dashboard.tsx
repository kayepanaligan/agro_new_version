import { AnalyticsData } from '@/types/dashboard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { SyncIndicator } from '@/components/agro-profiler/sync-indicator';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { NarrativeCard } from '@/components/agro-profiler/narrative-card';
import { DashboardDateFilter, type DateRange } from '@/components/agro-profiler/dashboard-date-filter';
import { exportToCsv, exportToPdf } from '@/lib/export';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import GeographicMap from '@/components/charts/GeographicMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
    Users,
    Map,
    MapPin,
    Ruler,
    BarChart3,
    Globe,
    Award,
    AlertTriangle,
    Package,
    TrendingUp,
    Sprout,
    Shield,
    Star,
    Layers,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface AdminDashboardProps {
    analytics: AnalyticsData;
}

function generateOverviewNarrative(a: AnalyticsData): string {
    const total = a.kpis.total_farmers;
    const farms = a.kpis.total_farms;
    const parcels = a.kpis.total_parcels;
    const area = Number(a.kpis.total_farm_area).toFixed(2);
    const topLivelihood = a.demographics.livelihood.sort((x, y) => y.count - x.count)[0];
    const ipCount = a.demographics.is_ip.find((d) => d.name === 'IP')?.count || 0;
    const regTrendLast = a.registration_trends.slice(-1)[0];
    let n = `The platform has registered a total of ${total.toLocaleString()} farmers across ${farms.toLocaleString()} farms and ${parcels.toLocaleString()} parcels, `;
    n += `covering ${area} hectares of agricultural land. `;
    if (topLivelihood) n += `The predominant livelihood is ${topLivelihood.name} with ${topLivelihood.count} farmers. `;
    if (ipCount > 0) n += `There are ${ipCount} indigenous peoples registered in the system. `;
    if (regTrendLast) n += `In ${regTrendLast.month}, ${regTrendLast.count} new farmer(s) were registered.`;
    return n;
}

function generateGeoNarrative(a: AnalyticsData): string {
    const top = a.geographic.top_barangays.slice(0, 3);
    const totalBarangays = a.geographic.by_barangay.length;
    let n = `Farmers are distributed across ${totalBarangays} barangays in Digos City. `;
    if (top.length > 0) {
        n += `The top 3 barangays by farmer count are ${top.map((b) => `${b.barangay} (${b.farmer_count})`).join(', ')}. `;
    }
    n += `The average parcel size is ${a.parcel_insights.avg_size} hectares per farmer.`;
    return n;
}

function generatePointsNarrative(a: AnalyticsData): string {
    const ps = a.points_summary;
    const topTier = ps.tier_distribution.sort((x, y) => y.count - x.count)[0];
    let n = `The gamification system has awarded a total of ${ps.total_points.toLocaleString()} verified points across ${ps.active_farmers} active farmers. `;
    n += `This month alone, ${ps.this_month_points.toLocaleString()} points have been earned. `;
    if (topTier) n += `The largest tier is ${topTier.name} with ${topTier.count} farmers. `;
    const topCat = ps.category_breakdown[0];
    if (topCat) n += `The top points category is "${topCat.name}" contributing ${topCat.count} points.`;
    return n;
}

function generateDamageNarrative(a: AnalyticsData): string {
    const d = a.crop_damage;
    const totalIncidents = d.severity.reduce((s, x) => s + x.count, 0);
    const topSeverity = d.severity.sort((x, y) => y.count - x.count)[0];
    let n = `A total of ${totalIncidents} crop damage incidents have been recorded across all severity levels. `;
    if (topSeverity) n += `The most common severity level is "${topSeverity.name}" with ${topSeverity.count} reported incidents. `;
    if (d.trend.length > 0) {
        const latest = d.trend[d.trend.length - 1];
        n += `In ${latest.month}, ${latest.count} damage record(s) were logged.`;
    }
    return n;
}

function generateDistributionNarrative(a: AnalyticsData): string {
    const ac = a.allocation_coverage;
    const received = ac.received.find((d) => d.name === 'Received')?.count || 0;
    const notReceived = ac.received.find((d) => d.name === 'Not Received')?.count || 0;
    const total = received + notReceived;
    const coveragePct = total > 0 ? Math.round((received / total) * 100) : 0;
    const topCommodity = a.crop_distribution.by_commodity.sort((x, y) => y.count - x.count)[0];
    let n = `Out of ${total.toLocaleString()} registered farmers, ${received.toLocaleString()} (${coveragePct}%) have received assistance, `;
    n += `while ${notReceived.toLocaleString()} have not yet received any. `;
    if (topCommodity) n += `The most widely planted commodity is "${topCommodity.name}" with ${topCommodity.count} records. `;
    const small = a.farm_size_distribution.find((d) => d.name.includes('Small'))?.count || 0;
    const med = a.farm_size_distribution.find((d) => d.name.includes('Medium'))?.count || 0;
    const large = a.farm_size_distribution.find((d) => d.name.includes('Large'))?.count || 0;
    n += `Farm size distribution shows ${small} small (<2ha), ${med} medium (2-5ha), and ${large} large (>5ha) parcels.`;
    return n;
}

export default function AdminDashboard({ analytics }: AdminDashboardProps) {
    const [dateRange, setDateRange] = useState<DateRange | null>(analytics.date_range);

    const handleRefresh = () => {
        const params: Record<string, string> = {};
        if (dateRange) {
            params.date_start = dateRange.start;
            params.date_end = dateRange.end;
        }
        router.get('/dashboard', params, { preserveState: true, replace: true });
    };

    const handleDateFilterChange = (range: DateRange | null) => {
        setDateRange(range);
        const params: Record<string, string> = {};
        if (range) {
            params.date_start = range.start;
            params.date_end = range.end;
        }
        router.get('/dashboard', params, { preserveState: true, replace: true });
    };

    const handleExportCsv = () => {
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Total Farmers', analytics.kpis.total_farmers],
            ['Total Farms', analytics.kpis.total_farms],
            ['Total Parcels', analytics.kpis.total_parcels],
            ['Total Farm Area (ha)', Number(analytics.kpis.total_farm_area).toFixed(2)],
            ['Total Points Awarded', analytics.points_summary.total_points],
            ['Active Farmers (Points)', analytics.points_summary.active_farmers],
            ['Crop Damage Incidents', analytics.crop_damage.severity.reduce((s, d) => s + d.count, 0)],
        ];
        exportToCsv('dashboard-analytics', headers, rows);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Sync Indicator */}
                <SyncIndicator lastSyncedAt={analytics.last_synced_at} onRefresh={handleRefresh} />

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Comprehensive analytics and insights for farmer management, allocation tracking, and crop monitoring.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DashboardDateFilter
                            dateRange={dateRange}
                            onApply={handleDateFilterChange}
                        />
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard label="Total Farmers" value={analytics.kpis.total_farmers} icon={Users} />
                    <KpiCard label="Total Farms" value={analytics.kpis.total_farms} icon={Map} />
                    <KpiCard label="Total Parcels" value={analytics.kpis.total_parcels} icon={MapPin} />
                    <KpiCard label="Total Farm Area" value={`${Number(analytics.kpis.total_farm_area).toFixed(2)} ha`} icon={Ruler} />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="flex flex-col gap-4">
                    <TabsList className="glass-surface w-fit">
                        <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" />Overview</TabsTrigger>
                        <TabsTrigger value="geospatial" className="gap-2"><Globe className="h-4 w-4" />Geospatial</TabsTrigger>
                        <TabsTrigger value="points" className="gap-2"><Award className="h-4 w-4" />Points</TabsTrigger>
                        <TabsTrigger value="damage" className="gap-2"><AlertTriangle className="h-4 w-4" />Damage</TabsTrigger>
                        <TabsTrigger value="distribution" className="gap-2"><Package className="h-4 w-4" />Distribution</TabsTrigger>
                    </TabsList>

                    {/* ─── Overview Tab ─────────────────────────────────── */}
                    <TabsContent value="overview" className="flex flex-col gap-5">
                        <NarrativeCard
                            narrative={generateOverviewNarrative(analytics)}
                            highlights={[
                                { text: 'total', value: analytics.kpis.total_farmers.toLocaleString() },
                                { text: 'farms', value: analytics.kpis.total_farms.toLocaleString() },
                                { text: 'parcels', value: analytics.kpis.total_parcels.toLocaleString() },
                            ]}
                        />
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Farmer Demographics</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <BarChart data={analytics.demographics.livelihood} title="By Main Livelihood" />
                                <PieChart data={analytics.demographics.is_4ps} title="4Ps Beneficiaries" />
                                <PieChart data={analytics.demographics.gender} title="Gender Distribution" />
                                <PieChart data={analytics.demographics.civil_status} title="Civil Status" />
                                <PieChart data={analytics.demographics.is_ip} title="IP vs Non-IP" />
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Farm Size Distribution</h2>
                            <BarChart data={analytics.farm_size_distribution} title="By Size Category" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                Small (&lt;2 ha), Medium (2-5 ha), Large (&gt;5 ha) — Critical for proportional and priority policies
                            </p>
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Registration Status & Growth</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <BarChart data={analytics.registration_status} title="Status Distribution" />
                                <LineChart data={analytics.registration_trends} title="Farmers Registered Over Time" />
                            </div>
                        </div>
                    </TabsContent>

                    {/* ─── Geospatial Tab ───────────────────────────────── */}
                    <TabsContent value="geospatial" className="flex flex-col gap-5">
                        <NarrativeCard
                            narrative={generateGeoNarrative(analytics)}
                            highlights={[
                                { text: 'average parcel size', value: `${analytics.parcel_insights.avg_size} ha` },
                            ]}
                        />
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Geographic Distribution</h2>
                            <div className="grid gap-4 lg:grid-cols-2">
                                <GeographicMap data={analytics.geographic} title="Farmers per Barangay" />
                                <BarChart
                                    data={analytics.geographic.top_barangays.map((b) => ({ name: b.barangay, count: b.farmer_count }))}
                                    title="Top 10 Barangays by Farmer Count"
                                />
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Parcel-Level Insights</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="glass-surface rounded-xl p-6">
                                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Average Parcel Size</h3>
                                    <p className="text-4xl font-bold text-primary">{analytics.parcel_insights.avg_size} ha</p>
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
                        </div>
                    </TabsContent>

                    {/* ─── Points Dashboard Tab ─────────────────────────── */}
                    <TabsContent value="points" className="flex flex-col gap-5">
                        <NarrativeCard
                            narrative={generatePointsNarrative(analytics)}
                            highlights={[
                                { text: 'total', value: analytics.points_summary.total_points.toLocaleString() },
                                { text: 'active farmers', value: analytics.points_summary.active_farmers },
                            ]}
                        />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <KpiCard label="Total Points" value={analytics.points_summary.total_points.toLocaleString()} icon={Star} />
                            <KpiCard label="Active Farmers" value={analytics.points_summary.active_farmers} icon={Users} />
                            <KpiCard label="This Month" value={analytics.points_summary.this_month_points.toLocaleString()} icon={TrendingUp} />
                            <KpiCard label="Categories" value={analytics.points_summary.category_breakdown.length} icon={Layers} />
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Tier Distribution & Points Trend</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <PieChart data={analytics.points_summary.tier_distribution} title="Farmers by Tier" />
                                <LineChart data={analytics.points_summary.points_trend} title="Points Earned Over Time" />
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Points by Category</h2>
                            <BarChart data={analytics.points_summary.category_breakdown} title="Verified Points by Category" />
                        </div>
                    </TabsContent>

                    {/* ─── Damage Visualization Tab ─────────────────────── */}
                    <TabsContent value="damage" className="flex flex-col gap-5">
                        <NarrativeCard
                            narrative={generateDamageNarrative(analytics)}
                            highlights={[
                                { text: 'total', value: analytics.crop_damage.severity.reduce((s, d) => s + d.count, 0) },
                            ]}
                        />
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Crop Damage Insights</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <PieChart data={analytics.crop_damage.severity} title="Damage Severity Distribution" />
                                <LineChart data={analytics.crop_damage.trend} title="Damage Reports Over Time" />
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Severity Breakdown</h2>
                            <BarChart data={analytics.crop_damage.severity} title="Incidents by Severity" />
                        </div>
                    </TabsContent>

                    {/* ─── Distribution Visualization Tab ───────────────── */}
                    <TabsContent value="distribution" className="flex flex-col gap-5">
                        <NarrativeCard
                            narrative={generateDistributionNarrative(analytics)}
                            highlights={[
                                { text: 'total', value: (analytics.allocation_coverage.received.reduce((s, d) => s + d.count, 0)).toLocaleString() },
                            ]}
                        />
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Allocation Coverage</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <PieChart data={analytics.allocation_coverage.received} title="Received vs Not Received" />
                                <LineChart data={analytics.allocation_coverage.trend} title="Beneficiaries Over Time" />
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Crop / Commodity Distribution</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <PieChart data={analytics.crop_distribution.by_commodity} title="By Commodity" />
                                <div className="glass-surface rounded-xl p-4">
                                    <h3 className="mb-4 font-semibold">Commodity per Barangay</h3>
                                    <p className="text-sm text-muted-foreground">
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
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
