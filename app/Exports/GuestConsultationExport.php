<?php

namespace App\Exports;

use App\Models\GuestConsultation;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Carbon\Carbon;

class GuestConsultationExport implements FromQuery, WithHeadings, WithMapping, WithColumnWidths, WithStyles, WithTitle, WithColumnFormatting, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate = null, $endDate = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function query()
    {
        $query = GuestConsultation::with(['diagnosa']);

        if ($this->startDate) {
            $startDateParsed = Carbon::createFromFormat('Y-m-d', $this->startDate)->startOfDay();
            $query->where('created_at', '>=', $startDateParsed);
        }

        if ($this->endDate) {
            $endDateParsed = Carbon::createFromFormat('Y-m-d', $this->endDate)->endOfDay();
            $query->where('created_at', '<=', $endDateParsed);
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'No',
            'Session ID',
            'Tanggal Konsultasi',
            'Nama',
            'Email',
            'NIM',
            'Fakultas',
            'Program Studi',
            'Usia',
            'Jenis Kelamin',
            'Hasil Diagnosa',
            'Tingkat Keparahan',
            'Nilai CF',
            'Nilai CF (%)',
            'Rekomendasi'
        ];
    }

    public function map($guestConsultation): array
    {
        static $no = 1;

        // Parse rekomendasi jika dalam format JSON
        $rekomendasi = $guestConsultation->rekomendasi;
        if (is_string($rekomendasi)) {
            $rekomendasiArray = json_decode($rekomendasi, true);
            if (is_array($rekomendasiArray)) {
                $rekomendasi = implode('; ', $rekomendasiArray);
            }
        } elseif (is_array($rekomendasi)) {
            $rekomendasi = implode('; ', $rekomendasi);
        }

        return [
            $no++,
            $guestConsultation->session_id ?? '-',
            $guestConsultation->created_at ? Carbon::parse($guestConsultation->created_at)->format('d/m/Y H:i:s') : '-',
            $guestConsultation->nama ?? '-',
            $guestConsultation->email ?? '-',
            $guestConsultation->nim ?? '-',
            $guestConsultation->fakultas ?? '-',
            $guestConsultation->program_studi ?? '-',
            $guestConsultation->umur ?? '-',
            $guestConsultation->jenis_kelamin == 'L' ? 'Laki-laki' : ($guestConsultation->jenis_kelamin == 'P' ? 'Perempuan' : '-'),
            $guestConsultation->hasil_diagnosa ?? '-',
            $guestConsultation->tingkat_keparahan ?? '-',
            $guestConsultation->nilai_cf ?? 0,
            $guestConsultation->nilai_cf ? round($guestConsultation->nilai_cf * 100, 2) : 0,
            $rekomendasi ?? '-'
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 5,   // No
            'B' => 25,  // Session ID
            'C' => 20,  // Tanggal
            'D' => 25,  // Nama
            'E' => 30,  // Email
            'F' => 15,  // NIM
            'G' => 30,  // Fakultas
            'H' => 35,  // Program Studi
            'I' => 8,   // Usia
            'J' => 15,  // Jenis Kelamin
            'K' => 35,  // Hasil Diagnosa
            'L' => 25,  // Tingkat Keparahan
            'M' => 12,  // Nilai CF
            'N' => 12,  // Nilai CF %
            'O' => 50,  // Rekomendasi
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();

        // Style untuk header
        $sheet->getStyle('A1:' . $lastColumn . '1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['argb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => '2563EB']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => '000000']
                ]
            ]
        ]);

        // Style untuk data
        $sheet->getStyle('A2:' . $lastColumn . $lastRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'C1C1C1']
                ]
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_TOP,
                'wrapText' => true
            ]
        ]);

        // Style khusus untuk kolom nomor
        $sheet->getStyle('A2:A' . $lastRow)->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ]
        ]);

        // Style khusus untuk kolom nilai CF
        $sheet->getStyle('M2:N' . $lastRow)->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ]
        ]);

        // Set tinggi baris
        $sheet->getRowDimension(1)->setRowHeight(25);
        for ($i = 2; $i <= $lastRow; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(-1); // Auto height
        }

        return [];
    }

    public function title(): string
    {
        $period = '';
        if ($this->startDate || $this->endDate) {
            $start = $this->startDate ? Carbon::createFromFormat('Y-m-d', $this->startDate)->format('d/m/Y') : 'Awal';
            $end = $this->endDate ? Carbon::createFromFormat('Y-m-d', $this->endDate)->format('d/m/Y') : 'Akhir';
            $period = " ({$start} - {$end})";
        }

        return 'Konsultasi Guest' . $period;
    }

    public function columnFormats(): array
    {
        return [
            'M' => '0.000',     // Nilai CF dengan 3 desimal
            'N' => '0.00"%"',   // Nilai CF % dengan 2 desimal dan simbol persen
            'C' => 'dd/mm/yyyy hh:mm:ss', // Format tanggal
        ];
    }
}
