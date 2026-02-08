<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
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
                'name'=> $user->name,
                'surname'=> $user->surname,
                'email' => $user->email,
                'role' => $user->role,
                'description' => $user->description
            ]
        ]);
    }



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





