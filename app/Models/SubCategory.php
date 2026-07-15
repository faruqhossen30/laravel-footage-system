<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SubCategory extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'name', 'slug', 'description', 'thumbnail', 'user_id', 'status'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function videos(): BelongsToMany
    {
        return $this->belongsToMany(Video::class, 'video_sub_categories', 'sub_category_id', 'video_id')
            ->using(VideoSubCategory::class)
            ->withTimestamps();
    }
}
