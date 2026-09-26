<?php

use App\Models\Image;
use App\Models\Video;
use App\Support\DiskPath;
use Tests\TestCase;

uses(TestCase::class);

test('it normalizes macOS path with trailing slash', function () {
    config(['filesystems.disk_file_location' => '/Volumes/Files/server']);

    expect(DiskPath::root())->toBe('/Volumes/Files/server/');
    expect(DiskPath::resolve('videos/sample.mp4'))->toBe('/Volumes/Files/server/videos/sample.mp4');
    expect(DiskPath::dir('videos'))->toBe('/Volumes/Files/server/videos');
});

test('it normalizes Windows path with forward slashes', function () {
    config(['filesystems.disk_file_location' => 'D:/server/']);

    expect(DiskPath::root())->toBe('D:/server/');
    expect(DiskPath::resolve('videos/sample.mp4'))->toBe('D:/server/videos/sample.mp4');
    expect(DiskPath::dir('thumbnails'))->toBe('D:/server/thumbnails');
});

test('it normalizes Windows path with backslashes', function () {
    config(['filesystems.disk_file_location' => 'D:\\server\\']);

    expect(DiskPath::root())->toBe('D:/server/');
    expect(DiskPath::resolve('videos\\sample.mp4'))->toBe('D:/server/videos/sample.mp4');
    expect(DiskPath::dir('images'))->toBe('D:/server/images');
});

test('it correctly cleans relative paths from absolute paths', function () {
    config(['filesystems.disk_file_location' => '/Volumes/Files/server/']);

    expect(DiskPath::cleanRelative('/Volumes/Files/server/videos/sample.mp4'))->toBe('videos/sample.mp4');
    expect(DiskPath::cleanRelative('videos/sample.mp4'))->toBe('videos/sample.mp4');

    config(['filesystems.disk_file_location' => 'D:\\server\\']);
    expect(DiskPath::cleanRelative('D:\\server\\videos\\sample.mp4'))->toBe('videos/sample.mp4');
    expect(DiskPath::cleanRelative('D:/server/videos/sample.mp4'))->toBe('videos/sample.mp4');
});

test('it safely handles null or empty inputs', function () {
    expect(DiskPath::resolve(null))->toBeNull();
    expect(DiskPath::resolve(''))->toBeNull();
    expect(DiskPath::resolve('   '))->toBeNull();
    expect(DiskPath::cleanRelative(null))->toBe('');
});

test('Video and Image models resolve disk_path using DiskPath', function () {
    config(['filesystems.disk_file_location' => 'D:/server/']);

    $video = new Video(['file_path' => 'videos/test.mp4']);
    expect($video->disk_path)->toBe('D:/server/videos/test.mp4');

    $image = new Image(['file_path' => 'images/test.jpg']);
    expect($image->disk_path)->toBe('D:/server/images/test.jpg');
});

test('it deletes physical files through DiskPath::deleteFile', function () {
    $tempDir = sys_get_temp_dir().'/footage_test_'.uniqid();
    mkdir($tempDir, 0755, true);

    config(['filesystems.disk_file_location' => $tempDir]);

    $testFile = $tempDir.'/test_video.mp4';
    file_put_contents($testFile, 'dummy video content');
    expect(file_exists($testFile))->toBeTrue();

    $deleted = DiskPath::deleteFile('test_video.mp4');
    expect($deleted)->toBeTrue();
    expect(file_exists($testFile))->toBeFalse();

    // Deleting non-existent file returns false safely
    expect(DiskPath::deleteFile('non_existent.mp4'))->toBeFalse();
    expect(DiskPath::deleteFile(null))->toBeFalse();

    @rmdir($tempDir);
});
