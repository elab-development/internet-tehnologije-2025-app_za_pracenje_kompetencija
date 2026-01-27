<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Competency;
use App\Models\Institution;
use App\Models\CompetencyType;
use App\Models\CompetencySource;

class CompetencyController extends Controller
{
    public function index()  //prikaz svih kompetencija trenutnog korisnika
    {
        return auth()->user()->competencies()->with(['institution', 'type', 'source', 'verifications'])->get(); // samo svoje kompetencije
    }
    //Brisanje kompetencije
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

    // Kreiranje nove kompetencije
//    public function store(Request $request)
// {
//     $data = $request->validate([
//         'name' => 'required|string',
//         'level' => 'required|integer|min:1|max:5',
//         'evidence' => 'nullable|string',
//         'institution_id' => 'required|exists:institutions,id',
//         'type_id' => 'required|exists:competency_types,id',
//         'source_id' => 'required|exists:competency_sources,id',
//     ]);

//     try {
//         $user = auth()->user();
//         $competency = $user->competencies()->create($data);
//         $competency->verifications()->create([
//             'user_id' => $user->id,
//             'status_verification_id' => 1, 
//             'request' => 'Request for: ' . $competency->name,
//             'moderator_id' => null, // Ovde stavljamo tvoj ID da baza ne baci grešku
//             'verified_at' => null, // Odmah stavljamo trenutno vreme
//         ]);

//         return response()->json($competency->load('verifications'), 201);
//     } catch (\Exception $e) {
//         return response()->json(['error' => $e->getMessage()], 500);
//     }
// }

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

        // 1) Kreiraj kompetenciju
        $competency = $user->competencies()->create($data);

        // 2) Ako je tip Informal (id=2), auto-approved
        $isInformal = ((int) $data['source_id'] === 2);

        // 1 = Waiting, 2 = Approved
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
    public function show(Competency $competency)
    {
        $this->authorize('view', $competency);
        return $competency->load(['institution', 'type', 'source', 'verifications']);
    }

    //Azuriranje komp
    // public function update(Request $request, Competency $competency)
    // {
    //     $this->authorize('update', $competency);

    //     $data = $request->validate([
    //         'name' => 'sometimes|string',
    //         'level' => 'sometimes|integer',
    //         'acquired_at' => 'nullable|date',
    //         'evidence' => 'nullable|string',
    //         'institution_id' => 'sometimes|exists:institutions,id',
    //         'type_id' => 'sometimes|exists:competency_types,id',
    //         'source_id' => 'sometimes|exists:competency_sources,id',
    //     ]);

    //     $competency->update($data);

    //     return response()->json($competency);
    // }

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

    // (Opcionalno, ali preporuka)
    // Ako izmeni pending kompetenciju, možeš da resetuješ verifikaciju na Pending
    // osim ako je Informal (source_id=2) -> Approved.
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

    // Vrati sve sa relacijama da front dobije sve što treba
    return response()->json(
        $competency->fresh()->load(['institution', 'type', 'source', 'verifications'])
    );
}


    //  // Brisanje komp
    // public function destroy(Competency $competency)
    // {
    //     $this->authorize('delete', $competency);
    //     $competency->delete();
    //     return response()->noContent();
    // }

    public function getOptions() 
{
    return response()->json([
        'institutions' => Institution::all(),
        'types' => CompetencyType::all(),
        'sources' => CompetencySource::all(),
    ]);
}



}
