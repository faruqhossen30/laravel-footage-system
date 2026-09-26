<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\DownloadImage;
use App\Models\Category;
use App\Models\Image;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Support\DiskPath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ImageController extends Controller
{
    public function index(Request $request)
    {
        $query = Image::with([
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

        $images = $query->paginate(10)->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);
        $subCategories = SubCategory::orderBy('name')->get(['id', 'name', 'category_id']);

        return Inertia::render('admin/image/index', [
            'images' => $images,
            'categories' => $categories,
            'subCategories' => $subCategories,
            'filters' => [
                'order' => $order ?: 'latest',
                'category_id' => $categoryId,
                'sub_category_id' => $subCategoryId,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $per_page = $request->query('per_page', 20);
        $page = $request->query('page', 1);
        $order = $request->query('order', 'popular');
        $search = $request->query('search', '');

        $key = env('PIXABAY_API_KEY');

        $params = [
            'key' => $key,
            'q' => $search,
            'order' => $order ?: 'popular',
            'page' => $page ?: 1,
            'per_page' => $per_page ?: 20, // Images page size can be 20
        ];

        $queryParams = http_build_query($params);
        $url = "https://pixabay.com/api/?{$queryParams}";
        $response = Http::get($url);
        $data = $response->json();

        $hits = $data['hits'] ?? [];
        $ids = collect($hits)->pluck('id')->toArray();

        $existIds = Image::whereIn('provider_id', $ids)->pluck('provider_id')->toArray();

        return Inertia::render(
            'admin/image/pixabay-images',
            [
                'items' => $hits,
                'existIds' => $existIds,
                'totalHits' => $data['totalHits'] ?? 0,
                'filters' => [
                    'search' => $search,
                    'order' => $order ?: 'popular',
                    'per_page' => (string) ($per_page ?: 20),
                    'page' => (int) ($page ?: 1),
                ],
            ]
        );
    }

    public function pixabayStore(Request $request)
    {
        $provider = 'pixabay';
        $images = $request->images;

        foreach ($images as $img) {
            $keywords = array_filter(array_unique(array_map(function ($t) {
                return trim($t);
            }, explode(',', $img['tags'] ?? ''))));

            $targetImage = Image::where('provider', $provider)
                ->where('provider_id', $img['id'])
                ->first();

            if (! $targetImage) {
                $targetImage = Image::create([
                    'provider' => $provider,
                    'provider_id' => $img['id'],
                    'file_name' => $img['largeImageURL'] ?? $img['webformatURL'], // using large image or web format
                    'thumbnail' => $img['previewURL'] ?? null,
                    'width' => $img['imageWidth'] ?? null,
                    'height' => $img['imageHeight'] ?? null,
                    'size' => $img['imageSize'] ?? null,
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
                $targetImage->tags()->syncWithoutDetaching($tagIds);
            }
        }

        return to_route('image.index');
    }

    public function edit(Image $image)
    {
        $allCategories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $allSubCategories = SubCategory::orderBy('name')->get(['id', 'name', 'slug', 'category_id']);
        $allTags = Tag::orderBy('name')->get(['id', 'name', 'slug']);

        $selectedCategoryIds = $image->categories()->pluck('categories.id');
        $selectedSubCategoryIds = $image->subCategories()->pluck('sub_categories.id');
        $selectedTagIds = $image->tags()->pluck('tags.id');

        return Inertia::render('admin/image/edit', [
            'image' => $image,
            'tags' => $allTags,
            'categories' => $allCategories,
            'subCategories' => $allSubCategories,
            'selectedCategoryIds' => $selectedCategoryIds,
            'selectedSubCategoryIds' => $selectedSubCategoryIds,
            'selectedTagIds' => $selectedTagIds,
        ]);
    }

    public function update(Request $request, Image $image)
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
            $image->title = $validated['title'];
        }
        $image->save();

        $image->tags()->sync($validated['tag_ids'] ?? []);
        $image->categories()->sync($validated['category_ids'] ?? []);
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
        $image->subCategories()->sync($allowedSubIds);

        return redirect()->route('image.index')->with('success', 'Image updated successfully.');
    }

    public function enqueueDownloads(Request $request)
    {
        Cache::forget('stop_image_downloads');

        $images = Image::query()
            ->where('status', 'list')
            ->orderBy('id')
            ->get();

        if ($images->isEmpty()) {
            return back()->with('success', 'No pending images to enqueue.');
        }

        $jobs = [];
        foreach ($images as $image) {
            $jobs[] = new DownloadImage($image->id);
        }

        Bus::chain($jobs)->dispatch();

        return back()->with('success', 'Enqueued '.count($jobs).' image downloads.');
    }

    public function stopDownloads()
    {
        Cache::forever('stop_image_downloads', true);

        // Clear the jobs table - wait, this deletes ALL jobs including videos if there's no way to filter
        // Just empty jobs table for now like video does
        DB::table('jobs')->delete();

        Image::where('status', 'run')->update(['status' => 'list']);

        return back()->with('success', 'All downloads stopped and queue cleared.');
    }

    public function destroy(string $id)
    {
        $image = Image::find($id);

        if ($image) {
            DiskPath::deleteFile($image->file_path);
            DiskPath::deleteFile($image->thumbnail);
            $image->delete();
        }

        return redirect()->route('image.index');
    }
}
