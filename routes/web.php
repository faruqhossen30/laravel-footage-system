<?php

use App\Http\Controllers\HomePageController;
use App\Http\Controllers\ImagePageController;
use App\Http\Controllers\SearchController;
use App\Models\Image;
use App\Models\Video;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomePageController::class, 'homePage'])->name('homepage');
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/images', [ImagePageController::class, 'index'])->name('images');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $total_list = Video::where('status', 'list')->count();
        $total_run = Video::where('status', 'run')->count();
        $total_done = Video::where('status', 'done')->count();

        $videos = [
            'total_list' => $total_list,
            'total_run' => $total_run,
            'total_done' => $total_done,
        ];

        $image_total_list = Image::where('status', 'list')->count();
        $image_total_run = Image::where('status', 'run')->count();
        $image_total_done = Image::where('status', 'done')->count();

        $images = [
            'total_list' => $image_total_list,
            'total_run' => $image_total_run,
            'total_done' => $image_total_done,
        ];

        return inertia('dashboard', ['videos' => $videos, 'images' => $images]);
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
