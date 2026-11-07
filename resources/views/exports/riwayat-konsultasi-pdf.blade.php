<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Riwayat Konsultasi</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 15px;
            color: #333;
            background-color: #f8f9fa;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
            background-color: #1e40af;
            color: white;
            padding: 20px;
            border: 3px solid #1e3a8a;
        }

        .header h1 {
            font-size: 22px;
            margin: 0 0 8px 0;
            font-weight: bold;
            color: #ffffff;
        }

        .header .period {
            font-size: 14px;
            color: #e0e7ff;
            margin: 8px 0;
            font-weight: bold;
        }

        .header .generated {
            font-size: 11px;
            margin-top: 8px;
            color: #c7d2fe;
        }

        .stats-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }

        .stats-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .stats-cell {
            width: 25%;
            padding: 15px;
            text-align: center;
            font-weight: bold;
            border: 2px solid white;
        }

        .stats-cell-1 {
            background-color: #3b82f6;
            color: white;
        }

        .stats-cell-2 {
            background-color: #10b981;
            color: white;
        }

        .stats-cell-3 {
            background-color: #8b5cf6;
            color: white;
        }

        .stats-cell-4 {
            background-color: #f59e0b;
            color: white;
        }

        .stats-cell .label {
            font-size: 11px;
            margin-bottom: 8px;
            display: block;
        }

        .stats-cell .value {
            font-size: 20px;
            font-weight: bold;
            display: block;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin: 25px 0 15px 0;
            padding: 12px 16px;
            background-color: #475569;
            color: white;
            border-left: 5px solid #1e40af;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
            border: 2px solid #e2e8f0;
        }

        .table th, .table td {
            border: 1px solid #cbd5e1;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }

        .table th {
            background-color: #64748b;
            color: white;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
        }

        .table tr:nth-child(even) td {
            background-color: #f1f5f9;
        }

        .table tr:nth-child(odd) td {
            background-color: white;
        }

        .severity-badge {
            padding: 4px 8px;
            font-size: 8px;
            font-weight: bold;
            color: white;
            border: 1px solid;
            display: inline-block;
        }

        .severity-normal {
            background-color: #10b981;
            border-color: #059669;
        }
        .severity-ringan {
            background-color: #f59e0b;
            border-color: #d97706;
        }
        .severity-sedang {
            background-color: #f97316;
            border-color: #ea580c;
        }
        .severity-berat {
            background-color: #ef4444;
            border-color: #dc2626;
        }

        .cf-value {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            background-color: #6366f1;
            color: white;
            padding: 3px 6px;
            font-size: 9px;
            border: 1px solid #4f46e5;
        }

        .footer {
            margin-top: 30px;
            padding: 15px;
            background-color: #374151;
            color: white;
            text-align: center;
            font-size: 11px;
            border: 2px solid #1f2937;
        }

        .footer .title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .summary-section {
            background-color: white;
            border: 2px solid #e2e8f0;
            margin-bottom: 20px;
            padding: 15px;
        }

        .summary-grid {
            width: 100%;
        }

        .summary-col {
            width: 33.33%;
            float: left;
            padding: 10px;
            border-right: 1px solid #e2e8f0;
        }

        .summary-col:last-child {
            border-right: none;
        }

        .summary-col h4 {
            margin: 0 0 12px 0;
            font-size: 13px;
            color: #1e40af;
            font-weight: bold;
            padding-bottom: 6px;
            border-bottom: 2px solid #e2e8f0;
        }

        .summary-item {
            margin-bottom: 8px;
            font-size: 11px;
            padding: 4px 0;
            border-bottom: 1px dotted #cbd5e1;
        }

        .summary-item:last-child {
            border-bottom: none;
        }

        .summary-item .key {
            color: #475569;
            font-weight: normal;
            width: 60%;
            display: inline-block;
        }

        .summary-item .value {
            font-weight: bold;
            color: #1e40af;
        }

        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }

        .no-data {
            text-align: center;
            padding: 30px;
            color: #64748b;
            background-color: white;
            border: 2px solid #e2e8f0;
            font-size: 14px;
            font-weight: bold;
        }

        /* Numbered rows */
        .table tbody tr td:first-child {
            background-color: #f8fafc;
            font-weight: bold;
            text-align: center;
        }

        /* Highlight important data */
        .mahasiswa-name {
            font-weight: bold;
            color: #1e40af;
        }

        .nim-code {
            font-family: 'Courier New', monospace;
            background-color: #f1f5f9;
            padding: 2px 4px;
            border: 1px solid #cbd5e1;
        }

        .fakultas-badge {
            background-color: #e0f2fe;
            color: #0369a1;
            padding: 2px 6px;
            border: 1px solid #0284c7;
            font-size: 8px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>LAPORAN RIWAYAT KONSULTASI</h1>
        <div class="period">
            @if(isset($period) && is_array($period))
                Periode: {{ \Carbon\Carbon::parse($period['start'])->format('d F Y') }} - {{ \Carbon\Carbon::parse($period['end'])->format('d F Y') }}
            @else
                Periode: {{ date('d F Y') }}
            @endif
        </div>
        <div class="generated">
            Dihasilkan pada: {{ isset($generated_at) ? $generated_at->format('d F Y H:i:s') : now()->format('d F Y H:i:s') }}
        </div>
    </div>

    <!-- Summary Statistics -->
    <div class="stats-section">
        <table class="stats-grid">
            <tr>
                <td class="stats-cell stats-cell-1">
                    <span class="label">TOTAL KONSULTASI</span>
                    <span class="value">
                        @if(isset($stats['total_konsultasi']))
                            {{ number_format($stats['total_konsultasi']) }}
                        @elseif(isset($riwayat))
                            {{ count($riwayat) }}
                        @else
                            0
                        @endif
                    </span>
                </td>
                <td class="stats-cell stats-cell-2">
                    <span class="label">MAHASISWA AKTIF</span>
                    <span class="value">
                        @if(isset($stats['mahasiswa_aktif']))
                            {{ number_format($stats['mahasiswa_aktif']) }}
                        @elseif(isset($riwayat))
                            {{ collect($riwayat)->pluck('id_mahasiswa')->unique()->count() }}
                        @else
                            0
                        @endif
                    </span>
                </td>
                <td class="stats-cell stats-cell-3">
                    <span class="label">RATA-RATA CF</span>
                    <span class="value">
                        @if(isset($stats['rata_rata_cf']) && $stats['rata_rata_cf'] > 0)
                            {{ number_format($stats['rata_rata_cf'], 3) }}
                        @elseif(isset($riwayat) && count($riwayat) > 0)
                            @php
                                $totalCF = collect($riwayat)->sum(function($item) {
                                    return is_numeric($item->nilai_cf) ? $item->nilai_cf : 0;
                                });
                                $avgCF = count($riwayat) > 0 ? $totalCF / count($riwayat) : 0;
                            @endphp
                            {{ number_format($avgCF, 3) }}
                        @else
                            0.000
                        @endif
                    </span>
                </td>
                <td class="stats-cell stats-cell-4">
                    <span class="label">CF TERTINGGI</span>
                    <span class="value">
                        @if(isset($stats['cf_tertinggi']) && $stats['cf_tertinggi'] > 0)
                            {{ number_format($stats['cf_tertinggi'], 3) }}
                        @elseif(isset($riwayat) && count($riwayat) > 0)
                            @php
                                $maxCF = collect($riwayat)->max(function($item) {
                                    return is_numeric($item->nilai_cf) ? $item->nilai_cf : 0;
                                });
                            @endphp
                            {{ number_format($maxCF ?? 0, 3) }}
                        @else
                            0.000
                        @endif
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <!-- Detailed Summary -->
    <div class="section-title">RINGKASAN DETAIL</div>
    <div class="summary-section">
        <div class="summary-grid clearfix">
            <div class="summary-col">
                <h4>TINGKAT KEPARAHAN</h4>
                @if(isset($stats['tingkat_keparahan']) && is_array($stats['tingkat_keparahan']) && count($stats['tingkat_keparahan']) > 0)
                    @foreach($stats['tingkat_keparahan'] as $severity => $count)
                        <div class="summary-item">
                            <span class="key">{{ $severity }}:</span>
                            <span class="value">{{ number_format($count) }}</span>
                        </div>
                    @endforeach
                @elseif(isset($riwayat) && count($riwayat) > 0)
                    @php
                        $severityCount = collect($riwayat)->groupBy('tingkat_keparahan')->map->count();
                    @endphp
                    @foreach($severityCount as $severity => $count)
                        <div class="summary-item">
                            <span class="key">{{ $severity }}:</span>
                            <span class="value">{{ $count }}</span>
                        </div>
                    @endforeach
                @else
                    <div class="summary-item">Tidak ada data</div>
                @endif
            </div>
            <div class="summary-col">
                <h4>FAKULTAS TERBANYAK</h4>
                @if(isset($stats['fakultas_distribution']) && is_array($stats['fakultas_distribution']) && count($stats['fakultas_distribution']) > 0)
                    @php
                        $topFaculties = collect($stats['fakultas_distribution'])
                            ->sortDesc()
                            ->take(5);
                    @endphp
                    @foreach($topFaculties as $faculty => $count)
                        <div class="summary-item">
                            <span class="key">{{ Str::limit($faculty ?: 'Tidak Diketahui', 15) }}:</span>
                            <span class="value">{{ number_format($count) }}</span>
                        </div>
                    @endforeach
                @elseif(isset($riwayat) && count($riwayat) > 0)
                    @php
                        $facultyCount = collect($riwayat)
                            ->pluck('mahasiswa.fakultas')
                            ->filter()
                            ->groupBy(function($item) { return $item; })
                            ->map->count()
                            ->sortDesc()
                            ->take(5);
                    @endphp
                    @foreach($facultyCount as $faculty => $count)
                        <div class="summary-item">
                            <span class="key">{{ Str::limit($faculty, 15) }}:</span>
                            <span class="value">{{ $count }}</span>
                        </div>
                    @endforeach
                @else
                    <div class="summary-item">Tidak ada data</div>
                @endif
            </div>
            <div class="summary-col">
                <h4>STATISTIK CF</h4>
                @php
                    $cfValues = isset($riwayat) ? collect($riwayat)->pluck('nilai_cf')->filter(function($cf) {
                        return is_numeric($cf) && $cf > 0;
                    }) : collect([]);

                    $avgCF = $cfValues->count() > 0 ? $cfValues->avg() : 0;
                    $maxCF = $cfValues->count() > 0 ? $cfValues->max() : 0;
                    $minCF = $cfValues->count() > 0 ? $cfValues->min() : 0;
                    $totalKonsultasi = isset($riwayat) ? count($riwayat) : 0;
                    $mahasiswaAktif = isset($riwayat) ? collect($riwayat)->pluck('id_mahasiswa')->unique()->count() : 0;
                @endphp

                <div class="summary-item">
                    <span class="key">Rata-rata:</span>
                    <span class="value">
                        {{ isset($stats['rata_rata_cf']) && $stats['rata_rata_cf'] > 0
                            ? number_format($stats['rata_rata_cf'], 3)
                            : number_format($avgCF, 3) }}
                    </span>
                </div>
                <div class="summary-item">
                    <span class="key">Tertinggi:</span>
                    <span class="value">
                        {{ isset($stats['cf_tertinggi']) && $stats['cf_tertinggi'] > 0
                            ? number_format($stats['cf_tertinggi'], 3)
                            : number_format($maxCF, 3) }}
                    </span>
                </div>
                <div class="summary-item">
                    <span class="key">Terendah:</span>
                    <span class="value">
                        {{ isset($stats['cf_terendah']) && $stats['cf_terendah'] > 0
                            ? number_format($stats['cf_terendah'], 3)
                            : number_format($minCF, 3) }}
                    </span>
                </div>
                <div class="summary-item">
                    <span class="key">Rata-rata per Mahasiswa:</span>
                    <span class="value">
                        {{ $mahasiswaAktif > 0 ? number_format($totalKonsultasi / $mahasiswaAktif, 1) : '0.0' }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Data Table -->
    <div class="section-title">DETAIL RIWAYAT KONSULTASI</div>

    @if(isset($riwayat) && count($riwayat) > 0)
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 6%;">NO</th>
                    <th style="width: 10%;">TANGGAL</th>
                    <th style="width: 16%;">MAHASISWA</th>
                    <th style="width: 10%;">NIM</th>
                    <th style="width: 22%;">HASIL DIAGNOSA</th>
                    <th style="width: 14%;">TINGKAT</th>
                    <th style="width: 8%;">CF</th>
                    <th style="width: 14%;">FAKULTAS</th>
                </tr>
            </thead>
            <tbody>
                @foreach($riwayat as $index => $konsultasi)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>
                            @if(isset($konsultasi->tanggal_konsultasi))
                                {{ \Carbon\Carbon::parse($konsultasi->tanggal_konsultasi)->format('d/m/Y') }}
                            @else
                                N/A
                            @endif
                        </td>
                        <td class="mahasiswa-name">
                            {{ isset($konsultasi->mahasiswa->nama) ? $konsultasi->mahasiswa->nama : 'N/A' }}
                        </td>
                        <td>
                            <span class="nim-code">
                                {{ isset($konsultasi->mahasiswa->nim) ? $konsultasi->mahasiswa->nim : 'N/A' }}
                            </span>
                        </td>
                        <td>
                            {{ isset($konsultasi->hasil_diagnosa) ? Str::limit($konsultasi->hasil_diagnosa, 35) : 'N/A' }}
                        </td>
                        <td>
                            @php
                                $tingkatKeparahan = $konsultasi->tingkat_keparahan ?? 'N/A';
                                $severityClass = 'severity-normal';

                                if (str_contains($tingkatKeparahan, 'Ringan')) {
                                    $severityClass = 'severity-ringan';
                                } elseif (str_contains($tingkatKeparahan, 'Sedang')) {
                                    $severityClass = 'severity-sedang';
                                } elseif (str_contains($tingkatKeparahan, 'Berat')) {
                                    $severityClass = 'severity-berat';
                                }
                            @endphp
                            <span class="severity-badge {{ $severityClass }}">
                                {{ Str::limit($tingkatKeparahan, 12) }}
                            </span>
                        </td>
                        <td>
                            <span class="cf-value">
                                {{ isset($konsultasi->nilai_cf) && is_numeric($konsultasi->nilai_cf)
                                    ? number_format($konsultasi->nilai_cf, 3)
                                    : '0.000' }}
                            </span>
                        </td>
                        <td>
                            <span class="fakultas-badge">
                                {{ isset($konsultasi->mahasiswa->fakultas)
                                    ? Str::limit($konsultasi->mahasiswa->fakultas, 12)
                                    : 'N/A' }}
                            </span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            TIDAK ADA DATA KONSULTASI PADA PERIODE YANG DIPILIH
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <div class="title">SISTEM PAKAR DIAGNOSIS DEPRESI MAHASISWA</div>
        <div>
            {{ url('/') }} |
            Dihasilkan pada: {{ isset($generated_at) ? $generated_at->format('d F Y H:i:s') : now()->format('d F Y H:i:s') }}
        </div>
    </div>
</body>
</html>
