import React from 'react';
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface PrintPDFHandlerProps {
    konsultasiId: number;
}

const PrintPDFHandler: React.FC<PrintPDFHandlerProps> = ({ konsultasiId }) => {

    // Handle direct print tanpa pindah halaman
    const handleDirectPrint = () => {
        // Buka halaman PrintResult di window baru, tapi langsung print
        const printUrl = route('mahasiswa.konsultasi.result.print', konsultasiId);
        const printWindow = window.open(printUrl, '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert('Popup terblokir. Silakan aktifkan popup untuk fitur print.');
            return;
        }

        // Auto-close setelah print
        printWindow.onafterprint = () => {
            printWindow.close();
        };

        // Fallback: tutup setelah 3 detik jika onafterprint tidak berfungsi
        setTimeout(() => {
            if (!printWindow.closed) {
                printWindow.close();
            }
        }, 3000);
    };

    // Handle PDF download menggunakan server
    const handlePDFDownload = async () => {
        if (!konsultasiId) {
            alert('ID konsultasi tidak valid');
            return;
        }

        try {
            // Panggil endpoint PDF yang sudah ada
            const response = await fetch(route('mahasiswa.konsultasi.result.pdf', konsultasiId), {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `hasil_konsultasi_${konsultasiId}_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            } else {
                // Jika server PDF belum siap, gunakan print-to-PDF
                throw new Error('Server PDF belum tersedia');
            }
        } catch (error) {
            console.error('PDF Download Error:', error);

            // Fallback: Buka halaman print dan minta user save as PDF
            alert('Server PDF belum tersedia. Silakan gunakan "Print to PDF" dari browser setelah halaman terbuka.');
            const printUrl = route('mahasiswa.konsultasi.result.print', konsultasiId);
            window.open(printUrl, '_blank');
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleDirectPrint}
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                title="Print hasil konsultasi"
            >
                <PrinterIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
                onClick={handlePDFDownload}
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                title="Download PDF hasil konsultasi"
            >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">PDF</span>
            </button>
        </div>
    );
};

export default PrintPDFHandler;
