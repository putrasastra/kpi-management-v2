
import React, { useState } from 'react';
import { CalculationResult, DivisionData } from '../../types';
import { formatCurrency, getIndicatorColor } from '../../utils/formatters';

interface ResultsSectionProps {
    results: CalculationResult;
    onExport: (format: 'excel' | 'pdf') => void;
    bonusCalculationMethod: DivisionData['bonusCalculationMethod'];
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, onExport, bonusCalculationMethod }) => {
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const { 
        grandTotalPoin, 
        finalBonus, 
        activeMultiplier, 
        kpiIndicator, 
        omsetIndicator, 
        totalOmsetRealisasi, 
        totalOmsetTarget 
    } = results;

    const isPointsBased = bonusCalculationMethod === 'POINTS_BASED';
    const isNonSales = bonusCalculationMethod === 'NON_SALES';

    // Dynamic font size logic
    const bonusText = formatCurrency(finalBonus);
    let bonusFontSize = 'text-5xl';
    if (bonusText.length > 16) {
        bonusFontSize = 'text-3xl';
    } else if (bonusText.length > 12) {
        bonusFontSize = 'text-4xl';
    }

    const pointsText = grandTotalPoin.toFixed(3);
    let pointsFontSize = 'text-6xl';
    if (pointsText.length > 10) {
        pointsFontSize = 'text-4xl';
    } else if (pointsText.length > 7) {
        pointsFontSize = 'text-5xl';
    }

    const renderPerformanceIndicator = () => {
        const hasThreshold = omsetIndicator && 'threshold' in omsetIndicator;

        return (
            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl text-center ring-1 ring-slate-200 dark:ring-slate-700">
                <h3 className="text-md font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {isPointsBased ? 'Indikator Performa' : 'Indikator Omset'}
                </h3>
                <div className={`indicator-badge inline-block px-4 py-2 rounded-full font-semibold text-white text-sm text-center ${getIndicatorColor(omsetIndicator.name)}`}>
                    {omsetIndicator.name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-3 space-y-1">
                    {isPointsBased ? (
                        <>
                            <p>Poin Aktual: <span className="font-bold text-slate-800 dark:text-slate-200">{grandTotalPoin.toFixed(3)}</span></p>
                            <p>Target Poin: <span className="font-bold text-slate-800 dark:text-slate-200">{hasThreshold ? omsetIndicator.threshold : 'N/A'}</span></p>
                        </>
                    ) : (
                        <>
                            <div className="relative group">
                                <div className="flex items-center justify-center gap-2">
                                    <span>Aktual</span>
                                    <span className="relative group inline-flex">
                                        <button type="button" aria-label="Informasi Omset Aktual" className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-yellow-400 text-yellow-500 bg-white dark:bg-slate-700 shadow hover:bg-yellow-50">
                                            <i className='bx bx-info-circle text-[14px]'></i>
                                        </button>
                                        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-[110%] transition z-10 whitespace-nowrap">
                                            Semua KPI Rupiah (kecuali biaya)
                                            <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 transform rotate-45"></span>
                                        </div>
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalOmsetRealisasi)}</span>
                                </div>
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Semua KPI Rupiah (kecuali biaya)</span>
                            </div>
                            <p>Target: <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalOmsetTarget)}</span></p>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Hasil Perhitungan</h2>
                <div className="relative inline-block text-left">
                    <div>
                        <button type="button" onClick={() => setExportMenuOpen(!exportMenuOpen)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">
                            <i className='bx bxs-download text-xl'></i>
                            <span>Export</span>
                            <i className='bx bx-chevron-down text-xl -mr-1 ml-2'></i>
                        </button>
                    </div>
                    {exportMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none z-10">
                            <div className="py-1">
                                <a href="#" onClick={(e) => { e.preventDefault(); onExport('excel'); setExportMenuOpen(false); }} className="text-slate-700 dark:text-slate-300 flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <i className='bx bxs-file-spreadsheet text-xl text-green-600'></i>
                                    <span>Export Excel (.xlsx)</span>
                                </a>
                                <a href="#" onClick={(e) => { e.preventDefault(); onExport('pdf'); setExportMenuOpen(false); }} className="text-slate-700 dark:text-slate-300 flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <i className='bx bxs-file-pdf text-xl text-red-600'></i>
                                    <span>Export PDF (.pdf)</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-xl shadow-lg shadow-blue-500/30 text-center lg:col-span-1">
                    <h3 className="text-lg font-medium opacity-80">GRAND TOTAL POIN</h3>
                    <p className={`${pointsFontSize} font-bold mt-2 font-mono`}>{pointsText}</p>
                    {!isNonSales && (
                        <p className="text-sm opacity-80 mt-2">Multiplier: <span className="font-bold text-lg">{activeMultiplier}</span></p>
                    )}
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl text-center ring-1 ring-slate-200 dark:ring-slate-700">
                        <h3 className="text-md font-medium text-slate-500 dark:text-slate-400 mb-2">Indikator KPI</h3>
                        <div className={`indicator-badge inline-block px-4 py-2 rounded-full font-semibold text-white text-sm text-center ${getIndicatorColor(omsetIndicator.name)}`}>
                            {omsetIndicator.name}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span className="text-md font-medium">Indikator Omset</span>
                            <span className="relative group inline-flex">
                                <button type="button" aria-label="Informasi Indikator Omset" className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-yellow-400 text-yellow-500 bg-white dark:bg-slate-700 shadow hover:bg-yellow-50">
                                    <i className='bx bx-info-circle text-[14px]'></i>
                                </button>
                                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-[110%] transition z-10 whitespace-nowrap">
                                    Omset Aktual menjumlah semua KPI bertipe Rupiah, kecuali yang namanya mengandung kata kunci biaya.
                                    <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 transform rotate-45"></span>
                                </div>
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Total Poin: <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{grandTotalPoin.toFixed(3)}</span></p>
                    </div>
                     {!isNonSales && renderPerformanceIndicator()}
                </div>
                {!isNonSales && (
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 lg:col-span-3 mt-4">
                        <div className="text-center">
                             <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Bonus yang Didapat:</h3>
                             <p className={`${bonusFontSize} font-extrabold text-green-600 dark:text-green-400 mt-1`}>{bonusText}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsSection;