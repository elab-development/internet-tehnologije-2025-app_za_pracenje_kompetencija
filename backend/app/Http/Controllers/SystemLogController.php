<?php

namespace App\Http\Controllers;

use App\Models\SystemLog;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Illuminate\Support\Facades\Auth;


class SystemLogController extends Controller
{


    //admin pregled logova
    #[OA\Get(
        path: '/api/system-logs',
        summary: 'Pregled svih sistemskih logova (Samo Admin)',
        security: [['bearerAuth' => []]],
        tags: ['Admin'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista svih akcija u sistemu sa podacima o korisnicima'
            ),
            new OA\Response(response: 403, description: 'Zabranjen pristup - niste admin'),
            new OA\Response(response: 401, description: 'Neautorizovan pristup')
        ]
    )]
    public function systemLogs()
    {
        $user = auth('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return SystemLog::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

    }

    //sistem automatski cuva nov log
    #[OA\Post(
        path: '/api/system-logs',
        summary: 'Ručno kreiranje log zapisa',
        security: [['bearerAuth' => []]],
        tags: ['Admin'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'action', type: 'string', example: 'Manual Audit'),
                    new OA\Property(property: 'entity', type: 'string', example: 'User Management'),
                    new OA\Property(property: 'entity_id', type: 'integer', example: 1),
                    new OA\Property(property: 'description', type: 'string', example: 'Provera statusa korisnika')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Log uspešno kreiran'),
            new OA\Response(response: 401, description: 'Neautorizovan pristup')
        ]
    )]
    public function store(Request $request)
    {
        $user = auth('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'action' => 'required|string',
            'entity' => 'required|string',
            'entity_id' => 'nullable|integer',
            'description' => 'nullable|string',
        ]);

        $data['performed_by'] = $user->id;
        $data['performed_by_role'] = $user->role;

        return response()->json(SystemLog::create($data), 201);
    }



}
