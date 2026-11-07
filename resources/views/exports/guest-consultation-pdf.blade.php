<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Konsultasi Guest</title>
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
            background-color: #0891b2;
            color: white;
            padding: 20px;
            border: 3px solid #0e7490;
        }

        .header h1 {
            font-size: 22px;
            margin: 0 0 8px 0;
            font-weight: bold;
            color: #ffffff;
        }

        .header .subtitle {
            font-size: 13px;
            color: #cffafe;
            margin: 5px 0;
        }

        .header .period {
            font-size: 14px;
            color: #e0f2fe;
            margin: 8px 0;
            font-weight: bold;
        }

        .header .generated {
            font-size: 11px;
            margin-top: 8px;
            color: #a5f3fc;
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
            width: 20%;
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

        .stats-cell-5 {
            background-color: #6366f1;
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
            background-color: #0e7490;
            color: white;
            border-left: 5px solid #0891b2;
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
            background-color: #0891b2;
            color: white;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
        }

        .table tr:nth-child(even) td {
            background-color: #f0fdfa;
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
            border-radius: 3px;
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
            border-radius: 3px;
        }

        .footer {
            margin-top: 30px;
            padding: 15px;
            background-color: #0e7490;
            color: white;
            text-align: center;
            font-size: 11px;
            border: 2px solid #155e75;
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
            color: #0891b2;
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
            color: #0891b2;
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

        .table tbody tr td:first-child {
            background-color: #f8fafc;
            font-weight: bold;
            text-align: center;
        }

        .guest-name {
            font-weight: bold;
            color: #0891b2;
        }

        .email-code {
            font-family: 'Courier New', monospace;
            background-color: #f1f5f9;
            padding: 2px 4px;
            border: 1px solid #cbd5e1;
            font-size: 8px;
        }

        .fakultas-badge {
            background-color: #e0f2fe;
            color: #0369a1;
            padding: 2px 6px;
            border: 1px solid #0284c7;
            font-size: 8px;
            border-radius: 3px;
        }

        .gender-badge {
            background-color: #fef3c7;
            color: #92400e;
            padding: 2px 6px;
            border: 1px solid #d97706;
            font-size: 8px;
            border-radius: 3px;
        }

        .guest-info {
            font-size: 9px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>LAPORAN KONSULTASI GUEST</h1>
        <div class="subtitle">Sistem Pakar Diagnosa Gangguan Depresi Mahasiswa</div>
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
                        {{ isset($stats['total_konsultasi']) ? number_format($stats['total_konsultasi']) : 0 }}
                    </span>
                </td>
                <td class="stats-cell stats-cell-2">
                    <span class="label">UNIQUE VISITORS</span>
                    <span class="value">
                        {{ isset($guestConsultations) ? collect($guestConsultations)->pluck('email')->unique()->count() : 0 }}
                    </span>
                </td>
                <td class="stats-cell stats-cell-3">
                    <span class="label">RATA-RATA CF</span>
                    <span class="value">
                        {{ isset($stats['rata_rata_cf']) ? number_format($stats['rata_rata_cf'], 3) : '0.000' }}
                    </span>
                </td>
                <td class="stats-cell stats-cell-4">
                    <span class="label">CF TERTINGGI</span>
                    <span class="value">
                        {{ isset($stats['cf_tertinggi']) ? number_format($stats['cf_tertinggi'], 3) : '0.000' }}
                    </span>
                </td>
                <td class="stats-cell stats-cell-5">
                    <span class="label">RATA-RATA UMUR</span>
                    <span class="value">
                        {{ isset($stats['umur_rata_rata']) ? number_format($stats['umur_rata_rata'], 0) : 0 }} th
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
                            <span class="key">{{ Str::limit($faculty ?: 'Guest (Tanpa Fakultas)', 18) }}:</span>
                            <span class="value">{{ number_format($count) }}</span>
                        </div>
                    @endforeach
                @else
                    <div class="summary-item">Tidak ada data</div>
                @endif
            </div>
            <div class="summary-col">
                <h4>JENIS KELAMIN</h4>
                @if(isset($stats['jenis_kelamin_distribution']) && is_array($stats['jenis_kelamin_distribution']) && count($stats['jenis_kelamin_distribution']) > 0)
                    @foreach($stats['jenis_kelamin_distribution'] as $gender => $count)
                        <div class="summary-item">
                            <span class="key">{{ $gender }}:</span>
                            <span class="value">{{ number_format($count) }}</span>
                        </div>
                    @endforeach
                @else
                    <div class="summary-item">Tidak ada data</div>
                @endif
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                    <h4 style="margin-bottom: 8px;">STATISTIK CF</h4>
                    <div class="summary-item">
                        <span class="key">CF Terendah:</span>
                        <span class="value">
                            {{ isset($stats['cf_terendah']) ? number_format($stats['cf_terendah'], 3) : '0.000' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Data Table -->
    <div class="section-title">DETAIL KONSULTASI GUEST</div>

    @if(isset($guestConsultations) && count($guestConsultations) > 0)
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 5%;">NO</th>
                    <th style="width: 10%;">TANGGAL</th>
                    <th style="width: 20%;">INFORMASI GUEST</th>
                    <th style="width: 23%;">HASIL DIAGNOSA</th>
                    <th style="width: 15%;">TINGKAT KEPARAHAN</th>
                    <th style="width: 8%;">CF</th>
                    <th style="width: 19%;">DETAIL</th>
                </tr>
            </thead>
            <tbody>
                @foreach($guestConsultations as $index => $konsultasi)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>
                            {{ \Carbon\Carbon::parse($konsultasi->created_at)->format('d/m/Y') }}<br>
                            <span style="font-size: 8px; color: #64748b;">
                                {{ \Carbon\Carbon::parse($konsultasi->created_at)->format('H:i') }}
                            </span>
                        </td>
                        <td>
                            <span class="guest-name">{{ $konsultasi->nama ?? 'Unknown' }}</span><br>
                            <span class="email-code">{{ Str::limit($konsultasi->email ?? '', 22) }}</span><br>
                            <div class="guest-info" style="margin-top: 3px;">
                                <span class="gender-badge">
                                    {{ $konsultasi->jenis_kelamin ?? 'L' }}
                                </span>
                                {{ $konsultasi->umur ?? 0 }} tahun
                            </div>
                        </td>
                        <td>
                            {{ Str::limit($konsultasi->hasil_diagnosa ?? 'N/A', 45) }}
                        </td>
                        <td>
                            @php
                                $tingkatKeparahan = $konsultasi->tingkat_keparahan ?? 'N/A';
                                $severityClass = 'severity-normal';

                                if (str_contains($tingkatKeparahan, 'Ringan') || str_contains($tingkatKeparahan, 'Mild')) {
                                    $severityClass = 'severity-ringan';
                                } elseif (str_contains($tingkatKeparahan, 'Sedang') || str_contains($tingkatKeparahan, 'Moderate')) {
                                    $severityClass = 'severity-sedang';
                                } elseif (str_contains($tingkatKeparahan, 'Berat') || str_contains($tingkatKeparahan, 'Severe')) {
                                    $severityClass = 'severity-berat';
                                }
                            @endphp
                            <span class="severity-badge {{ $severityClass }}">
                                {{ Str::limit($tingkatKeparahan, 18) }}
                            </span>
                        </td>
                        <td>
                            <span class="cf-value">
                                {{ number_format($konsultasi->nilai_cf ?? 0, 3) }}
                            </span>
                        </td>
                        <td>
                            @if($konsultasi->fakultas)
                                <span class="fakultas-badge">
                                    {{ Str::limit($konsultasi->fakultas, 18) }}
                                </span><br>
                            @endif
                            @if($konsultasi->nim)
                                <span style="font-size: 8px; color: #64748b;">
                                    NIM: {{ $konsultasi->nim }}
                                </span><br>
                            @endif
                            @if($konsultasi->program_studi)
                                <span style="font-size: 8px; color: #64748b;">
                                    {{ Str::limit($konsultasi->program_studi, 16) }}
                                </span>
                            @else
                                <span style="font-size: 8px; color: #94a3b8; font-style: italic;">
                                    Guest (Non-Mahasiswa)
                                </span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

    @else
        <div class="no-data">
            TIDAK ADA DATA KONSULTASI GUEST PADA PERIODE YANG DIPILIH
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <div class="title">SISTEM PAKAR DIAGNOSA DEPRESI MAHASISWA</div>
        <div>
            Laporan Konsultasi Guest |
            Dihasilkan pada: {{ isset($generated_at) ? $generated_at->format('d F Y H:i:s') : now()->format('d F Y H:i:s') }}
        </div>
        <div style="margin-top: 5px; font-size: 10px;">
            © {{ date('Y') }} - Sistem Pakar Diagnosa Gangguan Depresi
        </div>
    </div>
</body>
</html>
