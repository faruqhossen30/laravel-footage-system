<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DownloadVideo;
use App\Models\Category;
use App\Models\Tag;
use App\Models\SubCategory;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $query = Video::with([
            'categories:id,name',
            'subCategories:id,name,category_id',
            'tags:id,name',
        ]);

        $order = $request->string('order')->toString();
        $categoryId = $request->input('category_id');
        $subCategoryId = $request->input('sub_category_id');

        if (! empty($categoryId)) {
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }
        if (! empty($subCategoryId)) {
            $query->whereHas('subCategories', function ($q) use ($subCategoryId) {
                $q->where('sub_categories.id', $subCategoryId);
            });
        }

        if ($order === 'old') {
            $query->oldest('id');
        } else {
            $query->latest('id');
        }

        $videos = $query->paginate(10)->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);
        $subCategories = SubCategory::orderBy('name')->get(['id', 'name', 'category_id']);

        return Inertia::render('admin/video/index', [
            'videos' => $videos,
            'categories' => $categories,
            'subCategories' => $subCategories,
            'filters' => [
                'order' => $order ?: 'latest',
                'category_id' => $categoryId,
                'sub_category_id' => $subCategoryId,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $per_page = null;
        if (isset($_GET['per_page']) && $_GET['per_page']) {
            $per_page = $_GET['per_page'];
        }

        $page = null;
        if (isset($_GET['page']) && $_GET['page']) {
            $page = $_GET['page'];
        }

        $order = null;
        if (isset($_GET['order']) && $_GET['order']) {
            $order = $_GET['order'];
        }


        $search = null;
        if (isset($_GET['search']) && $_GET['search']) {
            $search = $_GET['search'];
        }

        $provider = null;
        if (isset($_GET['provider']) && $_GET['provider']) {
            $provider = $_GET['provider'];
        }

        $key = env('PIXABAY_API_KEY');
        $query = $search;

        $params = [
            'key' => $key,
            'q' => $search,
            'order' => $order ?? 'popular',
            'page' => $page ?? 1,
            'per_page' => $per_page ?? 10,
        ];

        $queryParams = http_build_query($params);
        $url = "https://pixabay.com/api/videos/?{$queryParams}";
        $response = Http::get($url);
        $data = $response->json();

        $data['hits'];
        $ids = collect($data['hits'])->pluck('id')->toArray();

        $existIds = Video::whereIn('povider_id', $ids)->pluck('povider_id')->toArray();

        // return $data;


        return Inertia::render(
            'admin/video/pixabay-videos',
            [
                'items' => $data['hits'],
                'existIds' => $existIds,
                'totalHits' => $data['totalHits'],
            ]
        );
    }

    public function pixabayStore(Request $request)
    {
        $provider = 'pixabay';
        $videos = $request->videos;

        foreach ($videos as $video) {
            $keywords = array_filter(array_unique(array_map(function ($t) {
                return trim($t);
            }, explode(',', $video['tags']))));

            // Find existing video by provider and provider_id; create if not found
            $targetVideo = Video::where('povider', $provider)
                ->where('povider_id', $video['id'])
                ->first();

            if (! $targetVideo) {
                $targetVideo = Video::create([
                    'povider' => $provider,
                    'povider_id' => $video['id'],
                    'file_name' => $video['url'],
                    'thumbnail' => $video['thumbnail'],
                    'width' => $video['width'],
                    'height' => $video['height'],
                    'size' => $video['size'] ?? null,
                    'duration' => $video['duration'] ?? null,
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
        }

        return  to_route('video.index');
    }

    public function store(Request $request) {}

    public function edit(Video $video)
    {
        $allCategories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $allSubCategories = SubCategory::orderBy('name')->get(['id', 'name', 'slug', 'category_id']);
        $allTags = Tag::orderBy('name')->get(['id', 'name', 'slug']);

        $selectedCategoryIds = $video->categories()->pluck('categories.id');
        $selectedSubCategoryIds = $video->subCategories()->pluck('sub_categories.id');
        $selectedTagIds = $video->tags()->pluck('tags.id');

        return Inertia::render('admin/video/edit', [
            'video' => $video,
            'tags' => $allTags,
            'categories' => $allCategories,
            'subCategories' => $allSubCategories,
            'selectedCategoryIds' => $selectedCategoryIds,
            'selectedSubCategoryIds' => $selectedSubCategoryIds,
            'selectedTagIds' => $selectedTagIds,
        ]);
    }

    public function update(Request $request, Video $video)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'tag_ids' => ['array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            'category_ids' => ['array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'sub_category_ids' => ['array'],
            'sub_category_ids.*' => ['integer', 'exists:sub_categories,id'],
        ]);

        if (array_key_exists('title', $validated)) {
            $video->title = $validated['title'];
        }
        $video->save();

        $video->tags()->sync($validated['tag_ids'] ?? []);
        $video->categories()->sync($validated['category_ids'] ?? []);
        $categoryIds = $validated['category_ids'] ?? [];
        $requestedSubIds = $validated['sub_category_ids'] ?? [];
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
        $video->subCategories()->sync($allowedSubIds);

        return redirect()->route('video.index')->with('success', 'Video updated successfully.');
    }

    /**
     * Enqueue pending video downloads to queue and return a JSON response.
     */
    public function enqueueDownloads(Request $request)
    {
        // Reset the stop flag so downloads can proceed
        \Illuminate\Support\Facades\Cache::forget('stop_video_downloads');

        $videos = Video::query()
            ->where('status', 'list')
            ->orderBy('id')
            ->get();

        if ($videos->isEmpty()) {
            return back()->with('success', 'No pending videos to enqueue.');
        }

        $jobs = [];
        foreach ($videos as $video) {
            $jobs[] = new DownloadVideo($video->id);
        }

        Bus::chain($jobs)->dispatch();

        return back()->with('success', 'Enqueued ' . count($jobs) . ' video downloads.');
    }

    /**
     * Stop all pending downloads and clear the queue.
     */
    public function stopDownloads()
    {
        // Set a flag to stop any running chains
        \Illuminate\Support\Facades\Cache::forever('stop_video_downloads', true);

        // Clear the jobs table (assuming database driver)
        \Illuminate\Support\Facades\DB::table('jobs')->delete();

        // Reset 'run' status videos back to 'list' so they can be re-queued later
        Video::where('status', 'run')->update(['status' => 'list']);

        return back()->with('success', 'All downloads stopped and queue cleared.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Video::where('id', $id)->delete();

        return redirect()->route('video.index');
    }
}
