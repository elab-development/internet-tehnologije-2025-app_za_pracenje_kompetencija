<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "API za praćenje kompetencija", 
    version: "1.0.0",
    description: "Dokumentacija obuhvata rute za upravljanje kompetencijama, verifikacijama i autentifikaciju korisnika."
)]
#[OA\Server(url: 'http://localhost:8000', description: 'Lokalni server')]
#[OA\Header(header: "Accept", schema: new OA\Schema(type: "string", default: "application/json"))]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    name: 'Authorization',
    in: 'header',
    scheme: 'bearer',
    bearerFormat: 'JWT'
)]
abstract class Controller
{
    //
}