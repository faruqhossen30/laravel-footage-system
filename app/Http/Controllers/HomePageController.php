<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Video;
use App\Support\DiskPath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HomePageController extends Controller
{
    public function homePage(Request $request): Response
    {
        $search = null;
        if ($request->has('search') && $request->filled('search')) {
            $search = trim($request->get('search'));
        } elseif ($request->has('query') && $request->filled('query')) {
            $search = trim($request->get('query'));
        }

        $perPage = 12;
        if ($request->has('show')) {
            $perPage = (int) $request->get('show');
        }

        $order = $request->get('order', 'desc') === 'asc' ? 'asc' : 'desc';

        $videos = Video::query()->orderBy('id', $order);

        if ($search) {
            $likeOperator = DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

            $videos->where(function ($query) use ($search, $likeOperator) {
                $terms = array_filter(explode(' ', $search));

                $query->where(function ($titleQuery) use ($search, $terms, $likeOperator) {
                    $titleQuery->where('title', $likeOperator, "%{$search}%");
                    foreach ($terms as $term) {
                        $titleQuery->orWhere('title', $likeOperator, "%{$term}%");
                    }
                })->orWhereHas('tags', function ($tagsQuery) use ($terms, $likeOperator) {
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
            $videos->whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->has('subcategory') && $request->filled('subcategory')) {
            $subCategorySlug = $request->get('subcategory');
            $videos->whereHas('subCategories', function ($q) use ($subCategorySlug) {
                $q->where('slug', $subCategorySlug);
            });
        }

        if ($request->has('tag') && $request->filled('tag')) {
            $tagSlug = $request->get('tag');
            $videos->whereHas('tags', function ($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        $videos = $videos->with(['tags', 'categories', 'subCategories'])->paginate($perPage)->appends($request->query());

        $categories = Category::with([
            'subCategories' => function ($query) {
                $query->where('status', true)->withCount('videos');
            },
        ])
            ->withCount('videos')
            ->where('status', true)
            ->get();

        $tags = Tag::where('status', true)
            ->has('videos')
            ->withCount('videos')
            ->orderByDesc('videos_count')
            ->limit(20)
            ->get();

        return Inertia::render('home-page', [
            'videos' => $videos,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => array_merge(
                $request->only(['show', 'order', 'category', 'subcategory', 'tag']),
                ['search' => $search]
            ),
            'disk_file_location' => DiskPath::root(),
        ]);
    }
}
