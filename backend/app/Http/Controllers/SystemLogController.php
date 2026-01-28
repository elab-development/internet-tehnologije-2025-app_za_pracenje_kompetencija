<?php

namespace App\Http\Controllers;

use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class SystemLogController extends Controller
{


    //admin pregled logova
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

    //cuvanje novog loga
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
