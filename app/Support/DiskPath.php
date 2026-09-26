<?php

namespace App\Support;

class DiskPath
{
    /**
     * Get the configured root location for disk files.
     * Always ensures a trailing slash (forward slash '/' is supported on Windows and Unix).
     */
    public static function root(): string
    {
        $location = (string) (config('filesystems.disk_file_location')
            ?? config('filesystems.disks.footage.root')
            ?? env('DISK_FILE_LOCATION', ''));

        if ($location === '') {
            return '';
        }

        // Normalize backslashes to forward slashes for uniform cross-platform behavior
        $normalized = str_replace('\\', '/', $location);

        return rtrim($normalized, '/').'/';
    }

    /**
     * Resolve a relative path into an absolute disk path.
     */
    public static function resolve(?string $relativePath): ?string
    {
        if ($relativePath === null || trim($relativePath) === '') {
            return null;
        }

        $root = static::root();
        $normalizedRelative = str_replace('\\', '/', $relativePath);

        if ($root === '') {
            return $normalizedRelative;
        }

        // If the path is already an absolute path starting with the root, return normalized
        if (str_starts_with($normalizedRelative, $root)) {
            return $normalizedRelative;
        }

        return $root.ltrim($normalizedRelative, '/');
    }

    /**
     * Get a specific subfolder path within the disk location.
     */
    public static function dir(string $subDirectory = ''): string
    {
        $root = static::root();
        $sub = trim(str_replace('\\', '/', $subDirectory), '/');

        if ($root === '') {
            return $sub;
        }

        return $sub === '' ? rtrim($root, '/') : rtrim($root, '/').'/'.$sub;
    }

    /**
     * Strip root prefixes (such as DISK_FILE_LOCATION, /Volumes/Files/server/, Windows drive letters) to get a relative path.
     */
    public static function cleanRelative(?string $fullOrRelativePath): string
    {
        if ($fullOrRelativePath === null) {
            return '';
        }

        $normalized = str_replace('\\', '/', trim($fullOrRelativePath));
        $root = static::root();

        // 1. Check if starts with configured root
        if ($root !== '' && str_starts_with($normalized, $root)) {
            $normalized = substr($normalized, strlen($root));
        }

        // 2. Check common legacy roots
        $legacyRoots = [
            '/Volumes/Files/server/',
            '/Volumes/Files/server',
        ];

        foreach ($legacyRoots as $legacy) {
            if (str_starts_with($normalized, $legacy)) {
                $normalized = substr($normalized, strlen($legacy));
                break;
            }
        }

        // 3. Remove leading slash
        return ltrim($normalized, '/');
    }

    /**
     * Delete a file from the disk location or public path if it exists.
     */
    public static function deleteFile(?string $path): bool
    {
        if ($path === null || trim($path) === '') {
            return false;
        }

        $resolved = static::resolve($path);
        if ($resolved && file_exists($resolved) && is_file($resolved)) {
            return @unlink($resolved);
        }

        $public = public_path($path);
        if (file_exists($public) && is_file($public)) {
            return @unlink($public);
        }

        return false;
    }
}
