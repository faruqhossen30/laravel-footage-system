<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\DownloadImage;
use App\Models\Image;
use App\Models\SubCategory;
use App\Models\Tag;
use Illuminate\Http\Request;
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
            $file_path = env('DISK_FILE_LOCATION') ? (env('DISK_FILE_LOCATION').$image->file_path) : Storage::disk('public')->path($image->file_path);
            $file_exist = file_exists($file_path);
        }

        return response()->json([
            'image_exist' => (bool) $image,
            'file_exist' => $file_exist,
            'image' => $image,
        ]);
    }

    public function getImagesLinksAndSize(Request $request)
    {
        $query = Image::query();

        $hasIds = false;
        if ($request->has('ids')) {
            $ids = $request->get('ids');
            if (is_string($ids)) {
                $ids = array_filter(explode(',', $ids));
            }
            if (is_array($ids) && ! empty($ids)) {
                $query->whereIn('id', $ids);
                $hasIds = true;
            }
        }

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

        if (! $hasIds) {
            $limit = $request->integer('limit', 5);
            $query->limit($limit);
        }

        $images = $query->get();
        if (! count($images)) {
            $images = Image::inRandomOrder()->limit(3)->get();
        }

        $diskLocation = env('DISK_FILE_LOCATION', '');
        $data = $images->map(function ($image) use ($diskLocation) {
            return [
                'id' => $image->id,
                'title' => $image->title,
                'image_link' => $image->file_path ? ($diskLocation ? $diskLocation.$image->file_path : asset('storage/'.$image->file_path)) : null,
                'width' => $image->width,
                'height' => $image->height,
                'size' => $image->size,
            ];
        });

        return response()->json($data);
    }
}
