<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Speaker extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_id',
        'speaker_key',
        'display_name',
        'voice_profile',
    ];

    protected $casts = [
        'voice_profile' => 'array',
    ];

    public function video(): BelongsTo
    {
        return $this->belongsTo(Video::class);
    }

    public function transcripts(): HasMany
    {
        return $this->hasMany(Transcript::class);
    }
}
