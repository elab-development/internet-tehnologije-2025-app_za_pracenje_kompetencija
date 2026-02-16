<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CompetencySource;
use App\Models\StatusVerification;
use App\Models\Institution;
use App\Models\CompetencyType;
use App\Models\Competency;
use Illuminate\Support\Facades\Hash;

class InitialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Institucije
        $institutions = [
            ['name' => 'Fakultet organizacionih nauka'],
            ['name' => 'Ekonomski fakultet'],
            ['name' => 'IT Akademija'],
            ['name' => 'Coursera Online'],
            ['name' => 'Srednja tehnička škola']
        ];
        foreach ($institutions as $inst) {
            Institution::create($inst);
        }

        // 2. Tipovi kompetencija
        $types = [
            ['name' => 'Programiranje'],
            ['name' => 'Strani jezici'],
            ['name' => 'Dizajn'],
            ['name' => 'Menadžment'],
            ['name' => 'Meke veštine (Soft skills)']
        ];
        foreach ($types as $type) {
            CompetencyType::create($type);
        }

        // 3. Izvori kompetencija (Formalno, Neformalno...)
        $sources = [
            ['name' => 'formal', 'description' => 'Obrazovanje stečeno u školama i fakultetima'],
            ['name' => 'informal', 'description' => 'Učenje kroz rad i svakodnevne aktivnosti'],
            ['name' => 'not formal', 'description' => 'Kursevi, seminari i radionice']
        ];
        foreach ($sources as $source) {
            CompetencySource::create($source);
        }

        // 4. Statusi verifikacije
        $statuses = [
            ['name' => 'pending', 'description' => 'Zahtev je poslat i čeka na pregled'],
            ['name' => 'approved', 'description' => 'Kompetencija je uspešno verifikovana'],
            ['name' => 'rejected', 'description' => 'Zahtev za verifikaciju je odbijen']
        ];
        foreach ($statuses as $status) {
            StatusVerification::create($status);
        }

        // 5. Admin 
        User::create([
            'name' => 'Admin',
            'surname' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
            'description' => 'Sistemski administrator'
        ]);

        // 6. Kreiranje Korisnika i njihovih kompetencija
        $usersData = [
            [
                'name' => 'Pera',
                'surname' => 'Peric',
                'email' => 'pera@gmail.com',
                'comp_name' => 'Java Backend Development',
                'type_id' => 1,
                'inst_id' => 3,
                'level' => '3'
            ],
            [
                'name' => 'Mika',
                'surname' => 'Mikic',
                'email' => 'mika@gmail.com',
                'comp_name' => 'Engleski jezik C1',
                'type_id' => 2,
                'inst_id' => 4,
                'level' => '3'
            ],
            [
                'name' => 'Zika',
                'surname' => 'Zikic',
                'email' => 'zika@gmail.com',
                'comp_name' => 'UI/UX Dizajn',
                'type_id' => 3,
                'inst_id' => 3,
                'level' => '2'
            ],
            [
                'name' => 'Ana',
                'surname' => 'Anic',
                'email' => 'ana@gmail.com',
                'comp_name' => 'Agile Menadžment',
                'type_id' => 4,
                'inst_id' => 1,
                'level' => '1'
            ],
        ];

        foreach ($usersData as $data) {
            // Kreiraj korisnika
            $user = User::create([
                'name' => $data['name'],
                'surname' => $data['surname'],
                'email' => $data['email'],
                'password' => Hash::make('123456'),
                'role' => 'user',
                'description' => 'Redovni korisnik aplikacije'
            ]);

            // Odmah mu dodaj kompetenciju
            Competency::create([
                'name' => $data['comp_name'],
                'level' => $data['level'],
                'evidence' => 'Sertifikat/Diploma ' . $data['name'],
                'user_id' => $user->id,
                'institution_id' => $data['inst_id'],
                'type_id' => $data['type_id'],
                'source_id' => rand(1, 3), // Nasumičan izvor (formal/informal/not formal)
                'acquired_at' => now()->subYears(1),
            ]);
        }
    }
}