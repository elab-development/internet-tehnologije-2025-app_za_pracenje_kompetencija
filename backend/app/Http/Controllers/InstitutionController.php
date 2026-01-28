<?php
namespace App\Http\Controllers;
use App\Models\Institution;
use Illuminate\Http\Request;

class InstitutionController extends Controller
{
    public function index()
    {
        return response()->json(Institution::all());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);
        $institution = Institution::create($request->only('name'));
        return response()->json($institution, 201);
    }

    public function update(Request $request, $id)
    {
        $institution = Institution::findOrFail($id);
        $request->validate(['name' => 'required|string']);
        $institution->update($request->only('name'));
        return response()->json($institution);
    }

    public function destroy($id)
    {
        $institution = Institution::findOrFail($id);
        $institution->delete();
        return response()->noContent(); // 204
    }



}