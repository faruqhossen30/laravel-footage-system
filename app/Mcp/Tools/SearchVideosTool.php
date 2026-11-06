<?php

namespace App\Mcp\Tools;

use App\Services\FootageSearchService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('search_videos')]
#[Description('Search stock video footages in the gallery by prioritized candidate keywords, minimum duration, or category. Automatically falls back to the next candidate keyword when the primary keyword yields 0 results.')]
class SearchVideosTool extends Tool
{
    public function __construct(public FootageSearchService $footageSearchService) {}

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $queries = $request->get('queries');
        if (is_string($queries)) {
            $queries = array_values(array_filter(array_map('trim', explode(',', $queries))));
        }

        $videos = $this->footageSearchService->searchVideos([
            'ids' => $request->get('ids'),
            'queries' => is_array($queries) ? $queries : null,
            'query' => $request->get('query'),
            'search' => $request->get('search'),
            'category' => $request->get('category'),
            'sub_category' => $request->get('sub_category'),
            'min_duration' => $request->get('min_duration'),
            'limit' => $request->get('limit', 5),
            'allow_fallback' => (bool) $request->get('allow_fallback', false),
        ]);

        return Response::json([
            'count' => count($videos),
            'videos' => $videos,
        ]);
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'queries' => $schema->array()
                ->items($schema->string())
                ->description('Ordered list of candidate search keywords (from most specific to broad fallback).'),
            'query' => $schema->string()
                ->description('Single search keyword if queries array is not provided.'),
            'category' => $schema->string()
                ->description('Optional category name, slug, or ID to filter videos.'),
            'sub_category' => $schema->string()
                ->description('Optional subcategory name, slug, or ID to filter videos.'),
            'min_duration' => $schema->integer()
                ->description('Optional minimum duration in seconds required for the clip.'),
            'limit' => $schema->integer()
                ->description('Maximum number of videos to return (default: 5).'),
            'allow_fallback' => $schema->boolean()
                ->description('Whether to return random fallback videos if no candidate keywords match (default: false).'),
        ];
    }
}
