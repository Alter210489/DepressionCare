<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Carbon\Carbon;
use App\Models\RiwayatKonsultasi;

class RiwayatKonsultasiExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnWidths,
    WithTitle,
    ShouldAutoSize,
    WithEvents
{
    protected $startDate;
    protected $endDate;
    protected $stats;
    protected $period;

    // PERBAIKAN: Constructor menerima tanggal, bukan collection langsung
    public function __construct($startDate = null, $endDate = null, $stats = [], $period = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->stats = $stats ?? [];
        $this->period = $period;
    }

    /**
     * PERBAIKAN: Query data di method collection() dengan load gejala yang benar
     * Return collection of data untuk export
     */
    public function collection()
    {
        try {
            $query = RiwayatKonsultasi::with(['mahasiswa.user', 'diagnosa']);

            // Filter berdasarkan tanggal jika ada
            if ($this->startDate) {
                $startDateParsed = Carbon::createFromFormat('Y-m-d', $this->startDate)->startOfDay();
                $query->where('tanggal_konsultasi', '>=', $startDateParsed);
            }

            if ($this->endDate) {
                $endDateParsed = Carbon::createFromFormat('Y-m-d', $this->endDate)->endOfDay();
                $query->where('tanggal_konsultasi', '<=', $endDateParsed);
            }

            // Load detail gejala untuk setiap konsultasi
            $result = $query->orderBy('tanggal_konsultasi', 'desc')->get();

            // PERBAIKAN: Load gejala dengan benar dari database atau detail JSON
            $result->each(function ($konsultasi) {
                // Reset detail gejala
                $konsultasi->gejala_list = [];

                // Coba ambil dari relasi gejala jika ada
                if ($konsultasi->relationLoaded('gejalaTerpilih')) {
                    $konsultasi->gejala_list = $konsultasi->gejalaTerpilih->pluck('nama_gejala')->toArray();
                } else {
                    // Parse dari detail JSON
                    $detail = [];
                    if ($konsultasi->detail) {
                        $detail = is_string($konsultasi->detail)
                            ? json_decode($konsultasi->detail, true)
                            : $konsultasi->detail;
                    }

                    // Ambil gejala dari jawaban
                    if (isset($detail['jawaban_gejala']) && is_array($detail['jawaban_gejala'])) {
                        $gejalaNames = [];
                        foreach ($detail['jawaban_gejala'] as $jawaban) {
                            if (isset($jawaban['nama_gejala']) && !empty($jawaban['nama_gejala'])) {
                                $gejalaNames[] = $jawaban['nama_gejala'];
                            } elseif (isset($jawaban['gejala']) && !empty($jawaban['gejala'])) {
                                $gejalaNames[] = $jawaban['gejala'];
                            } elseif (isset($jawaban['id_gejala'])) {
                                // Jika hanya ada id_gejala, coba query ke database
                                try {
                                    $gejala = \App\Models\Gejala::find($jawaban['id_gejala']);
                                    if ($gejala) {
                                        $gejalaNames[] = $gejala->nama_gejala;
                                    }
                                } catch (\Exception $e) {
                                    // Skip jika error
                                }
                            }
                        }
                        $konsultasi->gejala_list = $gejalaNames;
                    }

                    // Fallback: coba ambil dari jawaban langsung jika ada
                    if (empty($konsultasi->gejala_list) && isset($detail['gejala'])) {
                        if (is_array($detail['gejala'])) {
                            $konsultasi->gejala_list = $detail['gejala'];
                        } elseif (is_string($detail['gejala'])) {
                            $konsultasi->gejala_list = explode(';', $detail['gejala']);
                        }
                    }
                }

                // Debug log untuk melihat data gejala
                \Log::info('Gejala untuk konsultasi ' . $konsultasi->id_konsultasi, [
                    'gejala_count' => count($konsultasi->gejala_list),
                    'gejala_list' => $konsultasi->gejala_list,
                    'detail_keys' => $konsultasi->detail ? array_keys(is_string($konsultasi->detail) ? json_decode($konsultasi->detail, true) ?? [] : $konsultasi->detail) : []
                ]);
            });

            return $result;

        } catch (\Exception $e) {
            \Log::error('Error in RiwayatKonsultasiExport collection()', [
                'error' => $e->getMessage(),
                'start_date' => $this->startDate,
                'end_date' => $this->endDate,
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            // Return empty collection jika error
            return collect();
        }
    }

    /**
     * Define headings untuk Excel - PERBAIKAN: Hapus duplikasi dan perbaiki struktur
     */
    public function headings(): array
    {
        return [
            'NO',
            'TANGGAL KONSULTASI',
            'NAMA MAHASISWA',
            'NIM',
            'FAKULTAS',
            'TINGKAT KEPARAHAN',
            'NILAI CF',
            'GEJALA YANG DIALAMI',
            'SARAN/REKOMENDASI'
        ];
    }

    /**
     * Map data untuk setiap row - PERBAIKAN: Hapus duplikasi dan perbaiki gejala
     */
    public function map($konsultasi): array
    {
        static $rowNumber = 1;

        // PERBAIKAN: Validasi konsultasi object
        if (!$konsultasi) {
            return [
                $rowNumber++,
                'N/A', 'N/A', 'N/A', 'N/A', 'N/A', '0.000', 'N/A', 'N/A'
            ];
        }

        // PERBAIKAN: Ambil gejala dari property yang sudah diset di collection()
        $gejalaList = '';
        if (!empty($konsultasi->gejala_list) && is_array($konsultasi->gejala_list)) {
            $gejalaList = implode('; ', array_filter($konsultasi->gejala_list));
        }

        // Jika masih kosong, coba metode alternatif
        if (empty($gejalaList)) {
            try {
                $detail = [];
                if ($konsultasi->detail) {
                    $detail = is_string($konsultasi->detail)
                        ? json_decode($konsultasi->detail, true)
                        : $konsultasi->detail;
                }

                // Coba berbagai kemungkinan struktur data
                $possibleGejalaKeys = ['jawaban_gejala', 'gejala_terpilih', 'selected_gejala', 'gejala'];

                foreach ($possibleGejalaKeys as $key) {
                    if (isset($detail[$key]) && is_array($detail[$key])) {
                        $gejalaNames = [];
                        foreach ($detail[$key] as $item) {
                            if (is_string($item)) {
                                $gejalaNames[] = $item;
                            } elseif (is_array($item)) {
                                if (isset($item['nama_gejala'])) {
                                    $gejalaNames[] = $item['nama_gejala'];
                                } elseif (isset($item['name'])) {
                                    $gejalaNames[] = $item['name'];
                                } elseif (isset($item['gejala'])) {
                                    $gejalaNames[] = $item['gejala'];
                                }
                            }
                        }
                        if (!empty($gejalaNames)) {
                            $gejalaList = implode('; ', $gejalaNames);
                            break;
                        }
                    }
                }
            } catch (\Exception $e) {
                $gejalaList = 'Error parsing gejala: ' . $e->getMessage();
            }
        }

        // PERBAIKAN: Singkatan fakultas untuk menghemat space
        $fakultas = $konsultasi->mahasiswa->fakultas ?? 'N/A';
        $fakultasShort = $this->getSingkatanFakultas($fakultas);

        // Generate saran berdasarkan tingkat keparahan
        $saran = $this->generateSaran($konsultasi->tingkat_keparahan ?? '');

        return [
            $rowNumber++,
            isset($konsultasi->tanggal_konsultasi)
                ? Carbon::parse($konsultasi->tanggal_konsultasi)->format('d/m/Y H:i')
                : 'N/A',
            $konsultasi->mahasiswa->nama ?? 'N/A',
            $konsultasi->mahasiswa->nim ?? 'N/A',
            $fakultasShort,
            $konsultasi->tingkat_keparahan ?? 'N/A', // PERBAIKAN: Hanya tingkat keparahan
            isset($konsultasi->nilai_cf) && is_numeric($konsultasi->nilai_cf)
                ? number_format($konsultasi->nilai_cf, 3)
                : '0.000',
            $gejalaList ?: 'Data gejala tidak tersedia',
            $saran
        ];
    }

    /**
     * PERBAIKAN: Helper method untuk singkatan fakultas
     */
    private function getSingkatanFakultas($fakultas): string
    {
        $singkatan = [
            'Fakultas Keguruan dan Ilmu Pendidikan' => 'FKIP',
            'Fakultas Ekonomi dan Bisnis' => 'FEB',
            'Fakultas Teknik' => 'FT',
            'Fakultas Ilmu Sosial dan Politik' => 'FISIP',
            'Fakultas Hukum' => 'FH',
            'Fakultas Pertanian' => 'FP',
            'Fakultas Matematika dan Ilmu Pengetahuan Alam' => 'FMIPA',
            'Fakultas Kedokteran' => 'FK',
            'Fakultas Psikologi' => 'FPsi',
            'Fakultas Ilmu Komunikasi' => 'FIKOM',
            'Fakultas Perikanan dan Kelautan' => 'FPK',
            'Fakultas Kehutanan' => 'Fahutan',
            'Teknik' => 'Teknik',
            'FKIP' => 'FKIP',
            'FEB' => 'FEB',
            'FT' => 'FT',
            'FISIP' => 'FISIP',
            'FH' => 'FH',
        ];

        return $singkatan[$fakultas] ?? (strlen($fakultas) > 10 ? substr($fakultas, 0, 8) . '..' : $fakultas);
    }

    /**
     * Generate saran berdasarkan tingkat keparahan
     */
    private function generateSaran($tingkatKeparahan): string
    {
        $tingkat = strtolower($tingkatKeparahan);

        if (str_contains($tingkat, 'normal') || str_contains($tingkat, 'minimal')) {
            return 'Tetap jaga kesehatan mental dengan olahraga rutin dan istirahat cukup.';
        } elseif (str_contains($tingkat, 'ringan')) {
            return 'Konsultasi dengan konselor, atur pola tidur, dan lakukan aktivitas positif.';
        } elseif (str_contains($tingkat, 'sedang')) {
            return 'Segera konsultasi dengan psikolog/psikiater, pertimbangkan terapi profesional.';
        } elseif (str_contains($tingkat, 'berat')) {
            return 'SEGERA hubungi psikiater/rumah sakit, butuh penanganan medis profesional.';
        }

        return 'Konsultasi dengan tenaga kesehatan mental untuk evaluasi lebih lanjut.';
    }

    /**
     * Define column widths - PERBAIKAN: Sesuaikan dengan 9 kolom
     */
    public function columnWidths(): array
    {
        return [
            'A' => 5,   // NO - lebih kecil
            'B' => 18,  // TANGGAL - cukup untuk dd/mm/yyyy hh:mm
            'C' => 25,  // NAMA - lebih lebar untuk nama lengkap
            'D' => 12,  // NIM - cukup untuk 10 digit
            'E' => 12,  // FAKULTAS - singkatan
            'F' => 30,  // TINGKAT KEPARAHAN - lebih lebar untuk teks lengkap
            'G' => 10,  // CF - cukup untuk 3 digit desimal
            'H' => 60,  // GEJALA - sangat lebar untuk list gejala
            'I' => 50,  // SARAN - lebar untuk rekomendasi
        ];
    }

    /**
     * Define styles untuk worksheet - PERBAIKAN: Style untuk 9 kolom
     */
    public function styles(Worksheet $sheet)
    {
        // PERBAIKAN: Hitung jumlah data dengan aman
        $collection = $this->collection();
        $dataCount = $collection ? $collection->count() : 0;
        $lastRow = $dataCount + 1;

        return [
            // Style untuk header - PERBAIKAN: Warna dan font yang lebih menarik
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 11,
                    'name' => 'Arial',
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2563EB'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                    'wrapText' => true,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_MEDIUM,
                        'color' => ['rgb' => '1E40AF'],
                    ],
                ],
            ],
            // Style untuk semua data - PERBAIKAN: Range untuk 9 kolom
            "A1:I{$lastRow}" => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '6B7280'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_TOP,
                    'wrapText' => true,
                ],
                'font' => [
                    'size' => 9,
                    'name' => 'Arial',
                ],
            ],
            // Style untuk kolom nomor
            "A2:A{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'font' => [
                    'bold' => true,
                    'size' => 10,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F3F4F6'],
                ],
            ],
            // Style untuk kolom tanggal
            "B2:B{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
                'font' => [
                    'size' => 9,
                ],
            ],
            // Style untuk kolom NIM
            "D2:D{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
                'font' => [
                    'size' => 9,
                ],
            ],
            // Style untuk kolom fakultas
            "E2:E{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
                'font' => [
                    'size' => 9,
                    'bold' => true,
                ],
            ],
            // Style untuk kolom tingkat keparahan
            "F2:F{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'font' => [
                    'bold' => true,
                    'size' => 9,
                ],
            ],
            // Style untuk kolom CF
            "G2:G{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'font' => [
                    'bold' => true,
                    'size' => 10,
                    'color' => ['rgb' => '1E40AF'],
                ],
            ],
            // Style untuk kolom gejala (justify agar rapi)
            "H2:H{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT,
                    'vertical' => Alignment::VERTICAL_TOP,
                    'wrapText' => true,
                ],
                'font' => [
                    'size' => 8, // Lebih kecil karena banyak text
                ],
            ],
            // Style untuk kolom saran
            "I2:I{$lastRow}" => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT,
                    'vertical' => Alignment::VERTICAL_TOP,
                    'wrapText' => true,
                ],
                'font' => [
                    'size' => 9,
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'FEFCE8'],
                ],
            ],
        ];
    }

    /**
     * Title untuk worksheet
     */
    public function title(): string
    {
        return 'Riwayat Konsultasi';
    }

    /**
     * Register events untuk customisasi tambahan
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // PERBAIKAN: Safe count
                $collection = $this->collection();
                $dataCount = $collection ? $collection->count() : 0;
                $lastRow = $dataCount + 1;

                // PERBAIKAN: Set row height yang lebih fleksibel
                $sheet->getRowDimension('1')->setRowHeight(30); // Header lebih tinggi

                // Set row height untuk data rows dengan auto-sizing yang lebih baik
                for ($i = 2; $i <= $lastRow; $i++) {
                    $sheet->getRowDimension($i)->setRowHeight(40); // Tinggi tetap yang cukup untuk wrap text
                }

                // PERBAIKAN: Auto-resize columns untuk menyesuaikan konten
                foreach (range('A', 'I') as $column) {
                    $sheet->getColumnDimension($column)->setAutoSize(false);
                }

                // PERBAIKAN: Set specific widths yang lebih tepat untuk 9 kolom
                $sheet->getColumnDimension('A')->setWidth(5);   // NO
                $sheet->getColumnDimension('B')->setWidth(18);  // TANGGAL
                $sheet->getColumnDimension('C')->setWidth(25);  // NAMA (lebih lebar)
                $sheet->getColumnDimension('D')->setWidth(12);  // NIM
                $sheet->getColumnDimension('E')->setWidth(12);  // FAKULTAS (singkat)
                $sheet->getColumnDimension('F')->setWidth(30);  // TINGKAT KEPARAHAN (lebih lebar)
                $sheet->getColumnDimension('G')->setWidth(10);  // CF
                $sheet->getColumnDimension('H')->setWidth(60);  // GEJALA (sangat lebar)
                $sheet->getColumnDimension('I')->setWidth(50);  // SARAN (lebar)

                // Tambahkan informasi statistik di bawah tabel
                if (!empty($this->stats)) {
                    $this->addStatisticsSection($sheet, $lastRow + 3);
                }

                // Freeze panes pada header
                $sheet->freezePane('A2');

                // PERBAIKAN: Print setup yang lebih baik
                $sheet->getPageSetup()
                    ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE)
                    ->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A3) // A3 untuk lebih luas
                    ->setFitToWidth(1)
                    ->setFitToHeight(0);

                // PERBAIKAN: Margins yang lebih kecil
                $sheet->getPageMargins()
                    ->setTop(0.3)
                    ->setRight(0.2)
                    ->setLeft(0.2)
                    ->setBottom(0.3);

                // PERBAIKAN: Page breaks manual jika diperlukan
                $sheet->setBreak('A' . ($lastRow + 1), \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::BREAK_ROW);
            },
        ];
    }

    /**
     * Tambahkan section statistik di bawah tabel
     */
    private function addStatisticsSection(Worksheet $sheet, int $startRow): void
    {
        // Header statistik
        $sheet->setCellValue("A{$startRow}", 'STATISTIK KONSULTASI');
        $sheet->getStyle("A{$startRow}:I{$startRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '475569'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);
        $sheet->mergeCells("A{$startRow}:I{$startRow}");

        $statRow = $startRow + 2;

        // Safe count untuk statistik
        $collection = $this->collection();
        $dataCount = $collection ? $collection->count() : 0;

        // Data statistik
        $statistics = [
            'Total Konsultasi' => $this->stats['total_konsultasi'] ?? $dataCount,
            'Mahasiswa Aktif' => $this->stats['mahasiswa_aktif'] ?? 0,
            'Rata-rata CF' => isset($this->stats['rata_rata_cf'])
                ? number_format($this->stats['rata_rata_cf'], 3)
                : '0.000',
            'CF Tertinggi' => isset($this->stats['cf_tertinggi'])
                ? number_format($this->stats['cf_tertinggi'], 3)
                : '0.000',
        ];

        foreach ($statistics as $label => $value) {
            $sheet->setCellValue("A{$statRow}", $label);
            $sheet->setCellValue("B{$statRow}", $value);

            $sheet->getStyle("A{$statRow}:B{$statRow}")->applyFromArray([
                'font' => ['bold' => true],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                    ],
                ],
            ]);

            $statRow++;
        }

        // Periode laporan
        if ($this->startDate || $this->endDate) {
            $periodRow = $statRow + 1;
            $sheet->setCellValue("A{$periodRow}", 'Periode');

            $periodText = '';
            if ($this->startDate && $this->endDate) {
                $periodText = Carbon::parse($this->startDate)->format('d F Y') . ' - ' .
                             Carbon::parse($this->endDate)->format('d F Y');
            } elseif ($this->startDate) {
                $periodText = 'Mulai ' . Carbon::parse($this->startDate)->format('d F Y');
            } elseif ($this->endDate) {
                $periodText = 'Sampai ' . Carbon::parse($this->endDate)->format('d F Y');
            } else {
                $periodText = 'Semua Data';
            }

            $sheet->setCellValue("B{$periodRow}", $periodText);

            $sheet->getStyle("A{$periodRow}:B{$periodRow}")->applyFromArray([
                'font' => ['bold' => true],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                    ],
                ],
            ]);
        }
    }
}
