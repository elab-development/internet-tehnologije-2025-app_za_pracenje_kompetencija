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
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action'); //APPROVED_VERIFICATION
            $table->string('entity')->nullable(); // Verification,user,competency
            $table->unsignedBigInteger('entity_id')->nullable();

            $table->unsignedBigInteger('performed_by')->nullable(); //moderator,admin
            $table->string('performed_by_role')->nullable(); //moderator,system

            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('performed_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
