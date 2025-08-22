import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const DivisionManager: React.FC = () => {
    const { addDivision, deleteDivision, divisions, renameDivision } = useContext(AppContext);
    const [newDivisionName, setNewDivisionName] = useState('');
    const [editing, setEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

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

    const startEdit = (division: string) => {
        setEditing(division);
        setEditValue(division);
    };

    const cancelEdit = () => {
        setEditing(null);
        setEditValue('');
    };

    const saveEdit = () => {
        if (!editing) return;
        renameDivision(editing, editValue);
        setEditing(null);
        setEditValue('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i className='bx bxs-building text-[#1877f2]'></i>Tambah Divisi Baru</h3>
                <form onSubmit={handleAddDivision} className="flex flex-col sm:flex-row items-end gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-grow w-full">
                        <label htmlFor="division-name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nama Divisi</label>
                        <input
                            type="text"
                            id="division-name"
                            className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-left transition focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                            value={newDivisionName}
                            onChange={e => setNewDivisionName(e.target.value)}
                            placeholder="Contoh: Tim Sales"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full sm:w-auto inline-flex items-center gap-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold py-2 px-4 rounded-lg shadow-sm"><i className='bx bx-plus'></i>Tambah Divisi</button>
                </form>
            </div>

            <div>
                 <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i className='bx bxs-collection text-[#1877f2]'></i>Kelola Divisi yang Ada</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        <thead className="bg-[#1877f2] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nama Divisi</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {divisions.map(division => (
                                <tr key={division} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {editing === division ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                                    autoFocus
                                                />
                                                <button type="button" onClick={saveEdit} className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition"><i className='bx bxs-check-circle'></i><span className="hidden sm:inline">Simpan</span></button>
                                                <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-500 transition"><i className='bx bxs-x-circle'></i><span className="hidden sm:inline">Batal</span></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <i className='bx bxs-building-house text-[#1877f2]'></i>
                                                <span>{division}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium whitespace-nowrap">
                                        {editing === division ? (
                                            <span className="text-xs text-slate-400 italic">Sedang mengedit…</span>
                                        ) : (
                                            <div className="inline-flex items-center gap-2">
                                                <button type="button" onClick={() => startEdit(division)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition" title="Edit">
                                                    <i className='bx bxs-edit-alt'></i>
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                {divisions.length > 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteDivision(division)}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                                        title="Hapus Divisi"
                                                    >
                                                        <i className='bx bxs-trash-alt'></i>
                                                        <span className="hidden sm:inline">Hapus</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Tidak bisa dihapus</span>
                                                )}
                                            </div>
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