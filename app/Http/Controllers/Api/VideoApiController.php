<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
                'povider'    => 'storyblocks',
                'povider_id' => $validated['assetId'],
                'file_name'  => $validated['file_name'],
                'file_path'  => 'videos/' . $validated['file_name'],
                'thumbnail'  => $validated['thumbnail'] ?? null,
                'width'      => null,
                'height'     => null,
                'size'       => null,
                'duration'   => $validated['duration'] ?? null,
                'video_quality'   => $validated['video_quality'] ?? null,
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
                $slug = $baseSlug . '-' . $i;
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
            $file_path = env('DISK_FILE_LOCATION') . $video->file_path;
            $file_exist = file_exists($file_path);
        }

        return response()->json([
            'video_exist' => (bool) $video,
            'file_exist' => $file_exist,
            'video' =>  $video
        ]);
    }

    public function getVideosLinksAndDuration(Request $request)
    {
        $query = Video::query();

        // 1. Filter by specific IDs if provided
        $hasIds = false;
        if ($request->has('ids')) {
            $ids = $request->get('ids');
            if (is_string($ids)) {
                $ids = array_filter(explode(',', $ids));
            }
            if (is_array($ids) && !empty($ids)) {
                $query->whereIn('id', $ids);
                $hasIds = true;
            }
        }

        // 2. Search by keyword/title/tags if provided
        $search = null;
        if ($request->has('search')) {
            $search = trim($request->get('search'));
        } elseif ($request->has('query')) {
            $search = trim($request->get('query'));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('tags', function ($tagsQuery) use ($search) {
                        $terms = array_filter(explode(' ', $search));
                        $tagsQuery->where(function ($subQ) use ($terms) {
                            foreach ($terms as $term) {
                                $subQ->orWhere('name', 'like', "%{$term}%");
                            }
                        });
                    });
            });
        }

        // 3. Retrieve videos (limit only when no ids query is provided)
        if (!$hasIds) {
            $limit = $request->integer('limit', 5);
            $query->limit($limit);
        }

        $videos = $query->get();
        if (!count($videos)) {
            $videos = Video::inRandomOrder()->limit(3)->get();
        }

        // 4. Map response to return ID, title, video link (local path), and duration
        $diskLocation = env('DISK_FILE_LOCATION', '');
        $data = $videos->map(function ($video) use ($diskLocation) {
            return [
                'id' => $video->id,
                'title' => $video->title,
                'video_link' => $video->file_path ? ($diskLocation . $video->file_path) : null,
                'duration' => $video->duration,
            ];
        });

        return response()->json($data);
    }
}
