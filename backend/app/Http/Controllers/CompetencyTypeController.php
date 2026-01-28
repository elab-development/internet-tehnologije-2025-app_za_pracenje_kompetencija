<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompetencyType;
use Illuminate\Http\Request;

class CompetencyTypeController extends Controller
{
    public function index()
    {
        return CompetencyType::all();
    }
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:competency_types,name']);
        return CompetencyType::create($request->only('name'));
    }

    public function update(Request $request, $id)
    {
        $type = CompetencyType::findOrFail($id);
        $request->validate(['name' => 'required|string|unique:competency_types,name,' . $id]);
        $type->update($request->only('name'));
        return $type;
    }

    public function destroy($id)
    {
        $type = CompetencyType::findOrFail($id);
        $type->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

}
