<?php

use App\Models\User;
use App\Models\Video;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from video path search to login', function () {
    $response = $this->get(route('video.search'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can view video path search page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('video.search'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/video/search')
            ->has('videos.data', 0)
        );
});

test('can search video using full disk path with quotes', function () {
    $user = User::factory()->create();

    $video = Video::create([
        'title' => 'Sample Medium Video',
        'file_name' => 'https://cdn.pixabay.com/video/2026/08/11/370013_medium.mp4',
        'file_path' => 'videos/370013_medium.mp4',
        'status' => 'done',
        'povider' => 'pixabay',
        'povider_id' => '370013',
    ]);

    $response = $this->actingAs($user)->get(route('video.search', [
        'path' => '"/Volumes/Files/server/videos/370013_medium.mp4"',
    ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/video/search')
            ->has('videos.data', 1)
            ->where('videos.data.0.id', $video->id)
            ->where('videos.data.0.file_path', 'videos/370013_medium.mp4')
        );
});

test('can search video using relative path and file name', function () {
    $user = User::factory()->create();

    $video = Video::create([
        'title' => 'Another Test Video',
        'file_name' => 'test_preview_999.mp4',
        'file_path' => 'videos/test_preview_999.mp4',
        'status' => 'done',
    ]);

    // Search by relative path
    $responseRelative = $this->actingAs($user)->get(route('video.search', [
        'path' => 'videos/test_preview_999.mp4',
    ]));

    $responseRelative->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/video/search')
            ->has('videos.data', 1)
            ->where('videos.data.0.id', $video->id)
        );

    // Search by filename only
    $responseBasename = $this->actingAs($user)->get(route('video.search', [
        'path' => 'test_preview_999.mp4',
    ]));

    $responseBasename->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/video/search')
            ->has('videos.data', 1)
            ->where('videos.data.0.id', $video->id)
        );
});
