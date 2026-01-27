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
        try {
            $user = auth()->user();
            if ($user->role === 'moderator') {
                // Učitavamo sve što je na čekanju (status 1)
                // BITNO: Proveri da li se tvoja relacija u modelu Competency zove 'user'
                return Verification::with(['competency', 'user', 'status'])
                    ->where('status_verification_id', 1)
                    ->get();
            }
            // Ako nije moderator, vidi samo svoje
            return Verification::with(['competency', 'status'])
                ->where('user_id', $user->id)
                ->get();
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage() // Ovo će nam reći tačnu grešku u konzoli
            ], 500);
        }
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
        return response()->json(['message' => 'Unauthorized', 403]);
    }


    public function update(Request $request, $id)
    {


    }

    //verifikovanje komp. od strane moderatora
    public function verify(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'moderator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $verification = Verification::findOrFail($id);

        // dozvoli samo ako je na čekanju
        if ($verification->status_verification_id != 1) {
            return response()->json(['message' => 'Only waiting verifications can be approved.'], 409);
        }

        $verification->update([
            'status_verification_id' => 2,           // Approved
            'moderator_id' => $user->id,
            'user_id' => $verification->competency->user_id, // +++
            'verified_at' => now()->toDateString(),  // pošto je kolona DATE
            'note' => $request->note ?? 'Approved.',
            'competency_id' => $verification->competency_id, //+++
        ]);

        // updated_at je automatski "poslednje vreme promene statusa"

        return response()->json([
            'message' => 'Competency successfully verified!',
            'verification' => $verification->fresh()
        ]);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string|min:5' // Razlog je obavezan pri odbijanju
        ]);
        $verification = Verification::findOrFail($id);
        $verification->update([
            'status_verification_id' => 3, // 3 = Rejected
            'moderator_id' => auth()->id(),
            'user_id' => $verification->competency->user_id,//+++
            'verified_at' => now(),
            'note' => $request->note,
            'competency_id' => $verification->competency_id, //+++
        ]);
        return response()->json(['message' => 'Competency rejected.']);
    }

    public function history()
    {
        $user = auth()->user();

        if ($user->role !== 'moderator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Verification::with([
            'competency.user',
            'moderator',
            'status'
        ])
            ->where('moderator_id', $user->id)         
            ->whereIn('status_verification_id', [2, 3])
            ->orderBy('verified_at', 'desc')
            ->get();
    }



}
