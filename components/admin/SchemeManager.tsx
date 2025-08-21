import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { BonusScheme, KpiIndicator } from '../../types';
import { formatCurrency, parseRupiah, getIndicatorColor, formatToRupiah } from '../../utils/formatters';

// --- Reusable Form Components ---
const FormInput: React.FC<any> = ({ label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <input {...props} className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

const SchemeManager: React.FC = () => {
    // --- Context and Props ---
    const { setAppData, currentDivision, currentDivisionData, addLog } = useContext(AppContext);
    const { bonusCalculationMethod, bonusSchemes, kpiIndicators } = currentDivisionData;
    const isPointsBased = bonusCalculationMethod === 'POINTS_BASED';
    const isNonSales = bonusCalculationMethod === 'NON_SALES';

    // --- Local State for Forms ---
    const [editingBonus, setEditingBonus] = useState<BonusScheme | null>(null);
    const [bonusForm, setBonusForm] = useState({ name: '', threshold: '', multiplier: '' });
    const [editingIndicator, setEditingIndicator] = useState<KpiIndicator | null>(null);
    const [indicatorForm, setIndicatorForm] = useState({ name: '', threshold: '' });

    // --- useEffects to Populate Forms ---
    useEffect(() => {
        if (editingBonus) {
            setBonusForm({
                name: editingBonus.name,
                threshold: isPointsBased ? editingBonus.threshold.toString() : formatToRupiah(editingBonus.threshold.toString()),
                multiplier: editingBonus.multiplier.toString()
            });
        } else {
            setBonusForm({ name: '', threshold: '', multiplier: '' });
        }
    }, [editingBonus, isPointsBased]);

    useEffect(() => {
        if (editingIndicator) {
            setIndicatorForm({ name: editingIndicator.name, threshold: editingIndicator.threshold.toString() });
        } else {
            setIndicatorForm({ name: '', threshold: '' });
        }
    }, [editingIndicator]);
    
    // --- Event Handlers (Rewritten for Reliability with useCallback) ---

    const handleBonusSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        if (!bonusForm.name.trim() || !bonusForm.threshold.trim() || !bonusForm.multiplier.trim()) {
            alert("Harap isi semua field.");
            return;
        }

        const thresholdValue = isPointsBased
            ? parseFloat(bonusForm.threshold)
            : parseFloat(parseRupiah(bonusForm.threshold));
            
        const newBonusData = {
            id: editingBonus ? editingBonus.id : Date.now(),
            name: bonusForm.name,
            threshold: thresholdValue || 0,
            multiplier: parseFloat(bonusForm.multiplier) || 0
        };
        
        const action = editingBonus
            ? `Updated bonus scheme: "${newBonusData.name}"`
            : `Created bonus scheme: "${newBonusData.name}"`;
        addLog(action, currentDivision);

        setAppData(prev => {
            const currentSchemes = prev[currentDivision]?.bonusSchemes || [];
            const updatedBonuses = editingBonus
                ? currentSchemes.map(b => b.id === newBonusData.id ? newBonusData : b)
                : [...currentSchemes, newBonusData];
            
            const newAppData = { ...prev };
            newAppData[currentDivision] = {
                ...newAppData[currentDivision],
                bonusSchemes: updatedBonuses.sort((a,b) => a.threshold - b.threshold)
            };
            return newAppData;
        });

        setEditingBonus(null);
    }, [bonusForm, editingBonus, isPointsBased, currentDivision, setAppData, addLog]);

    const handleBonusDelete = useCallback((id: number) => {
        const schemeToDelete = bonusSchemes.find(s => s.id === id);
        if (!schemeToDelete) return;

        if (window.confirm(`Hapus skema bonus "${schemeToDelete.name}"?`)) {
            addLog(`Deleted bonus scheme: "${schemeToDelete.name}"`, currentDivision);
            setAppData(prev => {
                const newAppData = { ...prev };
                if (newAppData[currentDivision]) {
                    const updated = newAppData[currentDivision].bonusSchemes.filter(b => b.id !== id);
                    newAppData[currentDivision] = { ...newAppData[currentDivision], bonusSchemes: updated };
                }
                return newAppData;
            });
        }
    }, [currentDivision, setAppData, bonusSchemes, addLog]);

    const handleIndicatorSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        if (!indicatorForm.name.trim() || !indicatorForm.threshold.trim()) {
             alert("Harap isi semua field.");
            return;
        }

        const newIndicator = {
            id: editingIndicator ? editingIndicator.id : Date.now(),
            name: indicatorForm.name,
            threshold: parseFloat(indicatorForm.threshold) || 0,
        };

        const action = editingIndicator
            ? `Updated KPI indicator: "${newIndicator.name}"`
            : `Created KPI indicator: "${newIndicator.name}"`;
        addLog(action, currentDivision, `Threshold: ${newIndicator.threshold}`);

        setAppData(prev => {
            const currentIndicators = prev[currentDivision]?.kpiIndicators || [];
            const colors = ['bg-red-600', 'bg-pink-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
            
            const finalIndicator = {
                ...newIndicator,
                color: editingIndicator ? editingIndicator.color : colors[currentIndicators.length % colors.length]
            };
            
            const updatedIndicators = editingIndicator
                ? currentIndicators.map(i => i.id === finalIndicator.id ? finalIndicator : i)
                : [...currentIndicators, finalIndicator];
            
            const newAppData = { ...prev };
            newAppData[currentDivision] = { 
                ...newAppData[currentDivision], 
                kpiIndicators: updatedIndicators.sort((a,b) => b.threshold - a.threshold) 
            };
            return newAppData;
        });

        setEditingIndicator(null);
    }, [indicatorForm, editingIndicator, currentDivision, setAppData, addLog]);

    const handleIndicatorDelete = useCallback((id: number) => {
        const indicatorToDelete = kpiIndicators.find(i => i.id === id);
        if (!indicatorToDelete) return;

        if (window.confirm(`Hapus indikator "${indicatorToDelete.name}"?`)) {
            addLog(`Deleted KPI indicator: "${indicatorToDelete.name}"`, currentDivision);
            setAppData(prev => {
                const newAppData = { ...prev };
                 if (newAppData[currentDivision]) {
                    const updated = newAppData[currentDivision].kpiIndicators.filter(i => i.id !== id);
                    newAppData[currentDivision] = { ...newAppData[currentDivision], kpiIndicators: updated };
                 }
                return newAppData;
            });
        }
    }, [currentDivision, setAppData, kpiIndicators, addLog]);

    // --- JSX Render ---
    return (
        <div className={`grid grid-cols-1 ${!isNonSales ? 'lg:grid-cols-2' : ''} gap-8`}>
            {/* Bonus Scheme Section */}
            {!isNonSales && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Skema Bonus (Multiplier)</h3>
                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full">
                            <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Indikator</th>
                                    <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isPointsBased ? 'Batas Poin' : 'Batas Omset'}</th>
                                    <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pengali</th>
                                    <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {bonusSchemes.length > 0 ? (
                                    bonusSchemes.map(scheme => (
                                        <tr key={scheme.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-medium text-slate-900"><span className={`px-2 py-1 text-xs rounded-full text-white ${getIndicatorColor(scheme.name)}`}>{scheme.name}</span></td>
                                            <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{isPointsBased ? scheme.threshold : formatCurrency(scheme.threshold)}</td>
                                            <td className="px-4 py-4 text-sm text-right text-slate-500 dark:text-slate-400">{scheme.multiplier}</td>
                                            <td className="px-4 py-4 text-sm text-right font-medium space-x-2">
                                                <button type="button" onClick={() => setEditingBonus(scheme)} className="p-1 rounded-full transition hover:bg-blue-100 dark:hover:bg-blue-500/20" title="Edit"><i className='bx bxs-edit-alt text-blue-600 dark:text-blue-400 text-xl pointer-events-none'></i></button>
                                                <button type="button" onClick={() => handleBonusDelete(scheme.id)} className="p-1 rounded-full transition hover:bg-red-100 dark:hover:bg-red-500/20" title="Hapus"><i className='bx bxs-trash-alt text-red-600 text-xl pointer-events-none'></i></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">Belum ada skema bonus.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
                        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">{editingBonus ? 'Edit' : 'Tambah'} Skema Bonus</h3>
                        <form onSubmit={handleBonusSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <FormInput label="Nama Indikator" type="text" value={bonusForm.name} onChange={(e:any) => setBonusForm({...bonusForm, name: e.target.value})} required />
                            <FormInput 
                                label={isPointsBased ? 'Batas Poin' : 'Batas Omset'}
                                type={isPointsBased ? 'number' : 'text'} 
                                value={bonusForm.threshold} 
                                onChange={(e:any) => setBonusForm({...bonusForm, threshold: isPointsBased ? e.target.value : formatToRupiah(e.target.value)})} 
                                required 
                            />
                            <FormInput label="Pengali" type="number" value={bonusForm.multiplier} onChange={(e:any) => setBonusForm({...bonusForm, multiplier: e.target.value})} required step="any" />
                            <div className="flex items-end space-x-2"><button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">{editingBonus ? 'Update' : 'Simpan'}</button>{editingBonus && <button type="button" onClick={() => setEditingBonus(null)} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Batal</button>}</div>
                        </form>
                    </div>
                </div>
            )}
            {/* KPI Indicator Section */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Indikator KPI</h3>
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full">
                        <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Indikator</th>
                                <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Batas Poin Min.</th>
                                <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {kpiIndicators.map(indicator => (
                                <tr key={indicator.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-slate-900"><span className={`px-2 py-1 text-xs rounded-full text-white ${indicator.color}`}>{indicator.name}</span></td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-500 dark:text-slate-400">{indicator.threshold}</td>
                                    <td className="px-4 py-4 text-sm text-right font-medium space-x-2">
                                        <button type="button" onClick={() => setEditingIndicator(indicator)} className="p-1 rounded-full transition hover:bg-blue-100 dark:hover:bg-blue-500/20" title="Edit"><i className='bx bxs-edit-alt text-blue-600 dark:text-blue-400 text-xl pointer-events-none'></i></button>
                                        <button type="button" onClick={() => handleIndicatorDelete(indicator.id)} className="p-1 rounded-full transition hover:bg-red-100 dark:hover:bg-red-500/20" title="Hapus"><i className='bx bxs-trash-alt text-red-600 text-xl pointer-events-none'></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">{editingIndicator ? 'Edit' : 'Tambah'} Indikator</h3>
                    <form onSubmit={handleIndicatorSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <FormInput label="Nama Indikator" type="text" value={indicatorForm.name} onChange={(e:any) => setIndicatorForm({...indicatorForm, name: e.target.value})} required />
                        <FormInput label="Batas Poin Min." type="number" value={indicatorForm.threshold} onChange={(e:any) => setIndicatorForm({...indicatorForm, threshold: e.target.value})} required step="any" />
                        <div className="flex items-end space-x-2"><button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">{editingIndicator ? 'Update' : 'Simpan'}</button>{editingIndicator && <button type="button" onClick={() => setEditingIndicator(null)} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Batal</button>}</div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchemeManager;