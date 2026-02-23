<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Institution;
use App\Models\CompetencyType;
use App\Models\CompetencySource;
use App\Models\StatusVerification; // Dodajemo model
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompetencyApiTest extends TestCase
{
    use RefreshDatabase;
    protected $seed = true; 

    public function test_user_can_create_competency()
    {
        // 1. REŠENJE: Ručno pravimo status koji kontroler traži (ID=1)
        StatusVerification::firstOrCreate(
            ['id' => 1], 
            ['name' => 'Pending', 'description' => 'Na čekanju']
        );

        // 2. Priprema korisnika
        $user = User::create([
            'name' => 'Martina',
            'surname' => 'Langworth',
            'email' => 'martina' . rand(1, 999) . '@example.org',
            'password' => bcrypt('password123'),
            'role' => 'user'
        ]);

        // 3. Obezbeđivanje ostalih stranih ključeva
        $inst = Institution::first() ?? Institution::create(['name' => 'Test Inst']);
        $type = CompetencyType::first() ?? CompetencyType::create(['name' => 'Test Type']);
        $source = CompetencySource::first() ?? CompetencySource::create(['name' => 'Formal']);

        // 4. Akcija
        $response = $this->actingAs($user)
            ->postJson('/api/competencies', [
                'name' => 'PHP Unit Testing',
                'level' => 5,
                'institution_id' => $inst->id,
                'type_id' => $type->id,
                'source_id' => $source->id,
            ]);

        // 5. Provera
        $response->assertStatus(201); 
        $this->assertDatabaseHas('competencies', [
            'name' => 'PHP Unit Testing'
        ]);
    }
}