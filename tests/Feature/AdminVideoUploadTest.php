<?php

use App\Enums\VideoProvider;
use App\Enums\VideoStatus;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Models\User;
use App\Models\Video;
use App\Support\DiskPath;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from video upload to login', function () {
    $response = $this->get(route('video.upload'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can view video upload page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('video.upload'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/video/upload')
            ->has('categories')
            ->has('subCategories')
            ->has('tags')
        );
});

test('validation errors when video file is missing', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('video.upload.store'), [
        'title' => 'My Video Without File',
    ]);

    $response->assertSessionHasErrors(['video']);
});

test('authenticated user can manually upload a video with thumbnail and categories', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Nature', 'slug' => 'nature-test', 'user_id' => $user->id]);
    $subCategory = SubCategory::create(['name' => 'Forest', 'slug' => 'forest-test', 'category_id' => $category->id, 'user_id' => $user->id]);
    $tag = Tag::create(['name' => 'Drone', 'slug' => 'drone-test', 'status' => true]);

    $videoFile = UploadedFile::fake()->create('epic_forest_drone.mp4', 2048, 'video/mp4');
    $thumbFile = UploadedFile::fake()->image('forest_thumb.jpg', 640, 360);

    $response = $this->actingAs($user)->post(route('video.upload.store'), [
        'video' => $videoFile,
        'title' => 'Epic Forest Drone View',
        'thumbnail' => $thumbFile,
        'duration' => 45,
        'width' => 1920,
        'height' => 1080,
        'video_quality' => '1080p',
        'category_ids' => [$category->id],
        'sub_category_ids' => [$subCategory->id],
        'tag_ids' => [$tag->id],
        'new_tags' => 'Scenic, 4K Footage',
    ]);

    $response->assertRedirect(route('video.index'));
    $response->assertSessionHas('success');

    $video = Video::where('title', 'Epic Forest Drone View')->first();
    expect($video)->not->toBeNull();
    expect($video->povider)->toBe(VideoProvider::MANUAL);
    expect($video->status)->toBe(VideoStatus::DONE);
    expect($video->duration)->toBe(45);
    expect($video->width)->toBe('1920');
    expect($video->height)->toBe('1080');
    expect($video->video_quality)->toBe('1080p');
    expect($video->file_name)->toBe('epic_forest_drone.mp4');
    expect(str_starts_with($video->file_path, 'videos/'))->toBeTrue();
    expect(str_starts_with($video->thumbnail, 'thumbnails/'))->toBeTrue();

    // Check relations
    expect($video->categories->pluck('id')->toArray())->toContain($category->id);
    expect($video->subCategories->pluck('id')->toArray())->toContain($subCategory->id);
    expect($video->tags->pluck('id')->toArray())->toContain($tag->id);

    // Check new tags were created and attached
    $newTag = Tag::where('name', 'Scenic')->first();
    expect($newTag)->not->toBeNull();
    expect($video->tags->pluck('id')->toArray())->toContain($newTag->id);

    // Clean up created test files
    if ($video->file_path) {
        DiskPath::deleteFile($video->file_path);
    }
    if ($video->thumbnail) {
        DiskPath::deleteFile($video->thumbnail);
    }
    $video->delete();
    $subCategory->delete();
    $category->delete();
    $tag->delete();
    if ($newTag) {
        $newTag->delete();
    }
    $user->delete();
});
