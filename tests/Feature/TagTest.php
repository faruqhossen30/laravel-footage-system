<?php

use App\Models\Tag;
use App\Models\User;

test('guests are redirected from tags index to login', function () {
    $response = $this->get(route('tag.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit tags index and view tags', function () {
    $user = User::factory()->create();
    Tag::create([
        'name' => 'Nature Video',
        'slug' => 'nature-video',
        'status' => true,
    ]);

    $response = $this->actingAs($user)->get(route('tag.index'));

    $response->assertOk();
});

test('authenticated users can create a new tag', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('tag.store'), [
        'name' => 'Technology',
        'status' => true,
    ]);

    $response->assertRedirect(route('tag.index'));
    $this->assertDatabaseHas('tags', [
        'name' => 'Technology',
        'slug' => 'technology',
    ]);
});

test('authenticated users can update a tag', function () {
    $user = User::factory()->create();
    $tag = Tag::create([
        'name' => 'Old Tag',
        'slug' => 'old-tag',
        'status' => true,
    ]);

    $response = $this->actingAs($user)->put(route('tag.update', $tag->id), [
        'name' => 'Updated Tag',
        'status' => false,
    ]);

    $response->assertRedirect(route('tag.index'));
    $this->assertDatabaseHas('tags', [
        'id' => $tag->id,
        'name' => 'Updated Tag',
        'slug' => 'updated-tag',
        'status' => 0,
    ]);
});

test('authenticated users can delete a tag', function () {
    $user = User::factory()->create();
    $tag = Tag::create([
        'name' => 'To Delete',
        'slug' => 'to-delete',
        'status' => true,
    ]);

    $response = $this->actingAs($user)->delete(route('tag.destroy', $tag->id));

    $response->assertRedirect(route('tag.index'));
    $this->assertDatabaseMissing('tags', [
        'id' => $tag->id,
    ]);
});
