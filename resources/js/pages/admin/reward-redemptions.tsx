import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, XCircle, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reward Redemptions', href: '/admin/reward-redemptions' },
];

interface Redemption {
    id: number;
    farmer_name: string;
    farmer_lfid: string;
    reward_type: string;
    reward_name: string;
    points_cost: number;
    status: string;
    notes: string | null;
    voucher_code: string | null;
    valid_until: string | null;
    approved_at: string | null;
    approved_by: string | null;
    created_at: string;
}

export default function RewardRedemptions() {
    const { redemptions } = usePage<{ redemptions: Redemption[] }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleApprove = (id: number) => {
        if (confirm('Are you sure you want to approve this redemption? Points will be deducted from the farmer.')) {
            router.post(`/admin/reward-redemptions/${id}/approve`);
        }
    };

    const handleReject = (id: number) => {
        const reason = prompt('Enter rejection reason (optional):');
        router.post(`/admin/reward-redemptions/${id}/reject`, {
            notes: reason || undefined,
        });
    };

    const filteredRedemptions = (redemptions || []).filter(redemption => {
        const matchesSearch = `${redemption.farmer_name} ${redemption.farmer_lfid} ${redemption.reward_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = (redemptions || []).filter(r => r.status === 'pending').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reward Redemptions" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reward Redemptions</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage farmer reward requests and point deductions
                        </p>
                    </div>
                    {pendingCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm px-4 py-2">
                            {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>

                {/* Redemptions Table */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search redemptions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 px-3 text-sm border rounded-md"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>
                            <p className="text-sm text-muted-foreground ml-auto">
                                {filteredRedemptions.length} redemption{filteredRedemptions.length !== 1 ? 's' : ''}
                            </p>
                        </div>
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
                                {filteredRedemptions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No redemption requests found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRedemptions.map((redemption) => (
                                        <TableRow key={redemption.id}>
                                            <TableCell className="font-medium">
                                                {redemption.farmer_name}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {redemption.farmer_lfid}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{redemption.reward_name}</p>
                                                    {redemption.voucher_code && (
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            Code: {redemption.voucher_code}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {redemption.reward_type.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-amber-600">
                                                {redemption.points_cost}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(redemption.status)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(redemption.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {redemption.status === 'pending' && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleApprove(redemption.id)}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleReject(redemption.id)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
