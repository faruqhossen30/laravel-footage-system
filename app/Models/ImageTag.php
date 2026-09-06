<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ImageTag extends Pivot
{
    protected $table = 'image_tags';
}
