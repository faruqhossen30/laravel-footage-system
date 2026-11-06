<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\GetGalleryTaxonomyTool;
use App\Mcp\Tools\SearchImagesTool;
use App\Mcp\Tools\SearchVideosTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Footage Gallery MCP Server')]
#[Version('1.0.0')]
#[Instructions('Use get_gallery_taxonomy first to inspect available categories, subcategories, and popular tags in the footage library. Then use search_videos or search_images with prioritized candidate queries to match the best video clips and images for video scenes.')]
class FootageServer extends Server
{
    protected array $tools = [
        GetGalleryTaxonomyTool::class,
        SearchVideosTool::class,
        SearchImagesTool::class,
    ];
}
