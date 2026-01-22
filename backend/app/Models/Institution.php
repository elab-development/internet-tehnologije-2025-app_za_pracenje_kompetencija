<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    protected $fillable = [
        'name',
    ];

    public function competencies()
    {
        return $this->hasMany(Competency::class);
    }
    public function users()
    {
        return $this->hasMany(User::class);
    }
}