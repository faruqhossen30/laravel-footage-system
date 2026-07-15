<?php

namespace App\Services;

class PixabayImageService
{
    private string $apiKey;

    private string $baseUrl = 'https://pixabay.com/api/';

    private int $rateLimitRemaining = 100;

    private int $rateLimitReset = 60;

    public function __construct()
    {
        $this->apiKey = config('services.pixabay.key', '');
    }
}
