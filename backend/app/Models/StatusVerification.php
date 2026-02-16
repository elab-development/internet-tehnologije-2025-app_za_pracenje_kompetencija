<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model; 

class StatusVerification extends Model{
    protected $fillable = [

        'name',
        'description', //opis npr "Na čekanju", "Odobreno", "Odbijeno" 
    ];

    public function verification(){
        return $this->hasMany(Verification::class, 'status_verification_id');
    }
}
