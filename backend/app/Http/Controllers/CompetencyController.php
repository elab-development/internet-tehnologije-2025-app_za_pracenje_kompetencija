<?php
namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

use Illuminate\Http\Request;
use App\Models\Competency;
use App\Models\Institution;
use App\Models\CompetencyType;
use App\Models\CompetencySource;



class CompetencyController extends Controller
{

    #[OA\Get(
        path: '/api/competencies',
        summary: 'Lista kompetencija',
        tags: ['Competencies'],
        security: [['bearerAuth' => []]], // OBAVEZNO dodaj ovo da bi se pojavio katanac
        responses: [
            new OA\Response(response: 200, description: 'OK'),
            new OA\Response(response: 401, description: 'Niste ulogovani')
        ]
    )]
    public function index()
    {
        $user = auth()->user();

        // Ako korisnik nije pronađen (token nevalja), vrati 401 umesto 500
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return $user->competencies()->with(['institution', 'type', 'source', 'verifications'])->get();
    }

    #[OA\Delete(
        path: '/api/competencies/{id}',
        summary: 'Brisanje kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Competencies'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Uspešno obrisano'),
            new OA\Response(response: 404, description: 'Nije pronađeno')
        ]
    )]
    public function destroy($id)
    {
        $competency = Competency::find($id);

        if (!$competency) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $competency->verifications()->delete();
        $competency->delete();

        return response()->noContent(); // 204
    }



    #[OA\Post(
        path: '/api/competencies',
        summary: 'Kreiranje nove kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Competencies'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'PHP Laravel'),
                    new OA\Property(property: 'level', type: 'integer', example: 4),
                    new OA\Property(property: 'institution_id', type: 'integer', example: 1),
                    new OA\Property(property: 'type_id', type: 'integer', example: 1),
                    new OA\Property(property: 'source_id', type: 'integer', example: 1),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Kompetencija uspešno kreirana'),
            new OA\Response(response: 422, description: 'Validaciona greška')
        ]
    )]
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'level' => 'required|integer|min:1|max:5',
            'acquired_at' => 'nullable|date',
            'evidence' => 'nullable|string',
            'institution_id' => 'required|exists:institutions,id',
            'type_id' => 'required|exists:competency_types,id',
            'source_id' => 'required|exists:competency_sources,id',
        ]);

        try {
            $user = auth()->user();

            // Kreiraj kompetenciju
            $competency = $user->competencies()->create($data);

            // Ako je tip Informal (id=2), auto-approved
            $isInformal = ((int) $data['source_id'] === 2);

            // 1 = Pending, 2 = Approved
            $statusId = $isInformal ? 2 : 1;

            // 3) Kreiraj verifikaciju sa odgovarajućim statusom
            $competency->verifications()->create([
                'user_id' => $user->id,
                'status_verification_id' => $statusId,
                'request' => $isInformal
                    ? 'Auto-approved (informal competency).'
                    : 'Request for: ' . $competency->name,
                'moderator_id' => null,
                'verified_at' => $isInformal ? now()->toDateString() : null, // kolona je DATE
                'note' => $isInformal
                    ? 'Automatically approved because competency type is Informal.'
                    : null,
            ]);

            return response()->json($competency->load('verifications'), 201);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }




    // Prikaz jedne kompetencije
    #[OA\Get(
        path: '/api/competencies/{id}',
        summary: 'Prikaz jedne kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Competencies'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalji kompetencije'),
            new OA\Response(response: 404, description: 'Nije pronađeno')
        ]
    )]
    public function show(Competency $competency)
    {
        $this->authorize('view', $competency); //koristi Laravel Policy da proveri da li trenutni korisnik sme da vidi kompetenicju
        return $competency->load(['institution', 'type', 'source', 'verifications']);
    }



    #[OA\Put(
        path: '/api/competencies/{id}',
        summary: 'Izmena postojeće kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Competencies'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Napredni PHP'),
                    new OA\Property(property: 'level', type: 'integer', example: 5)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Uspešno izmenjeno'),
            new OA\Response(response: 404, description: 'Nije pronađeno')
        ]
    )]
    public function update(Request $request, $id)
    {
        $user = auth()->user();

        // Nadji kompetenciju i proveri da je user-ova
        $competency = Competency::with(['institution', 'type', 'source', 'verifications'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$competency) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'level' => 'sometimes|required|integer|min:1|max:5',
            'acquired_at' => 'nullable|date',
            'evidence' => 'nullable|string',
            'institution_id' => 'sometimes|required|exists:institutions,id',
            'type_id' => 'sometimes|required|exists:competency_types,id',
            //'source_id' => 'sometimes|required|exists:competency_sources,id',
        ]);

        $competency->update($data);


        // Ako izmeni pending kompetenciju, može da resetuje verifikaciju na Pending
        // osim ako je Informal (source_id=2) -> Approved
        $latestVerification = $competency->verifications()->orderByDesc('id')->first();

        if ($latestVerification) {
            $sourceId = (int) ($data['source_id'] ?? $competency->source_id);
            $isInformal = ($sourceId === 2);

            $latestVerification->update([
                'status_verification_id' => $isInformal ? 2 : $latestVerification->status_verification_id,
                'verified_at' => $isInformal ? now()->toDateString() : $latestVerification->verified_at,
                'note' => $isInformal ? 'Automatically approved because competency source is Informal.' : $latestVerification->note,
            ]);
        }


        return response()->json(
            $competency->fresh()->load(['institution', 'type', 'source', 'verifications'])
        );
    }



    //frontend treba liste institucija, tipova i izvora za dropdown menije
    #[OA\Get(
        path: '/api/competencies/options',
        summary: 'Liste za dropdown (institucije, tipovi, izvori)',
        tags: ['Competencies'],
        responses: [
            new OA\Response(response: 200, description: 'JSON sa nizovima opcija')
        ]
    )]
    public function getOptions()
    {
        return response()->json([
            'institutions' => Institution::all(),
            'types' => CompetencyType::all(),
            'sources' => CompetencySource::all(),
        ]);
    }

    //za sve korisnike vraca komp
    #[OA\Get(
        path: '/api/admin/all-competencies',
        summary: 'Pregled svih kompetencija u sistemu (Admin)',
        security: [['bearerAuth' => []]],
        tags: ['Admin'],
        responses: [
            new OA\Response(response: 200, description: 'Lista svih kompetencija sa podacima o korisnicima')
        ]
    )]
    public function allCompetencies()
    {
        return Competency::with(['user', 'institution', 'type', 'source', 'verifications'])->get();
    }




}
