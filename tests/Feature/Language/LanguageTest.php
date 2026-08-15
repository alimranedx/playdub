<?php

namespace Tests\Feature\Language;

use App\Models\Language;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LanguageTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_retrieve_active_languages(): void
    {
        Language::create(['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'is_active' => true]);
        Language::create(['code' => 'bn', 'name' => 'Bangla', 'native_name' => 'বাংলা', 'is_active' => true]);

        $response = $this->getJson('/api/v1/languages');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'languages' => [
                    '*' => ['id', 'code', 'name', 'native_name', 'is_active'],
                ],
            ]);
    }
}
