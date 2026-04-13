<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AllocationPolicy;
use App\Models\FormulaType;
use App\Services\SafeExpressionParser;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FormulaTypeController extends Controller
{
    public function __construct(
        private readonly SafeExpressionParser $parser = new SafeExpressionParser()
    ) {}

    /**
     * Display the formula types reference page.
     */
    public function index(): Response
    {
        // Defaults first (in defined order), then custom alphabetically
        $formulaTypes = FormulaType::orderByRaw('is_default DESC')
            ->orderByRaw("FIELD(type, 'equal', 'proportional', 'priority', 'weighted')")
            ->orderBy('name')
            ->get();

        return Inertia::render('super_admin/formula-types', [
            'formulaTypes'       => $formulaTypes,
            'allowedFactorFields' => SafeExpressionParser::ALLOWED_VARS,
        ]);
    }

    /**
     * Create a new custom formula type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:150',
            'base_algorithm'     => 'required|in:equal,proportional,priority,weighted',
            'short_description'  => 'required|string|max:1000',
            'use_case'           => 'nullable|string|max:255',
            'expression_mode'    => 'required|in:builder,advanced',
            'factors'            => 'required_if:expression_mode,builder|nullable|array|min:1',
            'factors.*.field'    => 'required_if:expression_mode,builder|string|in:' . implode(',', SafeExpressionParser::ALLOWED_VARS),
            'factors.*.weight'   => 'required_if:expression_mode,builder|numeric|min:0',
            'factors.*.label'    => 'nullable|string|max:100',
            'formula_expression' => 'required_if:expression_mode,advanced|nullable|string|max:2000',
            'logic_notes'        => 'nullable|array',
            'logic_notes.*'      => 'string|max:500',
            'edge_cases'         => 'nullable|array',
            'edge_cases.*'       => 'string|max:500',
            'is_active'          => 'boolean',
        ]);

        // Validate expression safety if advanced mode
        if (($validated['expression_mode'] ?? 'builder') === 'advanced' && !empty($validated['formula_expression'])) {
            $check = $this->parser->validate($validated['formula_expression']);
            if (!$check['valid']) {
                return back()->withErrors(['formula_expression' => implode(' ', $check['errors'])])
                             ->withInput();
            }
        }

        // Generate a unique slug from the name
        $slug = Str::slug($validated['name'], '_');
        $base = $slug;
        $i    = 2;
        while (FormulaType::where('type', $slug)->exists()) {
            $slug = $base . '_' . $i++;
        }

        FormulaType::create([
            'type'               => $slug,
            'name'               => $validated['name'],
            'is_default'         => false,
            'base_algorithm'     => $validated['base_algorithm'],
            'expression_mode'    => $validated['expression_mode'],
            'factors'            => $validated['factors'] ?? null,
            'formula_expression' => $validated['formula_expression'] ?? '',
            'short_description'  => $validated['short_description'],
            'use_case'           => $validated['use_case'] ?? null,
            'logic_notes'        => $validated['logic_notes'] ?? null,
            'edge_cases'         => $validated['edge_cases'] ?? null,
            'is_active'          => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Custom formula created successfully.');
    }

    /**
     * Update an existing formula type.
     * Type identifier and is_default flag are always immutable.
     */
    public function update(Request $request, FormulaType $formulaType)
    {
        $validated = $request->validate([
            'name'               => 'sometimes|string|max:150',
            'short_description'  => 'required|string|max:1000',
            'formula_expression' => 'required|string|max:2000',
            'base_algorithm'     => 'sometimes|nullable|in:equal,proportional,priority,weighted',
            'expression_mode'    => 'sometimes|in:builder,advanced',
            'factors'            => 'nullable|array',
            'factors.*.field'    => 'string|in:' . implode(',', SafeExpressionParser::ALLOWED_VARS),
            'factors.*.weight'   => 'numeric|min:0',
            'factors.*.label'    => 'nullable|string|max:100',
            'logic_notes'        => 'nullable|array',
            'logic_notes.*'      => 'string|max:500',
            'example'            => 'nullable|array',
            'use_case'           => 'nullable|string|max:255',
            'edge_cases'         => 'nullable|array',
            'edge_cases.*'       => 'string|max:500',
            'is_active'          => 'boolean',
        ]);

        // Validate expression safety if switching to advanced
        $mode = $validated['expression_mode'] ?? $formulaType->expression_mode;
        if ($mode === 'advanced' && !empty($validated['formula_expression'])) {
            $check = $this->parser->validate($validated['formula_expression']);
            if (!$check['valid']) {
                return back()->withErrors(['formula_expression' => implode(' ', $check['errors'])])
                             ->withInput();
            }
        }

        // Protect immutable fields
        unset($validated['type'], $validated['is_default']);

        $formulaType->update($validated);

        return redirect()->back()->with('success', 'Formula type updated successfully.');
    }

    /**
     * Delete a custom formula type.
     * Default formula types cannot be deleted.
     */
    public function destroy(FormulaType $formulaType)
    {
        if ($formulaType->is_default) {
            abort(403, 'Default formula types cannot be deleted.');
        }

        // Prevent deletion if referenced by active policies
        $usedCount = AllocationPolicy::where('formula_type_id', $formulaType->id)
            ->where('is_active', true)
            ->count();

        if ($usedCount > 0) {
            return back()->withErrors([
                'delete' => "Cannot delete: this formula is used by {$usedCount} active allocation "
                    . ($usedCount === 1 ? 'policy' : 'policies') . '.',
            ]);
        }

        $formulaType->delete();

        return redirect()->back()->with('success', 'Custom formula deleted.');
    }
}
