<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HomePageController;
use App\Http\Controllers\SearchController;

Route::get('/', [HomePageController::class, 'homePage'])->name('homepage');
Route::get('/search', [SearchController::class, 'index'])->name('search');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $total_list = \App\Models\Video::where('status', 'list')->count();
        $total_run = \App\Models\Video::where('status', 'run')->count();
        $total_done = \App\Models\Video::where('status', 'done')->count();

        $videos = [
            'total_list' => $total_list,
            'total_run' => $total_run,
            'total_done' => $total_done,
        ];

        return inertia('dashboard', ['videos' => $videos]);
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
