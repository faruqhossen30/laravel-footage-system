<?php

use App\Models\Image;
use App\Models\Tag;

test('images can be searched by tag name', function () {
    // 1. Create a tag "nature"
    $natureTag = Tag::create([
        'name' => 'Nature View',
        'slug' => 'nature-view',
    ]);

    // 2. Create another tag "city"
    $cityTag = Tag::create([
        'name' => 'City Lights',
        'slug' => 'city-lights',
    ]);

    // 3. Create images
    $natureImage = Image::create([
        'title' => 'A beautiful forest',
        'file_name' => 'forest.jpg',
    ]);
    $natureImage->tags()->attach($natureTag);

    $cityImage = Image::create([
        'title' => 'New York Skyline',
        'file_name' => 'nyc.jpg',
    ]);
    $cityImage->tags()->attach($cityTag);

    // 4. Request image list without query
    $response = $this->getJson('/api/images');
    $response->assertStatus(200);
    // There should be 2 images returned
    $response->assertJsonCount(2, 'data');

    // 5. Request image list with query "nature"
    $response = $this->getJson('/api/images?query=nature');
    $response->assertStatus(200);
    // Only natureImage should be returned
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.title', 'A beautiful forest');

    // 5b. Request image list with uppercase query "NATURE"
    $response = $this->getJson('/api/images?query=NATURE');
    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');

    // 6. Request image list with query "City"
    $response = $this->getJson('/api/images?query=City');
    $response->assertStatus(200);
    // Only cityImage should be returned
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.title', 'New York Skyline');

    // 6b. Request image list with lowercase query "city"
    $response = $this->getJson('/api/images?query=city');
    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');

    // 7. Request image list with query that matches nothing
    $response = $this->getJson('/api/images?query=ocean');
    $response->assertStatus(200);
    $response->assertJsonCount(0, 'data');
});
