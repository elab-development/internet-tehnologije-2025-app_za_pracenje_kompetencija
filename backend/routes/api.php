<?php

// use App\Http\Controllers\VerificationController;
// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\AuthController;
// use App\Http\Controllers\CompetencyController;
// use App\Models\User;
// use App\Models\Competency;
// use Illuminate\Http\Request;
// use App\Http\Controllers\UserController;
// use App\Http\Controllers\InstitutionController;
// use App\Http\Controllers\SystemLogController;
// use App\Http\Controllers\CompetencyTypeController;
// use App\Http\Controllers\AdminStatisticsController;


use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Models\User;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompetencyController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\SystemLogController;
use App\Http\Controllers\CompetencyTypeController;
use App\Http\Controllers\AdminStatisticsController;
/*
|--------------------------------------------------------------------------
| Public routes (no auth)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// public profile by share token (guest access)
Route::get('/public-profile/{token}', [UserController::class, 'publicProfileByToken']);

// options can be public (dropdowns) — ako želiš možeš i ovo da zaključaš
Route::get('/competency-options', [CompetencyController::class, 'getOptions']);

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Profile update (user updates self in controller logic)
    Route::put('/users/{id}', [UserController::class, 'update']);

    // Generate share link (requires login)
    Route::post('/generate-share-link/{id}', [UserController::class, 'generateShareLink']);

    // Competencies + Verifications (protected)
    Route::apiResource('competencies', CompetencyController::class);
    Route::apiResource('verifications', VerificationController::class);

    // Moderator routes (pretpostavka: controller proverava role)
    Route::get('/moderator/pending-verifications', [VerificationController::class, 'index']);
    Route::post('/moderator/verify/{id}', [VerificationController::class, 'verify']);
    Route::post('/moderator/reject/{id}', [VerificationController::class, 'reject']);
    Route::get('/moderator/verification-history', [VerificationController::class, 'history']);

    // Institutions + all competencies (protected)
    Route::apiResource('institutions', InstitutionController::class);
    Route::get('/all-competencies', [CompetencyController::class, 'allCompetencies']);

    // System logs (protected)
    Route::get('/system-logs', [SystemLogController::class, 'systemLogs']);
    Route::post('/system-logs', [SystemLogController::class, 'store']);

    // Competency types (protected)
    Route::get('/competency-types', [CompetencyTypeController::class, 'index']);
    Route::post('/competency-types', [CompetencyTypeController::class, 'store']);
    Route::put('/competency-types/{id}', [CompetencyTypeController::class, 'update']);
    Route::delete('/competency-types/{id}', [CompetencyTypeController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Admin-only routes (auth + role check)
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {

        // Admin: open user profile + update user
        Route::get('/users/{id}/profile', [UserController::class, 'adminUserProfile']);
        Route::put('/users/{id}', [UserController::class, 'adminUpdateUser']);
        Route::get('/verifications-overview', [VerificationController::class, 'systemOverview']);

        // Admin: list all users (CLOSED: only admin)
        Route::get('/users', function () {
            $user = Auth::user();
            if (!$user || $user->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return User::all();
        });

        // Admin: change role (CLOSED: only admin)
        Route::patch('/users/{id}/role', function (Request $request, $id) {
            $admin = Auth::user();
            if (!$admin || $admin->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $request->validate([
                'role' => 'required|in:admin,moderator,user,guest'
            ]);

            $u = User::findOrFail($id);
            $u->role = $request->role;
            $u->save();

            return response()->json([
                'message' => 'Role successfully changed',
                'user' => $u
            ]);
        });

        // Admin: delete user (CLOSED: only admin)
        Route::delete('/users/{id}', function ($id) {
            $admin = Auth::user();
            if (!$admin || $admin->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // opcionalno: zabrani brisanje admina
            $u = User::findOrFail($id);
            if ($u->role === 'admin') {
                return response()->json(['message' => 'Cannot delete admin user'], 403);
            }

            $u->delete();
            return response()->json(['message' => 'User deleted']);
        });

        // Admin: statistics (controller već proverava role === admin)
        Route::get('/statistics', [AdminStatisticsController::class, 'competencyStatus']);
        Route::get('/statistics/top-competency-types', [AdminStatisticsController::class, 'topCompetencyTypes']);
        Route::get('/statistics/competency-sources', [AdminStatisticsController::class, 'competencySources']);
    });
});

// Route::post('/login', [AuthController::class, 'login']);
// Route::post('/register', [AuthController::class, 'register']);
// Route::get('/users', function () {
//     return User::all();
// }); // ruta za listu svih korisnika

// Route::patch('/users/{id}/role', function (Request $request, $id) {
//     $user = User::findOrFail($id);

//     $user->role = $request->role; // npr. 'moderator' ili 'user'
//     $user->save();
//     return response()->json(['message' => 'Rola uspešno promenjena', 'user' => $user]); //  <- izbacuje onu poruku gore :)
// }); // ruta za promenu rola korisnika
// Route::middleware('auth:sanctum')->put('/users/{id}', [UserController::class, 'update']);// update profila
// Route::get('/competency-options', [CompetencyController::class, 'getOptions']);
// Route::middleware('auth:sanctum')->group(function () {
//     Route::apiResource('competencies', CompetencyController::class);
// }); //jer metode u CompetencuController koriste auth()->user() tjtst mora da postoji ulogovani korisnik da bi se ruta koristila


// Route::middleware('auth:sanctum')->group(function () {
//     Route::apiResource('verifications', VerificationController::class);
// });

// Route::delete('/users/{id}', [UserController::class, 'destroy']); // ruta za brisanje naloga

// Route::delete('/competencies/{id}', [CompetencyController::class, 'destroy']);


// Route::get('/public-profile/{token}', [UserController::class, 'publicProfileByToken']);
// Route::middleware('auth:sanctum')->post('/generate-share-link/{id}', [UserController::class, 'generateShareLink']);

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/moderator/pending-verifications', [VerificationController::class, 'index']);
//     Route::post('/moderator/verify/{id}', [VerificationController::class, 'verify']);
//     Route::post('/moderator/reject/{id}', [VerificationController::class, 'reject']);
//     Route::get('/moderator/verification-history', [VerificationController::class, 'history']);
// });

// //dodato za update

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/competencies', [CompetencyController::class, 'index']);
//     Route::put('/competencies/{id}', [CompetencyController::class, 'update']);
//     Route::delete('/competencies/{id}', [CompetencyController::class, 'destroy']);
// });


// Route::middleware('auth:sanctum')->group(function () {
//     Route::apiResource('institutions', InstitutionController::class);
//     Route::get('/all-competencies', [CompetencyController::class, 'allCompetencies']);
// });



// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/system-logs', [SystemLogController::class, 'systemLogs']);
//     Route::post('/system-logs', [SystemLogController::class, 'store']);
// });

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/competency-types', [CompetencyTypeController::class, 'index']);
//     Route::post('/competency-types', [CompetencyTypeController::class, 'store']);
//     Route::put('/competency-types/{id}', [CompetencyTypeController::class, 'update']);
//     Route::delete('/competency-types/{id}', [CompetencyTypeController::class, 'destroy']);
// });

// Route::middleware('auth:sanctum')->get('/admin/users/{id}/profile', [UserController::class, 'adminUserProfile']);
// Route::middleware('auth:sanctum')->put('/admin/users/{id}', [UserController::class, 'adminUpdateUser']);



// Route::middleware('auth:sanctum')->get(
//     '/admin/statistics',
//     [AdminStatisticsController::class, 'competencyStatus']
// );

// Route::middleware('auth:sanctum')->get(
//     '/admin/statistics/top-competency-types',
//     [AdminStatisticsController::class, 'topCompetencyTypes']
// );

// Route::middleware('auth:sanctum')->get(
//     '/admin/statistics/competency-sources',
//     [AdminStatisticsController::class, 'competencySources']
//);