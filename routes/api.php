<?php

use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\ImageApiController;
use App\Http\Controllers\Api\SubCategoryApiController;
use App\Http\Controllers\Api\TagApiController;
use App\Http\Controllers\Api\VideoApiController;
use App\Http\Resources\ImageResource;
use App\Http\Resources\VideoResource;
use App\Models\Image;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('videos', function (Request $request) {
    $search = $request->input('query');
    $perPage = $request->input('per_page');

    $query = Video::query();

    if (! empty($search)) {
        $query->whereHas('tags', function ($q) use ($search) {
            $q->whereRaw('LOWER(name) like ?', ['%'.strtolower($search).'%']);
        });
    }

    $videos = $query
        ->paginate($perPage ?? 5)
        ->appends(request()->query());

    return VideoResource::collection($videos);
});

Route::get('images', function (Request $request) {
    $search = $request->input('query');
    $perPage = $request->input('per_page');

    $query = Image::query();

    if (! empty($search)) {
        $query->whereHas('tags', function ($q) use ($search) {
            $q->whereRaw('LOWER(name) like ?', ['%'.strtolower($search).'%']);
        });
    }

    $images = $query
        ->paginate($perPage ?? 5)
        ->appends(request()->query());

    return ImageResource::collection($images);
});

Route::post('video/create', [VideoApiController::class, 'storeStoryBlocksVideo']);
Route::get('/{id}/check-video', [VideoApiController::class, 'checkVideo']);
Route::get('footage', [VideoApiController::class, 'getVideosLinksAndDuration']);

Route::post('image/create', [ImageApiController::class, 'storePixabayImage']);
Route::get('/{id}/check-image', [ImageApiController::class, 'checkImage']);
Route::get('images-list', [ImageApiController::class, 'getImagesLinksAndSize']);

Route::get('categories', [CategoryApiController::class, 'index']);
Route::get('categories/{id}', [CategoryApiController::class, 'show']);

Route::get('sub-categories', [SubCategoryApiController::class, 'index']);
Route::get('sub-categories/{id}', [SubCategoryApiController::class, 'show']);
Route::get('tags', [TagApiController::class, 'index']);
