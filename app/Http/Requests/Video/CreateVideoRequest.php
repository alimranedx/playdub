<?php

namespace App\Http\Requests\Video;

use Illuminate\Foundation\Http\FormRequest;

class CreateVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'source_type' => ['required', 'string', 'in:upload,url'],
            'source_url' => ['required_if:source_type,url', 'nullable', 'url', 'max:1000'],
            'video_file' => ['required_if:source_type,upload', 'nullable', 'file', 'mimes:mp4,mov,avi,mkv,webm', 'max:512000'],
            'original_language' => ['required', 'string', 'max:10'],
            'target_language' => ['required', 'string', 'max:10'],
        ];
    }
}
