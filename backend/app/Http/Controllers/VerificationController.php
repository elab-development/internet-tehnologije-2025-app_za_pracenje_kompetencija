<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Verification;
use App\Models\Competency;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;


class VerificationController extends Controller
{
    #[OA\Get(
        path: '/api/moderator/pending-verifications',
        summary: 'Lista zahteva na čekanju (samo za moderatore)',
        security: [['bearerAuth' => []]],
        tags: ['Moderator'],
        responses: [
            new OA\Response(response: 200, description: 'Uspešno dobavljena lista'),
            new OA\Response(response: 403, description: 'Zabranjen pristup - niste moderator')
        ]
    )]
    public function index()
    {
        try {
            $user = auth()->user();
            if ($user->role === 'moderator') {
                // Učitavamo sve što je na čekanju (status 1)
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
                'message' => $e->getMessage() // ya tačnu grešku u konzoli
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
    #[OA\Get(
        path: '/api/moderator/verifications/{id}',
        summary: 'Prikaz jedne specifične verifikacije',
        security: [['bearerAuth' => []]],
        tags: ['Moderator'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalji verifikacije')
        ]
    )]
    public function show(Verification $verification)
    {
        $user = Auth::user();
        if ($user->role === 'moderator' || $verification->competency->user_id === $user->id) {
            return $verification->load(['competency', 'moderator', 'status']);
        }
        return response()->json(['message' => 'Unauthorized'], 403);
    }


    public function update(Request $request, $id)
    {


    }

    #[OA\Post(
        path: '/api/moderator/verify/{id}',
        summary: 'Odobravanje kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Moderator'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Kompetencija uspešno odobrena')
        ]
    )]
    public function verify($id)
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
            'user_id' => $verification->competency->user_id, // njen vlasnik je
            'verified_at' => now()->toDateString(),  // pošto je kolona DATE
            'note' => $request->note ?? 'Approved.', //ako ne posalje note automatski se pise
            'competency_id' => $verification->competency_id, //+++
        ]);

        \App\Models\SystemLog::create([
            'action' => 'Verify Competency',
            'entity' => 'Verification',
            'entity_id' => $verification->id,
            'performed_by' => $user->id,
            'performed_by_role' => $user->role,
            'description' => "Competency ID {$verification->competency_id} verified by moderator.",
        ]);

        // updated_at je automatski "poslednje vreme promene statusa"

        return response()->json([
            'message' => 'Competency successfully verified!',
            'verification' => $verification->fresh()
        ]);
    }

    #[OA\Post(
        path: '/api/moderator/reject/{id}',
        summary: 'Odbijanje kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Moderator'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'note', type: 'string', example: 'Nedovoljno dokaza.')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Kompetencija odbijena')
        ]
    )]
    public function reject(Request $request, $id)
    {
        $user = auth()->user();

        $request->validate([
            'note' => 'required|string|min:5' // Razlog je obavezan pri odbijanju
        ]);
        $verification = Verification::findOrFail($id);
        $verification->update([
            'status_verification_id' => 3, // 3 = Rejected
            'moderator_id' => auth()->id(),
            'user_id' => $verification->competency->user_id,//+++
            'verified_at' => now()->toDateString(),
            'note' => $request->note,
            'competency_id' => $verification->competency_id, //+++
        ]);

        \App\Models\SystemLog::create([
            'action' => 'Reject Competency',
            'entity' => 'Verification',
            'entity_id' => $verification->id,
            'performed_by' => auth()->id(),
            'performed_by_role' => $user->role,
            'description' => "Competency ID {$verification->competency_id} rejected by moderator.",
        ]);

        return response()->json(['message' => 'Competency rejected.']);
    }

    #[OA\Get(
        path: '/api/moderator/verification-history',
        summary: 'Istorija obrađenih zahteva moderatora',
        security: [['bearerAuth' => []]],
        tags: ['Moderator'],
        responses: [
            new OA\Response(response: 200, description: 'Lista odobrenih i odbijenih zahteva')
        ]
    )]
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
            ->whereIn('status_verification_id', [2, 3])  //aproved reject
            ->orderBy('verified_at', 'desc')
            ->get();
    }

    //pregled svih verifikacija u sistemu za admina
    #[OA\Get(
        path: '/api/admin/verifications-overview',
        summary: 'Pregled svih verifikacija (Admin)',
        security: [['bearerAuth' => []]],
        tags: ['Admin'],
        responses: [
            new OA\Response(response: 200, description: 'Kompletna lista svih statusa')
        ]
    )]
    public function systemOverview()
    {
        $user = auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admin only.'], 403);
        }
        $verifications = Verification::with(['user', 'competency', 'status'])->get();
        return response()->json($verifications);
    }




}
