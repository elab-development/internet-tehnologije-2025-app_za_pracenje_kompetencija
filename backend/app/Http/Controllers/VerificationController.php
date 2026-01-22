<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Verification;
use App\Models\Competency;
use Illuminate\Support\Facades\Auth;


class VerificationController extends Controller
{
    // Prikaz svih verifikacija za moderatora
    public function index()
    {
        $user = Auth::user();

        //Ako je moderator videce sve verif
        if ($user->role === 'moderator') {
            return Verification::with(['competency', 'competency.user', 'status', 'moderator'])->get();
        }
        // Standardni korisnik vidi samo svoje verifikacije
        return Verification::with(['competency', 'status', 'moderator'])
            ->where('competency', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

    }


    //kreiranje nove verifikacije by moderator
    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'moderator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $data = $request->validate([
            'competency_id' => 'required|exists:competencies,id',
            'status_verification_id' => 'required|exists:status_verifications,id',
            'request' => 'required|string',
            'note' => 'nullable|string',
            'verified_at' => 'required|date',
        ]);

        //moderator je ulogovan, id se uzima iz Auth
        $data['moderator_id'] = $user->id;

        $verification = Verification::create($data);

        return response()->json($verification, 201);
    }

    //prikaz jedne ver
    public function show(Verification $verification)
    {
        $user = Auth::user();
        if ($user->role === 'moderator' || $verification->competency->user_id === $user->id) {
            return $verification->load(['competency', 'moderator', 'status']);
        }
        return response()->json(['message'=>'Unauthorized',403]);
    }

    
    public function update(Request $request, $id)
    {


    }
}
