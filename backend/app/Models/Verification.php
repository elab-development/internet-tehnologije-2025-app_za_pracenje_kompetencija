<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Verification extends Model
{
    protected $fillable = [
        'competency_id',
        'moderator_id',
        'status_verification_id',
        'request',
        'note',
        'verified_at',
    ];

    public function competency()
    {
        return $this->belongsTo(Competency::class);
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
