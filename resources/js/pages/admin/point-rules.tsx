import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    { title: 'Point Rules', href: '/admin/point-rules' },
];

interface PointRule {
    id: number;
    name: string;
    trigger_action: string;
    points_awarded: number;
    max_earnable: number | null;
    description: string;
    is_active: boolean;
}

export default function PointRules() {
    const { rules } = usePage<{ rules: PointRule[] }>().props;

    const [searchTerm, setSearchTerm] = useState('');
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

    const [isDeleteRuleModalOpen, setIsDeleteRuleModalOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<PointRule | null>(null);

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

    const handleToggleRule = (rule: PointRule) => {
        router.post(`/admin/point-rules/${rule.id}/toggle`);
    };

    const filteredRules = (rules || []).filter(rule =>
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.trigger_action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Point Rules" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Point Rules</h1>
                        <p className="text-muted-foreground mt-1">
                            Configure how farmers earn points through activities
                        </p>
                    </div>
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

                {/* Rules Table */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="relative w-64">
                                <input
                                    type="text"
                                    placeholder="Search rules..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-9 px-3 py-1 text-sm border rounded-md"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {filteredRules.length} rule{filteredRules.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rule Name</TableHead>
                                    <TableHead>Trigger Action</TableHead>
                                    <TableHead className="text-right">Points</TableHead>
                                    <TableHead className="text-right">Max Earnable</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No point rules found. Click "Add Rule" to create one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRules.map((rule) => (
                                        <TableRow key={rule.id}>
                                            <TableCell className="font-medium">{rule.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {rule.trigger_action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">
                                                {rule.points_awarded}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {rule.max_earnable ? (
                                                    <span className="font-semibold">{rule.max_earnable}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">∞ Unlimited</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                                {rule.description || '—'}
                                            </TableCell>
                                            <TableCell className="text-center">
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

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
                                onChange={(e) => setRuleForm({ ...ruleForm, points_awarded: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Earnable (Optional, leave empty for unlimited)</Label>
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
