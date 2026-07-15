<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\SubCategory;
use App\Models\Video;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'thumbnail', 'user_id', 'status'];

    public function subCategories()
    {
        return $this->hasMany(SubCategory::class)->orderBy('name');
    }

    public function videos(): BelongsToMany
    {
        return $this->belongsToMany(Video::class, 'video_categories', 'category_id', 'video_id')
            ->withTimestamps();
    }
}
