<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Models\User;
use Illuminate\Http\Request;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register',[AuthController::class,'register']);
Route::get('/users', function () {
    return User::all(); 
}); // ruta za listu svih korisnika

Route::patch('/users/{id}/role', function (Request $request, $id) {
    $user = User::findOrFail($id);
    // Ako je korisnik admin, ne dozvoljavamo promenu role
    
    $user->role = $request->role; // npr. 'moderator' ili 'user'
    $user->save();
    return response()->json(['message' => 'Rola uspešno promenjena', 'user' => $user]); //  <- izbacuje onu poruku gore :)
}); // ruta za promenu rola korisnika

