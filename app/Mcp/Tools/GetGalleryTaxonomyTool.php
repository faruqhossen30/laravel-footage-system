<?php

namespace App\Mcp\Tools;

use App\Services\FootageSearchService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('get_gallery_taxonomy')]
#[Description('Get all available categories, subcategories, and popular tags in the footage gallery so AI keyword extraction and search can use actual tags present in the database.')]
class GetGalleryTaxonomyTool extends Tool
{
    public function __construct(public FootageSearchService $footageSearchService) {}

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $tagLimit = (int) $request->get('tag_limit', 100);

        return Response::json(
            $this->footageSearchService->getTaxonomy($tagLimit)
        );
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'tag_limit' => $schema->integer()
                ->description('Maximum number of popular tags to return (default: 100, max: 300).'),
        ];
    }
}
