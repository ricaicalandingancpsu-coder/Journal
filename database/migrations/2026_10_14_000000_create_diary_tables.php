<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('theme', 20)->default('cream')->after('password');
            $table->string('text_size', 20)->default('comfortable')->after('theme');
        });

        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('content');
            $table->date('entry_date');
            $table->string('mood', 20)->nullable();
            $table->string('cover_path')->nullable();
            $table->string('visibility', 20)->default('private');
            $table->timestamps();

            $table->index(['user_id', 'entry_date']);
            $table->index(['user_id', 'mood']);
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 40);
            $table->timestamps();

            $table->unique(['user_id', 'name']);
        });

        Schema::create('journal_entry_tag', function (Blueprint $table) {
            $table->foreignId('journal_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();

            $table->primary(['journal_entry_id', 'tag_id']);
        });

        Schema::create('memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('caption', 500)->nullable();
            $table->string('image_path');
            $table->date('memory_date');
            $table->timestamps();

            $table->index(['user_id', 'memory_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memories');
        Schema::dropIfExists('journal_entry_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('journal_entries');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['theme', 'text_size']);
        });
    }
};
