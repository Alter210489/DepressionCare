<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hasil Konsultasi Kesehatan Mental - ID: {{ $konsultasi->id_konsultasi ?? 'N/A' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #1f2937;
            background: #ffffff;
        }

        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header */
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
        }

        .header .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 5px;
        }

        .header .meta {
            font-size: 11px;
            color: #9ca3af;
        }

        /* Patient Info */
        .patient-info {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .patient-info h2 {
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
        }

        .info-grid {
            display: table;
            width: 100%;
        }

        .info-row {
            display: table-row;
        }

        .info-label, .info-value {
            display: table-cell;
            padding: 4px 0;
            vertical-align: top;
        }

        .info-label {
            font-weight: bold;
            width: 30%;
            color: #4b5563;
        }

        .info-value {
            width: 70%;
            color: #1f2937;
        }

        /* Results Section */
        .results-section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 2px solid #3b82f6;
        }

        /* Diagnosis Card */
        .diagnosis-card {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .diagnosis-card.severe {
            background: #fef2f2;
            border-color: #ef4444;
        }

        .diagnosis-card.moderate {
            background: #fff7ed;
            border-color: #f97316;
        }

        .diagnosis-card.mild {
            background: #fef3c7;
            border-color: #f59e0b;
        }

        .diagnosis-card.normal {
            background: #f0fdf4;
            border-color: #22c55e;
        }

        .diagnosis-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }

        .severity-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 10px;
        }

        .severity-normal {
            background: #dcfce7;
            color: #166534;
        }

        .severity-mild {
            background: #fef3c7;
            color: #92400e;
        }

        .severity-moderate {
            background: #fed7aa;
            color: #c2410c;
        }

        .severity-severe {
            background: #fecaca;
            color: #dc2626;
        }

        /* CF Analysis */
        .cf-analysis {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .cf-grid {
            display: table;
            width: 100%;
        }

        .cf-row {
            display: table-row;
        }

        .cf-cell {
            display: table-cell;
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }

        .cf-header {
            font-weight: bold;
            background: #e2e8f0;
            color: #374151;
        }

        .cf-value {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #1e40af;
        }

        /* Recommendations */
        .recommendations {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 15px;
            margin-bottom: 20px;
        }

        .recommendations h3 {
            font-size: 14px;
            font-weight: bold;
            color: #166534;
            margin-bottom: 10px;
        }

        .recommendations ul {
            list-style: none;
            padding-left: 0;
        }

        .recommendations li {
            margin-bottom: 6px;
            padding-left: 20px;
            position: relative;
        }

        .recommendations li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #22c55e;
            font-weight: bold;
        }

        /* Symptoms Table */
        .symptoms-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }

        .symptoms-table th,
        .symptoms-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }

        .symptoms-table th {
            background: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }

        .symptoms-table tr:nth-child(even) {
            background: #f9fafb;
        }

        .symptom-code {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #1e40af;
            font-size: 10px;
        }

        /* Emergency Notice */
        .emergency-notice {
            background: #fef2f2;
            border: 2px solid #ef4444;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .emergency-notice h3 {
            font-size: 14px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 8px;
        }

        /* Disclaimer */
        .disclaimer {
            background: #fffbeb;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 12px;
            margin-top: 20px;
            font-size: 10px;
            color: #92400e;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
        }

        /* Page Break */
        .page-break {
            page-break-before: always;
        }

        /* Print Specific */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }

            .container {
                margin: 0;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>HASIL KONSULTASI KESEHATAN MENTAL</h1>
            <div class="subtitle">Sistem Deteksi Dini menggunakan Metode Certainty Factor (CF)</div>
            <div class="meta">
                Digenerate pada: {{ $generated_at->format('d M Y, H:i:s') }} WIB
            </div>
        </div>

        <!-- Patient/Consultation Info -->
        <div class="patient-info">
            <h2>Informasi Konsultasi</h2>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">ID Konsultasi:</div>
                    <div class="info-value">#{{ $konsultasi->id_konsultasi ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Tanggal Konsultasi:</div>
                    <div class="info-value">
                        {{ $konsultasi->tanggal_konsultasi ?
                            \Carbon\Carbon::parse($konsultasi->tanggal_konsultasi)->format('d M Y, H:i') . ' WIB' :
                            'Tidak tersedia' }}
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Metode Analisis:</div>
                    <div class="info-value">Certainty Factor (CF) Only</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Total Gejala Dievaluasi:</div>
                    <div class="info-value">{{ count($gejalaDetails) }} gejala</div>
                </div>
            </div>
        </div>

        <!-- Main Diagnosis Result -->
        <div class="results-section">
            <h2 class="section-title">Hasil Diagnosis</h2>

            @php
                $tingkatKeparahan = $konsultasi->tingkat_keparahan ?? 'Tidak Diketahui';
                $severityClass = 'normal';
                $severityBadgeClass = 'severity-normal';

                if (stripos($tingkatKeparahan, 'berat') !== false || stripos($tingkatKeparahan, 'severe') !== false) {
                    $severityClass = 'severe';
                    $severityBadgeClass = 'severity-severe';
                } elseif (stripos($tingkatKeparahan, 'sedang') !== false || stripos($tingkatKeparahan, 'moderate') !== false) {
                    $severityClass = 'moderate';
                    $severityBadgeClass = 'severity-moderate';
                } elseif (stripos($tingkatKeparahan, 'ringan') !== false || stripos($tingkatKeparahan, 'mild') !== false) {
                    $severityClass = 'mild';
                    $severityBadgeClass = 'severity-mild';
                }
            @endphp

            <div class="diagnosis-card {{ $severityClass }}">
                <div class="diagnosis-title">
                    {{ $konsultasi->diagnosa->nama_diagnosa ?? $konsultasi->hasil_diagnosa ?? 'Diagnosis tidak tersedia' }}
                </div>

                <span class="severity-badge {{ $severityBadgeClass }}">
                    {{ $tingkatKeparahan }}
                </span>

                <div style="margin-top: 10px; line-height: 1.5;">
                    {{ $konsultasi->diagnosa->deskripsi_diagnosa ?? 'Deskripsi diagnosis tidak tersedia.' }}
                </div>
            </div>
        </div>

        <!-- CF Analysis -->
        <div class="results-section">
            <h2 class="section-title">Analisis Certainty Factor (CF)</h2>

            <div class="cf-analysis">
                <div class="cf-grid">
                    <div class="cf-row">
                        <div class="cf-cell cf-header">Parameter</div>
                        <div class="cf-cell cf-header">Nilai</div>
                        <div class="cf-cell cf-header">Keterangan</div>
                    </div>
                    <div class="cf-row">
                        <div class="cf-cell">CF Gabungan</div>
                        <div class="cf-cell cf-value">{{ number_format($konsultasi->nilai_cf ?? 0, 4) }}</div>
                        <div class="cf-cell">Nilai kepercayaan sistem (0.0 - 1.0)</div>
                    </div>
                    <div class="cf-row">
                        <div class="cf-cell">Persentase Keyakinan</div>
                        <div class="cf-cell cf-value">{{ number_format(($konsultasi->nilai_cf ?? 0) * 100, 1) }}%</div>
                        <div class="cf-cell">Tingkat akurasi diagnosis</div>
                    </div>
                    <div class="cf-row">
                        <div class="cf-cell">Status Keyakinan</div>
                        <div class="cf-cell cf-value">{{ $confidenceLevel['label'] ?? 'Tidak Diketahui' }}</div>
                        <div class="cf-cell">
                            @if(($konsultasi->nilai_cf ?? 0) >= 0.98)
                                Sangat Yakin (≥98%)
                            @elseif(($konsultasi->nilai_cf ?? 0) >= 0.85)
                                Yakin (85-97%)
                            @elseif(($konsultasi->nilai_cf ?? 0) >= 0.50)
                                Cukup Yakin (50-84%)
                            @else
                                Kurang Yakin (0-49%)
                            @endif
                        </div>
                    </div>
                    <div class="cf-row">
                        <div class="cf-cell">Gejala Relevan</div>
                        <div class="cf-cell cf-value">
                            {{ collect($gejalaDetails)->where('cf_hasil', '>', 0)->count() }}/{{ count($gejalaDetails) }}
                        </div>
                        <div class="cf-cell">Jumlah gejala dengan CF positif</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recommendations -->
        @if(isset($rekomendasi) && !empty($rekomendasi))
        <div class="results-section">
            <h2 class="section-title">Rekomendasi Tindakan</h2>

            <div class="recommendations">
                <h3>Langkah-langkah yang Disarankan:</h3>
                <ul>
                    @if(is_array($rekomendasi))
                        @foreach($rekomendasi as $item)
                            <li>{{ $item }}</li>
                        @endforeach
                    @else
                        @php
                            $rekomendasiArray = [];
                            try {
                                $rekomendasiArray = json_decode($rekomendasi, true);
                                if (!is_array($rekomendasiArray)) {
                                    $rekomendasiArray = [$rekomendasi];
                                }
                            } catch (Exception $e) {
                                $rekomendasiArray = [$rekomendasi];
                            }
                        @endphp
                        @foreach($rekomendasiArray as $item)
                            <li>{{ $item }}</li>
                        @endforeach
                    @endif
                </ul>
            </div>
        </div>
        @endif

        <!-- Emergency Notice for Severe Cases -->
        @if($severityClass === 'severe' || $severityClass === 'moderate')
        <div class="emergency-notice">
            <h3>⚠️ PERHATIAN PENTING</h3>
            <p><strong>Segera konsultasi dengan profesional kesehatan mental!</strong></p>
            <p>Hasil menunjukkan tingkat keparahan yang memerlukan penanganan segera oleh psikolog atau psikiater berlisensi.</p>
            <div style="margin-top: 10px;">
                <strong>Kontak Darurat:</strong><br>
                • Hotline Crisis: 119 ext 8 (24/7)<br>
                • Bagian Kemahasiswaan kampus<br>
                • Klinik kesehatan kampus atau RS terdekat
            </div>
        </div>
        @endif

        <!-- Symptoms Analysis -->
        @if(!empty($gejalaDetails))
        <div class="results-section page-break">
            <h2 class="section-title">Rincian Gejala yang Dianalisis</h2>

            <table class="symptoms-table">
                <thead>
                    <tr>
                        <th width="10%">Kode</th>
                        <th width="35%">Nama Gejala</th>
                        <th width="20%">Kategori</th>
                        <th width="25%">Jawaban Anda</th>
                        <th width="10%">CF Hasil</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($gejalaDetails as $detail)
                        @if(isset($detail['gejala']))
                        <tr>
                            <td class="symptom-code">{{ $detail['gejala']['kode_gejala'] ?? 'N/A' }}</td>
                            <td>{{ $detail['gejala']['nama_gejala'] ?? 'Nama tidak tersedia' }}</td>
                            <td style="text-transform: capitalize;">
                                {{ str_replace('_', ' ', $detail['gejala']['kategori_gejala'] ?? 'Tidak diketahui') }}
                            </td>
                            <td>{{ $detail['opsi_terpilih']['text'] ?? 'Tidak ada jawaban' }}</td>
                            <td class="cf-value" style="text-align: center;">
                                {{ number_format($detail['cf_hasil'] ?? 0, 3) }}
                            </td>
                        </tr>
                        @endif
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Method Information -->
        <div class="results-section">
            <h2 class="section-title">Tentang Metode Certainty Factor (CF)</h2>

            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="margin-bottom: 10px;"><strong>Certainty Factor (CF)</strong> adalah metode yang digunakan untuk mengukur tingkat kepercayaan atau keyakinan sistem terhadap hasil diagnosis berdasarkan gejala-gejala yang diinput.</p>

                <p style="margin-bottom: 10px;"><strong>Formula Kombinasi CF:</strong> CF = CF1 + CF2 × (1 - CF1)</p>

                <p style="margin-bottom: 10px;"><strong>Interpretasi Nilai CF:</strong></p>
                <ul style="list-style-type: disc; margin-left: 20px; margin-bottom: 10px;">
                    <li>≥ 0.98 (≥98%): Tingkat Berat - Keyakinan sangat tinggi</li>
                    <li>0.85 - 0.97 (85-97%): Tingkat Sedang - Keyakinan tinggi</li>
                    <li>0.50 - 0.84 (50-84%): Tingkat Ringan - Keyakinan sedang</li>
                    <li>0.00 - 0.49 (0-49%): Tingkat Normal - Keyakinan rendah</li>
                </ul>

                <p><strong>Keunggulan:</strong> Memberikan hasil diagnosis yang terukur dengan tingkat kepercayaan yang jelas.</p>
            </div>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer">
            <strong>DISCLAIMER MEDIS:</strong> Hasil konsultasi ini merupakan screening awal menggunakan sistem AI berbasis Certainty Factor dan
            <strong>BUKAN diagnosis medis resmi</strong>. Hasil ini tidak dapat menggantikan konsultasi langsung dengan dokter, psikolog,
            atau profesional kesehatan mental berlisensi. Untuk evaluasi dan penanganan yang tepat, sangat disarankan untuk berkonsultasi
            dengan tenaga medis profesional. Sistem ini bertujuan untuk memberikan indikasi awal dan tidak bertanggung jawab atas keputusan
            medis yang diambil berdasarkan hasil ini.
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini digenerate secara otomatis oleh Sistem Deteksi Kesehatan Mental</p>
            <p>ID Konsultasi: #{{ $konsultasi->id_konsultasi ?? 'N/A' }} |
               Tanggal Generate: {{ $generated_at->format('d/m/Y H:i:s') }} WIB</p>
            <p>© {{ date('Y') }} - Sistem Kesehatan Mental Kampus</p>
        </div>
    </div>
</body>
</html>
