<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LanguageResource;
use App\Models\Language;
use Illuminate\Http\JsonResponse;

class LanguageController extends Controller
{
    public function index(): JsonResponse
    {
        $languages = Language::where('is_active', true)->orderBy('name')->get();

        return response()->json([
            'languages' => LanguageResource::collection($languages),
        ]);
    }
}
