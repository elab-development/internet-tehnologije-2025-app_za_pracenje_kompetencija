# App za praćenje kompetencija 

Ova aplikacija omogućava korisnicima da evidentiraju svoje profesionalne kompetencije, dok moderatori mogu da vrše njihovu verifikaciju. Projekat je razvijen kao mikroservisna arhitektura korišćenjem modernih tehnologija.

##  Tehnologije

- **Backend:** Laravel 11 (PHP 8.2)
- **Frontend:** React.js / Vite
- **Baza podataka:** MySQL 8.0
- **Kontejnerizacija:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Dokumentacija:** Swagger (OpenAPI)

##  Instalacija i pokretanje (Docker)

Najbrži način da pokrenete aplikaciju je korišćenjem Docker-a.

1. **Klonirajte repozitorijum:**
   ```bash
   git clone [https://github.com/elab-development/internet-tehnologije-2025-app_za_pracenje_kompetencija]
2. **Pokrenite kontejnere:**
    docker-compose up -d --build
3. **Pripremite bazu podataka:**
    docker exec -it backend_app php artisan migrate:fresh --seed
4. **Pokrenite swagger:**
    docker exec -it backend_app php artisan l5-swagger:generate

Aplikacija će biti dostupna na:
    Frontend: http://localhost:3000
    Backend API: http://localhost:8000
    Swagger dokumentacija: http://localhost:8000/api/documentation

## Testiranje:
Testovi se izvršavaju automatski putem GitHub Actions pipeline-a, ali ih možete pokrenuti i lokalno unutar kontejnera:
    docker exec -it backend_app php artisan test

## Bezbednost:
Aplikacija koristi:
    Laravel Sanctum za bezbednu autentifikaciju putem Bearer tokena.
    Mass Assignment zaštitu u modelima.
    SQL Injection zaštitu putem Eloquent ORM-a
    Rate Limiting za sprečavanje Brute Force napada.

## Branching model:
Projekat koristi Git Flow organizaciju:
    main: Stabilna verzija spremna za produkciju.
    develop: Integraciona grana za razvoj.
    feature/*: Grane za razvoj specifičnih funkcionalnosti (npr. feature/api-documentation).
