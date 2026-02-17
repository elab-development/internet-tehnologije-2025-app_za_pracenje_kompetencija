<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompetencyType;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class CompetencyTypeController extends Controller
{
    #[OA\Get(
        path: '/api/competency-types',
        summary: 'Lista svih tipova kompetencija',
        tags: ['Settings'],
        responses: [
            new OA\Response(response: 200, description: 'Uspešno dobavljena lista')
        ]
    )]
    public function index()
    {
        return CompetencyType::all();
    }
    #[OA\Post(
        path: '/api/competency-types',
        summary: 'Dodaj novi tip kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Settings'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Programiranje')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Uspešno kreirano'),
            new OA\Response(response: 422, description: 'Greška u validaciji')
        ]
    )]
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:competency_types,name']);
        return CompetencyType::create($request->only('name'));
    }

    #[OA\Put(
        path: '/api/competency-types/{id}',
        summary: 'Ažuriraj tip kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Settings'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Dizajn')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Uspešno ažurirano'),
            new OA\Response(response: 404, description: 'Tip nije pronađen')
        ]
    )]
    public function update(Request $request, $id)
    {
        $type = CompetencyType::findOrFail($id);
        $request->validate(['name' => 'required|string|unique:competency_types,name,' . $id]);
        $type->update($request->only('name'));
        return $type;
    }

    #[OA\Delete(
        path: '/api/competency-types/{id}',
        summary: 'Obriši tip kompetencije',
        security: [['bearerAuth' => []]],
        tags: ['Settings'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Uspešno obrisano'),
            new OA\Response(response: 404, description: 'Tip nije pronađen')
        ]
    )]
    public function destroy($id)
    {
        $type = CompetencyType::findOrFail($id);
        $type->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

}
