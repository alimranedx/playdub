<?php

namespace Tests\Feature\Video;

use App\Models\User;
use App\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_video_dubbing_project(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/videos', [
                'title' => 'Test Video URL Dub',
                'source_type' => 'url',
                'source_url' => 'https://www.youtube.com/watch?v=example',
                'original_language' => 'en',
                'target_language' => 'bn',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'video' => ['id', 'title', 'source_type', 'status'],
                'dubbed_video' => ['id', 'source_language', 'target_language', 'status'],
                'job' => ['id', 'status', 'progress', 'current_step'],
            ]);

        $this->assertDatabaseHas('videos', [
            'user_id' => $user->id,
            'title' => 'Test Video URL Dub',
        ]);
    }

    public function test_user_can_fetch_videos_list(): void
    {
        $user = User::factory()->create();
        Video::create([
            'user_id' => $user->id,
            'title' => 'Sample Project',
            'source_type' => 'url',
            'source_url' => 'https://example.com/video.mp4',
            'original_language' => 'en',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/videos');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'videos' => [
                    '*' => ['id', 'title', 'source_type', 'status'],
                ],
            ]);
    }
}
