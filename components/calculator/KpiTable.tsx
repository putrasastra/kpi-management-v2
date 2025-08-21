import React from 'react';
import { KpiConfig, RealisasiInput, CalculationResult } from '../../types';
import { formatToRupiah, formatCurrency } from '../../utils/formatters';

interface KpiTableProps {
    platform: string;
    kpis: KpiConfig[];
    realisasiInputs: RealisasiInput;
    setRealisasiInputs: React.Dispatch<React.SetStateAction<RealisasiInput>>;
    results: CalculationResult | null;
}

const KpiTable: React.FC<KpiTableProps> = ({ platform, kpis, realisasiInputs, setRealisasiInputs, results }) => {
    
    const handleInputChange = (id: number, value: string, isCurrency: boolean) => {
        const processedValue = isCurrency ? formatToRupiah(value) : value;
        setRealisasiInputs(prev => ({ ...prev, [id]: processedValue }));
    };

    const getResultDetail = (id: number) => {
        return results?.details.find(d => d.id === id);
    };
    
    const platformTotals = kpis.reduce((acc, kpi) => {
        const detail = getResultDetail(kpi.id);
        acc.bobot += kpi.bobot;
        acc.score += detail?.score || 0;
        acc.poin += detail?.poin || 0;
        return acc;
    }, { bobot: 0, score: 0, poin: 0 });

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{platform}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">KPI</th>
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bobot</th>
                            <th className="px-4 pb-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target</th>
                            <th className="px-4 pb-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Realisasi</th>
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Poin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {kpis.map(kpi => {
                            const detail = getResultDetail(kpi.id);
                            
                            return (
                                <tr key={kpi.id} className="align-middle hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{kpi.name}</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-500 dark:text-slate-400">{kpi.bobot}%</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-500 dark:text-slate-400">
                                        {
                                            kpi.isCurrency ? formatCurrency(kpi.target) :
                                            kpi.isPercentage ? `${kpi.target.toString().replace('.', ',')}%` :
                                            kpi.target.toString().replace('.', ',')
                                        }
                                        {kpi.specialCalc === 'ROAS' && kpi.minTarget && (
                                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                                                (Min: {kpi.minTarget.toString().replace('.',',')})
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 w-40">
                                        {kpi.specialCalc === 'ROAS' ? (
                                            <span className="block w-full text-right p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-500 dark:text-slate-300 font-mono">
                                                {detail?.realisasi.toFixed(2).replace('.', ',') ?? 'Otomatis'}
                                            </span>
                                        ) : (
                                            <input 
                                                type="text" 
                                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-none text-slate-700 dark:text-slate-200 rounded-lg text-right transition focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                                placeholder="0" 
                                                inputMode="numeric"
                                                value={realisasiInputs[kpi.id] || ''}
                                                onChange={(e) => handleInputChange(kpi.id, e.target.value, kpi.isCurrency)}
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right font-semibold text-slate-700 dark:text-slate-300 font-mono">{detail ? detail.score.toFixed(2) : '-'}</td>
                                    <td className="px-4 py-4 text-right font-bold text-blue-600 dark:text-blue-400 font-mono">{detail ? detail.poin.toFixed(3) : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-200 dark:border-slate-700">
                        <tr className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50">
                            <td className="px-4 py-3 text-right"></td>
                            <td className="px-4 py-3 text-right">{platformTotals.bobot}%</td>
                            <td colSpan={2} className="px-4 py-3 text-right">Total {platform}</td>
                            <td className="px-4 py-3 text-right font-mono">{platformTotals.score.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-lg text-blue-600 dark:text-blue-400 font-mono">{platformTotals.poin.toFixed(3)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default KpiTable;