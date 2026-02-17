<?php
namespace App\Http\Controllers;
use App\Models\Institution;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class InstitutionController extends Controller
{
    #[OA\Get(
        path: '/api/institutions',
        summary: 'Lista svih institucija',
        tags: ['Settings'],
        responses: [
            new OA\Response(response: 200, description: 'Uspešno dobavljena lista')
        ]
    )]
    public function index()
    {
        return response()->json(Institution::all());
    }

    #[OA\Post(
        path: '/api/institutions',
        summary: 'Dodaj novu instituciju',
        security: [['bearerAuth' => []]],
        tags: ['Settings'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Univerzitet u Beogradu')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Institucija uspešno kreirana'),
            new OA\Response(response: 422, description: 'Greška u validaciji')
        ]
    )]
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);
        $institution = Institution::create($request->only('name'));
        return response()->json($institution, 201);
    }

    #[OA\Put(
        path: '/api/institutions/{id}',
        summary: 'Ažuriraj podatke o instituciji',
        security: [['bearerAuth' => []]],
        tags: ['Settings'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Novi Sad IT Akademija')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Uspešno ažurirano'),
            new OA\Response(response: 404, description: 'Institucija nije pronađena')
        ]
    )]
    public function update(Request $request, $id)
    {
        $institution = Institution::findOrFail($id);
        $request->validate(['name' => 'required|string']);
        $institution->update($request->only('name'));
        return response()->json($institution);
    }

    #[OA\Delete(
        path: '/api/institutions/{id}',
        summary: 'Obriši instituciju',
        security: [['bearerAuth' => []]],
        tags: ['Settings'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Uspešno obrisano'),
            new OA\Response(response: 404, description: 'Institucija nije pronađena')
        ]
    )]
    public function destroy($id)
    {
        $institution = Institution::findOrFail($id);
        $institution->delete();
        return response()->noContent(); // 204
    }



}