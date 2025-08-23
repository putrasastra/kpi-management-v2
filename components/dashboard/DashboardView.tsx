
import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import SummaryCards from './SummaryCards';
import HistoryTable from './HistoryTable';
import ComparisonChart from './ComparisonChart';
import TrendChart from './TrendChart';

const DashboardView: React.FC = () => {
    const { currentDivisionData } = useContext(AppContext);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dasbor Performa Tim</h2>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300 text-sm"
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
                            className="p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300 text-sm"
                        >
                            <option value="">Semua Tahun</option>
                            {Array.from(new Set(currentDivisionData.history.map(record => record.periodYear).filter(Boolean)))
                                .sort((a, b) => Number(b || 0) - Number(a || 0))
                                .map(year => (
                                    <option key={year} value={year?.toString()}>{year}</option>
                                ))}
                        </select>
                        {(selectedMonth || selectedYear) && (
                            <button
                                onClick={() => {
                                    setSelectedMonth('');
                                    setSelectedYear('');
                                }}
                                className="px-3 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center gap-2 text-sm"
                            >
                                <i className='bx bx-x'></i>
                                Reset
                            </button>
                        )}
                    </div>
                </div>
                <SummaryCards selectedMonth={selectedMonth} selectedYear={selectedYear} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
                        <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Perbandingan Poin Staff (Terbaru)</h3>
                        <ComparisonChart selectedMonth={selectedMonth} selectedYear={selectedYear} />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
                        <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Tren Performa Individu</h3>
                        <TrendChart selectedMonth={selectedMonth} selectedYear={selectedYear} />
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Riwayat Perhitungan Bonus</h2>
                <HistoryTable />
            </div>
        </div>
    );
};

export default DashboardView;
