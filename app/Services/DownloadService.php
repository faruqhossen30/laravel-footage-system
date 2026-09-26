<?php

namespace App\Services;

use App\Models\Image;
use App\Models\Video;
use App\Support\DiskPath;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class DownloadService
{
    public function downloadPixabayImage(Image $image): string
    {
        $url = (string) $image->file_name;
        if ($url === '') {
            throw new RuntimeException('Image file_name is empty.');
        }

        $basename = basename(parse_url($url, PHP_URL_PATH) ?? '') ?: ('image_'.$image->id.'.jpg');
        $root = DiskPath::root() !== ''
            ? DiskPath::dir('images')
            : Storage::disk('public')->path('images');

        if (! is_dir($root)) {
            mkdir($root, 0755, true);
        }

        $response = Http::withOptions(['stream' => true])->get($url);
        if ($response->failed()) {
            throw new RuntimeException('Failed to download image. HTTP status: '.$response->status());
        }

        $fullPath = $root.'/'.$basename;
        $body = $response->toPsrResponse()->getBody();
        $stream = fopen($fullPath, 'w');
        while (! $body->eof()) {
            fwrite($stream, $body->read(1024 * 1024)); // write in 1MB chunks
        }
        fclose($stream);

        return 'images/'.$basename;
    }

    public function downloadImageThumbnail(Image $image): string
    {
        $url = (string) $image->thumbnail;
        if ($url === '') {
            throw new RuntimeException('Image thumbnail is empty.');
        }

        $basename = basename(parse_url($url, PHP_URL_PATH) ?? '') ?: ('img_thumb_'.$image->id.'.jpg');

        $root = DiskPath::root() !== ''
            ? DiskPath::dir('thumbnails')
            : public_path('thumbnails');

        if (! is_dir($root)) {
            mkdir($root, 0755, true);
        }

        $response = Http::withOptions(['stream' => true])->get($url);
        if ($response->failed()) {
            throw new RuntimeException('Failed to download image thumbnail. HTTP status: '.$response->status());
        }

        $fullPath = $root.'/'.$basename;
        $body = $response->toPsrResponse()->getBody();
        $stream = fopen($fullPath, 'w');
        while (! $body->eof()) {
            fwrite($stream, $body->read(1024 * 128)); // 128KB chunks for images
        }
        fclose($stream);

        return 'thumbnails/'.$basename;
    }

    /**
     * Download the video's remote file to the public storage and return the relative path.
     */
    public function downloadVideo(Video $video): string
    {
        $url = (string) $video->file_name;
        if ($url === '') {
            throw new RuntimeException('Video file_name is empty.');
        }

        $basename = basename(parse_url($url, PHP_URL_PATH) ?? '') ?: ('video_'.$video->id.'.mp4');
        $root = DiskPath::root() !== ''
            ? DiskPath::dir('videos')
            : Storage::disk('public')->path('videos');

        if (! is_dir($root)) {
            mkdir($root, 0755, true);
        }

        // Stream download to file to avoid loading entire video into memory
        $response = Http::withOptions(['stream' => true])->get($url);
        if ($response->failed()) {
            throw new RuntimeException('Failed to download video. HTTP status: '.$response->status());
        }

        $fullPath = $root.'/'.$basename;
        $body = $response->toPsrResponse()->getBody();
        $stream = fopen($fullPath, 'w');
        while (! $body->eof()) {
            fwrite($stream, $body->read(1024 * 1024)); // write in 1MB chunks
        }
        fclose($stream);

        return 'videos/'.$basename;
    }

    /**
     * Download the video's thumbnail to the public storage and return the relative path.
     */
    public function downloadThumbnail(Video $video): string
    {
        $url = (string) $video->thumbnail;
        if ($url === '') {
            throw new RuntimeException('Video thumbnail is empty.');
        }

        $basename = basename(parse_url($url, PHP_URL_PATH) ?? '') ?: ('thumb_'.$video->id.'.jpg');

        $root = DiskPath::root() !== ''
            ? DiskPath::dir('thumbnails')
            : public_path('thumbnails');

        if (! is_dir($root)) {
            mkdir($root, 0755, true);
        }

        $response = Http::withOptions(['stream' => true])->get($url);
        if ($response->failed()) {
            throw new RuntimeException('Failed to download thumbnail. HTTP status: '.$response->status());
        }

        $fullPath = $root.'/'.$basename;
        $body = $response->toPsrResponse()->getBody();
        $stream = fopen($fullPath, 'w');
        while (! $body->eof()) {
            fwrite($stream, $body->read(1024 * 128)); // 128KB chunks for images
        }
        fclose($stream);

        return 'thumbnails/'.$basename;
    }
}
