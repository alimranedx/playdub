<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TranslatedSegment extends Model
{
    use HasFactory;

    protected $fillable = [
        'dubbed_video_id',
        'transcript_id',
        'translated_text',
        'start_time',
        'end_time',
        'audio_path',
        'sequence',
    ];

    protected $casts = [
        'start_time' => 'float',
        'end_time' => 'float',
        'sequence' => 'integer',
    ];

    public function dubbedVideo(): BelongsTo
    {
        return $this->belongsTo(DubbedVideo::class);
    }

    public function transcript(): BelongsTo
    {
        return $this->belongsTo(Transcript::class);
    }
}
