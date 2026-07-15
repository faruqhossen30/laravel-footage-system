<?php

namespace App\Http\Controllers;

use App\Services\PixabayImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PixabayController extends Controller
{
    private PixabayImageService $pixabayService;

    public function __construct(PixabayImageService $pixabayService)
    {
        $this->pixabayService = $pixabayService;
    }

    /**
     * Display the image search interface
     */
    public function index(): Response
    {
        return Inertia::render('Pixabay/Search', [
            'categories' => PixabayImageService::getAvailableCategories(),
            'imageTypes' => PixabayImageService::getAvailableImageTypes(),
            'orientations' => PixabayImageService::getAvailableOrientations(),
            'colors' => PixabayImageService::getAvailableColors(),
            'isConfigured' => $this->pixabayService->isConfigured(),
            'rateLimit' => $this->pixabayService->getRateLimitInfo(),
        ]);
    }

    /**
     * Search for images
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'nullable|string|max:100',
            'image_type' => 'nullable|in:'.implode(',', PixabayImageService::getAvailableImageTypes()),
            'orientation' => 'nullable|in:'.implode(',', PixabayImageService::getAvailableOrientations()),
            'category' => 'nullable|in:'.implode(',', PixabayImageService::getAvailableCategories()),
            'colors' => 'nullable|string',
            'min_width' => 'nullable|integer|min:0',
            'min_height' => 'nullable|integer|min:0',
            'editors_choice' => 'nullable|boolean',
            'safesearch' => 'nullable|boolean',
            'order' => 'nullable|in:popular,latest',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:3|max:200',
        ]);

        $params = $request->only([
            'query', 'image_type', 'orientation', 'category', 'colors',
            'min_width', 'min_height', 'editors_choice', 'safesearch',
            'order', 'page', 'per_page',
        ]);

        // Remove empty values
        $params = array_filter($params, function ($value) {
            return $value !== null && $value !== '';
        });

        $results = $this->pixabayService->searchImages($params);

        return response()->json([
            'success' => ! isset($results['error']),
            'data' => $results,
            'rate_limit' => $this->pixabayService->getRateLimitInfo(),
        ]);
    }

    /**
     * Search by query term
     */
    public function searchByQuery(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|max:100',
            'filters' => 'nullable|array',
        ]);

        $results = $this->pixabayService->searchByQuery(
            $request->input('query'),
            $request->input('filters', [])
        );

        return response()->json([
            'success' => ! isset($results['error']),
            'data' => $results,
            'rate_limit' => $this->pixabayService->getRateLimitInfo(),
        ]);
    }

    /**
     * Get images by category
     */
    public function getByCategory(Request $request): JsonResponse
    {
        $request->validate([
            'category' => 'required|in:'.implode(',', PixabayImageService::getAvailableCategories()),
            'per_page' => 'nullable|integer|min:3|max:200',
        ]);

        $results = $this->pixabayService->getImagesByCategory(
            $request->input('category'),
            $request->input('per_page', 20)
        );

        return response()->json([
            'success' => ! isset($results['error']),
            'data' => $results,
            'rate_limit' => $this->pixabayService->getRateLimitInfo(),
        ]);
    }

    /**
     * Get high-quality images
     */
    public function getHighQuality(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'nullable|string|max:100',
            'filters' => 'nullable|array',
        ]);

        $results = $this->pixabayService->getHighQualityImages(
            $request->input('query', ''),
            $request->input('filters', [])
        );

        return response()->json([
            'success' => ! isset($results['error']),
            'data' => $results,
            'rate_limit' => $this->pixabayService->getRateLimitInfo(),
        ]);
    }

    /**
     * Download a single image
     */
    public function downloadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|array',
            'image.id' => 'required|integer',
            'image.largeImageURL' => 'required_without:image.webformatURL|string',
            'image.webformatURL' => 'required_without:image.largeImageURL|string',
            'disk' => 'nullable|string',
        ]);

        $downloadUrl = $this->pixabayService->downloadImage(
            $request->input('image'),
            $request->input('disk', 'public')
        );

        return response()->json([
            'success' => $downloadUrl !== null,
            'download_url' => $downloadUrl,
            'message' => $downloadUrl ? 'Image downloaded successfully' : 'Failed to download image',
        ]);
    }

    /**
     * Download multiple images
     */
    public function downloadMultiple(Request $request): JsonResponse
    {
        $request->validate([
            'images' => 'required|array|min:1|max:10',
            'images.*.id' => 'required|integer',
            'images.*.largeImageURL' => 'required_without:images.*.webformatURL|string',
            'images.*.webformatURL' => 'required_without:images.*.largeImageURL|string',
            'disk' => 'nullable|string',
        ]);

        $results = $this->pixabayService->downloadMultipleImages(
            $request->input('images'),
            $request->input('disk', 'public')
        );

        $successCount = collect($results)->filter(function ($result) {
            return $result['download_url'] !== null;
        })->count();

        return response()->json([
            'success' => $successCount > 0,
            'results' => $results,
            'downloaded' => $successCount,
            'total' => count($results),
            'message' => "Downloaded {$successCount} out of ".count($results).' images',
        ]);
    }

    /**
     * Get service information
     */
    public function info(): JsonResponse
    {
        return response()->json([
            'is_configured' => $this->pixabayService->isConfigured(),
            'rate_limit' => $this->pixabayService->getRateLimitInfo(),
            'categories' => PixabayImageService::getAvailableCategories(),
            'image_types' => PixabayImageService::getAvailableImageTypes(),
            'orientations' => PixabayImageService::getAvailableOrientations(),
            'colors' => PixabayImageService::getAvailableColors(),
        ]);
    }
}
