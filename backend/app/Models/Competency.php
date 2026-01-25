<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Competency extends Model
{
    protected $fillable = [
        'name',
        'level',
        'evidence',
        'user_id',
        'institution_id',
        'type_id',
        'source_id',
        'acquired_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function type()
    {
        return $this->belongsTo(CompetencyType::class, 'type_id');
    }

    public function source()
    {
        return $this->belongsTo(CompetencySource::class, 'source_id');
    }

    public function verifications()
    {
        return $this->hasMany(Verification::class, 'competency_id');
    }
}
