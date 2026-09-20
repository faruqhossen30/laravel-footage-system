<?php

use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Models\Video;
use Inertia\Testing\AssertableInertia as Assert;

test('homepage can be rendered with video search layout', function () {
    Video::create([
        'title' => 'Stunning Mountain Drone Shot',
        'file_name' => 'mountain.mp4',
    ]);

    $category = Category::create([
        'name' => 'Nature',
        'slug' => 'nature',
        'user_id' => 1,
        'status' => true,
    ]);

    $tag = Tag::create([
        'name' => 'Drone',
        'slug' => 'drone',
        'status' => true,
    ]);

    $response = $this->get(route('homepage'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data', 1)
        ->has('categories')
        ->has('tags')
        ->has('filters')
    );
});

test('homepage videos can be searched by title with case insensitivity', function () {
    Video::create([
        'title' => 'Epic Sunset Over Ocean',
        'file_name' => 'sunset.mp4',
    ]);
    Video::create([
        'title' => 'City Lights at Night',
        'file_name' => 'city.mp4',
    ]);

    $response = $this->get(route('homepage', ['search' => 'sunset']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data', 1)
        ->where('videos.data.0.title', 'Epic Sunset Over Ocean')
    );

    $responseUpper = $this->get(route('homepage', ['search' => 'SUNSET']));
    $responseUpper->assertOk();
    $responseUpper->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data', 1)
        ->where('videos.data.0.title', 'Epic Sunset Over Ocean')
    );
});

test('homepage videos can be searched by tag name', function () {
    $tag = Tag::create([
        'name' => 'Wildlife',
        'slug' => 'wildlife',
        'status' => true,
    ]);

    $video = Video::create([
        'title' => 'Wild Lions in Savannah',
        'file_name' => 'lions.mp4',
    ]);
    $video->tags()->attach($tag);

    $response = $this->get(route('homepage', ['search' => 'wildlife']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data', 1)
        ->where('videos.data.0.title', 'Wild Lions in Savannah')
    );
});

test('homepage videos can be filtered by category', function () {
    $category = Category::create([
        'name' => 'Technology',
        'slug' => 'technology',
        'user_id' => 1,
        'status' => true,
    ]);

    $video1 = Video::create([
        'title' => 'Futuristic AI Code',
        'file_name' => 'ai.mp4',
    ]);
    $video1->categories()->attach($category);

    $video2 = Video::create([
        'title' => 'Forest River Flow',
        'file_name' => 'river.mp4',
    ]);

    $response = $this->get(route('homepage', ['category' => 'technology']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data', 1)
        ->where('videos.data.0.title', 'Futuristic AI Code')
    );
});

test('homepage videos can be filtered by subcategory', function () {
    $category = Category::create([
        'name' => 'Architecture',
        'slug' => 'architecture',
        'user_id' => 1,
        'status' => true,
    ]);

    $subCategory = SubCategory::create([
        'category_id' => $category->id,
        'name' => 'Bridges',
        'slug' => 'bridges',
        'user_id' => 1,
        'status' => true,
    ]);

    $video = Video::create([
        'title' => 'Golden Gate Fog',
        'file_name' => 'bridge.mp4',
    ]);
    $video->categories()->attach($category);
    $video->subCategories()->attach($subCategory);

    $video2 = Video::create([
        'title' => 'Skyscraper Sunset',
        'file_name' => 'tower.mp4',
    ]);
    $video2->categories()->attach($category);

    $response = $this->get(route('homepage', ['category' => 'architecture', 'subcategory' => 'bridges']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data', 1)
        ->where('videos.data.0.title', 'Golden Gate Fog')
    );
});

test('homepage returns videos with tags eagerly loaded', function () {
    $tag = Tag::create([
        'name' => 'Cinematic',
        'slug' => 'cinematic',
        'status' => true,
    ]);

    $video = Video::create([
        'title' => 'Slow Motion Rain',
        'file_name' => 'rain.mp4',
    ]);
    $video->tags()->attach($tag);

    $response = $this->get(route('homepage'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data.0.tags', 1)
        ->where('videos.data.0.tags.0.name', 'Cinematic')
    );
});

test('homepage videos can be searched with multi-word queries', function () {
    $tag = Tag::create([
        'name' => 'Nature',
        'slug' => 'nature',
        'status' => true,
    ]);

    $video = Video::create([
        'title' => 'Calm Mountain River',
        'file_name' => 'mountain_river.mp4',
    ]);
    $video->tags()->attach($tag);

    $response = $this->get(route('homepage', ['search' => 'Mountain Nature']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data', 1)
        ->where('videos.data.0.title', 'Calm Mountain River')
    );
});

test('homepage video search also works with query parameter', function () {
    $video = Video::create([
        'title' => 'Deep Blue Ocean Waves',
        'file_name' => 'ocean.mp4',
    ]);

    $response = $this->get(route('homepage', ['query' => 'ocean']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('home-page')
        ->has('videos.data', 1)
        ->where('videos.data.0.title', 'Deep Blue Ocean Waves')
    );
});
