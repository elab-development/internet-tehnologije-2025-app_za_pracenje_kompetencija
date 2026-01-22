<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CompetencyType extends Model{
    protected $fillable=[
        'name',
    ]; 

    public function competencies(){
        return $this->hasMany(Competency::class,'type_id');
    }
}
