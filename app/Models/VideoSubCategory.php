<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class VideoSubCategory extends Pivot
{
    protected $table = 'video_sub_categories';

    protected $fillable = [
        'video_id',
        'sub_category_id',
    ];
}
