<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CompetencySource extends Model{
    protected $fillable=[
        'name',
        'description',
    ];

    public function competencies()
    {
        return $this->hasMany(Competency::class, 'source_id');
    }
}