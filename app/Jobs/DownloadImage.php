<?php

namespace App\Jobs;

use App\Models\Image;
use App\Services\DownloadService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class DownloadImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $imageId;

    // php artisan queue:work --queue=image-downloads

    public function __construct(int $imageId)
    {
        $this->imageId = $imageId;
        $this->onQueue('image-downloads');
    }

    public function handle(DownloadService $downloader): void
    {
        if (Cache::get('stop_image_downloads')) {
            throw new \Exception('Image downloads stopped by user.');
        }

        $image = Image::findOrFail($this->imageId);
        $image->update(['status' => 'run']);

        $path = $downloader->downloadPixabayImage($image);

        $updates = [
            'file_path' => $path,
        ];

        // Attempt to download thumbnail if a remote URL is provided
        $thumbUrl = (string) $image->thumbnail;
        if ($thumbUrl !== '' && preg_match('/^https?:\/\//i', $thumbUrl)) {
            try {
                $thumbPath = $downloader->downloadImageThumbnail($image);
                $updates['thumbnail'] = $thumbPath;
            } catch (Throwable $e) {
                Log::warning('Image thumbnail download failed for image ID '.$image->id.': '.$e->getMessage());
            }
        }

        $updates['status'] = 'done';
        $image->update($updates);
    }

    public function failed(Throwable $e): void
    {
        if ($image = Image::find($this->imageId)) {
            // revert status to list on failure so it can be retried later
            $image->update(['status' => 'list']);
        }
    }
}
