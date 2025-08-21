
import React from 'react';
import { HistoryEntry, DivisionData, KpiConfig } from '../../types';
import { formatCurrency, getIndicatorColor } from '../../utils/formatters';

interface HistoryDetailModalProps {
    record: HistoryEntry;
    onClose: () => void;
    divisionData: DivisionData;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ record, onClose, divisionData }) => {
    const { results, employeeName, periodMonth, periodYear } = record;
    const { kpiConfigs, bonusCalculationMethod } = divisionData;
    const isPointsBased = bonusCalculationMethod === 'POINTS_BASED';
    const isNonSales = bonusCalculationMethod === 'NON_SALES';
    
    const platforms = [...new Set(kpiConfigs.map(k => k.platform))];

    const getResultDetail = (id: number) => {
        return results.details.find(d => d.id === id);
    };

    // Dynamic font size logic
    const bonusText = formatCurrency(results.finalBonus);
    let bonusFontSize = 'text-3xl';
    if (bonusText.length > 16) {
        bonusFontSize = 'text-xl';
    } else if (bonusText.length > 12) {
        bonusFontSize = 'text-2xl';
    }

    const pointsText = results.grandTotalPoin.toFixed(3).replace('.',',');
    let pointsFontSize = 'text-3xl';
    if (pointsText.length > 10) {
        pointsFontSize = 'text-2xl';
    }

    return (
        <div 
            className="fixed inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-blue-700/50 w-full max-w-4xl max-h-[90vh] flex flex-col animate-slide-up backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-blue-200/50 dark:border-blue-700/50 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
                    <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-sm">
                            📊 Detail Performa
                        </h3>
                        <p className="text-sm text-blue-100">
                            {employeeName} - Periode {periodMonth} {periodYear}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-white/80 hover:bg-white/20 transition-all duration-200 hover:scale-110" aria-label="Tutup">
                        <i className='bx bx-x text-2xl'></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {/* Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl text-center h-full flex flex-col justify-center border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-blue-600 dark:text-blue-400 mb-2">
                                <i className='bx bx-target text-2xl'></i>
                            </div>
                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Grand Total Poin</h4>
                            <p className={`${pointsFontSize} font-bold text-blue-800 dark:text-blue-200 font-mono`}>{pointsText}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-6 rounded-xl text-center h-full flex flex-col justify-center border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="text-indigo-600 dark:text-indigo-400 mb-2">
                                <i className='bx bx-chart text-2xl'></i>
                            </div>
                            <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Indikator KPI</h4>
                            <p className={`mt-2 inline-block px-4 py-2 text-sm font-semibold rounded-full text-white shadow-md ${results.kpiIndicator.color}`}>{results.kpiIndicator.name}</p>
                        </div>
                        {!isNonSales && (
                            <>
                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 p-6 rounded-xl text-center h-full flex flex-col justify-center border border-cyan-200/50 dark:border-cyan-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    <div className="text-cyan-600 dark:text-cyan-400 mb-2">
                                        <i className='bx bx-trending-up text-2xl'></i>
                                    </div>
                                    <h4 className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-2">
                                        {isPointsBased ? 'Indikator Performa' : 'Indikator Omset'}
                                    </h4>
                                    <p className={`mt-2 inline-block px-4 py-2 text-sm font-semibold rounded-full text-white shadow-md ${getIndicatorColor(results.omsetIndicator.name)}`}>
                                        {results.omsetIndicator.name}
                                    </p>
                                    {isPointsBased && 'threshold' in results.omsetIndicator && (
                                        <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 font-medium">
                                            Target: {results.omsetIndicator.threshold} Poin
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 p-6 rounded-xl text-center h-full flex flex-col justify-center border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    <div className="text-emerald-600 dark:text-emerald-400 mb-2">
                                        <i className='bx bx-money text-2xl'></i>
                                    </div>
                                    <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">Bonus Final</h4>
                                    <p className={`${bonusFontSize} font-bold text-emerald-700 dark:text-emerald-300`}>{bonusText}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* KPI Details */}
                    <div className="space-y-8">
                        {platforms.map(platform => {
                            const platformKpis = kpiConfigs.filter(k => k.platform === platform);
                            if (platformKpis.length === 0) return null;

                            return (
                                <div key={platform} className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                                            <i className='bx bx-desktop text-lg'></i>
                                        </div>
                                        <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200">{platform}</h4>
                                    </div>
                                    <div className="overflow-x-auto rounded-xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                                                <tr>
                                                    <th className="px-6 py-4 text-left font-semibold text-white w-2/5">📋 KPI</th>
                                                    <th className="px-6 py-4 text-right font-semibold text-white">⚖️ Bobot</th>
                                                    <th className="px-6 py-4 text-right font-semibold text-white">🎯 Target</th>
                                                    <th className="px-6 py-4 text-right font-semibold text-white">📊 Realisasi</th>
                                                    <th className="px-6 py-4 text-right font-semibold text-white">📈 Score</th>
                                                    <th className="px-6 py-4 text-right font-semibold text-white">⭐ Poin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-blue-100 dark:divide-blue-800/50">
                                                {platformKpis.map((kpi: KpiConfig, index) => {
                                                    const detail = getResultDetail(kpi.id);
                                                    const targetDisplay = kpi.isCurrency ? formatCurrency(kpi.target) : (kpi.isPercentage ? `${kpi.target.toString().replace('.', ',')}%` : kpi.target.toString().replace('.', ','));
                                                    const realisasiDisplay = detail ? (kpi.isCurrency ? formatCurrency(detail.realisasi) : kpi.isPercentage ? `${detail.realisasi.toFixed(2).replace('.',',')}%` : detail.realisasi.toFixed(2).replace('.',',')) : '-';

                                                    return (
                                                        <tr key={kpi.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-blue-50/30 dark:bg-blue-900/10'} hover:bg-blue-100/50 dark:hover:bg-blue-800/20 transition-colors duration-200`}>
                                                            <td className="px-6 py-4 font-medium text-blue-900 dark:text-blue-100">{kpi.name}</td>
                                                            <td className="px-6 py-4 text-right text-blue-700 dark:text-blue-300 font-medium">{kpi.bobot}%</td>
                                                            <td className="px-6 py-4 text-right text-blue-700 dark:text-blue-300 font-medium">{targetDisplay}</td>
                                                            <td className="px-6 py-4 text-right font-bold text-blue-800 dark:text-blue-200">{realisasiDisplay}</td>
                                                            <td className="px-6 py-4 text-right text-blue-700 dark:text-blue-300 font-mono font-medium">{detail ? detail.score.toFixed(2).replace('.',',') : '-'}</td>
                                                            <td className="px-6 py-4 text-right font-bold text-blue-800 dark:text-blue-200 font-mono bg-blue-100/50 dark:bg-blue-800/30">{detail ? detail.poin.toFixed(3).replace('.',',') : '-'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-6 border-t border-blue-200/50 dark:border-blue-700/50 flex-shrink-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-b-2xl">
                    <button 
                        onClick={onClose} 
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                        <i className='bx bx-check text-lg'></i>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryDetailModal;