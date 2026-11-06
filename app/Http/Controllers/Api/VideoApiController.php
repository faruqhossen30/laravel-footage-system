<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Models\Video;
use App\Services\FootageSearchService;
use App\Support\DiskPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VideoApiController extends Controller
{
    public function storeStoryBlocksVideo(Request $request)
    {

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'assetId' => ['required', 'string'],
            'file_name' => ['required', 'string'],
            'file_path' => ['required', 'string'],
            'keywords' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'string'],
            'duration' => ['nullable', 'integer'],
            'video_quality' => ['nullable', 'string'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'subcategory_ids' => ['nullable', 'array'],
            'subcategory_ids.*' => ['integer', 'exists:sub_categories,id'],
        ]);

        $keywords = array_filter(array_unique(array_map(function ($t) {
            return trim($t);
        }, explode(',', $validated['keywords'] ?? ''))));

        // Find existing video by provider and provider_id; create if not found
        $targetVideo = Video::where('povider_id', $validated['assetId'])
            ->first();

        if (! $targetVideo) {
            $targetVideo = Video::create([
                'title' => $validated['title'],
                'povider' => 'storyblocks',
                'povider_id' => $validated['assetId'],
                'file_name' => $validated['file_name'],
                'file_path' => 'videos/'.$validated['file_name'],
                'thumbnail' => $validated['thumbnail'] ?? null,
                'width' => null,
                'height' => null,
                'size' => null,
                'duration' => $validated['duration'] ?? null,
                'video_quality' => $validated['video_quality'] ?? null,
            ]);
        }

        $tagIds = [];
        foreach ($keywords as $name) {
            if ($name === '') {
                continue;
            }

            $existingByName = Tag::where('name', $name)->first();
            if ($existingByName) {
                $tagIds[] = $existingByName->id;

                continue;
            }

            $baseSlug = Str::slug($name);
            $slug = $baseSlug;
            $i = 1;
            while (Tag::where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$i;
                $i++;
            }

            $tag = Tag::create([
                'name' => $name,
                'slug' => $slug,
                'status' => true,
            ]);
            $tagIds[] = $tag->id;
        }

        if (! empty($tagIds)) {
            $targetVideo->tags()->syncWithoutDetaching($tagIds);
        }

        if (array_key_exists('category_ids', $validated)) {
            $targetVideo->categories()->syncWithoutDetaching($validated['category_ids'] ?? []);
        }

        $categoryIds = $validated['category_ids'] ?? [];
        $requestedSubIds = $validated['subcategory_ids'] ?? [];
        $allowedSubIds = [];
        if (! empty($requestedSubIds)) {
            $allowedSubIds = SubCategory::query()
                ->whereIn('id', $requestedSubIds)
                ->when(! empty($categoryIds), function ($q) use ($categoryIds) {
                    $q->whereIn('category_id', $categoryIds);
                })
                ->pluck('id')
                ->all();
        }
        if (! empty($allowedSubIds)) {
            $targetVideo->subCategories()->syncWithoutDetaching($allowedSubIds);
        }

        return $request->all();
    }

    public function checkVideo(Request $request)
    {
        $video = Video::with(['categories:id,name', 'subCategories:id,name'])->firstWhere('povider_id', $request->id);

        $file_exist = false;

        if ($video && $video->file_path) {
            $file_path = DiskPath::resolve($video->file_path);
            $file_exist = $file_path ? file_exists($file_path) : false;
        }

        return response()->json([
            'video_exist' => (bool) $video,
            'file_exist' => $file_exist,
            'video' => $video,
        ]);
    }

    public function getVideosLinksAndDuration(Request $request, FootageSearchService $footageSearchService): JsonResponse
    {
        $queries = $request->input('queries');
        if (is_string($queries)) {
            $queries = array_values(array_filter(array_map('trim', explode(',', $queries))));
        }

        $allowFallback = $request->has('fallback')
            ? $request->boolean('fallback')
            : empty($queries);

        $data = $footageSearchService->searchVideos([
            'ids' => $request->input('ids'),
            'queries' => is_array($queries) ? $queries : null,
            'search' => $request->input('search'),
            'query' => $request->input('query'),
            'category' => $request->input('category'),
            'sub_category' => $request->input('sub_category'),
            'min_duration' => $request->input('min_duration'),
            'limit' => $request->integer('limit', 5),
            'allow_fallback' => $allowFallback,
        ]);

        return response()->json($data);
    }

    public function taxonomy(Request $request, FootageSearchService $footageSearchService): JsonResponse
    {
        return response()->json(
            $footageSearchService->getTaxonomy($request->integer('tag_limit', 100))
        );
    }
}
