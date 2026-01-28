<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'action',
        'entity',
        'entity_id',
        'performed_by',
        'performed_by_role',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    
}
