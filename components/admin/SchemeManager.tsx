import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { BonusScheme, KpiIndicator } from '../../types';
import { formatCurrency, parseRupiah, getIndicatorColor, formatToRupiah } from '../../utils/formatters';

// --- Reusable Form Components ---
const FormInput: React.FC<any> = ({ label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <input {...props} className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#1877f2]" />
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
        const bonusDetails = editingBonus
            ? `Threshold: ${editingBonus.threshold} -> ${newBonusData.threshold}, Multiplier: ${editingBonus.multiplier} -> ${newBonusData.multiplier}`
            : `Threshold: ${newBonusData.threshold}, Multiplier: ${newBonusData.multiplier}`;
        addLog(action, currentDivision, bonusDetails);

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
            const details = `Threshold: ${schemeToDelete.threshold}, Multiplier: ${schemeToDelete.multiplier}`;
            addLog(`Deleted bonus scheme: "${schemeToDelete.name}"`, currentDivision, details);
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
        const indicatorDetails = editingIndicator
            ? `Threshold: ${editingIndicator.threshold} -> ${newIndicator.threshold}`
            : `Threshold: ${newIndicator.threshold}`;
        addLog(action, currentDivision, indicatorDetails);

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
            const details = `Threshold: ${indicatorToDelete.threshold}`;
            addLog(`Deleted KPI indicator: "${indicatorToDelete.name}"`, currentDivision, details);
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

    // --- Additional Settings: Cost Keywords ---
    const [costKeywordsInput, setCostKeywordsInput] = useState<string>('');
    useEffect(() => {
        const defaults = ['biaya','cost','spend','ads','iklan'];
        const fromDivision = currentDivisionData.costKeywords && currentDivisionData.costKeywords.length > 0 ? currentDivisionData.costKeywords : defaults;
        setCostKeywordsInput(fromDivision.join(', '));
    }, [currentDivisionData.costKeywords]);

    const handleSaveCostKeywords = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const parsed = costKeywordsInput
            .split(',')
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 0);
        setAppData(prev => {
            const newData: any = { ...prev };
            if (newData[currentDivision]) {
                newData[currentDivision] = { ...newData[currentDivision], costKeywords: parsed };
            }
            return newData;
        });
        addLog('Updated cost keywords', currentDivision, `Keywords: ${parsed.join(', ')}`);
        alert('Kata kunci biaya berhasil disimpan.');
    }, [costKeywordsInput, setAppData, currentDivision, addLog]);

    // --- JSX Render ---
    return (
        <div className={`grid grid-cols-1 ${!isNonSales ? 'lg:grid-cols-2' : ''} gap-8`}>
            {/* Bonus Scheme Section */}
            {!isNonSales && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                        <i className='bx bxs-trophy text-[#1877f2]'></i>
                        Skema Bonus (Multiplier)
                    </h3>
                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                            <thead className="bg-[#1877f2] text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Indikator</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">{isPointsBased ? 'Batas Poin' : 'Batas Omset'}</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Pengali</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                {bonusSchemes.length > 0 ? (
                                    bonusSchemes.map(scheme => (
                                        <tr key={scheme.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                            <td className="px-4 py-4 text-sm font-medium text-slate-900"><span className={`px-2 py-1 text-xs rounded-full text-white ${getIndicatorColor(scheme.name)}`}>{scheme.name}</span></td>
                                            <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{isPointsBased ? scheme.threshold : formatCurrency(scheme.threshold)}</td>
                                            <td className="px-4 py-4 text-sm text-right text-slate-600 dark:text-slate-400">{scheme.multiplier}</td>
                                            <td className="px-4 py-4 text-sm text-right font-medium space-x-2 whitespace-nowrap">
                                                <button type="button" onClick={() => setEditingBonus(scheme)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition" title="Edit">
                                                    <i className='bx bxs-edit-alt'></i>
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                <button type="button" onClick={() => handleBonusDelete(scheme.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Hapus">
                                                    <i className='bx bxs-trash-alt'></i>
                                                    <span className="hidden sm:inline">Hapus</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">Belum ada skema bonus.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i className='bx bxs-edit text-[#1877f2]'></i>{editingBonus ? 'Edit' : 'Tambah'} Skema Bonus</h3>
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
                            <div className="flex items-end gap-2"><button type="submit" className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium py-2 px-4 rounded-lg">{editingBonus ? 'Update' : 'Simpan'}</button>{editingBonus && <button type="button" onClick={() => setEditingBonus(null)} className="bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500">Batal</button>}</div>
                        </form>
                    </div>
                </div>
            )}
            {/* KPI Indicator Section */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                    <i className='bx bxs-flag-alt text-[#1877f2]'></i>
                    Indikator KPI
                </h3>
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        <thead className="bg-[#1877f2] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nama Indikator</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Batas Poin Min.</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {kpiIndicators.length > 0 ? (
                                kpiIndicators.map(indicator => (
                                    <tr key={indicator.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                        <td className="px-4 py-4 text-sm font-medium text-slate-900"><span className={`px-2 py-1 text-xs rounded-full text-white ${indicator.color}`}>{indicator.name}</span></td>
                                        <td className="px-4 py-4 text-sm text-right text-slate-600 dark:text-slate-400">{indicator.threshold}</td>
                                        <td className="px-4 py-4 text-sm text-right font-medium space-x-2 whitespace-nowrap">
                                            <button type="button" onClick={() => setEditingIndicator(indicator)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition" title="Edit">
                                                <i className='bx bxs-edit-alt'></i>
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                            <button type="button" onClick={() => handleIndicatorDelete(indicator.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Hapus">
                                                <i className='bx bxs-trash-alt'></i>
                                                <span className="hidden sm:inline">Hapus</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-slate-500 dark:text-slate-400">Belum ada indikator KPI.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2"><i className='bx bxs-edit text-[#1877f2]'></i>{editingIndicator ? 'Edit' : 'Tambah'} Indikator</h3>
                    <form onSubmit={handleIndicatorSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <FormInput label="Nama Indikator" type="text" value={indicatorForm.name} onChange={(e:any) => setIndicatorForm({...indicatorForm, name: e.target.value})} required />
                        <FormInput label="Batas Poin Min." type="number" value={indicatorForm.threshold} onChange={(e:any) => setIndicatorForm({...indicatorForm, threshold: e.target.value})} required step="any" />
                        <div className="flex items-end gap-2"><button type="submit" className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium py-2 px-4 rounded-lg">{editingIndicator ? 'Update' : 'Simpan'}</button>{editingIndicator && <button type="button" onClick={() => setEditingIndicator(null)} className="bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500">Batal</button>}</div>
                    </form>
                </div>
            </div>
            {/* Additional Settings: Cost Keywords */}
            <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                    <i className='bx bxs-cog text-[#1877f2]'></i>
                    Pengaturan Kata Kunci Biaya
                </h3>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSaveCostKeywords} className="space-y-3">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Daftar kata kunci biaya (pisahkan dengan koma)</label>
                        <input type="text" value={costKeywordsInput} onChange={(e:any) => setCostKeywordsInput(e.target.value)} placeholder="mis: biaya, cost, ads, iklan" className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#1877f2]" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">KPI bertipe Rp yang namanya mengandung salah satu kata kunci di atas <strong>tidak</strong> akan dihitung sebagai Omset aktual. Pengaturan ini spesifik per divisi.</p>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium py-2 px-4 rounded-lg">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchemeManager;