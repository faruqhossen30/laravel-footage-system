<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Image;
use App\Models\Tag;
use App\Models\Video;
use App\Support\DiskPath;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FootageSearchService
{
    /**
     * Search videos by candidate queries, IDs, duration, and taxonomy filters.
     *
     * @param  array{
     *     ids?: array<int|string>|string|null,
     *     queries?: array<int, string>|null,
     *     search?: string|null,
     *     query?: string|null,
     *     category?: int|string|null,
     *     sub_category?: int|string|null,
     *     min_duration?: int|null,
     *     limit?: int|null,
     *     allow_fallback?: bool|null
     * }  $options
     * @return array<int, array{
     *     id: int,
     *     title: string|null,
     *     video_link: string|null,
     *     duration: int|null,
     *     video_quality: string|null,
     *     width: int|null,
     *     height: int|null,
     *     tags: array<int, string>,
     *     categories: array<int, string>,
     *     sub_categories: array<int, string>,
     *     matched_query: string|null,
     *     is_fallback: bool
     * }>
     */
    public function searchVideos(array $options = []): array
    {
        $limit = max(1, min(50, (int) ($options['limit'] ?? 5)));
        $allowFallback = (bool) ($options['allow_fallback'] ?? false);
        $minDuration = isset($options['min_duration']) ? (int) $options['min_duration'] : null;
        $categoryFilter = $options['category'] ?? null;
        $subCategoryFilter = $options['sub_category'] ?? null;

        $ids = $this->normalizeIds($options['ids'] ?? null);
        if ($ids !== []) {
            $videos = Video::query()
                ->with(['tags:id,name', 'categories:id,name', 'subCategories:id,name'])
                ->whereIn('id', $ids)
                ->get();

            return $this->formatVideos($videos, null, false);
        }

        $candidateQueries = $this->extractCandidateQueries($options);
        $matchedQuery = null;
        $videos = collect();

        if ($candidateQueries !== []) {
            foreach ($candidateQueries as $candidate) {
                $query = Video::query()
                    ->with(['tags:id,name', 'categories:id,name', 'subCategories:id,name']);

                $this->applyVideoFilters($query, $minDuration, $categoryFilter, $subCategoryFilter);
                $this->applyKeywordWhere($query, $candidate);

                $results = $query->limit($limit * 3)->get();

                if ($results->isNotEmpty()) {
                    $videos = $this->rankByRelevance($results, $candidate)->take($limit)->values();
                    $matchedQuery = $candidate;
                    break;
                }
            }
        } else {
            $query = Video::query()
                ->with(['tags:id,name', 'categories:id,name', 'subCategories:id,name']);

            $this->applyVideoFilters($query, $minDuration, $categoryFilter, $subCategoryFilter);
            $videos = $query->limit($limit)->get();
        }

        $isFallback = false;
        if ($videos->isEmpty() && $allowFallback) {
            $videos = Video::query()
                ->with(['tags:id,name', 'categories:id,name', 'subCategories:id,name'])
                ->inRandomOrder()
                ->limit(min($limit, 3))
                ->get();
            $isFallback = true;
        }

        return $this->formatVideos($videos, $matchedQuery, $isFallback);
    }

    /**
     * Search images by candidate queries, IDs, and taxonomy filters.
     *
     * @param  array{
     *     ids?: array<int|string>|string|null,
     *     queries?: array<int, string>|null,
     *     search?: string|null,
     *     query?: string|null,
     *     category?: int|string|null,
     *     sub_category?: int|string|null,
     *     limit?: int|null,
     *     allow_fallback?: bool|null
     * }  $options
     * @return array<int, array{
     *     id: int,
     *     title: string|null,
     *     image_link: string|null,
     *     file_path: string|null,
     *     width: int|null,
     *     height: int|null,
     *     size: float|int|string|null,
     *     tags: array<int, string>,
     *     categories: array<int, string>,
     *     sub_categories: array<int, string>,
     *     matched_query: string|null,
     *     is_fallback: bool
     * }>
     */
    public function searchImages(array $options = []): array
    {
        $limit = max(1, min(50, (int) ($options['limit'] ?? 5)));
        $allowFallback = (bool) ($options['allow_fallback'] ?? false);
        $categoryFilter = $options['category'] ?? null;
        $subCategoryFilter = $options['sub_category'] ?? null;

        $ids = $this->normalizeIds($options['ids'] ?? null);
        if ($ids !== []) {
            $images = Image::query()
                ->with(['tags:id,name', 'categories:id,name', 'subCategories:id,name'])
                ->whereIn('id', $ids)
                ->get();

            return $this->formatImages($images, null, false);
        }

        $candidateQueries = $this->extractCandidateQueries($options);
        $matchedQuery = null;
        $images = collect();

        if ($candidateQueries !== []) {
            foreach ($candidateQueries as $candidate) {
                $query = Image::query()
                    ->with(['tags:id,name', 'categories:id,name', 'subCategories:id,name']);

                $this->applyTaxonomyFilters($query, $categoryFilter, $subCategoryFilter);
                $this->applyKeywordWhere($query, $candidate);

                $results = $query->limit($limit * 3)->get();

                if ($results->isNotEmpty()) {
                    $images = $this->rankByRelevance($results, $candidate)->take($limit)->values();
                    $matchedQuery = $candidate;
                    break;
                }
            }
        } else {
            $query = Image::query()
                ->with(['tags:id,name', 'categories:id,name', 'subCategories:id,name']);

            $this->applyTaxonomyFilters($query, $categoryFilter, $subCategoryFilter);
            $images = $query->limit($limit)->get();
        }

        $isFallback = false;
        if ($images->isEmpty() && $allowFallback) {
            $images = Image::query()
                ->with(['tags:id,name', 'categories:id,name', 'subCategories:id,name'])
                ->inRandomOrder()
                ->limit(min($limit, 3))
                ->get();
            $isFallback = true;
        }

        return $this->formatImages($images, $matchedQuery, $isFallback);
    }

    /**
     * Retrieve gallery taxonomy (categories, subcategories, popular tags, and media counts).
     *
     * @return array{
     *     total_videos: int,
     *     total_images: int,
     *     categories: array<int, array{
     *         id: int,
     *         name: string,
     *         slug: string,
     *         videos_count: int,
     *         images_count: int,
     *         sub_categories: array<int, array{id: int, name: string, slug: string}>
     *     }>,
     *     popular_tags: array<int, array{name: string, videos_count: int, images_count: int}>
     * }
     */
    public function getTaxonomy(int $tagLimit = 100): array
    {
        $categories = Category::query()
            ->with(['subCategories:id,category_id,name,slug'])
            ->withCount(['videos', 'images'])
            ->orderBy('name')
            ->get()
            ->map(function (Category $category): array {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'videos_count' => (int) $category->videos_count,
                    'images_count' => (int) $category->images_count,
                    'sub_categories' => $category->subCategories->map(function ($sub): array {
                        return [
                            'id' => $sub->id,
                            'name' => $sub->name,
                            'slug' => $sub->slug,
                        ];
                    })->values()->all(),
                ];
            })
            ->values()
            ->all();

        $popularTags = Tag::query()
            ->where('status', true)
            ->withCount(['videos', 'images'])
            ->get()
            ->sortByDesc(function (Tag $tag): int {
                return ((int) $tag->videos_count) + ((int) $tag->images_count);
            })
            ->take(max(1, min(300, $tagLimit)))
            ->map(function (Tag $tag): array {
                return [
                    'name' => $tag->name,
                    'videos_count' => (int) $tag->videos_count,
                    'images_count' => (int) $tag->images_count,
                ];
            })
            ->values()
            ->all();

        return [
            'total_videos' => Video::query()->count(),
            'total_images' => Image::query()->count(),
            'categories' => $categories,
            'popular_tags' => $popularTags,
        ];
    }

    /**
     * Normalize IDs from array or comma-separated string.
     *
     * @return array<int, int|string>
     */
    protected function normalizeIds(mixed $ids): array
    {
        if (is_string($ids)) {
            $ids = array_filter(array_map('trim', explode(',', $ids)));
        }

        if (! is_array($ids)) {
            return [];
        }

        return array_values(array_filter($ids, fn ($id): bool => $id !== '' && $id !== null));
    }

    /**
     * Extract ordered, non-empty candidate search queries.
     *
     * @param  array<string, mixed>  $options
     * @return array<int, string>
     */
    protected function extractCandidateQueries(array $options): array
    {
        $candidates = [];

        if (! empty($options['queries']) && is_array($options['queries'])) {
            foreach ($options['queries'] as $q) {
                if (is_string($q) && trim($q) !== '') {
                    $candidates[] = trim($q);
                }
            }
        }

        foreach (['search', 'query'] as $key) {
            if (! empty($options[$key]) && is_string($options[$key])) {
                $trimmed = trim($options[$key]);
                if ($trimmed !== '') {
                    $candidates[] = $trimmed;
                }
            }
        }

        return array_values(array_unique($candidates));
    }

    /**
     * Apply video-specific filters (min_duration + taxonomy).
     *
     * @param  Builder<Video>  $query
     */
    protected function applyVideoFilters(
        Builder $query,
        ?int $minDuration,
        int|string|null $category,
        int|string|null $subCategory
    ): void {
        if ($minDuration !== null && $minDuration > 0) {
            $query->where('duration', '>=', $minDuration);
        }

        $this->applyTaxonomyFilters($query, $category, $subCategory);
    }

    /**
     * Apply category and subcategory filters by ID, slug, or name.
     *
     * @param  Builder<Video>|Builder<Image>  $query
     */
    protected function applyTaxonomyFilters(
        Builder $query,
        int|string|null $category,
        int|string|null $subCategory
    ): void {
        $likeOperator = $this->likeOperator();

        if ($category !== null && $category !== '') {
            $query->whereHas('categories', function (Builder $q) use ($category, $likeOperator): void {
                if (is_numeric($category)) {
                    $q->where('categories.id', (int) $category);
                } else {
                    $q->where('categories.slug', $category)
                        ->orWhere('categories.name', $likeOperator, "%{$category}%");
                }
            });
        }

        if ($subCategory !== null && $subCategory !== '') {
            $query->whereHas('subCategories', function (Builder $q) use ($subCategory, $likeOperator): void {
                if (is_numeric($subCategory)) {
                    $q->where('sub_categories.id', (int) $subCategory);
                } else {
                    $q->where('sub_categories.slug', $subCategory)
                        ->orWhere('sub_categories.name', $likeOperator, "%{$subCategory}%");
                }
            });
        }
    }

    /**
     * Apply keyword search across title, tags, categories, and subcategories.
     *
     * @param  Builder<Video>|Builder<Image>  $query
     */
    protected function applyKeywordWhere(Builder $query, string $search): void
    {
        $likeOperator = $this->likeOperator();
        $terms = array_values(array_filter(preg_split('/\s+/', $search) ?: []));

        $query->where(function (Builder $q) use ($search, $terms, $likeOperator): void {
            $q->where('title', $likeOperator, "%{$search}%");

            foreach ($terms as $term) {
                if (mb_strlen($term) >= 2) {
                    $q->orWhere('title', $likeOperator, "%{$term}%");
                }
            }

            $q->orWhereHas('tags', function (Builder $tagsQuery) use ($search, $terms, $likeOperator): void {
                $tagsQuery->where(function (Builder $subQ) use ($search, $terms, $likeOperator): void {
                    $subQ->where('name', $likeOperator, "%{$search}%");
                    foreach ($terms as $term) {
                        $subQ->orWhere('name', $likeOperator, "%{$term}%");
                    }
                });
            });

            $q->orWhereHas('categories', function (Builder $catQuery) use ($search, $likeOperator): void {
                $catQuery->where('name', $likeOperator, "%{$search}%");
            });

            $q->orWhereHas('subCategories', function (Builder $subCatQuery) use ($search, $likeOperator): void {
                $subCatQuery->where('name', $likeOperator, "%{$search}%");
            });
        });
    }

    /**
     * Rank a collection of Video or Image models by how closely they match the search phrase.
     *
     * @template TModel of Video|Image
     *
     * @param  Collection<int, TModel>  $items
     * @return Collection<int, TModel>
     */
    protected function rankByRelevance(Collection $items, string $search): Collection
    {
        $normalizedSearch = mb_strtolower(trim($search));
        $terms = array_values(array_filter(preg_split('/\s+/', $normalizedSearch) ?: []));

        return $items->sortByDesc(function (Video|Image $item) use ($normalizedSearch, $terms): int {
            $score = 0;
            $title = mb_strtolower((string) $item->title);
            $tagNames = $item->tags->pluck('name')->map(fn (string $n): string => mb_strtolower($n))->all();
            $catNames = $item->categories->pluck('name')->map(fn (string $n): string => mb_strtolower($n))->all();
            $subCatNames = $item->subCategories->pluck('name')->map(fn (string $n): string => mb_strtolower($n))->all();

            if ($title === $normalizedSearch) {
                $score += 100;
            } elseif ($normalizedSearch !== '' && str_contains($title, $normalizedSearch)) {
                $score += 60;
            }

            foreach ($tagNames as $tagName) {
                if ($tagName === $normalizedSearch) {
                    $score += 80;
                } elseif ($normalizedSearch !== '' && str_contains($tagName, $normalizedSearch)) {
                    $score += 40;
                }
            }

            foreach ($catNames as $catName) {
                if ($normalizedSearch !== '' && str_contains($catName, $normalizedSearch)) {
                    $score += 25;
                }
            }

            foreach ($subCatNames as $subCatName) {
                if ($normalizedSearch !== '' && str_contains($subCatName, $normalizedSearch)) {
                    $score += 30;
                }
            }

            foreach ($terms as $term) {
                if (str_contains($title, $term)) {
                    $score += 15;
                }

                foreach ($tagNames as $tagName) {
                    if ($tagName === $term) {
                        $score += 20;
                    } elseif (str_contains($tagName, $term)) {
                        $score += 10;
                    }
                }
            }

            return $score;
        });
    }

    /**
     * Format video collection into array payload.
     *
     * @param  Collection<int, Video>  $videos
     * @return array<int, array{
     *     id: int,
     *     title: string|null,
     *     video_link: string|null,
     *     duration: int|null,
     *     video_quality: string|null,
     *     width: int|null,
     *     height: int|null,
     *     tags: array<int, string>,
     *     categories: array<int, string>,
     *     sub_categories: array<int, string>,
     *     matched_query: string|null,
     *     is_fallback: bool
     * }>
     */
    protected function formatVideos(Collection $videos, ?string $matchedQuery, bool $isFallback): array
    {
        return $videos->map(function (Video $video) use ($matchedQuery, $isFallback): array {
            return [
                'id' => $video->id,
                'title' => $video->title,
                'video_link' => DiskPath::resolve($video->file_path),
                'duration' => $video->duration,
                'video_quality' => $video->video_quality,
                'width' => $video->width,
                'height' => $video->height,
                'tags' => $video->tags->pluck('name')->values()->all(),
                'categories' => $video->categories->pluck('name')->values()->all(),
                'sub_categories' => $video->subCategories->pluck('name')->values()->all(),
                'matched_query' => $matchedQuery,
                'is_fallback' => $isFallback,
            ];
        })->values()->all();
    }

    /**
     * Format image collection into array payload.
     *
     * @param  Collection<int, Image>  $images
     * @return array<int, array{
     *     id: int,
     *     title: string|null,
     *     image_link: string|null,
     *     file_path: string|null,
     *     width: int|null,
     *     height: int|null,
     *     size: float|int|string|null,
     *     tags: array<int, string>,
     *     categories: array<int, string>,
     *     sub_categories: array<int, string>,
     *     matched_query: string|null,
     *     is_fallback: bool
     * }>
     */
    protected function formatImages(Collection $images, ?string $matchedQuery, bool $isFallback): array
    {
        return $images->map(function (Image $image) use ($matchedQuery, $isFallback): array {
            $imageLink = $image->file_path
                ? (DiskPath::root() !== '' ? DiskPath::resolve($image->file_path) : asset('storage/'.$image->file_path))
                : null;

            return [
                'id' => $image->id,
                'title' => $image->title,
                'image_link' => $imageLink,
                'file_path' => $image->file_path,
                'width' => $image->width,
                'height' => $image->height,
                'size' => $image->size,
                'tags' => $image->tags->pluck('name')->values()->all(),
                'categories' => $image->categories->pluck('name')->values()->all(),
                'sub_categories' => $image->subCategories->pluck('name')->values()->all(),
                'matched_query' => $matchedQuery,
                'is_fallback' => $isFallback,
            ];
        })->values()->all();
    }

    protected function likeOperator(): string
    {
        return DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
    }
}
