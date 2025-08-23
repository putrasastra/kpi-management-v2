
import React, { useState } from 'react';
import KpiManager from './KpiManager';
import SchemeManager from './SchemeManager';

const KpiConfigInstruction: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-6 text-white hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                    <i className='bx bxs-info-circle text-3xl'></i>
                    <h2 className="text-2xl font-bold">Petunjuk Konfigurasi KPI</h2>
                </div>
                <i className={`bx bx-chevron-down text-4xl transition-transform transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && (
                <div className="px-6 pb-6 text-blue-100 dark:text-blue-200 space-y-5 border-t border-white/20 pt-5">
                    <p className="text-lg">Halaman ini adalah pusat kendali untuk semua perhitungan insentif. Semua pengaturan di sini bersifat spesifik untuk divisi yang sedang dipilih.</p>
                    <ol className="list-decimal list-inside space-y-4 text-base">
                        <li>
                            <strong className="font-semibold text-white">Pengaturan Matriks KPI:</strong>
                            <ul className="list-disc list-inside pl-5 text-sm space-y-2 mt-2 bg-white/10 p-4 rounded-lg">
                                <li><b>Metode Kalkulasi:</b> Pilih cara bonus dihitung. Perubahan antara "Berbasis Omset" dan "Berbasis Poin" akan menghapus skema bonus yang ada.</li>
                                <li><b>Tambah/Edit KPI:</b> Gunakan formulir di bawah tabel untuk menambahkan atau mengedit KPI.</li>
                                <li><b>Platform/Grup:</b> Tentukan grup untuk KPI (misal: Shopee) untuk pengelompokan di kalkulator.</li>
                                <li><b>Jenis KPI:</b> Pilih <strong>GENERAL KPI</strong> untuk menambahkan <em>satu</em> KPI biasa, atau pilih <strong>KPI ROAS</strong> untuk menambahkan <em>paket KPI</em> sekaligus (ROAS wajib; Omset dan Biaya Iklan opsional).</li>
                                <li><b>Tipe Target:</b> Untuk <strong>GENERAL KPI</strong>, pilih apakah target berupa Rupiah (Rp), Persentase (%), atau Angka. Untuk <strong>KPI ROAS</strong>, target selalu berupa <strong>Angka</strong> dan tersedia kolom <strong>Target Min.</strong>.</li>
                                <li><b>Total Bobot:</b> Pastikan total bobot dari semua KPI untuk satu divisi adalah 100%.</li>
                            </ul>
                        </li>
                        <li>
                            <strong className="font-semibold text-white">Pengaturan Skema & Indikator:</strong>
                            <ul className="list-disc list-inside pl-5 text-sm space-y-2 mt-2 bg-white/10 p-4 rounded-lg">
                                <li><b>Skema Bonus (Multiplier):</b> Atur tingkatan bonus berdasarkan pencapaian omset/poin total.</li>
                                <li><b>Indikator KPI:</b> Atur tingkatan performa kualitatif (misal: Excellent) berdasarkan total poin.</li>
                            </ul>
                        </li>
                        <li>
                            <strong className="font-semibold text-white">Perilaku Sistem & Fitur Otomatis (Penting!):</strong>
                            <ul className="list-disc list-inside pl-5 text-sm space-y-3 mt-2 bg-white/10 p-4 rounded-lg">
                                <li><b>Total Omset Otomatis:</b> Untuk divisi "Berbasis Omset", sistem otomatis menjumlahkan <strong>semua KPI bertipe Rupiah (Rp)</strong> sebagai Omset Aktual. KPI yang berhubungan dengan biaya (nama mengandung <strong>kata kunci biaya</strong>, misal: "biaya", "cost", "ads", "iklan") <strong>tidak</strong> dihitung ke omset.</li>
                                <li><b>ROAS Otomatis + Pembuatan Paket:</b> Saat membuat KPI baru dengan <strong>Jenis KPI = "KPI ROAS"</strong>, sistem menyediakan satu form untuk membuat <strong>paket</strong> KPI: 1) <em>KPI ROAS</em> (bobot, target angka, target minimum), 2) <em>KPI Omset</em> (opsional, bobot dan target Rp), 3) <em>KPI Biaya Iklan</em> (opsional, bobot dan target Rp). Semua otomatis terhubung pada platform/grup yang sama dan perhitungan ROAS akan muncul di kalkulator.</li>
                                <li className="text-xs opacity-80">Catatan: <em>Daftar kata kunci biaya dapat diatur</em> di bagian "Pengaturan Kata Kunci Biaya" pada halaman ini.</li>
                                <li><b>Target Minimum ROAS:</b> Untuk KPI ROAS, kolom <strong>Target Min.</strong> akan muncul. Jika realisasi di bawah target minimum, poin KPI ROAS akan menjadi <strong>nol (0)</strong>.</li>
                                <li><b>Konversi KPI lama:</b> Jika masih ada KPI bernama "roas" (bukan KPI ROAS), tersedia tombol <em>Konversi "roas" → KPI ROAS</em> di toolbar untuk mengubahnya menjadi tipe KPI ROAS.</li>
                                <li><b>Batas Poin (Capping):</b> Opsi "Poin Maksimal" akan membatasi poin KPI agar tidak melebihi nilai <strong>Bobot</strong>-nya.</li>
                                <li><strong className="text-yellow-300 dark:text-yellow-400">Peringatan:</strong> Mengubah "Metode Kalkulasi" akan <strong>MENGHAPUS</strong> skema bonus yang ada.</li>
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
            <div className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-6">
                    <i className='bx bxs-grid-alt text-3xl text-blue-600 dark:text-blue-400'></i>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan Matriks KPI</h2>
                </div>
                <KpiManager />
            </div>
            <div className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-4 mb-6">
                    <i className='bx bxs-ruler text-3xl text-blue-600 dark:text-blue-400'></i>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan Skema & Indikator</h2>
                </div>
                <SchemeManager />
            </div>
        </div>
    );
};

export default AdminView;