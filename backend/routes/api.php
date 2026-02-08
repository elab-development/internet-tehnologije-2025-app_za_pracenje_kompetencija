<?php

use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompetencyController;
use App\Models\User;
use App\Models\Competency;
use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\SystemLogController;
use App\Http\Controllers\CompetencyTypeController;



Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/users', function () {
    return User::all();
}); // ruta za listu svih korisnika

Route::patch('/users/{id}/role', function (Request $request, $id) {
    $user = User::findOrFail($id);

    $user->role = $request->role; // npr. 'moderator' ili 'user'
    $user->save();
    return response()->json(['message' => 'Rola uspešno promenjena', 'user' => $user]); //  <- izbacuje onu poruku gore :)
}); // ruta za promenu rola korisnika
Route::middleware('auth:sanctum')->put('/users/{id}', [UserController::class, 'update']);// update profila
Route::get('/competency-options', [CompetencyController::class, 'getOptions']);
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('competencies', CompetencyController::class);
}); //jer metode u CompetencuController koriste auth()->user() tjtst mora da postoji ulogovani korisnik da bi se ruta koristila


Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('verifications', VerificationController::class);
});

Route::delete('/users/{id}', [UserController::class, 'destroy']); // ruta za brisanje naloga

Route::delete('/competencies/{id}', [CompetencyController::class, 'destroy']);


Route::get('/public-profile/{token}', [UserController::class, 'publicProfileByToken']);
Route::middleware('auth:sanctum')->post('/generate-share-link/{id}', [UserController::class, 'generateShareLink']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/moderator/pending-verifications', [VerificationController::class, 'index']);
    Route::post('/moderator/verify/{id}', [VerificationController::class, 'verify']);
    Route::post('/moderator/reject/{id}', [VerificationController::class, 'reject']);
    Route::get('/moderator/verification-history', [VerificationController::class, 'history']);
});

//dodato za update

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/competencies', [CompetencyController::class, 'index']);
    Route::put('/competencies/{id}', [CompetencyController::class, 'update']);
    Route::delete('/competencies/{id}', [CompetencyController::class, 'destroy']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('institutions', InstitutionController::class);
    Route::get('/all-competencies', [CompetencyController::class, 'allCompetencies']);
});



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/system-logs', [SystemLogController::class, 'systemLogs']);
    Route::post('/system-logs', [SystemLogController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/competency-types', [CompetencyTypeController::class, 'index']);
    Route::post('/competency-types', [CompetencyTypeController::class, 'store']);
    Route::put('/competency-types/{id}', [CompetencyTypeController::class, 'update']);
    Route::delete('/competency-types/{id}', [CompetencyTypeController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->get('/admin/users/{id}/profile', [UserController::class, 'adminUserProfile']);
Route::middleware('auth:sanctum')->put('/admin/users/{id}', [UserController::class, 'adminUpdateUser']);