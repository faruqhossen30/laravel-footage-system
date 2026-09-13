<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Image extends Model
{
    protected $fillable = [
        'title',
        'file_name',
        'file_path',
        'thumbnail',
        'size',
        'width',
        'height',
        'provider',
        'provider_id',
        'status',
    ];

    protected $appends = [
        'disk_path',
    ];

    public function getDiskPathAttribute(): ?string
    {
        return $this->file_path ? env('DISK_FILE_LOCATION', '/Volumes/Files/server/').$this->file_path : null;
    }

    protected function casts(): array
    {
        return [
            // assuming we use VideoProvider and VideoStatus, or string
            // 'provider' => \App\Enums\VideoProvider::class,
            // 'status' => \App\Enums\VideoStatus::class,
        ];
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'image_tags', 'image_id', 'tag_id')
            ->using(ImageTag::class)
            ->withTimestamps();
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'image_categories', 'image_id', 'category_id')
            ->using(ImageCategory::class)
            ->withTimestamps();
    }

    public function subCategories(): BelongsToMany
    {
        return $this->belongsToMany(SubCategory::class, 'image_sub_categories', 'image_id', 'sub_category_id')
            ->using(ImageSubCategory::class)
            ->withTimestamps();
    }
}
