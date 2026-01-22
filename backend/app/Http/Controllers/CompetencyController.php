<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Competency;

class CompetencyController extends Controller
{
    public function index()  //prikaz svih kompetencija trenutnog korisnika
    {
        return auth()->user()->competencies()->with(['institution', 'type', 'source', 'verifications'])->get(); // samo svoje kompetencije
    }

    // Kreiranje nove kompetencije
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'level' => 'required|integer',
            'evidence' => 'nullable|string',
            'institution_id' => 'nullable|exists:institutions,id',
            'type_id' => 'nullable|exists:competency_types,id',
            'source_id' => 'nullable|exists:competency_sources,id',
        ]);

        $competency = auth()->user()->competencies()->create($data);

        return response()->json($competency, 201);
    }


    // Prikaz jedne kompetencije
    public function show(Competency $competency)
    {
        $this->authorize('view', $competency);
        return $competency->load(['institution', 'type', 'source', 'verifications']);
    }

    //Azuriranje komp
    public function update(Request $request, Competency $competency)
    {
        $this->authorize('update', $competency);

        $data = $request->validate([
            'name' => 'sometimes|string',
            'level' => 'sometimes|integer',
            'evidence' => 'nullable|string',
            'institution_id' => 'sometimes|exists:institutions,id',
            'type_id' => 'sometimes|exists:competency_types,id',
            'source_id' => 'sometimes|exists:competency_sources,id',
        ]);

        $competency->update($data);

        return response()->json($competency);
    }

     // Brisanje komp
    public function destroy(Competency $competency)
    {
        $this->authorize('delete', $competency);
        $competency->delete();
        return response()->noContent();
    }
}
