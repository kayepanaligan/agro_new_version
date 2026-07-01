import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Farmer } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, Mail, MapPin, Phone, User, Users, Home,
    FileText, Briefcase, GraduationCap, Heart, Shield, Award,
    Package, Sprout, TrendingDown, QrCode, Star, ChevronRight,
    Leaf, BarChart3, CheckCircle2, Clock, AlertTriangle, XCircle,
    Wheat, Droplets, TreePine, Activity, Gift,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { KpiCard } from '@/components/agro-profiler/kpi-card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Farmers', href: '/admin/farmers' },
];

// ── helpers ────────────────────────────────────────────────────────────────

function fmt(date?: string | null, opts?: Intl.DateTimeFormatOptions) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-PH', opts ?? {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function fmtShort(date?: string | null) {
    return fmt(date, { year: 'numeric', month: 'short', day: 'numeric' });
}

function peso(val?: string | number | null) {
    if (!val) return '—';
    return `₱${parseFloat(String(val)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

function slugify(s: string) {
    return s.toLowerCase().replace(/\s+/g, '-');
}

// ── sub-components ────────────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
    return <div id={id} className="scroll-mt-48" />;
}

function InfoRow({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
            {mono
                ? <span className={`text-sm font-mono font-medium ${value ? '' : 'text-muted-foreground'}`}>{value ?? '—'}</span>
                : <span className={`text-sm font-medium leading-snug ${value ? '' : 'text-muted-foreground'}`}>{value ?? '—'}</span>
            }
        </div>
    );
}

function SectionHeader({ icon: Icon, title, count }: { icon: React.ElementType; title: string; count?: number }) {
    return (
        <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 flex-shrink-0">
                <Icon className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight">{title}</h2>
            {count !== undefined && (
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {count}
                </span>
            )}
        </div>
    );
}

function EmptyState({ icon: Icon, message, submessage }: { icon: React.ElementType; message: string; submessage?: string }) {
    return (
        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Icon className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">{message}</p>
            {submessage && <p className="text-xs text-center">{submessage}</p>}
        </div>
    );
}

// ── Tier config ────────────────────────────────────────────────────────────

function getTier(points: number) {
    if (points >= 1000) return {
        label: 'Gold',
        emoji: '🥇',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        bar: 'bg-amber-400',
        next: null,
        progress: 100,
    };
    if (points >= 500) return {
        label: 'Silver',
        emoji: '🥈',
        color: 'text-slate-500',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        bar: 'bg-slate-400',
        next: 1000,
        progress: Math.round(((points - 500) / 500) * 100),
    };
    if (points >= 200) return {
        label: 'Bronze',
        emoji: '🥉',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        bar: 'bg-orange-400',
        next: 500,
        progress: Math.round(((points - 200) / 300) * 100),
    };
    return {
        label: 'Seedling',
        emoji: '🌱',
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        bar: 'bg-primary',
        next: 200,
        progress: Math.round((points / 200) * 100),
    };
}

const STATUS_MAP: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    received:   { label: 'Received',   icon: CheckCircle2,    className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending:    { label: 'Pending',    icon: Clock,           className: 'bg-amber-50 text-amber-700 border-amber-200'       },
    validated:  { label: 'Validated',  icon: CheckCircle2,    className: 'bg-sky-50 text-sky-700 border-sky-200'             },
    for_review: { label: 'For Review', icon: Clock,           className: 'bg-amber-50 text-amber-700 border-amber-200'       },
    rejected:   { label: 'Rejected',   icon: XCircle,         className: 'bg-red-50 text-red-700 border-red-200'             },
};

function StatusPill({ status }: { status?: string }) {
    const cfg = STATUS_MAP[status ?? ''] ?? { label: status ?? 'Unknown', icon: Clock, className: 'bg-muted text-muted-foreground border-border' };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
}

// ── NAV SECTIONS ──────────────────────────────────────────────────────────

const NAV_SECTIONS = [
    { id: 'points',     label: 'Points & Tier',    icon: Star       },
    { id: 'personal',   label: 'Personal Info',    icon: User       },
    { id: 'contact',    label: 'Contact',          icon: Phone      },
    { id: 'address',    label: 'Address',          icon: MapPin     },
    { id: 'household',  label: 'Household',        icon: Home       },
    { id: 'education',  label: 'Education',        icon: GraduationCap },
    { id: 'livelihood', label: 'Livelihood',       icon: Briefcase  },
    { id: 'emergency',  label: 'Emergency Contact',icon: Heart      },
    { id: 'farms',      label: 'Farms & Parcels',  icon: Leaf       },
    { id: 'allocations',label: 'Allocations',      icon: Package    },
    { id: 'damage',     label: 'Crop Damage',      icon: TrendingDown },
    { id: 'monitoring', label: 'Crop Monitoring',  icon: BarChart3  },
    { id: 'points-history', label: 'Points History', icon: Star     },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function FarmerProfile() {
    const { farmer } = usePage<{
        farmer: Farmer & {
            profile?: any; address?: any; contact?: any; spouse?: any;
            household?: any; education?: any; emergencyContact?: any;
            mainLivelihood?: any; farmingActivities?: any[];
            income?: any; farms?: any[]; documents?: any[];
            memberships?: any[]; allocation_history?: any[];
            crop_damage_history?: any[]; crop_monitoring_reports?: any[];
            points?: number;
            points_summary?: {
                total_points: number;
                current_tier: string;
                activities_count: number;
                this_month_points: number;
            };
            points_history?: any[];
            reward_history?: any[];
        };
    }>().props;

    const [activeSection, setActiveSection] = useState('points');

    const profile        = farmer.profile || farmer;
    const address        = farmer.address || {};
    const contact        = farmer.contact || {};
    const spouse         = farmer.spouse;
    const household      = farmer.household || {};
    const education      = farmer.education || {};
    const emergencyContact = farmer.emergencyContact || {};
    const mainLivelihood = farmer.mainLivelihood || {};
    const income         = farmer.income || {};
    const farms          = farmer.farms || [];
    const allocationHistory    = farmer.allocation_history || [];
    const cropDamageHistory    = farmer.crop_damage_history || [];
    const cropMonitoringReports = farmer.crop_monitoring_reports || [];
    const pointsSummary        = farmer.points_summary || { total_points: 0, current_tier: 'Seedling', activities_count: 0, this_month_points: 0 };
    const pointsHistory        = farmer.points_history || [];
    const rewardHistory        = farmer.reward_history || [];

    const totalPoints = farmer.points ?? 0;
    const tier = getTier(totalPoints);

    const fullName = [profile.first_name, profile.middle_name, profile.last_name]
        .filter(Boolean).join(' ');

    const initials = [profile.first_name?.[0], profile.last_name?.[0]]
        .filter(Boolean).join('').toUpperCase();

    function scrollTo(id: string) {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${fullName} — Profile`} />

            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">

                {/* ── Hero Header ─────────────────────────────────────── */}
                <div className="glass-card rounded-2xl shadow-sm sticky top-0 z-30">
                    <div className="px-6 py-4 space-y-3">
                        {/* Back */}
                        <Link href="/admin/farmers" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Farmers
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            {/* Avatar + name */}
                            <div className="flex items-start gap-4">
                                <div className="relative flex-shrink-0">
                                    <div className="h-20 w-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md overflow-hidden border-2 border-primary/20">
                                        {farmer.picture_id
                                            ? <img src={farmer.picture_id} alt={fullName} className="h-full w-full object-cover" />
                                            : initials || <User className="h-8 w-8" />
                                        }
                                    </div>
                                    {/* Tier indicator dot */}
                                    <span className="absolute -bottom-1.5 -right-1.5 text-base leading-none">{tier.emoji}</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h1 className="text-xl font-bold tracking-tight">{fullName}</h1>
                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tier.bg} ${tier.border} ${tier.color}`}>
                                            {tier.emoji} {tier.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                                        RSBSA #{farmer.rsbsa_number || 'Not assigned'}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {profile.sex && (
                                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border">
                                                {profile.sex}
                                            </span>
                                        )}
                                        {profile.civil_status && (
                                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border">
                                                {profile.civil_status}
                                            </span>
                                        )}
                                        {profile.is_4ps_beneficiary && (
                                            <span className="rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 text-xs font-semibold">
                                                4Ps Beneficiary
                                            </span>
                                        )}
                                        {profile.is_ip && (
                                            <span className="rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-0.5 text-xs font-semibold">
                                                Indigenous Person
                                            </span>
                                        )}
                                        {profile.is_pwd && (
                                            <span className="rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold">
                                                PWD
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-shrink-0">
                                <Link href={`/admin/farmers/${farmer.id}/edit`}>
                                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm">
                                        Edit Profile
                                    </Button>
                                </Link>
                                {farmer.lfid && (
                                    <Button
                                        variant="outline"
                                        className="h-9 text-sm"
                                        onClick={() => window.open(`${window.location.origin}/farmer/profile/${farmer.lfid}`, '_blank')}
                                    >
                                        <QrCode className="h-4 w-4 mr-1.5" />
                                        QR Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body: sidebar + content ──────────────────────────── */}
                <div className="flex flex-1 gap-0">

                    {/* Sticky sidebar nav */}
                    <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r glass-surface sticky top-[180px] h-[calc(100vh-180px)] overflow-y-auto z-20">
                        <nav className="py-3 px-2">
                            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Sections
                            </p>
                            {NAV_SECTIONS.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => scrollTo(s.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] font-medium transition-colors mb-0.5
                                            ${activeSection === s.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                                        {s.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main scrollable content */}
                    <div className="flex-1 overflow-auto px-6 py-6 space-y-10 max-w-5xl">

                        {/* ══ POINTS & TIER ══════════════════════════════ */}
                        <section>
                            <SectionAnchor id="points" />
                            <SectionHeader icon={Star} title="Points & Tier" />

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
                                <KpiCard label="Total Points" value={pointsSummary.total_points.toLocaleString()} icon={Star} />
                                <KpiCard label="This Month" value={`+${pointsSummary.this_month_points.toLocaleString()}`} icon={TrendingDown} />
                                <KpiCard label="Activities" value={pointsSummary.activities_count} icon={Activity} />
                                <KpiCard label="Current Tier" value={`${tier.emoji} ${tier.label}`} icon={Award} />
                            </div>

                            {/* Tier legend */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="px-4 py-3 border-b glass-surface">
                                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tier Thresholds</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0">
                                    {[
                                        { emoji: '🌱', label: 'Seedling', range: '0–199 pts',   perks: 'Earning phase',          active: totalPoints < 200 },
                                        { emoji: '🥉', label: 'Bronze',   range: '200–499 pts', perks: 'Priority eligible',      active: totalPoints >= 200 && totalPoints < 500 },
                                        { emoji: '🥈', label: 'Silver',   range: '500–999 pts', perks: 'Voucher eligible',       active: totalPoints >= 500 && totalPoints < 1000 },
                                        { emoji: '🥇', label: 'Gold',     range: '1,000+ pts',  perks: 'Priority + Voucher',     active: totalPoints >= 1000 },
                                    ].map((t) => (
                                        <div key={t.label} className={`px-4 py-3 ${t.active ? 'bg-primary/10' : ''}`}>
                                            <div className="text-base mb-0.5">{t.emoji} <span className="text-xs font-bold">{t.label}</span></div>
                                            <div className="text-xs text-muted-foreground">{t.range}</div>
                                            <div className="text-xs font-medium text-foreground mt-0.5">{t.perks}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* ══ PERSONAL INFORMATION ═══════════════════════ */}
                        <section>
                            <SectionAnchor id="personal" />
                            <SectionHeader icon={User} title="Personal Information" />

                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 p-5">
                                    <InfoRow label="First Name"     value={profile.first_name} />
                                    <InfoRow label="Middle Name"    value={profile.middle_name} />
                                    <InfoRow label="Last Name"      value={profile.last_name} />
                                    <InfoRow label="Extension Name" value={profile.extension_name} />
                                    <InfoRow label="Sex"            value={profile.sex} />
                                    <InfoRow label="Date of Birth"  value={fmt(profile.birthdate)} />
                                    <InfoRow label="Civil Status"   value={profile.civil_status} />
                                    <InfoRow label="Religion"       value={profile.religion} />
                                    <InfoRow label="Nationality"    value={profile.nationality} />
                                    <InfoRow label="RSBSA Number"   value={farmer.rsbsa_number} mono />
                                    <InfoRow label="PhilSys ID"     value={profile.philsys_id} mono />
                                    <InfoRow label="Registered Voter" value={profile.is_registered_voter ? 'Yes' : 'No'} />
                                </div>

                                {spouse && (
                                    <>
                                        <div className="border-t glass-surface px-5 py-2.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Spouse Information</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 p-5">
                                            <InfoRow label="First Name"     value={spouse.spouse_first_name} />
                                            <InfoRow label="Middle Name"    value={spouse.spouse_middle_name} />
                                            <InfoRow label="Surname"        value={spouse.spouse_surname} />
                                            <InfoRow label="Extension Name" value={spouse.spouse_extension_name} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <Separator />

                        {/* ══ CONTACT ════════════════════════════════════ */}
                        <section>
                            <SectionAnchor id="contact" />
                            <SectionHeader icon={Phone} title="Contact Information" />

                            <div className="glass-card rounded-2xl p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                                    <InfoRow label="Mobile Number"   value={contact.mobile_number} mono />
                                    <InfoRow label="Landline Number" value={contact.landline_number} mono />
                                    <InfoRow label="Email Address"   value={contact.gmail} />
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* ══ ADDRESS ════════════════════════════════════ */}
                        <section>
                            <SectionAnchor id="address" />
                            <SectionHeader icon={MapPin} title="Address Information" />

                            <div className="glass-card rounded-2xl p-5">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                                    <InfoRow label="House / Lot / Purok"    value={address.house_lot_bldg_no_purok} />
                                    <InfoRow label="Street / Sitio / Subdv" value={address.street_sitio_subdv} />
                                    <InfoRow label="Barangay"               value={address.barangay} />
                                    <InfoRow label="City / Municipality"    value={address.municipality_city} />
                                    <InfoRow label="Province"               value={address.province} />
                                    <InfoRow label="Region"                 value={address.region} />
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* ══ HOUSEHOLD ══════════════════════════════════ */}
                        <section>
                            <SectionAnchor id="household" />
                            <SectionHeader icon={Home} title="Household Information" />

                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 p-5">
                                    <InfoRow label="Household Head" value={household.is_household_head ? 'Yes' : 'No'} />
                                    {!household.is_household_head && (
                                        <>
                                            <InfoRow
                                                label="Head of Household"
                                                value={[household.household_head_first_name, household.household_head_middle_name, household.household_head_surname].filter(Boolean).join(' ')}
                                            />
                                            <InfoRow label="Relationship" value={household.relationship_to_household_head} />
                                        </>
                                    )}
                                </div>

                                <div className="border-t glass-surface px-5 py-2.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Household Members</span>
                                </div>
                                <div className="grid grid-cols-3 divide-x p-0">
                                    {[
                                        { label: 'Total', value: household.no_living_household_members ?? 0 },
                                        { label: 'Male',  value: household.no_male_household_members ?? 0   },
                                        { label: 'Female',value: household.no_female_household_members ?? 0 },
                                    ].map((m) => (
                                        <div key={m.label} className="flex flex-col items-center py-5 gap-1">
                                            <span className="text-3xl font-black text-foreground">{m.value}</span>
                                            <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* ══ EDUCATION ══════════════════════════════════ */}
                        <section>
                            <SectionAnchor id="education" />
                            <SectionHeader icon={GraduationCap} title="Education & Special Fields" />

                            <div className="glass-card rounded-2xl p-5">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                                    <InfoRow
                                        label="Highest Education"
                                        value={education.highest_formal_education?.replace(/_/g, ' ')}
                                    />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Special Classifications</span>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {profile.is_4ps_beneficiary && <span className="rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 text-xs font-semibold">4Ps Beneficiary</span>}
                                            {profile.is_ip && <span className="rounded-full bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 text-xs font-semibold">Indigenous Person</span>}
                                            {profile.is_pwd && <span className="rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 text-xs font-semibold">PWD</span>}
                                            {!profile.is_4ps_beneficiary && !profile.is_ip && !profile.is_pwd && (
                                                <span className="text-sm text-muted-foreground">None</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* ══ LIVELIHOOD ═════════════════════════════════ */}
                        <section>
                            <SectionAnchor id="livelihood" />
                            <SectionHeader icon={Briefcase} title="Livelihood & Income" />

                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 p-5">
                                    <InfoRow
                                        label="Main Livelihood"
                                        value={mainLivelihood.main_livelihood?.replace(/_/g, ' ')}
                                    />
                                </div>
                                {(income.farming_income || income.non_farming_income) && (
                                    <>
                                        <div className="border-t glass-surface px-5 py-2.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Income</span>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x">
                                            <div className="flex flex-col items-center py-5 gap-0.5">
                                                <span className="text-xs text-muted-foreground font-medium">Farming</span>
                                                <span className="text-xl font-black text-primary">{peso(income.farming_income)}</span>
                                                <span className="text-[10px] text-muted-foreground">per year</span>
                                            </div>
                                            <div className="flex flex-col items-center py-5 gap-0.5">
                                                <span className="text-xs text-muted-foreground font-medium">Non-Farming</span>
                                                <span className="text-xl font-black text-foreground">{peso(income.non_farming_income)}</span>
                                                <span className="text-[10px] text-muted-foreground">per year</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <Separator />

                        {/* ══ EMERGENCY CONTACT ══════════════════════════ */}
                        <section>
                            <SectionAnchor id="emergency" />
                            <SectionHeader icon={Heart} title="Emergency Contact" />

                            {emergencyContact.emergency_contact_first_name ? (
                                <div className="glass-card rounded-2xl p-5">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                                        <InfoRow
                                            label="Full Name"
                                            value={[
                                                emergencyContact.emergency_contact_first_name,
                                                emergencyContact.emergency_contact_middle_name,
                                                emergencyContact.emergency_contact_last_name,
                                            ].filter(Boolean).join(' ')}
                                        />
                                        <InfoRow label="Contact Number" value={emergencyContact.contact_number} mono />
                                        <InfoRow label="Email"          value={emergencyContact.email} />
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card rounded-2xl">
                                    <EmptyState icon={Heart} message="No emergency contact provided" />
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* ══ FARMS & PARCELS ════════════════════════════ */}
                        <section>
                            <SectionAnchor id="farms" />
                            <SectionHeader icon={Leaf} title="Farms & Parcels" count={farms.length} />

                            {farms.length === 0 ? (
                                <div className="glass-card rounded-2xl">
                                    <EmptyState icon={Leaf} message="No farm information provided" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {farms.map((farm: any, fi: number) => (
                                        <div key={farm.id} className="glass-card rounded-2xl overflow-hidden">
                                            {/* Farm header */}
                                            <div className="flex items-center gap-3 px-5 py-3.5 border-b bg-primary/5">
                                                <TreePine className="h-4 w-4 text-primary" />
                                                <span className="font-bold text-sm text-primary">
                                                    {farm.farm_name || `Farm #${fi + 1}`}
                                                </span>
                                                {farm.farm_parcels?.length > 0 && (
                                                    <span className="ml-auto rounded-full bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5">
                                                        {farm.farm_parcels.length} parcel{farm.farm_parcels.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Parcels */}
                                            {farm.farm_parcels?.length > 0 ? (
                                                <div className="divide-y">
                                                    {farm.farm_parcels.map((parcel: any, pi: number) => (
                                                        <div key={parcel.id} className="p-5">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                                                    Parcel #{parcel.parcel_number || pi + 1}
                                                                </span>
                                                                {parcel.farm_type && (
                                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                                                                        {parcel.farm_type.replace(/_/g, ' ')}
                                                                    </span>
                                                                )}
                                                                {parcel.ownership_type && (
                                                                    <span className="rounded bg-sky-50 text-sky-700 px-1.5 py-0.5 text-xs font-medium border border-sky-100">
                                                                        {parcel.ownership_type.replace(/_/g, ' ')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
                                                                <InfoRow label="Barangay"        value={parcel.barangay} />
                                                                <InfoRow label="City / Mun."     value={parcel.city_municipality} />
                                                                <InfoRow
                                                                    label="Total Area"
                                                                    value={parcel.total_farm_area ? `${parcel.total_farm_area} ha` : undefined}
                                                                />
                                                                <InfoRow
                                                                    label="Parcel Size"
                                                                    value={parcel.parcel_size ? `${parcel.parcel_size} ha` : undefined}
                                                                />
                                                                {parcel.livestock_count > 0 && (
                                                                    <InfoRow label="Livestock Count" value={parcel.livestock_count} />
                                                                )}
                                                            </div>
                                                            {(parcel.within_ancestral_domain || parcel.agrarian_reform_beneficiary || parcel.is_organic_practitioner) && (
                                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                                    {parcel.within_ancestral_domain && (
                                                                        <span className="rounded-full bg-muted border px-2 py-0.5 text-xs font-medium">Ancestral Domain</span>
                                                                    )}
                                                                    {parcel.agrarian_reform_beneficiary && (
                                                                        <span className="rounded-full bg-muted border px-2 py-0.5 text-xs font-medium">Agrarian Reform</span>
                                                                    )}
                                                                    {parcel.is_organic_practitioner && (
                                                                        <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-medium">Organic Practitioner</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {parcel.remarks && (
                                                                <p className="mt-3 text-xs text-muted-foreground border-t pt-3">{parcel.remarks}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-5">
                                                    <p className="text-sm text-muted-foreground">No parcels recorded for this farm.</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* ══ POINTS HISTORY ═════════════════════════════ */}
                        <section>
                            <SectionAnchor id="points-history" />
                            <SectionHeader icon={Star} title="Points Activity History" count={pointsHistory.length} />

                            {pointsHistory.length === 0 ? (
                                <div className="glass-card rounded-2xl">
                                    <EmptyState icon={Star} message="No points activity yet" submessage="Points will be earned as the farmer engages with the app" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pointsHistory.map((activity: any) => (
                                        <div key={activity.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between gap-4 px-5 py-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                                                        {activity.icon || <Star className="h-6 w-6" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm">{activity.activity_name}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                                                            {activity.status === 'verified' && (
                                                                <Badge variant="default" className="bg-primary text-xs">Verified</Badge>
                                                            )}
                                                            {activity.status === 'pending' && (
                                                                <Badge variant="secondary" className="text-xs">Pending</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className={`text-3xl font-black ${
                                                        activity.points > 0 ? 'text-primary' : 'text-red-600'
                                                    }`}>
                                                        {activity.points > 0 ? '+' : ''}{activity.points}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">points</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(activity.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* ══ REWARD REDEMPTION HISTORY ═════════════════════════ */}
                        <section>
                            <SectionAnchor id="rewards" />
                            <SectionHeader icon={Gift} title="Reward Redemption History" count={rewardHistory.length} />

                            {rewardHistory.length === 0 ? (
                                <div className="glass-card rounded-2xl">
                                    <EmptyState icon={Gift} message="No reward redemptions yet" submessage="Farmer has not redeemed any rewards" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rewardHistory.map((reward: any) => (
                                        <div key={reward.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between gap-4 px-5 py-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                        reward.status === 'approved' ? 'bg-primary/10 text-primary' :
                                                        reward.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        <Gift className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <p className="font-semibold text-base">{reward.reward_name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs">{reward.reward_type}</Badge>
                                                            {reward.status === 'approved' && (
                                                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Approved</Badge>
                                                            )}
                                                            {reward.status === 'pending' && (
                                                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Pending</Badge>
                                                            )}
                                                            {reward.status === 'rejected' && (
                                                                <Badge variant="destructive" className="text-xs">Rejected</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-3xl font-black text-amber-600">
                                                        -{reward.points_cost}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">points</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(reward.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                    {reward.voucher_code && (
                                                        <p className="text-xs font-mono font-semibold text-primary mt-1">
                                                            {reward.voucher_code}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* ══ ALLOCATION HISTORY ═════════════════════════ */}
                        <section>
                            <SectionAnchor id="allocations" />
                            <SectionHeader icon={Package} title="Allocation History" count={allocationHistory.length} />

                            {allocationHistory.length === 0 ? (
                                <div className="glass-card rounded-2xl">
                                    <EmptyState icon={Package} message="No allocation records found" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {allocationHistory.map((a: any) => (
                                        <div key={a.id} className="glass-card rounded-2xl overflow-hidden">
                                            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b bg-muted/20">
                                                <div>
                                                    <p className="font-bold text-sm">{a.distribution_name}</p>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        <span className="rounded bg-muted border px-1.5 py-0.5 text-xs font-medium">{a.allocation_type}</span>
                                                        <span className="rounded bg-muted border px-1.5 py-0.5 text-xs font-medium">{a.program_name}</span>
                                                        <StatusPill status={a.status} />
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-2xl font-black text-primary">
                                                        {parseFloat(a.quantity_allocated).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{a.unit}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 px-5 py-4">
                                                <InfoRow label="Release Date"  value={fmtShort(a.release_date)} />
                                                {a.received_at && <InfoRow label="Received On" value={fmtShort(a.received_at)} />}
                                                {a.received_by && <InfoRow label="Received By" value={a.received_by} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* ══ CROP DAMAGE HISTORY ════════════════════════ */}
                        <section>
                            <SectionAnchor id="damage" />
                            <SectionHeader icon={TrendingDown} title="Crop Damage History" count={cropDamageHistory.length} />

                            {cropDamageHistory.length === 0 ? (
                                <div className="glass-card rounded-2xl">
                                    <EmptyState icon={TrendingDown} message="No crop damage records found" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cropDamageHistory.map((d: any) => (
                                        <div key={d.id} className="glass-card rounded-2xl overflow-hidden">
                                            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b bg-muted/20">
                                                <div>
                                                    <p className="font-bold text-sm">{d.commodity_name || 'Unknown Crop'}</p>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        <span className="rounded bg-muted border px-1.5 py-0.5 text-xs font-medium">{d.damage_category}</span>
                                                        <span className="rounded bg-muted border px-1.5 py-0.5 text-xs font-medium">{d.damage_type}</span>
                                                        <StatusPill status={d.status} />
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-xs text-muted-foreground font-semibold">Severity</p>
                                                    <p className="text-lg font-black capitalize text-orange-600">
                                                        {d.severity?.replace('_', ' ') || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 px-5 py-4">
                                                <InfoRow label="Variety"       value={d.variety_name} />
                                                <InfoRow label="Area Affected" value={d.area_affected ? `${d.area_affected} ha` : undefined} />
                                                <InfoRow label="Date Reported" value={fmtShort(d.date_reported)} />
                                                <InfoRow label="Location"      value={[d.barangay, d.municipality].filter(Boolean).join(', ')} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* ══ CROP MONITORING REPORTS ════════════════════ */}
                        <section>
                            <SectionAnchor id="monitoring" />
                            <SectionHeader icon={BarChart3} title="Crop Monitoring Reports" count={cropMonitoringReports.length} />

                            {cropMonitoringReports.length === 0 ? (
                                <div className="glass-card rounded-2xl">
                                    <EmptyState icon={BarChart3} message="No crop monitoring reports submitted yet" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cropMonitoringReports.map((r: any) => (
                                        <div key={r.id} className="glass-card rounded-2xl overflow-hidden">
                                            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b bg-muted/20">
                                                <div>
                                                    <p className="font-bold text-sm">{r.crop_name || r.commodity_name || 'Monitoring Report'}</p>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        {r.report_type && <span className="rounded bg-muted border px-1.5 py-0.5 text-xs font-medium">{r.report_type}</span>}
                                                        {r.season && <span className="rounded bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 text-xs font-medium">{r.season}</span>}
                                                        {r.status && <StatusPill status={r.status} />}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">{fmtShort(r.date_reported || r.created_at)}</span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 px-5 py-4">
                                                <InfoRow label="Area Planted"   value={r.area_planted ? `${r.area_planted} ha` : undefined} />
                                                <InfoRow label="Area Harvested" value={r.area_harvested ? `${r.area_harvested} ha` : undefined} />
                                                <InfoRow label="Yield"          value={r.yield_amount ? `${r.yield_amount} ${r.yield_unit || 'MT'}` : undefined} />
                                                <InfoRow label="Barangay"       value={r.barangay} />
                                                {r.crop_stage && <InfoRow label="Crop Stage" value={r.crop_stage} />}
                                                {r.irrigation_source && <InfoRow label="Irrigation" value={r.irrigation_source} />}
                                                {r.remarks && (
                                                    <div className="col-span-2 sm:col-span-4">
                                                        <InfoRow label="Remarks" value={r.remarks} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* bottom breathing room */}
                        <div className="h-8" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
