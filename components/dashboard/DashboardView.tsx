
import React, { useContext } from 'react';
import SummaryCards from './SummaryCards';
import HistoryTable from './HistoryTable';
import ComparisonChart from './ComparisonChart';
import TrendChart from './TrendChart';

const DashboardView: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Dasbor Performa Tim</h2>
                <SummaryCards />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
                        <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Perbandingan Poin Staff (Terbaru)</h3>
                        <ComparisonChart />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
                        <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Tren Performa Individu</h3>
                        <TrendChart />
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
