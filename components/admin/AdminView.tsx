
import React, { useState } from 'react';
import KpiManager from './KpiManager';
import SchemeManager from './SchemeManager';

const KpiConfigInstruction: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Petunjuk Konfigurasi KPI</h2>
                <i className={`bx bx-chevron-down text-2xl text-slate-500 dark:text-slate-400 transition-transform transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && (
                <div className="px-5 pb-6 text-slate-600 dark:text-slate-300 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p>Halaman ini adalah pusat kendali untuk semua perhitungan insentif. Semua pengaturan di sini bersifat spesifik untuk divisi yang sedang dipilih.</p>
                    <ol className="list-decimal list-inside space-y-3">
                        <li><b>Pengaturan Matriks KPI:</b>
                            <ul className="list-disc list-inside pl-4 text-sm space-y-1 mt-1">
                                <li><b>Metode Kalkulasi:</b> Pilih cara bonus dihitung. Perubahan antara "Berbasis Omset" dan "Berbasis Poin" akan menghapus skema bonus yang ada (lihat detail di bawah).</li>
                                <li><b>Tambah/Edit KPI:</b> Gunakan formulir di bawah tabel untuk menambahkan atau mengedit KPI.</li>
                                <li><b>Platform/Grup:</b> Tentukan grup untuk KPI (misal: Shopee). Ini akan mengelompokkan KPI di halaman kalkulator.</li>
                                <li><b>Tipe Target:</b> Pilih apakah target berupa Rupiah (Rp), Persentase (%), atau Angka biasa.</li>
                                <li><b>Total Bobot:</b> Pastikan total bobot dari semua KPI untuk satu divisi adalah 100%.</li>
                            </ul>
                        </li>
                        <li><b>Pengaturan Skema & Indikator:</b>
                            <ul className="list-disc list-inside pl-4 text-sm space-y-1 mt-1">
                                <li><b>Skema Bonus (Multiplier):</b> Atur tingkatan bonus berdasarkan pencapaian omset total atau poin total. Bagian ini tidak aktif jika metode "Non Sales" dipilih.</li>
                                <li><b>Indikator KPI:</b> Atur tingkatan performa kualitatif (misal: Excellent, Good) berdasarkan total poin yang dicapai.</li>
                            </ul>
                        </li>
                        <li><b>Perilaku Sistem & Fitur Otomatis (Penting!):</b>
                            <ul className="list-disc list-inside pl-4 text-sm space-y-2 mt-1">
                                <li><b>Total Omset:</b> Untuk divisi "Berbasis Omset", sistem otomatis menjumlahkan semua KPI bertipe Rupiah (Rp) yang namanya mengandung kata <strong>"omset"</strong>.</li>
                                <li><b>ROAS Otomatis:</b> Jika nama KPI mengandung kata <strong>"ROAS"</strong>, nilainya akan dihitung otomatis. Agar berfungsi, pastikan ada juga KPI dengan nama mengandung <strong>"omset"</strong> dan <strong>"biaya"</strong> dalam satu Platform/Grup yang sama.</li>
                                <li><b>Target Minimum ROAS:</b> Untuk KPI ROAS, Anda bisa menetapkan "Target Min.". Jika realisasi berada di bawah target minimum ini, poin untuk KPI tersebut akan otomatis menjadi <strong>nol (0)</strong>.</li>
                                <li><b>Batas Poin (Capping):</b> Saat membuat KPI, Anda dapat memilih Batas Poin "Poin Maksimal". Opsi ini akan membatasi poin yang dihasilkan KPI tersebut agar tidak melebihi nilai <strong>Bobot</strong>-nya.</li>
                                <li><strong className="text-amber-600 dark:text-amber-400">Peringatan Reset Skema Bonus:</strong> Mengubah "Metode Kalkulasi" <strong>ANTARA</strong> "Berbasis Omset" dan "Berbasis Poin" akan secara otomatis <strong>MENGHAPUS</strong> semua skema bonus yang ada. Anda perlu mengaturnya kembali dari awal.</li>
                            </ul>
                        </li>
                    </ol>
                </div>
            )}
        </div>
    );
}

const AdminView: React.FC = () => {
    return (
        <div className="space-y-8">
            <KpiConfigInstruction />
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Pengaturan Matriks KPI</h2>
                <KpiManager />
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Pengaturan Skema & Indikator</h2>
                <SchemeManager />
            </div>
        </div>
    );
};

export default AdminView;