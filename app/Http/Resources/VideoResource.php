<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);
        return [
            "id"           => $this->id,
            "title"        => $this->title,
            "file_name"    =>  $this->file_name,
            "file_path"    => env('DISK_FILE_LOCATION') . $this->file_path,
            "duration"     => $this->duration,
            // "thumbnail"    => public_path($this->thumbnail),
            // "video_quality" => $this->video_quality,
            // "size"         => $this->size,
            // "width"        => $this->width,
            // "height"       => $this->height,
            // "povider"      => $this->povider,
            // "status"       => $this->status,
            // "povider_id"   => $this->povider_id,
            // "created_at"   => $this->created_at,
            // "updated_at"   => $this->updated_at,
        ];
    }
}
