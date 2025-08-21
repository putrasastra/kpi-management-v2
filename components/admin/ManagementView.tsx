
import React, { useState } from 'react';
import EmployeeManager from './EmployeeManager';
import DivisionManager from './DivisionManager';

const ManagementInstruction: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Petunjuk Halaman Manajemen</h2>
                <i className={`bx bx-chevron-down text-2xl text-slate-500 dark:text-slate-400 transition-transform transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && (
                <div className="px-5 pb-6 text-slate-600 dark:text-slate-300 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p>Halaman ini digunakan untuk mengelola data master aplikasi Anda.</p>
                    <ol className="list-decimal list-inside space-y-3">
                        <li><b>Manajemen Divisi:</b><br/><span className="text-sm pl-4 block">Tambah atau hapus divisi untuk organisasi Anda. Setiap divisi memiliki pengaturan KPI dan staffnya sendiri.</span></li>
                        <li><b>Manajemen Staff:</b><br/><span className="text-sm pl-4 block">Tambahkan atau hapus staff untuk divisi yang sedang dipilih. Staff yang ditambahkan akan muncul di dropdown pada halaman Kalkulator.</span></li>
                    </ol>
                </div>
            )}
        </div>
    );
}

const ManagementView: React.FC = () => {
    return (
        <div className="space-y-8">
            <ManagementInstruction />
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Manajemen Divisi</h2>
                <DivisionManager />
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Manajemen Staff</h2>
                <EmployeeManager />
            </div>
        </div>
    );
};

export default ManagementView;