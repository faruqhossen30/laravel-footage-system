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
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->integer('duration')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('video_quality')->nullable();
            $table->float('size')->nullable();
            $table->string('width')->nullable();
            $table->string('height')->nullable();
            $table->string('povider_id')->nullable();
            $table->enum('povider', ['all', 'pixabay', 'storyblocks', 'freepik'])->default('all');
            $table->enum('status', ['list', 'run', 'done'])->default('list');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
