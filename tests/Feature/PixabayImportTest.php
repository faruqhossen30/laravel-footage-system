<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('pixabay images create page returns filters prop with search, order, and per_page', function () {
    Http::fake([
        'https://pixabay.com/api/*' => Http::response([
            'total' => 50,
            'totalHits' => 50,
            'hits' => [
                [
                    'id' => 1001,
                    'tags' => 'flower, nature',
                    'previewURL' => 'https://cdn.pixabay.com/preview.jpg',
                    'webformatURL' => 'https://cdn.pixabay.com/web.jpg',
                    'largeImageURL' => 'https://cdn.pixabay.com/large.jpg',
                    'imageWidth' => 1920,
                    'imageHeight' => 1080,
                    'imageSize' => 1048576,
                ],
            ],
        ]),
    ]);

    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('image.create', [
        'search' => 'flower',
        'order' => 'latest',
        'per_page' => 40,
        'page' => 2,
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/image/pixabay-images')
        ->has('items', 1)
        ->has('filters')
        ->where('filters.search', 'flower')
        ->where('filters.order', 'latest')
        ->where('filters.per_page', '40')
        ->where('filters.page', 2)
    );
});

test('pixabay videos create page returns filters prop with search, order, and per_page', function () {
    Http::fake([
        'https://pixabay.com/api/videos/*' => Http::response([
            'total' => 25,
            'totalHits' => 25,
            'hits' => [
                [
                    'id' => 2001,
                    'tags' => 'sunset, ocean',
                    'videos' => [],
                ],
            ],
        ]),
    ]);

    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('video.create', [
        'search' => 'sunset',
        'order' => 'popular',
        'per_page' => 30,
        'page' => 1,
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/video/pixabay-videos')
        ->has('items', 1)
        ->has('filters')
        ->where('filters.search', 'sunset')
        ->where('filters.order', 'popular')
        ->where('filters.per_page', '30')
        ->where('filters.page', 1)
    );
});
