import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FormulaType, type FormulaFactor } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Scale, FlaskConical, ChevronDown, ChevronUp, Pencil, TriangleAlert,
    CircleCheck, BookOpen, Sigma, ListOrdered, Layers3, Equal, Plus,
    Trash2, X, Info, Wand2, Code2, Lock,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Formula Types', href: '/super-admin/formula-types' }];

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------
const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; badge: string; icon: React.ElementType }> = {
    equal:        { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800',   icon: Equal },
    proportional: { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-800',  icon: Sigma },
    priority:     { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', icon: ListOrdered },
    weighted:     { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', icon: Layers3 },
    custom:       { color: 'text-slate-700',  bg: 'bg-slate-50',  border: 'border-slate-300',  badge: 'bg-slate-100 text-slate-700',  icon: FlaskConical },
};

const ALGORITHM_LABELS: Record<string, string> = {
    equal:        'Equal Distribution',
    proportional: 'Proportional Distribution',
    priority:     'Priority-Based Allocation',
    weighted:     'Weighted / Hybrid Allocation',
};

const FIELD_LABELS: Record<string, string> = {
    eligibility_score: 'Eligibility Score',
    damage_score:      'Damage Score',
    farm_size:         'Farm Size',
    membership_score:  'Membership Score',
    years_farming:     'Years Farming',
};

function getTypeConfig(formula: FormulaType) {
    if (formula.is_default) return TYPE_CONFIG[formula.type] ?? TYPE_CONFIG.equal;
    return TYPE_CONFIG.custom;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ExampleSection({ example }: { example: Record<string, any> | null }) {
    const [open, setOpen] = useState(false);
    if (!example) return null;
    return (
        <div className="mt-3">
            <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="h-3.5 w-3.5" />
                Example
                {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {open && (
                <div className="mt-2 rounded-md bg-muted/50 border p-3 text-sm space-y-1">
                    {Object.entries(example).map(([key, val]) => (
                        <div key={key} className="flex flex-col gap-0.5">
                            <span className="font-semibold capitalize text-xs text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                            {Array.isArray(val) ? (
                                <ul className="ml-3 list-disc text-xs space-y-0.5">{val.map((v, i) => <li key={i}>{String(v)}</li>)}</ul>
                            ) : typeof val === 'object' && val !== null ? (
                                <ul className="ml-3 list-none text-xs space-y-0.5">
                                    {Object.entries(val).map(([k, v]) => <li key={k}><span className="font-medium">{k}:</span> {String(v)}</li>)}
                                </ul>
                            ) : (
                                <span className="font-mono text-xs">{String(val)}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function FactorTable({ factors }: { factors: FormulaFactor[] }) {
    const total = factors.reduce((s, f) => s + f.weight, 0);
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                <Wand2 className="h-3.5 w-3.5" /> Factors &amp; Weights
            </p>
            <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-muted/60 border-b">
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Field</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Label</th>
                            <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Weight</th>
                        </tr>
                    </thead>
                    <tbody>
                        {factors.map((f, i) => (
                            <tr key={i} className="border-b last:border-0">
                                <td className="px-3 py-2 font-mono text-muted-foreground">{f.field}</td>
                                <td className="px-3 py-2">{f.label || FIELD_LABELS[f.field] || f.field}</td>
                                <td className="px-3 py-2 text-right font-semibold">{f.weight}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-muted/30">
                            <td colSpan={2} className="px-3 py-2 text-xs font-semibold text-muted-foreground">∑ weights</td>
                            <td className={`px-3 py-2 text-right font-bold text-xs ${Math.abs(total - 1) < 0.01 ? 'text-green-600' : 'text-amber-600'}`}>
                                {total.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

function FormulaCard({
    formula, onEdit, onDelete,
}: { formula: FormulaType; onEdit: (f: FormulaType) => void; onDelete: (f: FormulaType) => void }) {
    const cfg = getTypeConfig(formula);
    const Icon = cfg.icon;
    const isCustom = !formula.is_default;

    return (
        <div className={`rounded-xl border-2 ${cfg.border} bg-card shadow-sm flex flex-col`}>
            {/* Header */}
            <div className={`${cfg.bg} rounded-t-xl px-5 py-4 flex items-start justify-between gap-3`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className={`text-lg font-bold ${cfg.color}`}>{formula.name}</h2>
                            {formula.is_default ? (
                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700">
                                    <Lock className="h-2.5 w-2.5" /> Default
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">
                                    Custom
                                </span>
                            )}
                            {!formula.is_active && (
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500">Inactive</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            {formula.use_case && <p className="text-xs text-muted-foreground">{formula.use_case}</p>}
                            {isCustom && formula.base_algorithm && (
                                <span className="text-xs text-muted-foreground italic">
                                    Distribution: {ALGORITHM_LABELS[formula.base_algorithm] ?? formula.base_algorithm}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(formula)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    {isCustom && (
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(formula)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-4 flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">{formula.short_description}</p>

                {/* Show factor table for custom builder formulas */}
                {isCustom && formula.expression_mode === 'builder' && formula.factors && formula.factors.length > 0 ? (
                    <FactorTable factors={formula.factors} />
                ) : isCustom && formula.expression_mode === 'advanced' ? (
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                            <Code2 className="h-3.5 w-3.5" /> Expression
                        </p>
                        <pre className={`rounded-lg border ${cfg.border} ${cfg.bg} px-4 py-2.5 text-sm font-mono ${cfg.color} whitespace-pre-wrap leading-relaxed`}>
                            {formula.formula_expression}
                        </pre>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            Variables: {Object.keys(FIELD_LABELS).map(k => <code key={k} className="mx-0.5 bg-muted px-1 rounded text-xs">{k}</code>)}
                        </p>
                    </div>
                ) : (
                    /* Default formulas: show the formula expression */
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                            <Scale className="h-3.5 w-3.5" /> Formula
                        </p>
                        <pre className={`rounded-lg border ${cfg.border} ${cfg.bg} px-4 py-2.5 text-sm font-mono ${cfg.color} whitespace-pre-wrap leading-relaxed`}>
                            {formula.formula_expression}
                        </pre>
                    </div>
                )}

                {/* Logic Notes */}
                {formula.logic_notes && formula.logic_notes.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                            <CircleCheck className="h-3.5 w-3.5" /> Logic
                        </p>
                        <ul className="space-y-1">
                            {formula.logic_notes.map((note, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${cfg.color.replace('text-', 'bg-')}`} />
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <ExampleSection example={formula.example} />

                {formula.edge_cases && formula.edge_cases.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1.5 flex items-center gap-1">
                            <TriangleAlert className="h-3.5 w-3.5" /> Edge Cases
                        </p>
                        <ul className="space-y-1">
                            {formula.edge_cases.map((ec, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span>{ec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Factor Builder Row
// ---------------------------------------------------------------------------
function FactorRow({
    factor, index, allowedFields, onChange, onRemove,
}: {
    factor: FormulaFactor;
    index: number;
    allowedFields: string[];
    onChange: (i: number, f: FormulaFactor) => void;
    onRemove: (i: number) => void;
}) {
    return (
        <tr className="border-b last:border-0">
            <td className="px-2 py-2">
                <Select value={factor.field} onValueChange={v => onChange(index, { ...factor, field: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Field" /></SelectTrigger>
                    <SelectContent>
                        {allowedFields.map(f => (
                            <SelectItem key={f} value={f}>{FIELD_LABELS[f] ?? f}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </td>
            <td className="px-2 py-2">
                <Input
                    className="h-8 text-xs"
                    placeholder={FIELD_LABELS[factor.field] || 'Label'}
                    value={factor.label}
                    onChange={e => onChange(index, { ...factor, label: e.target.value })}
                />
            </td>
            <td className="px-2 py-2">
                <Input
                    type="number" step="0.01" min="0" max="10"
                    className="h-8 text-xs text-right"
                    value={factor.weight}
                    onChange={e => onChange(index, { ...factor, weight: parseFloat(e.target.value) || 0 })}
                />
            </td>
            <td className="px-2 py-2 text-center">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onRemove(index)}>
                    <X className="h-3.5 w-3.5" />
                </Button>
            </td>
        </tr>
    );
}

// ---------------------------------------------------------------------------
// Formula Builder Modal (create / edit custom)
// ---------------------------------------------------------------------------
type BuilderFormData = {
    name: string;
    use_case: string;
    short_description: string;
    base_algorithm: string;
    expression_mode: 'builder' | 'advanced';
    factors: FormulaFactor[];
    formula_expression: string;
    logic_notes_text: string;
    edge_cases_text: string;
    is_active: boolean;
};

function emptyBuilderForm(): BuilderFormData {
    return {
        name: '', use_case: '', short_description: '',
        base_algorithm: 'proportional',
        expression_mode: 'builder',
        factors: [{ field: 'eligibility_score', weight: 1.0, label: 'Eligibility Score' }],
        formula_expression: '',
        logic_notes_text: '', edge_cases_text: '',
        is_active: true,
    };
}

function FormulaBuilderModal({
    open, formula, allowedFields, onClose,
}: {
    open: boolean;
    formula: FormulaType | null;   // null = create mode
    allowedFields: string[];
    onClose: () => void;
}) {
    const isEdit = formula !== null;
    const expressionRef = useRef<HTMLTextAreaElement>(null);

    const [form, setForm] = useState<BuilderFormData>(() => {
        if (!formula) return emptyBuilderForm();
        return {
            name: formula.name,
            use_case: formula.use_case ?? '',
            short_description: formula.short_description,
            base_algorithm: formula.base_algorithm ?? 'proportional',
            expression_mode: formula.expression_mode,
            factors: formula.factors ? [...formula.factors] : [],
            formula_expression: formula.formula_expression ?? '',
            logic_notes_text: (formula.logic_notes ?? []).join('\n'),
            edge_cases_text: (formula.edge_cases ?? []).join('\n'),
            is_active: formula.is_active,
        };
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when dialog opens/closes or target formula changes
    const reset = (f: FormulaType | null) => {
        if (!f) { setForm(emptyBuilderForm()); }
        else {
            setForm({
                name: f.name, use_case: f.use_case ?? '',
                short_description: f.short_description,
                base_algorithm: f.base_algorithm ?? 'proportional',
                expression_mode: f.expression_mode,
                factors: f.factors ? [...f.factors] : [],
                formula_expression: f.formula_expression ?? '',
                logic_notes_text: (f.logic_notes ?? []).join('\n'),
                edge_cases_text: (f.edge_cases ?? []).join('\n'),
                is_active: f.is_active,
            });
        }
        setErrors({});
    };

    const weightSum = form.factors.reduce((s, f) => s + (f.weight || 0), 0);

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Name is required.';
        if (!form.base_algorithm) e.base_algorithm = 'Base algorithm is required.';
        if (!form.short_description.trim()) e.short_description = 'Description is required.';
        if (form.expression_mode === 'builder' && form.factors.length === 0) {
            e.factors = 'Add at least one factor.';
        }
        if (form.expression_mode === 'builder') {
            form.factors.forEach((f, i) => {
                if (!f.field) e[`factor_field_${i}`] = 'Select a field.';
                if (f.weight <= 0) e[`factor_weight_${i}`] = 'Weight must be > 0.';
            });
        }
        if (form.expression_mode === 'advanced' && !form.formula_expression.trim()) {
            e.formula_expression = 'Expression is required in advanced mode.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const payload = {
            name: form.name,
            use_case: form.use_case,
            short_description: form.short_description,
            base_algorithm: form.base_algorithm,
            expression_mode: form.expression_mode,
            factors: form.expression_mode === 'builder' ? form.factors : null,
            formula_expression: form.formula_expression,
            logic_notes: form.logic_notes_text.split('\n').map(s => s.trim()).filter(Boolean),
            edge_cases: form.edge_cases_text.split('\n').map(s => s.trim()).filter(Boolean),
            is_active: form.is_active,
        };

        if (isEdit && formula) {
            router.put(`/super-admin/formula-types/${formula.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { onClose(); },
            });
        } else {
            router.post('/super-admin/formula-types', payload, {
                preserveScroll: true,
                onSuccess: () => { onClose(); reset(null); },
            });
        }
    };

    const addFactor = () => setForm(prev => ({
        ...prev,
        factors: [...prev.factors, { field: allowedFields[0] ?? 'eligibility_score', weight: 0.1, label: '' }],
    }));

    const updateFactor = (i: number, f: FormulaFactor) =>
        setForm(prev => { const next = [...prev.factors]; next[i] = f; return { ...prev, factors: next }; });

    const removeFactor = (i: number) =>
        setForm(prev => ({ ...prev, factors: prev.factors.filter((_, idx) => idx !== i) }));

    const insertVariable = (v: string) => {
        const el = expressionRef.current;
        if (!el) return;
        const start = el.selectionStart ?? form.formula_expression.length;
        const end   = el.selectionEnd   ?? start;
        const next  = form.formula_expression.slice(0, start) + v + form.formula_expression.slice(end);
        setForm(prev => ({ ...prev, formula_expression: next }));
        setTimeout(() => { el.focus(); el.setSelectionRange(start + v.length, start + v.length); }, 0);
    };

    return (
        <Dialog open={open} onOpenChange={o => { if (!o) { onClose(); reset(formula); } }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-slate-600" />
                        {isEdit ? 'Edit Custom Formula' : 'New Custom Formula'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update this custom formula definition. The type identifier cannot be changed.'
                            : 'Define a new allocation formula using the factor builder or an expression.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-2">
                    {/* === Identity === */}
                    <div className="rounded-lg border p-4 grid gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Identity</p>

                        <div className="grid gap-1.5">
                            <Label htmlFor="ft-name">Formula Name <span className="text-red-500">*</span></Label>
                            <Input id="ft-name" placeholder="e.g. Damage-Weighted Priority" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="ft-usecase">Use Case <span className="text-xs text-muted-foreground">(one-liner)</span></Label>
                            <Input id="ft-usecase" placeholder="e.g. For programs with damage-weighted priority" value={form.use_case}
                                onChange={e => setForm({ ...form, use_case: e.target.value })} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="ft-desc">Description <span className="text-red-500">*</span></Label>
                            <Textarea id="ft-desc" rows={2} value={form.short_description}
                                onChange={e => setForm({ ...form, short_description: e.target.value })}
                                placeholder="What this formula does and when to use it..." />
                            {errors.short_description && <p className="text-xs text-red-500">{errors.short_description}</p>}
                        </div>

                        <div className="grid gap-1.5">
                            <Label>Base Algorithm <span className="text-red-500">*</span></Label>
                            <Select value={form.base_algorithm} onValueChange={v => setForm({ ...form, base_algorithm: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ALGORITHM_LABELS).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Determines how computed scores are converted to allocation quantities.
                            </p>
                            {errors.base_algorithm && <p className="text-xs text-red-500">{errors.base_algorithm}</p>}
                        </div>
                    </div>

                    {/* === Formula Definition === */}
                    <div className="rounded-lg border p-4 grid gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Formula Definition</p>
                            <div className="flex rounded-md border overflow-hidden text-xs">
                                <button
                                    className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${form.expression_mode === 'builder' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                                    onClick={() => setForm({ ...form, expression_mode: 'builder' })}
                                >
                                    <Wand2 className="h-3 w-3" /> Builder
                                </button>
                                <button
                                    className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors border-l ${form.expression_mode === 'advanced' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                                    onClick={() => setForm({ ...form, expression_mode: 'advanced' })}
                                >
                                    <Code2 className="h-3 w-3" /> Advanced
                                </button>
                            </div>
                        </div>

                        {form.expression_mode === 'builder' ? (
                            <div className="grid gap-2">
                                {/* Factor table */}
                                <div className="rounded-lg border overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-muted/60 border-b">
                                                <th className="text-left px-2 py-2 font-semibold text-muted-foreground w-36">Field</th>
                                                <th className="text-left px-2 py-2 font-semibold text-muted-foreground">Display Label</th>
                                                <th className="text-right px-2 py-2 font-semibold text-muted-foreground w-20">Weight</th>
                                                <th className="w-8" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {form.factors.map((f, i) => (
                                                <FactorRow key={i} factor={f} index={i} allowedFields={allowedFields}
                                                    onChange={updateFactor} onRemove={removeFactor} />
                                            ))}
                                            {form.factors.length === 0 && (
                                                <tr><td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">No factors added yet.</td></tr>
                                            )}
                                        </tbody>
                                        {form.factors.length > 0 && (
                                            <tfoot>
                                                <tr className="bg-muted/30 border-t">
                                                    <td colSpan={2} className="px-2 py-2 text-xs text-muted-foreground font-semibold">∑ weights</td>
                                                    <td className={`px-2 py-2 text-right text-xs font-bold ${Math.abs(weightSum - 1) < 0.01 ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {weightSum.toFixed(2)}
                                                    </td>
                                                    <td />
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                                <Button variant="outline" size="sm" className="w-fit" onClick={addFactor}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Factor
                                </Button>
                                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                    Weights do not need to sum to 1 — the engine normalises them automatically.
                                </p>
                                {errors.factors && <p className="text-xs text-red-500">{errors.factors}</p>}
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {/* Variable chips */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Click a variable to insert at cursor:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {allowedFields.map(v => (
                                            <button key={v} onClick={() => insertVariable(v)}
                                                className="rounded bg-muted px-2 py-1 text-xs font-mono hover:bg-primary hover:text-primary-foreground transition-colors">
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">Operators: <code className="bg-muted px-1 rounded">+ - * / ( )</code></p>
                                </div>
                                <Textarea
                                    ref={expressionRef}
                                    rows={4} className="font-mono text-sm"
                                    placeholder="e.g. (eligibility_score * 0.5) + (damage_score * 0.3) + (farm_size * 0.2)"
                                    value={form.formula_expression}
                                    onChange={e => setForm({ ...form, formula_expression: e.target.value })}
                                />
                                {errors.formula_expression && <p className="text-xs text-red-500">{errors.formula_expression}</p>}
                                <p className="text-xs text-amber-700 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded p-2">
                                    <TriangleAlert className="h-3 w-3 mt-0.5 shrink-0" />
                                    Only whitelisted variables and arithmetic operators are permitted. The expression is validated server-side before saving.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* === Optional Notes === */}
                    <div className="grid gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="ft-logic">Logic Notes <span className="text-xs text-muted-foreground">(one per line)</span></Label>
                            <Textarea id="ft-logic" rows={3} value={form.logic_notes_text}
                                onChange={e => setForm({ ...form, logic_notes_text: e.target.value })}
                                placeholder="Higher score → more allocation&#10;Fallback to equal when ∑scores = 0" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="ft-edge">Edge Cases <span className="text-xs text-muted-foreground">(one per line)</span></Label>
                            <Textarea id="ft-edge" rows={2} value={form.edge_cases_text}
                                onChange={e => setForm({ ...form, edge_cases_text: e.target.value })}
                                placeholder="If ∑scores = 0 → fallback to Equal Distribution" />
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                            <Checkbox id="ft-active" checked={form.is_active}
                                onCheckedChange={(c: boolean) => setForm({ ...form, is_active: c })} />
                            <Label htmlFor="ft-active" className="cursor-pointer">
                                Active
                                <span className="ml-1 text-xs text-muted-foreground">— inactive formulas are hidden from allocation policy selection</span>
                            </Label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => { onClose(); reset(formula); }}>Cancel</Button>
                    <Button onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Create Formula'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Edit Default Formula Modal (simpler — only docs fields)
// ---------------------------------------------------------------------------
type DefaultEditForm = {
    short_description: string;
    formula_expression: string;
    logic_notes_text: string;
    edge_cases_text: string;
    use_case: string;
    is_active: boolean;
};

function DefaultEditModal({ open, formula, onClose }: { open: boolean; formula: FormulaType | null; onClose: () => void }) {
    const [form, setForm] = useState<DefaultEditForm>({
        short_description: '', formula_expression: '', logic_notes_text: '', edge_cases_text: '', use_case: '', is_active: true,
    });

    const reset = (f: FormulaType | null) => {
        if (!f) return;
        setForm({
            short_description:  f.short_description,
            formula_expression: f.formula_expression,
            logic_notes_text:   (f.logic_notes ?? []).join('\n'),
            edge_cases_text:    (f.edge_cases  ?? []).join('\n'),
            use_case:           f.use_case ?? '',
            is_active:          f.is_active,
        });
    };

    // sync form when formula changes
    if (open && formula && form.short_description !== formula.short_description && form.formula_expression !== formula.formula_expression) {
        reset(formula);
    }

    const handleSave = () => {
        if (!formula) return;
        const payload = {
            short_description:  form.short_description,
            formula_expression: form.formula_expression,
            logic_notes:        form.logic_notes_text.split('\n').map(s => s.trim()).filter(Boolean),
            edge_cases:         form.edge_cases_text.split('\n').map(s => s.trim()).filter(Boolean),
            use_case:           form.use_case,
            is_active:          form.is_active,
        };
        router.put(`/super-admin/formula-types/${formula.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" /> Edit Default Formula
                    </DialogTitle>
                    <DialogDescription>
                        Update the documentation for this built-in formula. The type identifier and distribution logic are immutable.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-1.5">
                        <Label>Use Case</Label>
                        <Input value={form.use_case} onChange={e => setForm({ ...form, use_case: e.target.value })} placeholder="One-liner use case" />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Description</Label>
                        <Textarea rows={3} value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Formula Expression</Label>
                        <Textarea rows={4} className="font-mono text-sm" value={form.formula_expression} onChange={e => setForm({ ...form, formula_expression: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Logic Notes <span className="text-xs text-muted-foreground">(one per line)</span></Label>
                        <Textarea rows={4} value={form.logic_notes_text} onChange={e => setForm({ ...form, logic_notes_text: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Edge Cases <span className="text-xs text-muted-foreground">(one per line)</span></Label>
                        <Textarea rows={3} value={form.edge_cases_text} onChange={e => setForm({ ...form, edge_cases_text: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Checkbox id="def-active" checked={form.is_active} onCheckedChange={(c: boolean) => setForm({ ...form, is_active: c })} />
                        <Label htmlFor="def-active" className="cursor-pointer">Active</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function FormulaTypes() {
    const { formulaTypes, allowedFactorFields } = usePage<{ formulaTypes: FormulaType[]; allowedFactorFields: string[] }>().props;

    const [builderOpen, setBuilderOpen] = useState(false);
    const [editCustomTarget, setEditCustomTarget] = useState<FormulaType | null>(null);
    const [editDefaultTarget, setEditDefaultTarget] = useState<FormulaType | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FormulaType | null>(null);

    const handleEdit = (f: FormulaType) => {
        if (f.is_default) { setEditDefaultTarget(f); }
        else { setEditCustomTarget(f); setBuilderOpen(true); }
    };

    const handleDelete = (f: FormulaType) => setDeleteTarget(f);

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/super-admin/formula-types/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const defaults = formulaTypes.filter(f => f.is_default);
    const customs  = formulaTypes.filter(f => !f.is_default);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Formula Types" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Page Header */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6 flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 rounded-lg bg-muted">
                                    <FlaskConical className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h1 className="text-3xl font-bold">Formula Types</h1>
                            </div>
                            <p className="text-muted-foreground text-sm ml-14">
                                Reference definitions and custom formulas for the DSS allocation engine.
                                Default formulas are locked and cannot be deleted.
                            </p>
                        </div>
                        <Button onClick={() => { setEditCustomTarget(null); setBuilderOpen(true); }} className="shrink-0">
                            <Plus className="h-4 w-4 mr-1.5" /> New Custom Formula
                        </Button>
                    </div>
                </div>

                {/* Default Formulas */}
                {defaults.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5" /> Default Formulas
                        </h2>
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {defaults.map(f => <FormulaCard key={f.id} formula={f} onEdit={handleEdit} onDelete={handleDelete} />)}
                        </div>
                    </div>
                )}

                {/* Custom Formulas */}
                <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                        <FlaskConical className="h-3.5 w-3.5" /> Custom Formulas
                    </h2>
                    {customs.length === 0 ? (
                        <div className="rounded-xl border border-dashed bg-card p-12 text-center">
                            <FlaskConical className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-muted-foreground font-medium">No custom formulas yet</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">Create one using the builder above to define your own weighted scoring formula.</p>
                            <Button variant="outline" className="mt-4" onClick={() => { setEditCustomTarget(null); setBuilderOpen(true); }}>
                                <Plus className="h-4 w-4 mr-1" /> Create Custom Formula
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {customs.map(f => <FormulaCard key={f.id} formula={f} onEdit={handleEdit} onDelete={handleDelete} />)}
                        </div>
                    )}
                </div>
            </div>

            {/* Custom formula builder modal (create & edit) */}
            <FormulaBuilderModal
                open={builderOpen}
                formula={editCustomTarget}
                allowedFields={allowedFactorFields}
                onClose={() => { setBuilderOpen(false); setEditCustomTarget(null); }}
            />

            {/* Default formula docs-edit modal */}
            <DefaultEditModal
                open={editDefaultTarget !== null}
                formula={editDefaultTarget}
                onClose={() => setEditDefaultTarget(null)}
            />

            {/* Delete confirmation */}
            <Dialog open={deleteTarget !== null} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Custom Formula</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
                            This cannot be undone. Allocation policies that reference this formula will have their formula link cleared.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
