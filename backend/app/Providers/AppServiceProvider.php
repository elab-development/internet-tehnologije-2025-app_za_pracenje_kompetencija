<?php

namespace App\Providers;
use App\Models\Competency;
use App\Policies\CompetencyPolicy;
use Illuminate\Support\Facades\Gate;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        // Registrujemo policy za Competency model
        Gate::policy(Competency::class, CompetencyPolicy::class);
    }
}
