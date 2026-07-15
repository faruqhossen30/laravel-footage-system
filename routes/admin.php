<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\SubCategoryController;
use App\Http\Controllers\Admin\VideoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::resource('category', CategoryController::class);
    Route::resource('sub-category', SubCategoryController::class);

    Route::get('video', [VideoController::class, 'index'])->name('video.index');
    Route::get('video/create', [VideoController::class, 'create'])->name('video.create');
    Route::post('video', [VideoController::class, 'pixabayStore'])->name('video.pixabay.store');
    Route::get('video/{video}/edit', [VideoController::class, 'edit'])->name('video.edit');
    Route::put('video/{video}', [VideoController::class, 'update'])->name('video.update');
    Route::post('video/enqueue', [VideoController::class, 'enqueueDownloads'])->name('video.enqueue');
    Route::post('video/stop-downloads', [VideoController::class, 'stopDownloads'])->name('video.stop-downloads');
    Route::delete('video/{id}', [VideoController::class, 'destroy'])->name('video.destroy');
});
