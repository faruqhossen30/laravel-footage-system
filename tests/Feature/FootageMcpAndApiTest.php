<?php

use App\Mcp\Servers\FootageServer;
use App\Mcp\Tools\GetGalleryTaxonomyTool;
use App\Mcp\Tools\SearchImagesTool;
use App\Mcp\Tools\SearchVideosTool;
use App\Models\Category;
use App\Models\Image;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Models\User;
use App\Models\Video;

test('footage endpoint respects fallback=0 when no videos match', function () {
    Video::create([
        'title' => 'Random City Traffic',
        'file_name' => 'traffic.mp4',
        'file_path' => 'videos/traffic.mp4',
        'duration' => 12,
    ]);

    $response = $this->getJson('/api/footage?search=spinach&fallback=0');

    $response->assertSuccessful();
    $response->assertJsonCount(0);
});

test('footage endpoint tries candidate queries in priority order and ranks by relevance', function () {
    $healthTag = Tag::create([
        'name' => 'heart health',
        'slug' => 'heart-health',
        'status' => true,
    ]);

    $spinachTag = Tag::create([
        'name' => 'spinach',
        'slug' => 'spinach',
        'status' => true,
    ]);

    $spinachVideo = Video::create([
        'title' => 'Fresh Organic Spinach Leaves',
        'file_name' => 'spinach.mp4',
        'file_path' => 'videos/spinach.mp4',
        'duration' => 15,
    ]);
    $spinachVideo->tags()->attach([$spinachTag->id, $healthTag->id]);

    $generalHealthVideo = Video::create([
        'title' => 'Morning Cardio Exercise',
        'file_name' => 'cardio.mp4',
        'file_path' => 'videos/cardio.mp4',
        'duration' => 10,
    ]);
    $generalHealthVideo->tags()->attach([$healthTag->id]);

    $response = $this->getJson('/api/footage?queries[]=nonexistent_keyword&queries[]=spinach');

    $response->assertSuccessful();
    $response->assertJsonCount(1);
    $response->assertJsonPath('0.title', 'Fresh Organic Spinach Leaves');
    $response->assertJsonPath('0.matched_query', 'spinach');
    $response->assertJsonPath('0.is_fallback', false);
});

test('mcp server tools search videos, images, and return gallery taxonomy', function () {
    $user = User::factory()->create();

    $category = Category::create([
        'name' => 'Nutrition',
        'slug' => 'nutrition',
        'user_id' => $user->id,
        'status' => true,
    ]);

    $subCategory = SubCategory::create([
        'category_id' => $category->id,
        'name' => 'Leafy Greens',
        'slug' => 'leafy-greens',
        'user_id' => $user->id,
        'status' => true,
    ]);

    $tag = Tag::create([
        'name' => 'avocado',
        'slug' => 'avocado',
        'status' => true,
    ]);

    $video = Video::create([
        'title' => 'Sliced Avocado on Wooden Board',
        'file_name' => 'avocado.mp4',
        'file_path' => 'videos/avocado.mp4',
        'duration' => 18,
    ]);
    $video->categories()->attach($category->id);
    $video->subCategories()->attach($subCategory->id);
    $video->tags()->attach($tag->id);

    $image = Image::create([
        'title' => 'Fresh Avocado Photo',
        'file_name' => 'avocado.jpg',
        'file_path' => 'images/avocado.jpg',
        'width' => 1920,
        'height' => 1080,
    ]);
    $image->categories()->attach($category->id);
    $image->tags()->attach($tag->id);

    // 1. Test GetGalleryTaxonomyTool via MCP Server
    $taxonomyResponse = FootageServer::tool(GetGalleryTaxonomyTool::class, [
        'tag_limit' => 10,
    ]);
    $taxonomyResponse->assertOk();
    $taxonomyResponse->assertSee('Nutrition');
    $taxonomyResponse->assertSee('Leafy Greens');
    $taxonomyResponse->assertSee('avocado');

    // 2. Test SearchVideosTool via MCP Server with multi-query fallback
    $videoToolResponse = FootageServer::tool(SearchVideosTool::class, [
        'queries' => ['unknown_fruit_xyz', 'avocado'],
        'min_duration' => 10,
        'limit' => 5,
    ]);
    $videoToolResponse->assertOk();
    $videoToolResponse->assertSee('Sliced Avocado on Wooden Board');

    // 3. Test SearchImagesTool via MCP Server
    $imageToolResponse = FootageServer::tool(SearchImagesTool::class, [
        'queries' => ['unknown_photo_xyz', 'avocado'],
        'limit' => 5,
    ]);
    $imageToolResponse->assertOk();
    $imageToolResponse->assertSee('Fresh Avocado Photo');

    // 4. Test HTTP JSON-RPC endpoint for MCP Server (/api/mcp/footage)
    $rpcResponse = $this->postJson('/api/mcp/footage', [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'tools/call',
        'params' => [
            'name' => 'search_videos',
            'arguments' => [
                'queries' => ['missing_kw', 'avocado'],
                'limit' => 3,
            ],
        ],
    ]);

    $rpcResponse->assertSuccessful();
    $rpcResponse->assertJsonPath('result.isError', false);
});
