<?php

use App\Models\Tag;
use App\Models\Video;

test('videos can be searched by tag name', function () {
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

    // 3. Create videos
    $natureVideo = Video::create([
        'title' => 'A beautiful forest',
        'file_name' => 'forest.mp4',
    ]);
    $natureVideo->tags()->attach($natureTag);

    $cityVideo = Video::create([
        'title' => 'New York Skyline',
        'file_name' => 'nyc.mp4',
    ]);
    $cityVideo->tags()->attach($cityTag);

    // 4. Request video list without query
    $response = $this->getJson('/api/videos');
    $response->assertStatus(200);
    // There should be 2 videos returned
    $response->assertJsonCount(2, 'data');

    // 5. Request video list with query "nature"
    $response = $this->getJson('/api/videos?query=nature');
    $response->assertStatus(200);
    // Only natureVideo should be returned
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.title', 'A beautiful forest');

    // 5b. Request video list with uppercase query "NATURE"
    $response = $this->getJson('/api/videos?query=NATURE');
    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');

    // 6. Request video list with query "City"
    $response = $this->getJson('/api/videos?query=City');
    $response->assertStatus(200);
    // Only cityVideo should be returned
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.title', 'New York Skyline');

    // 6b. Request video list with lowercase query "city"
    $response = $this->getJson('/api/videos?query=city');
    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');

    // 7. Request video list with query that matches nothing
    $response = $this->getJson('/api/videos?query=ocean');
    $response->assertStatus(200);
    $response->assertJsonCount(0, 'data');
});
