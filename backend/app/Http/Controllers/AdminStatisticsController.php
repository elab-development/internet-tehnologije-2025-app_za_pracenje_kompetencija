<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Verification;

class AdminStatisticsController extends Controller
{
    public function competencyStatus(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $total = Verification::count();

        $c1 = Verification::where('status_verification_id', 1)->count(); // Pending
        $c2 = Verification::where('status_verification_id', 2)->count(); // Approved
        $c3 = Verification::where('status_verification_id', 3)->count(); // Rejected

        $pct = function ($x) use ($total) {
            return $total > 0 ? round(($x / $total) * 100, 2) : 0;
        };

        return response()->json([
            'total' => $total,
            'countsById' => [
                '1' => $c1,
                '2' => $c2,
                '3' => $c3,
            ],
            'percentagesById' => [
                '1' => $pct($c1),
                '2' => $pct($c2),
                '3' => $pct($c3),
            ],
        ]);
    }

    public function topCompetencyTypes(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $totalAll = DB::table('verifications')->count();

        $rows = DB::table('verifications')
            ->join('competencies', 'verifications.competency_id', '=', 'competencies.id')
            ->join('competency_types', 'competencies.type_id', '=', 'competency_types.id')
            ->select(
                'competency_types.id as type_id',
                'competency_types.name as type_name',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('competency_types.id', 'competency_types.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $items = $rows->map(function ($r) use ($totalAll) {
            $pct = $totalAll > 0 ? round(((int)$r->total / $totalAll) * 100, 2) : 0;
            return [
                'type_id' => (int)$r->type_id,
                'type_name' => $r->type_name,
                'total' => (int)$r->total,
                'percentage' => $pct,
            ];
        });

        return response()->json([
            'totalAllVerifications' => $totalAll,
            'topType' => $items->first(),
            'items' => $items,
        ]);
    }

    public function competencySources(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rows = DB::table('verifications')
            ->join('competencies', 'verifications.competency_id', '=', 'competencies.id')
            ->leftJoin('competency_sources', 'competencies.source_id', '=', 'competency_sources.id')
            ->select(
                DB::raw('COALESCE(competency_sources.id, 0) as source_id'),
                DB::raw('COALESCE(competency_sources.name, "Unknown") as source_name'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy(
                DB::raw('COALESCE(competency_sources.id, 0)'),
                DB::raw('COALESCE(competency_sources.name, "Unknown")')
            )
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'items' => $rows->map(fn($r) => [
                'source_id' => (int)$r->source_id,
                'source_name' => $r->source_name,
                'total' => (int)$r->total,
            ]),
        ]);
    }
}