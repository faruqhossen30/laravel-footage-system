<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ImageCategory extends Pivot
{
    protected $table = 'image_categories';
}
