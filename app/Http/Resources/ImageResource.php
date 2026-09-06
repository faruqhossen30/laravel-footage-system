<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'file_name' => $this->file_name,
            'file_path' => env('DISK_FILE_LOCATION').$this->file_path,
            'thumbnail' => env('DISK_FILE_LOCATION').$this->thumbnail,
            'size' => $this->size,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
