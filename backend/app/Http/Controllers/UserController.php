<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class UserController extends Controller
{

    #[OA\Put(
        path: '/api/users/{id}',
        summary: 'Ažuriranje sopstvenog profila',
        security: [['bearerAuth' => []]],
        tags: ['User Profile'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Pera'),
                    new OA\Property(property: 'surname', type: 'string', example: 'Peric'),
                    new OA\Property(property: 'email', type: 'string', example: 'pera.izmenjen@gmail.com'),
                    new OA\Property(property: 'description', type: 'string', example: 'Novi opis profila'),
                    new OA\Property(property: 'password', type: 'string', example: 'novaLozinka123')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Profil uspešno ažuriran'),
            new OA\Response(response: 403, description: 'Možete menjati samo svoj profil')
        ]
    )]
    public function update(Request $request, $id) //req-podaci frontenda, id tog usera
    {
        if (auth()->id() !== (int) $id) {
            return response()->json([
                'message' => 'You can update only your own profile.'
            ], 403);
        }
        $request->validate([
            'name' => 'sometimes|nullable|string|max:255',
            'surname' => 'sometimes|nullable|string|max:255',
            'email' => 'sometimes|nullable|email|unique:users,email,' . $id,
            'password' => 'sometimes|nullable|min:6',
        ]);

        $user = User::findOrFail($id);

        //Ažuriranje profila
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
        ], 200); //front moze da osvezi prikaz
    }

    #[OA\Delete(
        path: '/api/users/{id}',
        summary: 'Trajno brisanje korisničkog naloga',
        security: [['bearerAuth' => []]],
        tags: ['User Profile'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Nalog obrisan')
        ]
    )]
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete(); // Trajno brisanje iz baze

        return response()->json([
            'message' => 'Account permanently deleted. ❌'
        ], 200);
    }


    #[OA\Get(
        path: '/api/public-profile/{token}',
        summary: 'Pregled javnog profila (bez logovanja)',
        tags: ['Public'],
        parameters: [
            new OA\Parameter(
                name: 'token', 
                in: 'path', 
                required: true, 
                schema: new OA\Schema(type: 'string', example: '550e8400-e29b-41d4-a716-446655440000')
            )
        ],
        responses: [
            new OA\Response(response: 200, description: 'Uspešan prikaz javnih podataka'),
            new OA\Response(response: 404, description: 'Profil nije pronađen')
        ]
    )]
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
                    $q->orderByDesc('id'); //sortiranje od najnovije
                }
            ])
            ->get()
            ->filter(function ($comp) {
                $latest = $comp->verifications->first();
                return $latest && (int) $latest->status_verification_id === 2; // Approved samo za prikaz
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


    #[OA\Post(
        path: '/api/users/generate-share-link/{id}',
        summary: 'Generiši UUID link za deljenje profila',
        security: [['bearerAuth' => []]],
        tags: ['User Profile'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Link generisan')
        ]
    )]
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

    //admin i moderator mogu videti tudj profil sa svim kompetenicjama
    #[OA\Get(
        path: '/api/admin/users/{id}/profile',
        summary: 'Detaljan profil korisnika za Admina/Moderatora',
        security: [['bearerAuth' => []]],
        tags: ['Admin'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Svi podaci o korisniku uključujući sve kompetencije'),
            new OA\Response(response: 403, description: 'Unauthorized')
        ]
    )]
    public function adminUserProfile($id)
    {
        $auth = auth()->user();


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

    //admin i moderator  mogu menjati podatke usera
    #[OA\Put(
        path: '/api/admin/users/{id}',
        summary: 'Admin ažuriranje bilo kog korisnika',
        security: [['bearerAuth' => []]],
        tags: ['Admin'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'role', type: 'string', example: 'moderator')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Korisnik uspešno ažuriran od strane admina')
        ]
    )]
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
            'role' => 'sometimes|in:user,moderator,admin' //da admin menja rolu
        ]);

        if ($request->has('name'))
            $user->name = $request->name;
        if ($request->has('surname'))
            $user->surname = $request->surname;
        if ($request->has('email'))
            $user->email = $request->email;
        if ($request->has('description'))
            $user->description = $request->description;
        if ($request->filled('password'))
            $user->password = Hash::make($request->password);
        if ($request->has('role'))
            $user->role = $request->role;

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }


}
