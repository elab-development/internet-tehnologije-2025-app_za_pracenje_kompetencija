<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/api/login',
        summary: 'Prijava korisnika',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'admin@gmail.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Uspešna prijava'),
            new OA\Response(response: 401, description: 'Pogrešni podaci')
        ]
    )]
    public function login(Request $request)
    {
        //validacija
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        //pronadji korisnika
        $user = User::where('email', $request->email)->first();
        //ako ne postoji ili lozinka nije dobra
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }


        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([ // ono sto front dobija kao res.data
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'role' => $user->role,
                'description' => $user->description
            ]
        ]);
    }



    #[OA\Post(
        path: '/api/register',
        summary: 'Registracija novog korisnika',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Pera'),
                    new OA\Property(property: 'surname', type: 'string', example: 'Peric'),
                    new OA\Property(property: 'email', type: 'string', example: 'pera@gmail.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Uspešna registracija'),
            new OA\Response(response: 422, description: 'Greška u validaciji')
        ]
    )]
    public function register(Request $request)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        //kreiram korisnika
        $user = User::create([
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        //vracam podatke kao JSON
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'surname' => $user->surname,
            'email' => $user->email,
            'role' => $user->role
        ]);
    }
}





