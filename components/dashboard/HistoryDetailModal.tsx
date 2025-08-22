
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
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-[#1877f2]">
                    <div>
                        <h3 className="text-xl font-semibold text-white">
                            Detail Performa
                        </h3>
                        <p className="text-sm text-blue-100 opacity-90">
                            {employeeName} - Periode {periodMonth} {periodYear}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:bg-white/10 transition-colors" aria-label="Tutup">
                        <i className='bx bx-x text-2xl'></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {/* Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Grand Total Poin</h4>
                            <p className={`${pointsFontSize} font-bold text-[#1877f2] font-mono`}>{pointsText}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Indikator KPI</h4>
                            <p className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full text-white ${results.kpiIndicator.color}`}>{results.kpiIndicator.name}</p>
                        </div>
                        {!isNonSales && (
                            <>
                                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                        {isPointsBased ? 'Indikator Performa' : 'Indikator Omset'}
                                    </h4>
                                    <p className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full text-white ${getIndicatorColor(results.omsetIndicator.name)}`}>
                                        {results.omsetIndicator.name}
                                    </p>
                                    {isPointsBased && 'threshold' in results.omsetIndicator && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Target: {results.omsetIndicator.threshold} Poin
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Bonus Final</h4>
                                    <p className={`${bonusFontSize} font-bold text-green-600 dark:text-green-400`}>{bonusText}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* KPI Details */}
                    <div className="space-y-6">
                        {platforms.map(platform => {
                            const platformKpis = kpiConfigs.filter(k => k.platform === platform);
                            if (platformKpis.length === 0) return null;

                            return (
                                <div key={platform}>
                                    <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">{platform}</h4>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-[#1877f2]">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium text-white w-2/5">KPI</th>
                                                    <th className="px-4 py-3 text-right font-medium text-white">Bobot</th>
                                                    <th className="px-4 py-3 text-right font-medium text-white">Target</th>
                                                    <th className="px-4 py-3 text-right font-medium text-white">Realisasi</th>
                                                    <th className="px-4 py-3 text-right font-medium text-white">Score</th>
                                                    <th className="px-4 py-3 text-right font-medium text-white">Poin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {platformKpis.map((kpi: KpiConfig, index) => {
                                                    const detail = getResultDetail(kpi.id);
                                                    const targetDisplay = kpi.isCurrency ? formatCurrency(kpi.target) : (kpi.isPercentage ? `${kpi.target.toString().replace('.', ',')}%` : kpi.target.toString().replace('.', ','));
                                                    const realisasiDisplay = detail ? (kpi.isCurrency ? formatCurrency(detail.realisasi) : kpi.isPercentage ? `${detail.realisasi.toFixed(2).replace('.',',')}%` : detail.realisasi.toFixed(2).replace('.',',')) : '-';

                                                    return (
                                                        <tr key={kpi.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700'}`}>
                                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{kpi.name}</td>
                                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{kpi.bobot}%</td>
                                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{targetDisplay}</td>
                                                            <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{realisasiDisplay}</td>
                                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 font-mono">{detail ? detail.score.toFixed(2).replace('.',',') : '-'}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-[#1877f2] font-mono">{detail ? detail.poin.toFixed(3).replace('.',',') : '-'}</td>
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
                <div className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-slate-700">
                    <button 
                        onClick={onClose} 
                        className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryDetailModal;