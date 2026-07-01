import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Award, Star, Trophy, TrendingUp, Users, Package,
    Search, Plus, Pencil, Trash2, MoreHorizontal,
    CheckCircle2, XCircle, Clock, Download, Filter,
    ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Points Management', href: '/admin/points-management' },
];

interface Farmer {
    id: number;
    lfid: string;
    first_name: string;
    last_name: string;
    barangay: string;
    total_points: number;
    current_tier: string;
    activities_count: number;
    rank?: number;
}

interface PointRule {
    id: number;
    name: string;
    trigger_action: string;
    points_awarded: number;
    max_earnable: number | null;
    description: string;
    is_active: boolean;
}

interface Activity {
    id: number;
    farmer_name: string;
    farmer_lfid: string;
    activity_name: string;
    category: string;
    points: number;
    status: string;
    is_manual: boolean;
    created_at: string;
}

interface Redemption {
    id: number;
    farmer_name: string;
    farmer_lfid: string;
    reward_type: string;
    reward_name: string;
    points_cost: number;
    status: string;
    created_at: string;
}

export default function PointsManagement() {
    const { farmers, pointRules, leaderboard, stats, tierDistribution, nearingPromotion, redemptions, activities } = usePage<{
        farmers: Farmer[];
        pointRules: PointRule[];
        leaderboard: Farmer[];
        stats: {
            total_points: number;
            active_farmers: number;
            pending_redemptions: number;
            this_month_points: number;
        };
        tierDistribution: Record<string, number>;
        nearingPromotion: Farmer[];
        redemptions: Redemption[];
        activities: Activity[];
    }>().props;

    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Leaderboard pagination
    const [leaderboardPage, setLeaderboardPage] = useState(1);
    const leaderboardPerPage = 10;
    
    // Award Points Modal
    const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
    const [awardForm, setAwardForm] = useState({
        farmer_id: '',
        points: '',
        category: 'farming',
        activity_name: '',
        description: '',
        admin_notes: '',
    });

    // Point Rule Modal
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<PointRule | null>(null);
    const [ruleForm, setRuleForm] = useState({
        name: '',
        trigger_action: '',
        points_awarded: 0,
        max_earnable: null as number | null,
        description: '',
        is_active: true,
    });

    // Delete Rule Modal
    const [isDeleteRuleModalOpen, setIsDeleteRuleModalOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<PointRule | null>(null);

    // Handle award points
    const handleAwardPoints = () => {
        router.post('/admin/points/award', awardForm, {
            onSuccess: () => {
                setIsAwardModalOpen(false);
                setAwardForm({
                    farmer_id: '',
                    points: '',
                    category: 'farming',
                    activity_name: '',
                    description: '',
                    admin_notes: '',
                });
            },
        });
    };

    // Handle save rule
    const handleSaveRule = () => {
        if (selectedRule) {
            router.put(`/admin/point-rules/${selectedRule.id}`, ruleForm, {
                onSuccess: () => {
                    setIsRuleModalOpen(false);
                    setSelectedRule(null);
                },
            });
        } else {
            router.post('/admin/point-rules', ruleForm, {
                onSuccess: () => {
                    setIsRuleModalOpen(false);
                    setRuleForm({
                        name: '',
                        trigger_action: '',
                        points_awarded: 0,
                        max_earnable: null,
                        description: '',
                        is_active: true,
                    });
                },
            });
        }
    };

    // Handle delete rule
    const handleDeleteRule = () => {
        if (ruleToDelete) {
            router.delete(`/admin/point-rules/${ruleToDelete.id}`, {
                onSuccess: () => {
                    setIsDeleteRuleModalOpen(false);
                    setRuleToDelete(null);
                },
            });
        }
    };

    // Handle toggle rule
    const handleToggleRule = (rule: PointRule) => {
        router.post(`/admin/point-rules/${rule.id}/toggle`);
    };

    // Handle approve redemption
    const handleApproveRedemption = (id: number) => {
        router.post(`/admin/reward-redemptions/${id}/approve`);
    };

    // Handle reject redemption
    const handleRejectRedemption = (id: number) => {
        router.post(`/admin/reward-redemptions/${id}/reject`);
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Gold': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Silver': return 'bg-sky-100 text-sky-800 border-sky-200';
            case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Points Management" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Points Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor farmer engagement, manage rewards, and track activities
                        </p>
                    </div>
                    <Button onClick={() => setIsAwardModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Award Points
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Points Awarded</p>
                                    <p className="text-3xl font-bold mt-2">{stats?.total_points?.toLocaleString() || 0}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-sky-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Farmers</p>
                                    <p className="text-3xl font-bold mt-2">{stats?.active_farmers || 0}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-sky-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending Redemptions</p>
                                    <p className="text-3xl font-bold mt-2">{stats?.pending_redemptions || 0}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                                    <p className="text-3xl font-bold mt-2">{stats?.this_month_points?.toLocaleString() || 0}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Award className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                        <TabsTrigger value="rules">Point Rules</TabsTrigger>
                        <TabsTrigger value="tiers">Tiers</TabsTrigger>
                        <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
                        <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tier Distribution */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Tier Distribution</h3>
                                    <div className="space-y-4">
                                        {Object.entries(tierDistribution || {}).map(([tier, count]) => (
                                            <div key={tier} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getTierColor(tier)}>{tier}</Badge>
                                                    <span className="text-sm text-muted-foreground">{count} farmers</span>
                                                </div>
                                                <div className="w-32 bg-muted rounded-full h-2">
                                                    <div
                                                        className="bg-emerald-500 h-2 rounded-full"
                                                        style={{
                                                            width: `${farmers?.length ? (count / farmers.length) * 100 : 0}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Nearing Promotion */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Nearing Tier Promotion</h3>
                                    <div className="space-y-3">
                                        {(nearingPromotion || []).slice(0, 5).map((farmer) => (
                                            <div key={farmer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{farmer.first_name} {farmer.last_name}</p>
                                                    <p className="text-xs text-muted-foreground">{farmer.lfid}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-sm">{farmer.total_points} pts</p>
                                                    <p className="text-xs text-muted-foreground">{farmer.current_tier}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="leaderboard" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Top Farmers Leaderboard</h3>
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search farmers..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setLeaderboardPage(1);
                                            }}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">Rank</TableHead>
                                            <TableHead>Farmer</TableHead>
                                            <TableHead>LFID</TableHead>
                                            <TableHead>Barangay</TableHead>
                                            <TableHead className="text-right">Total Points</TableHead>
                                            <TableHead>Tier</TableHead>
                                            <TableHead className="text-right">Activities</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            const filteredLeaderboard = (leaderboard || [])
                                                .filter((f) =>
                                                    `${f.first_name} ${f.last_name} ${f.lfid}`
                                                        .toLowerCase()
                                                        .includes(searchTerm.toLowerCase())
                                                );
                                            
                                            // Calculate pagination
                                            const totalPages = Math.ceil(filteredLeaderboard.length / leaderboardPerPage);
                                            const startIndex = (leaderboardPage - 1) * leaderboardPerPage;
                                            const endIndex = startIndex + leaderboardPerPage;
                                            const paginatedLeaderboard = filteredLeaderboard.slice(startIndex, endIndex);
                                            
                                            return (
                                                <>
                                                    {paginatedLeaderboard.map((farmer) => (
                                                        <TableRow key={farmer.id}>
                                                            <TableCell className="font-bold">
                                                                {(farmer.rank || 0) <= 3 ? (
                                                                    <span className="text-lg">
                                                                        {farmer.rank === 1 ? '🥇' : farmer.rank === 2 ? '🥈' : '🥉'}
                                                                    </span>
                                                                ) : (
                                                                    farmer.rank || '—'
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {farmer.first_name} {farmer.last_name}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">{farmer.lfid}</TableCell>
                                                            <TableCell>{farmer.barangay}</TableCell>
                                                            <TableCell className="text-right font-bold text-emerald-600">
                                                                {farmer.total_points.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getTierColor(farmer.current_tier)}>
                                                                    {farmer.current_tier}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">{farmer.activities_count}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {paginatedLeaderboard.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                                No farmers found matching your search
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </TableBody>
                                </Table>
                                
                                {/* Pagination Controls */}
                                {(() => {
                                    const filteredLeaderboard = (leaderboard || [])
                                        .filter((f) =>
                                            `${f.first_name} ${f.last_name} ${f.lfid}`
                                                .toLowerCase()
                                                .includes(searchTerm.toLowerCase())
                                        );
                                    const totalPages = Math.ceil(filteredLeaderboard.length / leaderboardPerPage);
                                    
                                    if (totalPages <= 1) return null;
                                    
                                    return (
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {((leaderboardPage - 1) * leaderboardPerPage) + 1} to {Math.min(leaderboardPage * leaderboardPerPage, filteredLeaderboard.length)} of {filteredLeaderboard.length} farmers
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setLeaderboardPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={leaderboardPage === 1}
                                                    className="px-3 py-1.5 text-sm font-medium rounded-md border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                
                                                {/* Page numbers */}
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNum;
                                                        if (totalPages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (leaderboardPage <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (leaderboardPage >= totalPages - 2) {
                                                            pageNum = totalPages - 4 + i;
                                                        } else {
                                                            pageNum = leaderboardPage - 2 + i;
                                                        }
                                                        
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => setLeaderboardPage(pageNum)}
                                                                className={`w-9 h-9 text-sm font-medium rounded-md ${
                                                                    leaderboardPage === pageNum
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-background border hover:bg-muted'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <button
                                                    onClick={() => setLeaderboardPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={leaderboardPage === totalPages}
                                                    className="px-3 py-1.5 text-sm font-medium rounded-md border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Point Rules Tab */}
                    <TabsContent value="rules" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Point Rules Configuration</h3>
                                    <Button onClick={() => {
                                        setSelectedRule(null);
                                        setRuleForm({
                                            name: '',
                                            trigger_action: '',
                                            points_awarded: 0,
                                            max_earnable: null,
                                            description: '',
                                            is_active: true,
                                        });
                                        setIsRuleModalOpen(true);
                                    }}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Rule
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Rule Name</TableHead>
                                            <TableHead>Trigger Action</TableHead>
                                            <TableHead className="text-right">Points</TableHead>
                                            <TableHead className="text-right">Max Earnable</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(pointRules || []).map((rule) => (
                                            <TableRow key={rule.id}>
                                                <TableCell className="font-medium">{rule.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{rule.trigger_action}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-600">
                                                    {rule.points_awarded}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {rule.max_earnable ? rule.max_earnable : '∞'}
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={rule.is_active}
                                                        onCheckedChange={() => handleToggleRule(rule)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedRule(rule);
                                                                setRuleForm({
                                                                    name: rule.name,
                                                                    trigger_action: rule.trigger_action,
                                                                    points_awarded: rule.points_awarded,
                                                                    max_earnable: rule.max_earnable,
                                                                    description: rule.description || '',
                                                                    is_active: rule.is_active,
                                                                });
                                                                setIsRuleModalOpen(true);
                                                            }}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setRuleToDelete(rule);
                                                                    setIsDeleteRuleModalOpen(true);
                                                                }}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tiers Tab */}
                    <TabsContent value="tiers" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { name: 'Gold', min: 1000, max: null, color: 'amber', benefits: 'Voucher + Priority Allocation' },
                                { name: 'Silver', min: 500, max: 999, color: 'sky', benefits: 'Voucher Eligibility' },
                                { name: 'Bronze', min: 200, max: 499, color: 'orange', benefits: 'Priority Eligibility' },
                                { name: 'Seedling', min: 0, max: 199, color: 'green', benefits: 'Participation Phase' },
                            ].map((tier) => (
                                <Card key={tier.name} className={`border-l-4 border-l-${tier.color}-500`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`h-12 w-12 rounded-full bg-${tier.color}-100 flex items-center justify-center`}>
                                                <Trophy className={`h-6 w-6 text-${tier.color}-600`} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{tier.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {tier.min} - {tier.max ? tier.max : '∞'} pts
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Benefits:</p>
                                            <p className="text-sm text-muted-foreground">{tier.benefits}</p>
                                            <p className="text-sm font-medium mt-4">
                                                Farmers: <span className="text-lg font-bold">{tierDistribution?.[tier.name] || 0}</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Redemptions Tab */}
                    <TabsContent value="redemptions" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Reward Redemption Requests</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Farmer</TableHead>
                                            <TableHead>LFID</TableHead>
                                            <TableHead>Reward</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Points Cost</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(redemptions || []).map((redemption) => (
                                            <TableRow key={redemption.id}>
                                                <TableCell className="font-medium">{redemption.farmer_name}</TableCell>
                                                <TableCell className="font-mono text-sm">{redemption.farmer_lfid}</TableCell>
                                                <TableCell>{redemption.reward_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{redemption.reward_type}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {redemption.points_cost}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(redemption.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {redemption.status === 'pending' && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => handleApproveRedemption(redemption.id)}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleRejectRedemption(redemption.id)}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Log Tab */}
                    <TabsContent value="activity" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Activity Log</h3>
                                    <Button variant="outline" onClick={() => router.get('/admin/activity-log/export')}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date/Time</TableHead>
                                            <TableHead>Farmer</TableHead>
                                            <TableHead>Activity</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Points</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Source</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(activities || []).slice(0, 100).map((activity) => (
                                            <TableRow key={activity.id}>
                                                <TableCell className="text-sm">
                                                    {new Date(activity.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm">{activity.farmer_name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">{activity.farmer_lfid}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{activity.activity_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{activity.category}</Badge>
                                                </TableCell>
                                                <TableCell className={`text-right font-bold ${activity.points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {activity.points > 0 ? '+' : ''}{activity.points}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(activity.status)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={activity.is_manual ? 'default' : 'secondary'}>
                                                        {activity.is_manual ? 'Manual' : 'Auto'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Award Points Modal */}
            <Dialog open={isAwardModalOpen} onOpenChange={setIsAwardModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Award Points to Farmer</DialogTitle>
                        <DialogDescription>
                            Manually award points to a farmer for participation or special recognition
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Farmer</Label>
                            <Select
                                value={awardForm.farmer_id}
                                onValueChange={(value) => setAwardForm({ ...awardForm, farmer_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a farmer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(farmers || []).map((farmer) => (
                                        <SelectItem key={farmer.id} value={String(farmer.id)}>
                                            {farmer.first_name} {farmer.last_name} ({farmer.lfid})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Points</Label>
                            <Input
                                type="number"
                                min="1"
                                value={awardForm.points}
                                onChange={(e) => setAwardForm({ ...awardForm, points: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={awardForm.category}
                                onValueChange={(value) => setAwardForm({ ...awardForm, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="farming">Farming</SelectItem>
                                    <SelectItem value="reporting">Reporting</SelectItem>
                                    <SelectItem value="learning">Learning</SelectItem>
                                    <SelectItem value="community">Community</SelectItem>
                                    <SelectItem value="special">Special Recognition</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Activity Name</Label>
                            <Input
                                value={awardForm.activity_name}
                                onChange={(e) => setAwardForm({ ...awardForm, activity_name: e.target.value })}
                                placeholder="e.g., Field Training Attendance"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Textarea
                                value={awardForm.description}
                                onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                                placeholder="Additional details..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Admin Notes (Optional)</Label>
                            <Textarea
                                value={awardForm.admin_notes}
                                onChange={(e) => setAwardForm({ ...awardForm, admin_notes: e.target.value })}
                                placeholder="Internal notes..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAwardModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAwardPoints}>
                            Award Points
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Point Rule Modal */}
            <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedRule ? 'Edit' : 'Create'} Point Rule</DialogTitle>
                        <DialogDescription>
                            {selectedRule ? 'Update' : 'Define'} how farmers can earn points
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rule Name</Label>
                            <Input
                                value={ruleForm.name}
                                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                                placeholder="e.g., Daily Login"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Trigger Action</Label>
                            <Input
                                value={ruleForm.trigger_action}
                                onChange={(e) => setRuleForm({ ...ruleForm, trigger_action: e.target.value })}
                                placeholder="e.g., login, form_submit"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Points Awarded</Label>
                            <Input
                                type="number"
                                min="1"
                                value={ruleForm.points_awarded}
                                onChange={(e) => setRuleForm({ ...ruleForm, points_awarded: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Earnable (Optional, null = unlimited)</Label>
                            <Input
                                type="number"
                                min="1"
                                value={ruleForm.max_earnable || ''}
                                onChange={(e) => setRuleForm({ ...ruleForm, max_earnable: e.target.value ? parseInt(e.target.value) : null })}
                                placeholder="Leave empty for unlimited"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={ruleForm.description}
                                onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                                placeholder="Description shown to farmers..."
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Active</Label>
                            <Switch
                                checked={ruleForm.is_active}
                                onCheckedChange={(checked) => setRuleForm({ ...ruleForm, is_active: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRuleModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveRule}>
                            {selectedRule ? 'Update' : 'Create'} Rule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Rule Modal */}
            <Dialog open={isDeleteRuleModalOpen} onOpenChange={setIsDeleteRuleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Point Rule</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{ruleToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteRuleModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteRule}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
