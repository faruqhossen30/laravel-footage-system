<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $search = null;
        if ($request->has('search') && $request->filled('search')) {
            $search = trim($request->get('search'));
        } elseif ($request->has('query') && $request->filled('query')) {
            $search = trim($request->get('query'));
        }

        $per_page = 10;
        if ($request->has('show')) {
            $per_page = (int) $request->get('show');
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

        if ($request->has('category')) {
            $categorySlug = $request->get('category');
            $videos->whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->has('subcategory')) {
            $subCategorySlug = $request->get('subcategory');
            $videos->whereHas('subCategories', function ($q) use ($subCategorySlug) {
                $q->where('slug', $subCategorySlug);
            });
        }

        if ($request->has('tag')) {
            $tagSlug = $request->get('tag');
            $videos->whereHas('tags', function ($q) use ($tagSlug) {
                $q->where('slug', $tagSlug);
            });
        }

        $videos = $videos->with(['tags', 'categories', 'subCategories'])->paginate($per_page)->appends($request->query());

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
            ->limit(20)
            ->get();

        return Inertia::render('search-page', [
            'videos' => $videos,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => array_merge(
                $request->only(['show', 'order', 'category', 'subcategory', 'tag']),
                ['search' => $search]
            ),
        ]);
    }
}
