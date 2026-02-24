<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/api/login',
        summary: 'Prijava korisnika',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'email', type: 'string', example: 'admin@gmail.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Uspešna prijava'),
            new OA\Response(response: 401, description: 'Pogrešni podaci')
        ]
    )]
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'role' => $user->role,
                'description' => $user->description
            ]
        ]);
    }

    #[OA\Post(
        path: '/api/register',
        summary: 'Registracija novog korisnika',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Pera'),
                    new OA\Property(property: 'surname', type: 'string', example: 'Peric'),
                    new OA\Property(property: 'email', type: 'string', example: 'pera@gmail.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Uspešna registracija'),
            new OA\Response(response: 422, description: 'Greška u validaciji')
        ]
    )]
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        Log::info('REGISTER HIT', [
            'email' => $request->email,
            'has_reputation_key' => !empty(env('ABSTRACT_EMAIL_REPUTATION_API_KEY')),
        ]);

        // ✅ Email REPUTATION check (deliverability/quality)
        $check = $this->checkEmailReputationWithAbstract($request->email);

        if (!$check['ok']) {
            return response()->json([
                'message' => $check['reason'] ?? 'Email address is not acceptable.',
                // opcionalno vrati detalje za debug (možeš kasnije ukloniti)
                'details' => $check['details'] ?? null,
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'surname' => $user->surname,
            'email' => $user->email,
            'role' => $user->role
        ], 201);
    }

    /**
     * Uses Abstract Email Reputation API:
     * GET https://emailreputation.abstractapi.com/v1/?api_key=...&email=...
     */
    private function checkEmailReputationWithAbstract(string $email): array
    {
        // ✅ koristi REPUTATION key
        $key =
            config('services.abstract_email_reputation.key')
            ?? env('ABSTRACT_EMAIL_REPUTATION_API_KEY');

        if (!$key) {
            // Fail closed (da se vidi odmah da nije podešeno)
            return ['ok' => false, 'reason' => 'Email reputation is not configured.'];
        }

        $res = Http::timeout(10)->get('https://emailreputation.abstractapi.com/v1/', [
            'api_key' => $key,
            'email'   => $email,
        ]);

        if (!$res->ok()) {
            Log::warning('ABSTRACT REPUTATION ERROR', [
                'status' => $res->status(),
                'body' => $res->body(),
            ]);

            return ['ok' => false, 'reason' => 'Email reputation service is unavailable.'];
        }

        $data = $res->json();
        Log::info('ABSTRACT REPUTATION RESPONSE', $data);

        // Očekivana polja (Email Reputation):
        $deliverability = strtolower($data['email_deliverability']['status'] ?? 'unknown');
        $isDisposable   = (bool)($data['email_quality']['is_disposable'] ?? false);
        $score          = (float)($data['email_quality']['score'] ?? 0);

        // ✅ Pravila (možeš prilagoditi):
        // - dozvoli samo deliverable
        // - blokiraj disposable
        // - blokiraj baš loš score (primer prag 0.30)
        // if ($deliverability !== 'deliverable') {
        //     return [
        //         'ok' => false,
        //         'reason' => 'Email is not deliverable.',
        //         'details' => ['deliverability' => $deliverability, 'is_disposable' => $isDisposable, 'score' => $score],
        //     ];
        // }
        if ($deliverability === 'undeliverable') {
            return [
                'ok' => false,
                'reason' => 'Email is not deliverable.'
            ];
        }

        if ($isDisposable) {
            return [
                'ok' => false,
                'reason' => 'Disposable email addresses are not allowed.'
            ];
        }

        // if ($isDisposable) {
        //     return [
        //         'ok' => false,
        //         'reason' => 'Disposable email addresses are not allowed.',
        //         'details' => ['deliverability' => $deliverability, 'is_disposable' => $isDisposable, 'score' => $score],
        //     ];
        // }

        // if ($score < 0.30) {
        //     return [
        //         'ok' => false,
        //         'reason' => 'Email reputation score is too low.',
        //         'details' => ['deliverability' => $deliverability, 'is_disposable' => $isDisposable, 'score' => $score],
        //     ];
        // }

        return ['ok' => true];
    }
}
