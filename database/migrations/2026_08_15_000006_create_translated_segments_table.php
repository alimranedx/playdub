<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('translated_segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dubbed_video_id')->constrained()->onDelete('cascade');
            $table->foreignId('transcript_id')->constrained()->onDelete('cascade');
            $table->text('translated_text');
            $table->decimal('start_time', 8, 3);
            $table->decimal('end_time', 8, 3);
            $table->string('audio_path')->nullable();
            $table->integer('sequence')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translated_segments');
    }
};
