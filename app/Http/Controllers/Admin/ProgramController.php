<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    /**
     * Display programs page.
     */
    public function index(): Response
    {
        $programs = Program::orderBy('program_name', 'asc')->get();

        return Inertia::render('admin/programs', [
            'programs' => $programs,
        ]);
    }

    /**
     * Store a new program.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'program_name' => 'required|string|max:255|unique:programs,program_name',
            'program_description' => 'nullable|string',
        ], [
            'program_name.unique' => 'A program with this name already exists.',
        ]);

        Program::create($validated);

        return back()->with('success', 'Program created successfully.');
    }

    /**
     * Update an existing program.
     */
    public function update(Request $request, Program $program): RedirectResponse
    {
        $validated = $request->validate([
            'program_name' => 'required|string|max:255|unique:programs,program_name,' . $program->id,
            'program_description' => 'nullable|string',
        ], [
            'program_name.unique' => 'A program with this name already exists.',
        ]);

        $program->update($validated);

        return back()->with('success', 'Program updated successfully.');
    }

    /**
     * Delete a program.
     */
    public function destroy(Program $program): RedirectResponse
    {
        $program->delete();

        return back()->with('success', 'Program deleted successfully.');
    }
}
