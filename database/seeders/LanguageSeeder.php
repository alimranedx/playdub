<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'is_active' => true],
            ['code' => 'bn', 'name' => 'Bangla', 'native_name' => 'বাংলা', 'is_active' => true],
            ['code' => 'hi', 'name' => 'Hindi', 'native_name' => 'हिन्दी', 'is_active' => true],
            ['code' => 'ta', 'name' => 'Tamil', 'native_name' => 'தமிழ்', 'is_active' => true],
            ['code' => 'tr', 'name' => 'Turkish', 'native_name' => 'Türkçe', 'is_active' => true],
            ['code' => 'es', 'name' => 'Spanish', 'native_name' => 'Español', 'is_active' => true],
            ['code' => 'ar', 'name' => 'Arabic', 'native_name' => 'العربية', 'is_active' => true],
        ];

        foreach ($languages as $lang) {
            Language::updateOrCreate(['code' => $lang['code']], $lang);
        }
    }
}
