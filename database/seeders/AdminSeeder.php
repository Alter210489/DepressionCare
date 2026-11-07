<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {
            // Admin pertama
            if (!User::where('email', 'admin@gmail.com')->exists()) {
                $user1 = User::create([
                    'name' => 'Administrator',
                    'email' => 'admin@gmail.com',
                    'password' => Hash::make('21wretchedegg'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]);

                Admin::create([
                    'user_id' => $user1->id,
                    'nama' => 'Administrator',
                    'email' => 'admin@gmail.com',
                    'password' => Hash::make('21wretchedegg'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]);
            }

            // Admin kedua
            if (!User::where('email', 'konselor@gmail.com')->exists()) {
                $user2 = User::create([
                    'name' => 'Konselor',
                    'email' => 'konselor@gmail.com',
                    'password' => Hash::make('21wretchedegg'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]);

                Admin::create([
                    'user_id' => $user2->id,
                    'nama' => 'Konselor',
                    'email' => 'konselor@gmail.com',
                    'password' => Hash::make('21wretchedegg'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]);
            }
        });

        $this->command->info('Admin users and admin data created successfully!');
    }
}
