<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;

class TagApiController extends Controller
{
    public function index()
    {
        $tags = Tag::withCount('videos')->orderBy('name')->get();

        return response()->json($tags);

    }
}
