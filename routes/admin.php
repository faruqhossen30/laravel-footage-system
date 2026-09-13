<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ImageController;
use App\Http\Controllers\Admin\SubCategoryController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\VideoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::resource('category', CategoryController::class);
    Route::resource('sub-category', SubCategoryController::class);
    Route::resource('tag', TagController::class);

    Route::get('video', [VideoController::class, 'index'])->name('video.index');
    Route::get('video/create', [VideoController::class, 'create'])->name('video.create');
    Route::post('video', [VideoController::class, 'pixabayStore'])->name('video.pixabay.store');
    Route::get('video/{video}/edit', [VideoController::class, 'edit'])->name('video.edit');
    Route::put('video/{video}', [VideoController::class, 'update'])->name('video.update');
    Route::post('video/enqueue', [VideoController::class, 'enqueueDownloads'])->name('video.enqueue');
    Route::post('video/stop-downloads', [VideoController::class, 'stopDownloads'])->name('video.stop-downloads');
    Route::delete('video/{id}', [VideoController::class, 'destroy'])->name('video.destroy');

    Route::get('image', [ImageController::class, 'index'])->name('image.index');
    Route::get('image/create', [ImageController::class, 'create'])->name('image.create');
    Route::post('image', [ImageController::class, 'pixabayStore'])->name('image.pixabay.store');
    Route::get('image/{image}/edit', [ImageController::class, 'edit'])->name('image.edit');
    Route::put('image/{image}', [ImageController::class, 'update'])->name('image.update');
    Route::post('image/enqueue', [ImageController::class, 'enqueueDownloads'])->name('image.enqueue');
    Route::post('image/stop-downloads', [ImageController::class, 'stopDownloads'])->name('image.stop-downloads');
    Route::delete('image/{id}', [ImageController::class, 'destroy'])->name('image.destroy');
});
