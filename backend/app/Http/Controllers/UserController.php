<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{

    public function update(Request $request, $id)
    {

        // 1. Validacija - 'sometimes' dozvoljava da polja ne budu u zahtevu, 
        // a 'nullable' dozvoljava da budu prazna.

        $request->validate([
            'name' => 'sometimes|nullable|string|max:255',
            'surname' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|nullable|email|unique:users,email,' . $id,
            'password' => 'sometimes|nullable|min:6',
        ]);

        $user = User::findOrFail($id);

        // 2. Ažuriranje - koristimo tvoju logiku sa filled()
        if ($request->filled('name')) {
            $user->name = $request->name;
        }

        if ($request->filled('surname')) {
            $user->surname = $request->surname;
        }

        if ($request->filled('email')) {
            $user->email = $request->email;
        }

        if ($request->filled('description')) {
            $user->description = $request->description;
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile successfully updated! ✅',
            'user' => $user
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete(); // Trajno brisanje iz baze 🚫

        return response()->json([
            'message' => 'Account permanently deleted. ❌'
        ], 200);
    }

    // public function publicProfileByToken($token)
    // {
    //     $user=User::where('share_token',$token)->firstOrFail();

    //     return response()->json([
    //         'name' => $user->name,
    //         'surname' => $user->surname,
    //         'competencies' => $user->competencies()
    //             ->with(['institution', 'type', 'source', 'verifications.status'])
    //             ->get()
    //     ], 200);
    // }

    public function publicProfileByToken($token)
    {
        $user = User::where('share_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $competencies = $user->competencies()
            ->with([
                'institution',
                'type',
                'source',
                'verifications' => function ($q) {
                    $q->orderByDesc('id'); // da prva bude "latest"
                }
            ])
            ->get()
            ->filter(function ($comp) {
                $latest = $comp->verifications->first();
                return $latest && (int)$latest->status_verification_id === 2; // Approved only
            })
            ->values();


        return response()->json([
            'name' => $user->name,
            'surname' => $user->surname,
            'email' => $user->email,
            'description' => $user->description,
            'competencies' => $competencies
        ], 200);
    }


    public function generateShareLink($id)
    {
        $user = User::findOrFail($id);

        $token = Str::uuid()->toString(); // generiše jedinstveni token

        $user->share_token = $token;
        $user->save();

        // vrati link korisniku
        $link = url("/public-profile/$token");

        return response()->json([
            'message' => 'Link successfully generated ✅',
            'link' => $link
        ]);
    }

    public function adminUserProfile($id)
    {
        $auth = auth()->user();

        // prilagodi: kod tebe su role 'admin', 'moderator', 'user'
        if (!$auth || !in_array($auth->role, ['admin', 'moderator'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::with([
            'competencies.institution',
            'competencies.type',
            'competencies.source',
            'competencies.verifications',
        ])->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'surname' => $user->surname,
            'email' => $user->email,
            'description' => $user->description,
            'competencies' => $user->competencies,
        ]);
    }

    public function adminUpdateUser(Request $request, $id)
{
    $auth = auth()->user();

    // Samo admin/moderator sme
    if (!$auth || !in_array($auth->role, ['admin', 'moderator'])) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $user = User::findOrFail($id);

    $request->validate([
        'name' => 'sometimes|nullable|string|max:255',
        'surname' => 'sometimes|nullable|string|max:255',
        'email' => 'sometimes|nullable|email|unique:users,email,' . $user->id,
        'description' => 'sometimes|nullable|string',
        'password' => 'sometimes|nullable|min:6',
        'role' => 'sometimes|in:user,moderator,admin' // opcionalno, ako želiš da admin menja rolu ovde
    ]);

    if ($request->has('name')) $user->name = $request->name;
    if ($request->has('surname')) $user->surname = $request->surname;
    if ($request->has('email')) $user->email = $request->email;
    if ($request->has('description')) $user->description = $request->description;
    if ($request->filled('password')) $user->password = Hash::make($request->password);
    if ($request->has('role')) $user->role = $request->role;

    $user->save();

    return response()->json([
        'message' => 'User updated successfully',
        'user' => $user
    ]);
}


}
