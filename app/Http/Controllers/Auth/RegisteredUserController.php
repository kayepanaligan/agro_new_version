<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => 'required|in:male,female,other',
            'dob' => 'required|date|before:today',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'contact_number' => 'required|string|max:20|unique:'.User::class,
            'street' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'municipality' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
            'id_document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Handle ID document upload
        $idDocumentPath = null;
        if ($request->hasFile('id_document')) {
            $file = $request->file('id_document');
            $idDocumentPath = $file->store('id-documents', 'public');
        }

        $user = User::create([
            'role_id' => 3, // Default to technician role
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name' => $validated['last_name'],
            'gender' => $validated['gender'],
            'dob' => $validated['dob'],
            'email' => $validated['email'],
            'contact_number' => $validated['contact_number'],
            'street' => $validated['street'],
            'barangay' => $validated['barangay'],
            'municipality' => $validated['municipality'],
            'province' => $validated['province'],
            'postal_code' => $validated['postal_code'],
            'id_document_path' => $idDocumentPath,
            'password' => Hash::make($validated['password']),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}
