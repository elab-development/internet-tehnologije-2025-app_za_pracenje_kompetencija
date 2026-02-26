<?php

namespace App\Policies; //automatski ukljucuje metode view,update,delete

use App\Models\Competency;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CompetencyPolicy
{
    public function before(User $user, $ability)
    {
        if ($user->role === 'admin') {
            return true;
        }
    }
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Competency $competency): bool
    {
        return $user->id === $competency->user_id; //korinsik vidi komp samo ako je njen vlasnik
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; //svaki user moze da pravi kompetencije
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Competency $competency): bool
    {
        return $user->id === $competency->user_id; //komp moze menjati samo njen vlasnik
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Competency $competency): bool
    {
        return $user->id === $competency->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Competency $competency): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Competency $competency): bool
    {
        return false;
    }
}
