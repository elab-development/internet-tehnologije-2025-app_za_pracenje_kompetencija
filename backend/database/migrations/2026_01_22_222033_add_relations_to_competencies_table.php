<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('competencies', function (Blueprint $table) {
            $table->foreignId('institution_id')
                ->nullable()
                ->after('user_id')
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('type_id')
                ->nullable()
                ->constrained('competency_types')
                ->nullOnDelete();

            $table->foreignId('source_id')
                ->nullable()
                ->constrained('competency_sources')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('competencies', function (Blueprint $table) {
            $table->dropForeign(['institution_id']);
            $table->dropForeign(['type_id']);
            $table->dropForeign(['source_id']);

            $table->dropColumn(['institution_id', 'type_id', 'source_id']);
        });
    }
};
