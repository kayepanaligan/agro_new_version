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
import { cn } from '@/lib/utils';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import GeographicMap from '@/components/charts/GeographicMap';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
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
    Star,
    Layers,
    Search,
    Sprout,
    ListTree,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface SuperAdminDashboardProps {
    analytics: AnalyticsData;
}

/* ────────────────────────────────────────────────────────────────
   Narrative generators (unchanged logic, same data contracts)
   ──────────────────────────────────────────────────────────────── */

function generateOverviewNarrative(a: AnalyticsData): string {
    const total = a.kpis.total_farmers;
    const farms = a.kpis.total_farms;
    const parcels = a.kpis.total_parcels;
    const area = Number(a.kpis.total_farm_area).toFixed(2);
    const topLivelihood = [...a.demographics.livelihood].sort((x, y) => y.count - x.count)[0];
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
    const topTier = [...ps.tier_distribution].sort((x, y) => y.count - x.count)[0];
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
    const topSeverity = [...d.severity].sort((x, y) => y.count - x.count)[0];
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
    const topCommodity = [...a.crop_distribution.by_commodity].sort((x, y) => y.count - x.count)[0];
    let n = `Out of ${total.toLocaleString()} registered farmers, ${received.toLocaleString()} (${coveragePct}%) have received assistance, `;
    n += `while ${notReceived.toLocaleString()} have not yet received any. `;
    if (topCommodity) n += `The most widely planted commodity is "${topCommodity.name}" with ${topCommodity.count} records. `;
    const small = a.farm_size_distribution.find((d) => d.name.includes('Small'))?.count || 0;
    const med = a.farm_size_distribution.find((d) => d.name.includes('Medium'))?.count || 0;
    const large = a.farm_size_distribution.find((d) => d.name.includes('Large'))?.count || 0;
    n += `Farm size distribution shows ${small} small (<2ha), ${med} medium (2-5ha), and ${large} large (>5ha) parcels.`;
    return n;
}

/* ────────────────────────────────────────────────────────────────
   Section registry — drives the sidebar nav, the mobile pill nav,
   and the scrollspy. Add/remove a section in one place only.
   ──────────────────────────────────────────────────────────────── */

const SECTIONS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'geospatial', label: 'Geospatial', icon: Globe },
    { id: 'points', label: 'Points', icon: Award },
    { id: 'damage', label: 'Damage', icon: AlertTriangle },
    { id: 'distribution', label: 'Distribution', icon: Package },
] as const;

/* ────────────────────────────────────────────────────────────────
   Layout primitives — kept consistent across every section instead
   of hand-rolled markup per block.
   ──────────────────────────────────────────────────────────────── */

function SectionCard({
    icon: Icon,
    title,
    description,
    action,
    children,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                    </span>
                    <div>
                        <h3 className="text-base font-semibold leading-tight">{title}</h3>
                        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
                    </div>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
    return (
        <div className="flex flex-col justify-center rounded-xl border border-border/60 bg-muted/30 p-6">
            <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
            <p className="mt-1 text-4xl font-bold text-primary">{value}</p>
            {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
        </div>
    );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="flex items-baseline gap-3 border-b border-border/60 pb-3">
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</span>
        </div>
    );
}

export default function SuperAdminDashboard({ analytics }: SuperAdminDashboardProps) {
    const [dateRange, setDateRange] = useState<DateRange | null>(analytics.date_range);
    const [tableQuery, setTableQuery] = useState('');
    const [visibleRows, setVisibleRows] = useState(10);
    const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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
        exportToCsv('super-admin-dashboard-analytics', headers, rows);
    };

    // Searchable / progressively-loaded commodity table instead of a hard 20-row cutoff
    const filteredCommodityRows = useMemo(() => {
        const q = tableQuery.trim().toLowerCase();
        if (!q) return analytics.crop_distribution.per_barangay;
        return analytics.crop_distribution.per_barangay.filter(
            (item) => item.barangay.toLowerCase().includes(q) || item.commodity.toLowerCase().includes(q),
        );
    }, [analytics.crop_distribution.per_barangay, tableQuery]);

    const totalDamageIncidents = analytics.crop_damage.severity.reduce((s, d) => s + d.count, 0);
    const totalBeneficiaries = analytics.allocation_coverage.received.reduce((s, d) => s + d.count, 0);

    // Scrollspy: highlight whichever section is currently in view in the nav rail
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActiveSection(visible[0].target.id);
            },
            { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
        );
        SECTIONS.forEach(({ id }) => {
            const el = sectionRefs.current[id];
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard" />
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 md:p-6">
                {/* ─── Page Header ───────────────────────────────────── */}
                <header className="flex flex-col gap-5 border-b border-border/60 pb-6">
                    <SyncIndicator lastSyncedAt={analytics.last_synced_at} onRefresh={handleRefresh} />

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Agro Profiler</p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Super Admin Dashboard</h1>
                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Comprehensive analytics and insights for farmer management, allocation tracking, and crop monitoring.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <DashboardDateFilter dateRange={dateRange} onApply={handleDateFilterChange} />
                            <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        </div>
                    </div>

                    {/* KPI summary strip */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <KpiCard label="Total Farmers" value={analytics.kpis.total_farmers} icon={Users} />
                        <KpiCard label="Total Farms" value={analytics.kpis.total_farms} icon={Map} />
                        <KpiCard label="Total Parcels" value={analytics.kpis.total_parcels} icon={MapPin} />
                        <KpiCard label="Total Farm Area" value={`${Number(analytics.kpis.total_farm_area).toFixed(2)} ha`} icon={Ruler} />
                    </div>
                </header>

                {/* Mobile / tablet section nav — horizontal pill bar, hidden at lg+ where the rail takes over */}
                <div className="sticky top-0 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-border/60 bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
                    {SECTIONS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => scrollToSection(id)}
                            className={cn(
                                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                                activeSection === id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ─── Body: sidebar rail + content ─────────────────── */}
                <div className="sticky top-[4.5rem] grid h-[calc(100vh-4.5rem)] gap-8 overflow-hidden lg:grid-cols-[220px_1fr]">
                    {/* Sidebar nav (desktop) */}
                    <nav className="hidden overflow-y-auto lg:block">
                        <div className="flex flex-col gap-1">
                            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sections</p>
                            {SECTIONS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => scrollToSection(id)}
                                    className={cn(
                                        'flex items-center justify-between gap-2 rounded-lg border-l-2 px-3 py-2 text-left text-sm font-medium transition-colors',
                                        activeSection === id
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </span>
                                    {id === 'damage' && (
                                        <Badge variant="secondary" className="text-xs">
                                            {totalDamageIncidents}
                                        </Badge>
                                    )}
                                    {id === 'distribution' && (
                                        <Badge variant="secondary" className="text-xs">
                                            {totalBeneficiaries.toLocaleString()}
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Main content — every section stacked and anchored for scrollspy */}
                    <main className="flex flex-col gap-14 overflow-y-auto">
                        {/* ─── Overview ──────────────────────────────── */}
                        <section
                            id="overview"
                            ref={(el) => {
                                sectionRefs.current.overview = el;
                            }}
                            className="scroll-mt-20 flex flex-col gap-5"
                        >
                            <SectionHeading eyebrow="Section 01" title="Overview" />
                            <NarrativeCard
                                narrative={generateOverviewNarrative(analytics)}
                                highlights={[
                                    { text: 'total', value: analytics.kpis.total_farmers.toLocaleString() },
                                    { text: 'farms', value: analytics.kpis.total_farms.toLocaleString() },
                                    { text: 'parcels', value: analytics.kpis.total_parcels.toLocaleString() },
                                ]}
                            />

                            <SectionCard
                                icon={Users}
                                title="Farmer Demographics"
                                description="Who's registered on the platform, by livelihood, benefits, and identity."
                            >
                                <div className="flex flex-col gap-4">
                                    <BarChart data={analytics.demographics.livelihood} title="By Main Livelihood" />
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <PieChart data={analytics.demographics.is_4ps} title="4Ps Beneficiaries" />
                                        <PieChart data={analytics.demographics.gender} title="Gender Distribution" />
                                        <PieChart data={analytics.demographics.civil_status} title="Civil Status" />
                                        <PieChart data={analytics.demographics.is_ip} title="IP vs Non-IP" />
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon={Sprout}
                                title="Farm Size Distribution"
                                description="Small (<2 ha), Medium (2-5 ha), Large (>5 ha) — used for proportional and priority policies."
                            >
                                <BarChart data={analytics.farm_size_distribution} title="By Size Category" />
                            </SectionCard>

                            <SectionCard
                                icon={TrendingUp}
                                title="Registration Status & Growth"
                                description="Current standing of registrations and how sign-ups have trended over time."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <BarChart data={analytics.registration_status} title="Status Distribution" />
                                    <LineChart data={analytics.registration_trends} title="Farmers Registered Over Time" />
                                </div>
                            </SectionCard>
                        </section>

                        {/* ─── Geospatial ────────────────────────────── */}
                        <section
                            id="geospatial"
                            ref={(el) => {
                                sectionRefs.current.geospatial = el;
                            }}
                            className="scroll-mt-20 flex flex-col gap-5"
                        >
                            <SectionHeading eyebrow="Section 02" title="Geospatial" />
                            <NarrativeCard
                                narrative={generateGeoNarrative(analytics)}
                                highlights={[{ text: 'average parcel size', value: `${analytics.parcel_insights.avg_size} ha` }]}
                            />

                            <SectionCard
                                icon={Globe}
                                title="Geographic Distribution"
                                description="Where farmers are concentrated across Digos City's barangays."
                            >
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <GeographicMap data={analytics.geographic} title="Farmers per Barangay" />
                                    <BarChart
                                        data={analytics.geographic.top_barangays.map((b) => ({ name: b.barangay, count: b.farmer_count }))}
                                        title="Top 10 Barangays by Farmer Count"
                                    />
                                </div>
                            </SectionCard>

                            <SectionCard icon={MapPin} title="Parcel-Level Insights" description="How land holdings break down per farmer.">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <StatTile
                                        label="Average Parcel Size"
                                        value={`${analytics.parcel_insights.avg_size} ha`}
                                        hint="Per farmer average"
                                    />
                                    <BarChart
                                        data={analytics.parcel_insights.count_distribution.map((d) => ({
                                            name: `${d.parcels} parcel${d.parcels > 1 ? 's' : ''}`,
                                            count: d.farmers,
                                        }))}
                                        title="Parcels per Farmer Distribution"
                                    />
                                </div>
                            </SectionCard>
                        </section>

                        {/* ─── Points ─────────────────────────────────── */}
                        <section
                            id="points"
                            ref={(el) => {
                                sectionRefs.current.points = el;
                            }}
                            className="scroll-mt-20 flex flex-col gap-5"
                        >
                            <SectionHeading eyebrow="Section 03" title="Points" />
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
                                <KpiCard
                                    label="This Month"
                                    value={analytics.points_summary.this_month_points.toLocaleString()}
                                    icon={TrendingUp}
                                />
                                <KpiCard label="Categories" value={analytics.points_summary.category_breakdown.length} icon={Layers} />
                            </div>

                            <SectionCard
                                icon={Award}
                                title="Tier Distribution & Points Trend"
                                description="How farmers are ranked, and how points earning has moved over time."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <PieChart data={analytics.points_summary.tier_distribution} title="Farmers by Tier" />
                                    <LineChart data={analytics.points_summary.points_trend} title="Points Earned Over Time" />
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon={Layers}
                                title="Points by Category"
                                description="Which verified activities contribute the most points."
                            >
                                <BarChart data={analytics.points_summary.category_breakdown} title="Verified Points by Category" />
                            </SectionCard>
                        </section>

                        {/* ─── Damage ─────────────────────────────────── */}
                        <section
                            id="damage"
                            ref={(el) => {
                                sectionRefs.current.damage = el;
                            }}
                            className="scroll-mt-20 flex flex-col gap-5"
                        >
                            <SectionHeading eyebrow="Section 04" title="Damage" />
                            <NarrativeCard
                                narrative={generateDamageNarrative(analytics)}
                                highlights={[{ text: 'total', value: totalDamageIncidents }]}
                            />

                            <SectionCard
                                icon={AlertTriangle}
                                title="Crop Damage Insights"
                                description="Severity mix and how incident volume has trended over time."
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <PieChart data={analytics.crop_damage.severity} title="Damage Severity Distribution" />
                                        <BarChart data={analytics.crop_damage.severity} title="Incidents by Severity" />
                                    </div>
                                    <LineChart data={analytics.crop_damage.trend} title="Damage Reports Over Time" />
                                </div>
                            </SectionCard>
                        </section>

                        {/* ─── Distribution ───────────────────────────── */}
                        <section
                            id="distribution"
                            ref={(el) => {
                                sectionRefs.current.distribution = el;
                            }}
                            className="scroll-mt-20 flex flex-col gap-5"
                        >
                            <SectionHeading eyebrow="Section 05" title="Distribution" />
                            <NarrativeCard
                                narrative={generateDistributionNarrative(analytics)}
                                highlights={[{ text: 'total', value: totalBeneficiaries.toLocaleString() }]}
                            />

                            <SectionCard
                                icon={Package}
                                title="Allocation Coverage"
                                description="Share of registered farmers who have received assistance, over time."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <PieChart data={analytics.allocation_coverage.received} title="Received vs Not Received" />
                                    <LineChart data={analytics.allocation_coverage.trend} title="Beneficiaries Over Time" />
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon={ListTree}
                                title="Crop / Commodity Distribution"
                                description="What's being planted, and where — searchable by barangay or commodity."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <PieChart data={analytics.crop_distribution.by_commodity} title="By Commodity" />

                                    <div className="flex flex-col rounded-xl border border-border/60 bg-muted/30 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <h4 className="font-semibold">Commodity per Barangay</h4>
                                            <Badge variant="secondary">
                                                {filteredCommodityRows.length.toLocaleString()} of{' '}
                                                {analytics.crop_distribution.per_barangay.length.toLocaleString()}
                                            </Badge>
                                        </div>

                                        <div className="relative mb-3">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={tableQuery}
                                                onChange={(e) => {
                                                    setTableQuery(e.target.value);
                                                    setVisibleRows(10);
                                                }}
                                                placeholder="Search barangay or commodity…"
                                                className="bg-background pl-9"
                                            />
                                        </div>

                                        <div className="max-h-72 overflow-auto rounded-lg border border-border/60 bg-background">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 bg-muted/90 backdrop-blur">
                                                    <tr className="border-b">
                                                        <th className="px-3 py-2 text-left font-medium">Barangay</th>
                                                        <th className="px-3 py-2 text-left font-medium">Commodity</th>
                                                        <th className="px-3 py-2 text-right font-medium">Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredCommodityRows.slice(0, visibleRows).map((item, idx) => (
                                                        <tr key={`${item.barangay}-${item.commodity}-${idx}`} className="border-b last:border-0">
                                                            <td className="px-3 py-2">{item.barangay}</td>
                                                            <td className="px-3 py-2">{item.commodity}</td>
                                                            <td className="px-3 py-2 text-right">{item.count}</td>
                                                        </tr>
                                                    ))}
                                                    {filteredCommodityRows.length === 0 && (
                                                        <tr>
                                                            <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                                                                No matching records.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {visibleRows < filteredCommodityRows.length && (
                                            <button
                                                type="button"
                                                onClick={() => setVisibleRows((v) => v + 20)}
                                                className="mt-3 self-center text-sm font-medium text-primary hover:underline"
                                            >
                                                Show more ({filteredCommodityRows.length - visibleRows} remaining)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </SectionCard>
                        </section>
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}
