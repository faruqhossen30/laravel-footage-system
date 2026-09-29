<?php

namespace App\Http\Controllers\Admin;

use App\Enums\VideoProvider;
use App\Enums\VideoStatus;
use App\Http\Controllers\Controller;
use App\Jobs\DownloadVideo;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Tag;
use App\Models\Video;
use App\Support\DiskPath;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Video::with([
            'categories:id,name',
            'subCategories:id,name,category_id',
            'tags:id,name',
        ]);

        $order = $request->string('order')->toString();
        $categoryId = $request->input('category_id');
        $subCategoryId = $request->input('sub_category_id');

        if (! empty($categoryId)) {
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }
        if (! empty($subCategoryId)) {
            $query->whereHas('subCategories', function ($q) use ($subCategoryId) {
                $q->where('sub_categories.id', $subCategoryId);
            });
        }

        if ($order === 'old') {
            $query->oldest('id');
        } else {
            $query->latest('id');
        }

        $videos = $query->paginate(10)->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);
        $subCategories = SubCategory::orderBy('name')->get(['id', 'name', 'category_id']);

        return Inertia::render('admin/video/index', [
            'videos' => $videos,
            'categories' => $categories,
            'subCategories' => $subCategories,
            'filters' => [
                'order' => $order ?: 'latest',
                'category_id' => $categoryId,
                'sub_category_id' => $subCategoryId,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $per_page = $request->query('per_page', 10);
        $page = $request->query('page', 1);
        $order = $request->query('order', 'popular');
        $search = $request->query('search', '');

        $key = env('PIXABAY_API_KEY');

        $params = [
            'key' => $key,
            'q' => $search,
            'order' => $order ?: 'popular',
            'page' => $page ?: 1,
            'per_page' => $per_page ?: 10,
        ];

        $queryParams = http_build_query($params);
        $url = "https://pixabay.com/api/videos/?{$queryParams}";
        $response = Http::get($url);
        $data = $response->json();

        $hits = $data['hits'] ?? [];
        $ids = collect($hits)->pluck('id')->toArray();

        $existIds = Video::whereIn('povider_id', $ids)->pluck('povider_id')->toArray();

        return Inertia::render(
            'admin/video/pixabay-videos',
            [
                'items' => $hits,
                'existIds' => $existIds,
                'totalHits' => $data['totalHits'] ?? 0,
                'filters' => [
                    'search' => $search,
                    'order' => $order ?: 'popular',
                    'per_page' => (string) ($per_page ?: 10),
                    'page' => (int) ($page ?: 1),
                ],
            ]
        );
    }

    public function pixabayStore(Request $request)
    {
        $provider = 'pixabay';
        $videos = $request->videos;

        foreach ($videos as $video) {
            $keywords = array_filter(array_unique(array_map(function ($t) {
                return trim($t);
            }, explode(',', $video['tags']))));

            // Find existing video by provider and provider_id; create if not found
            $targetVideo = Video::where('povider', $provider)
                ->where('povider_id', $video['id'])
                ->first();

            if (! $targetVideo) {
                $targetVideo = Video::create([
                    'povider' => $provider,
                    'povider_id' => $video['id'],
                    'file_name' => $video['url'],
                    'thumbnail' => $video['thumbnail'],
                    'width' => $video['width'],
                    'height' => $video['height'],
                    'size' => $video['size'] ?? null,
                    'duration' => $video['duration'] ?? null,
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
                $targetVideo->tags()->syncWithoutDetaching($tagIds);
            }
        }

        return to_route('video.index');
    }

    /**
     * Show the manual video upload form.
     */
    public function upload()
    {
        $allCategories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $allSubCategories = SubCategory::orderBy('name')->get(['id', 'name', 'slug', 'category_id']);
        $allTags = Tag::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('admin/video/upload', [
            'tags' => $allTags,
            'categories' => $allCategories,
            'subCategories' => $allSubCategories,
        ]);
    }

    /**
     * Store a manually uploaded video from PC.
     */
    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'video' => ['required', 'file', 'mimetypes:video/mp4,video/quicktime,video/webm,video/x-matroska,video/avi,video/x-msvideo', 'max:204800'],
            'title' => ['nullable', 'string', 'max:255'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'thumbnail_blob' => ['nullable', 'string'],
            'duration' => ['nullable', 'numeric'],
            'width' => ['nullable'],
            'height' => ['nullable'],
            'video_quality' => ['nullable', 'string', 'max:50'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'sub_category_ids' => ['nullable', 'array'],
            'sub_category_ids.*' => ['integer', 'exists:sub_categories,id'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            'new_tags' => ['nullable'],
        ]);

        $videoFile = $request->file('video');
        $originalName = $videoFile->getClientOriginalName();
        $extension = $videoFile->getClientOriginalExtension() ?: 'mp4';
        $rawBaseName = pathinfo($originalName, PATHINFO_FILENAME);
        $cleanBaseName = Str::slug($rawBaseName);
        if ($cleanBaseName === '') {
            $cleanBaseName = 'video';
        }
        $videoFileName = time().'_'.$cleanBaseName.'.'.$extension;

        $videoTargetDir = DiskPath::root() !== ''
            ? DiskPath::dir('videos')
            : Storage::disk('public')->path('videos');

        if (! is_dir($videoTargetDir)) {
            mkdir($videoTargetDir, 0755, true);
        }

        $videoFile->move($videoTargetDir, $videoFileName);
        $videoRelativePath = 'videos/'.$videoFileName;
        $videoFullPath = $videoTargetDir.'/'.$videoFileName;

        // Process thumbnail
        $thumbnailRelativePath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbFile = $request->file('thumbnail');
            $thumbExt = $thumbFile->getClientOriginalExtension() ?: 'jpg';
            $thumbFileName = 'thumb_'.time().'_'.Str::random(8).'.'.$thumbExt;
            $thumbTargetDir = DiskPath::root() !== ''
                ? DiskPath::dir('thumbnails')
                : public_path('thumbnails');

            if (! is_dir($thumbTargetDir)) {
                mkdir($thumbTargetDir, 0755, true);
            }

            $thumbFile->move($thumbTargetDir, $thumbFileName);
            $thumbnailRelativePath = 'thumbnails/'.$thumbFileName;
        } elseif ($request->filled('thumbnail_blob')) {
            $blob = $request->input('thumbnail_blob');
            if (preg_match('/^data:image\/(\w+);base64,/', $blob, $matches)) {
                $ext = strtolower($matches[1]) === 'png' ? 'png' : 'jpg';
                $decoded = base64_decode(substr($blob, strpos($blob, ',') + 1));
                if ($decoded !== false) {
                    $thumbFileName = 'thumb_'.time().'_'.Str::random(8).'.'.$ext;
                    $thumbTargetDir = DiskPath::root() !== ''
                        ? DiskPath::dir('thumbnails')
                        : public_path('thumbnails');

                    if (! is_dir($thumbTargetDir)) {
                        mkdir($thumbTargetDir, 0755, true);
                    }

                    file_put_contents($thumbTargetDir.'/'.$thumbFileName, $decoded);
                    $thumbnailRelativePath = 'thumbnails/'.$thumbFileName;
                }
            }
        }

        // Fallback: try ffmpeg if available to generate thumbnail
        if (! $thumbnailRelativePath && file_exists($videoFullPath)) {
            $ffmpegPath = trim((string) shell_exec('which ffmpeg 2>/dev/null'));
            if ($ffmpegPath !== '') {
                $thumbFileName = 'thumb_'.time().'_'.Str::random(8).'.jpg';
                $thumbTargetDir = DiskPath::root() !== ''
                    ? DiskPath::dir('thumbnails')
                    : public_path('thumbnails');

                if (! is_dir($thumbTargetDir)) {
                    mkdir($thumbTargetDir, 0755, true);
                }

                $thumbFullPath = $thumbTargetDir.'/'.$thumbFileName;
                @shell_exec(escapeshellcmd($ffmpegPath).' -ss 00:00:01 -i '.escapeshellarg($videoFullPath).' -vframes 1 -q:v 2 '.escapeshellarg($thumbFullPath).' 2>&1');
                if (file_exists($thumbFullPath) && filesize($thumbFullPath) > 0) {
                    $thumbnailRelativePath = 'thumbnails/'.$thumbFileName;
                }
            }
        }

        // Title handling
        $title = trim((string) $request->input('title'));
        if ($title === '') {
            $title = ucwords(str_replace(['-', '_', '.'], ' ', $rawBaseName));
        }

        // Metadata extraction
        $size = file_exists($videoFullPath) ? (string) filesize($videoFullPath) : ($request->input('size') ?? null);
        $duration = $request->filled('duration') ? (int) round((float) $request->input('duration')) : null;
        $width = $request->input('width') ? (string) $request->input('width') : null;
        $height = $request->input('height') ? (string) $request->input('height') : null;
        $videoQuality = $request->input('video_quality') ?: null;
        if (! $videoQuality && $height) {
            $h = (int) $height;
            if ($h >= 2160) {
                $videoQuality = '4K';
            } elseif ($h >= 1440) {
                $videoQuality = '2K';
            } elseif ($h >= 1080) {
                $videoQuality = '1080p';
            } elseif ($h >= 720) {
                $videoQuality = '720p';
            } elseif ($h >= 480) {
                $videoQuality = '480p';
            }
        }

        $video = Video::create([
            'title' => $title,
            'povider' => VideoProvider::MANUAL,
            'povider_id' => 'manual_'.time().'_'.Str::random(6),
            'file_name' => $originalName,
            'file_path' => $videoRelativePath,
            'thumbnail' => $thumbnailRelativePath,
            'width' => $width,
            'height' => $height,
            'size' => $size,
            'duration' => $duration,
            'video_quality' => $videoQuality,
            'status' => VideoStatus::DONE,
        ]);

        // Tags
        $tagIds = $request->input('tag_ids', []);
        if (! is_array($tagIds)) {
            $tagIds = [];
        }

        $newTags = $request->input('new_tags');
        if (! empty($newTags)) {
            $tagNames = is_array($newTags) ? $newTags : explode(',', (string) $newTags);
            foreach ($tagNames as $name) {
                $name = trim($name);
                if ($name === '') {
                    continue;
                }

                $existing = Tag::where('name', $name)->first();
                if ($existing) {
                    $tagIds[] = $existing->id;

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
        }

        if (! empty($tagIds)) {
            $video->tags()->sync(array_unique($tagIds));
        }

        // Categories & SubCategories
        $categoryIds = $request->input('category_ids', []);
        if (is_array($categoryIds) && ! empty($categoryIds)) {
            $video->categories()->sync($categoryIds);
        }

        $requestedSubIds = $request->input('sub_category_ids', []);
        if (is_array($requestedSubIds) && ! empty($requestedSubIds)) {
            $allowedSubIds = SubCategory::query()
                ->whereIn('id', $requestedSubIds)
                ->when(! empty($categoryIds), function ($q) use ($categoryIds) {
                    $q->whereIn('category_id', $categoryIds);
                })
                ->pluck('id')
                ->all();

            $video->subCategories()->sync($allowedSubIds);
        }

        return redirect()->route('video.index')->with('success', 'Video uploaded successfully.');
    }

    public function edit(Video $video)
    {
        $allCategories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $allSubCategories = SubCategory::orderBy('name')->get(['id', 'name', 'slug', 'category_id']);
        $allTags = Tag::orderBy('name')->get(['id', 'name', 'slug']);

        $selectedCategoryIds = $video->categories()->pluck('categories.id');
        $selectedSubCategoryIds = $video->subCategories()->pluck('sub_categories.id');
        $selectedTagIds = $video->tags()->pluck('tags.id');

        return Inertia::render('admin/video/edit', [
            'video' => $video,
            'tags' => $allTags,
            'categories' => $allCategories,
            'subCategories' => $allSubCategories,
            'selectedCategoryIds' => $selectedCategoryIds,
            'selectedSubCategoryIds' => $selectedSubCategoryIds,
            'selectedTagIds' => $selectedTagIds,
        ]);
    }

    public function update(Request $request, Video $video)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'tag_ids' => ['array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            'category_ids' => ['array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'sub_category_ids' => ['array'],
            'sub_category_ids.*' => ['integer', 'exists:sub_categories,id'],
        ]);

        if (array_key_exists('title', $validated)) {
            $video->title = $validated['title'];
        }
        $video->save();

        $video->tags()->sync($validated['tag_ids'] ?? []);
        $video->categories()->sync($validated['category_ids'] ?? []);
        $categoryIds = $validated['category_ids'] ?? [];
        $requestedSubIds = $validated['sub_category_ids'] ?? [];
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
        $video->subCategories()->sync($allowedSubIds);

        return redirect()->route('video.index')->with('success', 'Video updated successfully.');
    }

    /**
     * Enqueue pending video downloads to queue and return a JSON response.
     */
    public function enqueueDownloads(Request $request)
    {
        // Reset the stop flag so downloads can proceed
        Cache::forget('stop_video_downloads');

        $videos = Video::query()
            ->where('status', 'list')
            ->orderBy('id')
            ->get();

        if ($videos->isEmpty()) {
            return back()->with('success', 'No pending videos to enqueue.');
        }

        $jobs = [];
        foreach ($videos as $video) {
            $jobs[] = new DownloadVideo($video->id);
        }

        Bus::chain($jobs)->dispatch();

        return back()->with('success', 'Enqueued '.count($jobs).' video downloads.');
    }

    /**
     * Stop all pending downloads and clear the queue.
     */
    public function stopDownloads()
    {
        // Set a flag to stop any running chains
        Cache::forever('stop_video_downloads', true);

        // Clear the jobs table (assuming database driver)
        DB::table('jobs')->delete();

        // Reset 'run' status videos back to 'list' so they can be re-queued later
        Video::where('status', 'run')->update(['status' => 'list']);

        return back()->with('success', 'All downloads stopped and queue cleared.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $video = Video::find($id);

        if ($video) {
            DiskPath::deleteFile($video->file_path);
            DiskPath::deleteFile($video->thumbnail);
            $video->delete();
        }

        return redirect()->route('video.index');
    }

    /**
     * Search videos by absolute disk path, relative path, or filename.
     */
    public function searchByPath(Request $request)
    {
        $rawPath = $request->string('path')->trim()->toString();
        // Remove enclosing quotes if user pasted e.g. "/Volumes/Files/server/videos/370013_medium.mp4"
        $cleanedPath = trim($rawPath, " \t\n\r\0\x0B\"'");

        $query = Video::with([
            'categories:id,name',
            'subCategories:id,name,category_id',
            'tags:id,name',
        ]);

        if ($cleanedPath !== '') {
            $relativePath = DiskPath::cleanRelative($cleanedPath);
            $basename = basename(str_replace('\\', '/', $cleanedPath));
            $likeOperator = DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

            $query->where(function ($q) use ($cleanedPath, $relativePath, $basename, $likeOperator) {
                $q->where('file_path', $cleanedPath)
                    ->orWhere('file_path', $relativePath)
                    ->orWhere('file_path', $likeOperator, "%{$relativePath}%")
                    ->orWhere('file_path', $likeOperator, "%{$basename}%")
                    ->orWhere('file_name', $likeOperator, "%{$basename}%")
                    ->orWhere('file_name', $likeOperator, "%{$cleanedPath}%")
                    ->orWhere('title', $likeOperator, "%{$basename}%");
            })->latest('id');
        } else {
            $query->whereRaw('1 = 0');
        }

        $videos = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/video/search', [
            'videos' => $videos,
            'filters' => [
                'path' => $rawPath,
            ],
        ]);
    }
}
