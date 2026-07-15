<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryApiController extends Controller
{
    public function index()
    {
        $categories = Category::with([
            'subCategories' => function ($query) {
                $query->withCount('videos');
            },
        ])->withCount('videos')->orderBy('name')->get();
        return response()->json($categories);
    }

    public function show($id)
    {
        $category = Category::with('subCategories')->findOrFail($id);
        return new CategoryResource($category);
    }
}
