<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubCategoryResource;
use App\Models\SubCategory;
use Illuminate\Http\Request;

class SubCategoryApiController extends Controller
{
    public function index()
    {
        $subCategories = SubCategory::with('category')->get();
        // return SubCategoryResource::collection($subCategories);
        return response()->json($subCategories);
        
    }

    public function show($id)
    {
        $subCategory = SubCategory::with('category')->findOrFail($id);
        return new SubCategoryResource($subCategory);
    }
}
