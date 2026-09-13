<?php

use App\Models\Category;
use App\Models\Image;
use App\Models\SubCategory;
use App\Models\Tag;
use Inertia\Testing\AssertableInertia as Assert;

test('images page can be rendered with all images', function () {
    Image::create([
        'title' => 'Sample Mountain',
        'file_name' => 'mountain.jpg',
    ]);

    $response = $this->get(route('images'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('images-page')
        ->has('images.data', 1)
        ->has('categories')
        ->has('tags')
        ->has('filters')
    );
});

test('images can be searched by title on images page with different casing', function () {
    Image::create([
        'title' => 'Stunning Sunset on Beach',
        'file_name' => 'sunset.jpg',
    ]);
    Image::create([
        'title' => 'Urban Street Skyline',
        'file_name' => 'city.jpg',
    ]);

    // Search with lowercase 'sunset'
    $response = $this->get(route('images', ['search' => 'sunset']));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('images-page')
        ->has('images.data', 1)
        ->where('images.data.0.title', 'Stunning Sunset on Beach')
    );

    // Search with uppercase 'SUNSET'
    $responseUpper = $this->get(route('images', ['search' => 'SUNSET']));
    $responseUpper->assertOk();
    $responseUpper->assertInertia(fn (Assert $page) => $page
        ->component('images-page')
        ->has('images.data', 1)
        ->where('images.data.0.title', 'Stunning Sunset on Beach')
    );
});

test('images can be searched by tag name on images page with different casing', function () {
    $tag = Tag::create([
        'name' => 'nuts',
        'slug' => 'nuts',
        'status' => true,
    ]);

    $image = Image::create([
        'title' => 'Healthy Food Bowl',
        'file_name' => 'bowl.jpg',
    ]);
    $image->tags()->attach($tag);

    Image::create([
        'title' => 'Green Forest Trail',
        'file_name' => 'forest.jpg',
    ]);

    // Search with title case 'Nuts' when tag is lowercase 'nuts'
    $response = $this->get(route('images', ['search' => 'Nuts']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('images-page')
        ->has('images.data', 1)
        ->where('images.data.0.title', 'Healthy Food Bowl')
    );

    // Search with uppercase 'NUTS'
    $responseUpper = $this->get(route('images', ['search' => 'NUTS']));

    $responseUpper->assertOk();
    $responseUpper->assertInertia(fn (Assert $page) => $page
        ->component('images-page')
        ->has('images.data', 1)
        ->where('images.data.0.title', 'Healthy Food Bowl')
    );
});

test('images can be filtered by category slug on images page', function () {
    $category = Category::create([
        'name' => 'Nature & Wildlife',
        'slug' => 'nature-wildlife',
        'user_id' => '1',
        'status' => true,
    ]);

    $image = Image::create([
        'title' => 'Wild Deer in Forest',
        'file_name' => 'deer.jpg',
    ]);
    $image->categories()->attach($category);

    Image::create([
        'title' => 'Office Meeting Room',
        'file_name' => 'office.jpg',
    ]);

    $response = $this->get(route('images', ['category' => 'nature-wildlife']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('images-page')
        ->has('images.data', 1)
        ->where('images.data.0.title', 'Wild Deer in Forest')
    );
});

test('images can be filtered by subcategory slug on images page', function () {
    $category = Category::create([
        'name' => 'Vehicles',
        'slug' => 'vehicles',
        'user_id' => '1',
        'status' => true,
    ]);

    $subcategory = SubCategory::create([
        'category_id' => $category->id,
        'name' => 'Classic Cars',
        'slug' => 'classic-cars',
        'user_id' => '1',
        'status' => true,
    ]);

    $image = Image::create([
        'title' => 'Vintage Red Car',
        'file_name' => 'car.jpg',
    ]);
    $image->subCategories()->attach($subcategory);

    Image::create([
        'title' => 'Cargo Ship in Sea',
        'file_name' => 'ship.jpg',
    ]);

    $response = $this->get(route('images', ['subcategory' => 'classic-cars']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('images-page')
        ->has('images.data', 1)
        ->where('images.data.0.title', 'Vintage Red Car')
    );
});

test('images can be filtered by tag slug on images page', function () {
    $tag = Tag::create([
        'name' => 'Aerial View',
        'slug' => 'aerial-view',
        'status' => true,
    ]);

    $image = Image::create([
        'title' => 'Aerial Drone Beach',
        'file_name' => 'drone.jpg',
    ]);
    $image->tags()->attach($tag);

    Image::create([
        'title' => 'Close up Flower',
        'file_name' => 'flower.jpg',
    ]);

    $response = $this->get(route('images', ['tag' => 'aerial-view']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('images-page')
        ->has('images.data', 1)
        ->where('images.data.0.title', 'Aerial Drone Beach')
    );
});
