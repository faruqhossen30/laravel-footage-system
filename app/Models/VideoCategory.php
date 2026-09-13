<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoCategory extends Model
{
    protected $table = 'video_categories';

    protected $fillable = [
        'video_id',
        'category_id',
    ];
}
