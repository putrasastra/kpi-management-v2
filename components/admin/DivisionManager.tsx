import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const DivisionManager: React.FC = () => {
    const { addDivision, deleteDivision, divisions } = useContext(AppContext);
    const [newDivisionName, setNewDivisionName] = useState('');

    const handleAddDivision = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDivisionName.trim()) {
            addDivision(newDivisionName.trim());
            setNewDivisionName('');
        }
    };

    const handleDeleteDivision = (divisionToDelete: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus divisi "${divisionToDelete}"? Semua data KPI, staff, dan riwayat di dalamnya akan hilang permanen.`)) {
            deleteDivision(divisionToDelete);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Tambah Divisi Baru</h3>
                <form onSubmit={handleAddDivision} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-grow w-full">
                        <label htmlFor="division-name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nama Divisi</label>
                        <input
                            type="text"
                            id="division-name"
                            className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newDivisionName}
                            onChange={e => setNewDivisionName(e.target.value)}
                            placeholder="Contoh: Tim Sales"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 flex-shrink-0">Tambah Divisi</button>
                </form>
            </div>

            <div>
                 <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Kelola Divisi yang Ada</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Divisi</th>
                                <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {divisions.map(division => (
                                <tr key={division} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{division}</td>
                                    <td className="px-4 py-4 text-sm text-right font-medium">
                                        {divisions.length > 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDivision(division)}
                                                className="p-1 rounded-full transition hover:bg-red-100 dark:hover:bg-red-500/20"
                                                title="Hapus Divisi"
                                            >
                                                <i className='bx bxs-trash-alt text-red-600 text-xl pointer-events-none'></i>
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Tidak bisa dihapus</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default DivisionManager;