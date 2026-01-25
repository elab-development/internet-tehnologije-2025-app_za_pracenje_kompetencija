<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Verification extends Model
{
    protected $fillable = [
        'user_id',
        'status_verification_id',
        'request',
        'moderator_id',
        'verified_at',
        'competency_id'
    ];

    public function competency()
    {
        return $this->belongsTo(Competency::class, 'competency_id');
    }

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }

    public function status()
    {
        return $this->belongsTo(StatusVerification::class, 'status_verification_id');
    }
}
