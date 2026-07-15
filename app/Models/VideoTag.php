<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class VideoTag extends Pivot
{
    protected $table = 'tag_video';

    protected $fillable = [
        'video_id',
        'tag_id',
    ];

    public $timestamps = true;

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }
}
