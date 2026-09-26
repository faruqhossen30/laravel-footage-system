<?php

namespace App\Http\Resources;

use App\Support\DiskPath;
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
            'file_path' => DiskPath::resolve($this->file_path),
            'thumbnail' => DiskPath::resolve($this->thumbnail),
            'size' => $this->size,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
