<?php

namespace App\Models;

use App\Enums\VideoProvider;
use App\Enums\VideoStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Video extends Model
{
    protected $fillable = [
        'title',
        'file_name',
        'file_path',
        'folder',
        'duration',
        'thumbnail',
        'video_quality',
        'size',
        'width',
        'height',
        'povider',
        'povider_id',
        'status',

    ];

    protected function casts(): array
    {
        return [
            // Note: column name is 'povider' in schema; cast accordingly
            'povider' => VideoProvider::class,
            'status' => VideoStatus::class,
            'duration' => 'integer'
        ];
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tag_video')
            ->using(VideoTag::class)
            ->withTimestamps();
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'video_categories', 'video_id', 'category_id')
            ->withTimestamps();
    }

    public function subCategories(): BelongsToMany
    {
        return $this->belongsToMany(SubCategory::class, 'video_sub_categories', 'video_id', 'sub_category_id')
            ->using(VideoSubCategory::class)
            ->withTimestamps();
    }

}
