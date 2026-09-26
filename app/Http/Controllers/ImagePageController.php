<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Image;
use App\Models\Tag;
use App\Support\DiskPath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ImagePageController extends Controller
{
    public function index(Request $request): Response
    {
        $search = null;
        if ($request->has('search')) {
            $search = trim($request->get('search'));
        }

        $perPage = 12;
        if ($request->has('show')) {
            $perPage = (int) $request->get('show');
        }

        $order = $request->get('order', 'desc') === 'asc' ? 'asc' : 'desc';

        $images = Image::query()->orderBy('id', $order);

        if ($search) {
            $likeOperator = DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

            $images->where(function ($query) use ($search, $likeOperator) {
                $query->where('title', $likeOperator, "%{$search}%")
                    ->orWhereHas('tags', function ($tagsQuery) use ($search, $likeOperator) {
                        $terms = array_filter(explode(' ', $search));
                        $tagsQuery->where(function ($q) use ($terms, $likeOperator) {
                            foreach ($terms as $term) {
                                $q->orWhere('name', $likeOperator, "%{$term}%");
                            }
                        });
                    });
            });
        }

        if ($request->has('category') && $request->filled('category')) {
            $categorySlug = $request->get('category');
            $images->whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->has('subcategory') && $request->filled('subcategory')) {
            $subCategorySlug = $request->get('subcategory');
            $images->whereHas('subCategories', function ($q) use ($subCategorySlug) {
                $q->where('slug', $subCategorySlug);
            });
        }

        if ($request->has('tag') && $request->filled('tag')) {
            $tagSlug = $request->get('tag');
            $images->whereHas('tags', function ($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        $images = $images->with(['tags', 'categories', 'subCategories'])
            ->paginate($perPage)
            ->appends($request->query());

        $categories = Category::with([
            'subCategories' => function ($query) {
                $query->where('status', true)->withCount('images');
            },
        ])
            ->withCount('images')
            ->where('status', true)
            ->get();

        $tags = Tag::where('status', true)
            ->withCount('images')
            ->orderByDesc('images_count')
            ->limit(20)
            ->get();

        return Inertia::render('images-page', [
            'images' => $images,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => $request->only(['search', 'show', 'order', 'category', 'subcategory', 'tag']),
            'disk_file_location' => DiskPath::root(),
        ]);
    }
}
