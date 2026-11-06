<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\DownloadImage;
use App\Models\Image;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Services\FootageSearchService;
use App\Support\DiskPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageApiController extends Controller
{
    public function storePixabayImage(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'assetId' => ['required', 'string'],
            'file_name' => ['required', 'string'], // remote url
            'file_path' => ['required', 'string'], // default path
            'keywords' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'string'],
            'width' => ['nullable', 'integer'],
            'height' => ['nullable', 'integer'],
            'size' => ['nullable', 'numeric'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'subcategory_ids' => ['nullable', 'array'],
            'subcategory_ids.*' => ['integer', 'exists:sub_categories,id'],
        ]);

        $keywords = array_filter(array_unique(array_map(function ($t) {
            return trim($t);
        }, explode(',', $validated['keywords'] ?? ''))));

        $targetImage = Image::where('provider_id', $validated['assetId'])->first();

        if (! $targetImage) {
            $targetImage = Image::create([
                'title' => $validated['title'],
                'provider' => 'pixabay',
                'provider_id' => $validated['assetId'],
                'file_name' => $validated['file_name'],
                'file_path' => 'images/'.basename(parse_url($validated['file_name'], PHP_URL_PATH) ?? '') ?: ('image_'.$validated['assetId'].'.jpg'),
                'thumbnail' => $validated['thumbnail'] ?? null,
                'width' => $validated['width'] ?? null,
                'height' => $validated['height'] ?? null,
                'size' => $validated['size'] ?? null,
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

        if (array_key_exists('category_ids', $validated)) {
            $targetImage->categories()->syncWithoutDetaching($validated['category_ids'] ?? []);
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
            $targetImage->subCategories()->syncWithoutDetaching($allowedSubIds);
        }

        // Dispatch job to download image
        DownloadImage::dispatch($targetImage->id);

        return response()->json(['message' => 'Image stored and download job dispatched.', 'image' => $targetImage]);
    }

    public function checkImage(Request $request)
    {
        $image = Image::with(['categories:id,name', 'subCategories:id,name'])->firstWhere('provider_id', $request->id);

        $file_exist = false;

        if ($image && $image->file_path) {
            $file_path = DiskPath::root() !== ''
                ? DiskPath::resolve($image->file_path)
                : Storage::disk('public')->path($image->file_path);
            $file_exist = $file_path ? file_exists($file_path) : false;
        }

        return response()->json([
            'image_exist' => (bool) $image,
            'file_exist' => $file_exist,
            'image' => $image,
        ]);
    }

    public function getImagesLinksAndSize(Request $request, FootageSearchService $footageSearchService): JsonResponse
    {
        $queries = $request->input('queries');
        if (is_string($queries)) {
            $queries = array_values(array_filter(array_map('trim', explode(',', $queries))));
        }

        $allowFallback = $request->has('fallback')
            ? $request->boolean('fallback')
            : empty($queries);

        $data = $footageSearchService->searchImages([
            'ids' => $request->input('ids'),
            'queries' => is_array($queries) ? $queries : null,
            'search' => $request->input('search'),
            'query' => $request->input('query'),
            'category' => $request->input('category'),
            'sub_category' => $request->input('sub_category'),
            'limit' => $request->integer('limit', 5),
            'allow_fallback' => $allowFallback,
        ]);

        return response()->json($data);
    }
}
