<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Audio extends Model
{
    protected $fillable = [
        'video_id',
        'file_name',
        'file_path',
        'pc',
        'status',
    ];

    public function video(): HasOne
    {
        return $this->hasOne(Video::class);
    }
}
