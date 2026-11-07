<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Diagnosa;
use Carbon\Carbon;

class DiagnosaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $diagnosaData = [
            [
                'nama_diagnosa' => 'Minimal (Normal)',
                'deskripsi' => 'Individu tidak menunjukkan gejala depresi yang signifikan. Fluktuasi mood wajar dan masih dalam batas normal. Biasanya hanya stres ringan atau kelelahan biasa, tidak memengaruhi aktivitas harian secara signifikan. Kondisi ini menunjukkan tingkat kesehatan mental yang baik dan stabil.'
            ],
            [
                'nama_diagnosa' => 'Depresi Ringan (Mild Depression)',
                'deskripsi' => 'Menunjukkan adanya gejala depresi ringan. Biasanya muncul perasaan sedih, kehilangan minat, atau sulit tidur, tapi masih bisa menjalankan aktivitas harian. Perlu diwaspadai agar tidak berkembang menjadi depresi sedang. Disarankan menjaga pola hidup sehat dan mencari dukungan sosial. Intervensi dini sangat penting untuk mencegah perkembangan kondisi yang lebih serius.'
            ],
            [
                'nama_diagnosa' => 'Depresi Sedang (Moderate Depression)',
                'deskripsi' => 'Gejala depresi lebih nyata dan mulai mengganggu aktivitas harian, prestasi akademik, relasi sosial, atau motivasi belajar. Biasanya perlu intervensi, misalnya konseling rutin, penanganan psikolog kampus, atau terapi psikologis. Kondisi ini memerlukan perhatian serius dan dukungan profesional untuk pemulihan yang optimal.'
            ],
            [
                'nama_diagnosa' => 'Depresi Berat (Severe Depression)',
                'deskripsi' => 'Gejala depresi sangat signifikan, dapat mencakup keputusasaan mendalam, kehilangan motivasi total, pikiran bunuh diri, atau ketidakmampuan berfungsi secara normal dalam studi dan kehidupan sosial. Kondisi ini perlu penanganan profesional segera — konseling intensif dan mungkin perawatan medis. Memerlukan monitoring ketat dan dukungan komprehensif dari tim kesehatan mental.'
            ]
        ];

        foreach ($diagnosaData as $data) {
            Diagnosa::create([
                'nama_diagnosa' => $data['nama_diagnosa'],
                'deskripsi' => $data['deskripsi'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
        }

        // Log untuk memastikan seeder berhasil dijalankan
        $this->command->info('Diagnosa seeder completed successfully!');
        $this->command->info('Created ' . count($diagnosaData) . ' diagnosa records.');
    }
}
