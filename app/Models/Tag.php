<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'status',
    ];

    public function videos(): BelongsToMany
    {
        return $this->belongsToMany(Video::class, 'tag_video')
            ->using(VideoTag::class)
            ->withTimestamps();
    }

    public function images(): BelongsToMany
    {
        return $this->belongsToMany(Image::class, 'image_tags', 'tag_id', 'image_id')
            ->using(ImageTag::class)
            ->withTimestamps();
    }
}
