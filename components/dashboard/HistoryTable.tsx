import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { formatCurrency, getIndicatorColor } from '../../utils/formatters';
import HistoryDetailModal from './HistoryDetailModal';
import { HistoryEntry } from '../../types';

const HistoryTable: React.FC = () => {
    const { setAppData, currentDivision, currentDivisionData, addLog } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingRecord, setViewingRecord] = useState<HistoryEntry | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown !== null) {
                const dropdowns = document.querySelectorAll('.action-dropdown');
                let clickedInside = false;
                
                dropdowns.forEach(dropdown => {
                    if (dropdown.contains(event.target as Node)) {
                        clickedInside = true;
                    }
                });
                
                if (!clickedInside) {
                    setActiveDropdown(null);
                    dropdowns.forEach(dropdown => {
                        (dropdown as HTMLElement).classList.add('hidden');
                    });
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeDropdown]);
    const isNonSales = currentDivisionData.bonusCalculationMethod === 'NON_SALES';

    const filteredHistory = useMemo(() => {
        return currentDivisionData.history
            .filter(record => {
                const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesMonth = !selectedMonth || record.periodMonth === selectedMonth;
                const matchesYear = !selectedYear || record.periodYear?.toString() === selectedYear;
                return matchesSearch && matchesMonth && matchesYear;
            })
            .sort((a, b) => b.id - a.id);
    }, [currentDivisionData.history, searchTerm, selectedMonth, selectedYear]);

    const handleDelete = useCallback((id: number) => {
        const recordToDelete = currentDivisionData.history.find(h => h.id === id);
        if (!recordToDelete) return;

        if (window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) {
            const period = recordToDelete.periodMonth && recordToDelete.periodYear ? `${recordToDelete.periodMonth} ${recordToDelete.periodYear}` : '-';
            const details = `Date: ${recordToDelete.date}, Period: ${period}, Total Poin: ${recordToDelete.totalPoints.toFixed(3)}` + (typeof recordToDelete.bonus === 'number' ? `, Bonus: ${recordToDelete.bonus}` : '');
            addLog(`Deleted history record for ${recordToDelete.employeeName}`, currentDivision, details);
            setAppData(prevData => {
                const newAppData = { ...prevData };
                if (newAppData[currentDivision]) {
                    const updatedHistory = newAppData[currentDivision].history.filter(h => h.id !== id);
                    newAppData[currentDivision] = { ...newAppData[currentDivision], history: updatedHistory };
                }
                return newAppData;
            });
        }
    }, [currentDivision, setAppData, addLog, currentDivisionData.history]);

    const formatDate = (dateString: string) => {
        try {
            // Check if it's a parseable string (like ISO)
            if (dateString && new Date(dateString).toString() !== 'Invalid Date') {
                return new Date(dateString).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
            }
        } catch (e) { /* Fallback for invalid dates */ }
        // Return original string for old formats or if parsing fails
        return dateString;
    };
    
    return (
        <>
            <div className="mb-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-64 p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                    >
                        <option value="">Semua Bulan</option>
                        <option value="Januari">Januari</option>
                        <option value="Februari">Februari</option>
                        <option value="Maret">Maret</option>
                        <option value="April">April</option>
                        <option value="Mei">Mei</option>
                        <option value="Juni">Juni</option>
                        <option value="Juli">Juli</option>
                        <option value="Agustus">Agustus</option>
                        <option value="September">September</option>
                        <option value="Oktober">Oktober</option>
                        <option value="November">November</option>
                        <option value="Desember">Desember</option>
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                    >
                        <option value="">Semua Tahun</option>
                        {Array.from(new Set(currentDivisionData.history.map(record => record.periodYear).filter(Boolean)))
                            .sort((a, b) => Number(b || 0) - Number(a || 0))
                            .map(year => (
                                <option key={year} value={year?.toString()}>{year}</option>
                            ))}
                    </select>
                    {(selectedMonth || selectedYear || searchTerm) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedMonth('');
                                setSelectedYear('');
                            }}
                            className="px-3 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center gap-2"
                        >
                            <i className='bx bx-x'></i>
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                     <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal Dibuat</th>
                            <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Periode</th>
                            <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Staff</th>
                            <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Indikator KPI</th>
                            {!isNonSales && <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Indikator Omset</th>}
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Poin</th>
                            {!isNonSales && <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bonus</th>}
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map(record => (
                                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(record.date)}</td>
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{record.periodMonth && record.periodYear ? `${record.periodMonth} ${record.periodYear}` : '-'}</td>
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{record.employeeName}</td>
                                    <td className="px-4 py-4 text-sm">
                                        <span className={`px-2 py-1 text-xs rounded-full text-white ${record.results.kpiIndicator.color}`}>
                                            {record.results.kpiIndicator.name}
                                        </span>
                                    </td>
                                    {!isNonSales && (
                                        <td className="px-4 py-4 text-sm">
                                             <span className={`px-2 py-1 text-xs rounded-full text-white ${getIndicatorColor(record.results.omsetIndicator.name)}`}>
                                                {record.results.omsetIndicator.name}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-4 py-4 text-sm text-right text-slate-500 dark:text-slate-400 font-mono">{record.totalPoints.toFixed(3)}</td>
                                    {!isNonSales && <td className="px-4 py-4 text-sm text-right text-green-600 dark:text-green-400 font-semibold">{formatCurrency(record.bonus)}</td>}
                                    <td className="px-4 py-4 text-sm text-right font-medium">
                                        <div className="relative inline-block text-left">
                                            <button 
                                                type="button" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const dropdown = e.currentTarget.nextElementSibling;
                                                    const isCurrentlyHidden = dropdown?.classList.contains('hidden');
                                                    
                                                    // Hide all dropdowns first
                                                    document.querySelectorAll('.action-dropdown').forEach(d => {
                                                        d.classList.add('hidden');
                                                    });
                                                    
                                                    if (isCurrentlyHidden) {
                                                        dropdown?.classList.remove('hidden');
                                                        setActiveDropdown(record.id);
                                                    } else {
                                                        setActiveDropdown(null);
                                                    }
                                                }}
                                                className="p-2 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-300"
                                            >
                                                <span>Aksi</span>
                                                <i className='bx bx-chevron-down'></i>
                                            </button>
                                            <div className="action-dropdown hidden absolute right-0 mt-1 w-48 rounded-lg bg-white dark:bg-slate-800 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 z-10">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setViewingRecord(record)}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    <i className='bx bxs-show text-blue-600 dark:text-blue-400'></i>
                                                    <span>Lihat Detail</span>
                                                </button>
                                                {record.pdfDataUri && (
                                                    <a 
                                                        href={record.pdfDataUri} 
                                                        download={`Laporan Insentif - ${record.employeeName} - ${record.date}.pdf`}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                                    >
                                                        <i className='bx bxs-file-pdf text-red-600'></i>
                                                        <span>Unduh PDF</span>
                                                    </a>
                                                )}
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDelete(record.id)}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700"
                                                >
                                                    <i className='bx bxs-trash-alt'></i>
                                                    <span>Hapus</span>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isNonSales ? 7 : 9} className="text-center py-12 text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <i className='bx bx-history text-4xl mb-2'></i>
                                        <span>{searchTerm ? 'Tidak ada hasil yang cocok.' : 'Belum ada riwayat.'}</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {viewingRecord && (
                <HistoryDetailModal
                    record={viewingRecord}
                    onClose={() => setViewingRecord(null)}
                    divisionData={currentDivisionData}
                />
            )}
        </>
    );
};

export default HistoryTable;