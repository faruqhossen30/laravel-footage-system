<?php

namespace App\Jobs;

use App\Models\Video;
use App\Services\DownloadService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class DownloadVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $videoId;

    public function __construct(int $videoId)
    {
        $this->videoId = $videoId;
        $this->onQueue('video-downloads');
    }

    public function handle(DownloadService $downloader): void
    {
        if (\Illuminate\Support\Facades\Cache::get('stop_video_downloads')) {
            throw new \Exception('Downloads stopped by user.');
        }

        $video = Video::findOrFail($this->videoId);
        $video->update(['status' => 'run']);

        $path = $downloader->downloadVideo($video);

        $updates = [
            'file_path' => $path,
        ];

        // Attempt to download thumbnail if a remote URL is provided
        $thumbUrl = (string) $video->thumbnail;
        if ($thumbUrl !== '' && preg_match('/^https?:\/\//i', $thumbUrl)) {
            try {
                $thumbPath = $downloader->downloadThumbnail($video);
                $updates['thumbnail'] = $thumbPath;
            } catch (\Throwable $e) {
                Log::warning('Thumbnail download failed for video ID '.$video->id.': '.$e->getMessage());
            }
        }

        $updates['status'] = 'done';
        $video->update($updates);
    }

    public function failed(Throwable $e): void
    {
        if ($video = Video::find($this->videoId)) {
            // revert status to list on failure so it can be retried later
            $video->update(['status' => 'list']);
        }
    }
}
