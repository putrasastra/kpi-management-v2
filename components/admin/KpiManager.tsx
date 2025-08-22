import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { KpiConfig } from '../../types';
import { formatCurrency, formatToRupiah, parseRupiah } from '../../utils/formatters';

type KpiFormState = Omit<Partial<KpiConfig>, 'bobot' | 'target' | 'minTarget'> & {
    bobot?: string | number;
    target?: string | number;
    minTarget?: string | number | null;
};

const initialFormState: KpiFormState = {
    name: '',
    platform: '',
    bobot: '',
    target: '',
    minTarget: '',
    type: 'higher_is_better',
    isCurrency: true,
    isPercentage: false,
    specialCalc: null,
    pointCapping: 'uncapped'
};

// --- Helper Components ---

const FormInput: React.FC<any> = ({ label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <input {...props} className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#1877f2]" />
    </div>
);

const FormSelect: React.FC<any> = ({ label, children, ...props}) => (
     <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <select {...props} className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#1877f2]">
            {children}
        </select>
     </div>
);

interface MethodRadioProps {
    value: string;
    label: string;
    description: string;
    currentMethod: string;
    onChange: (newMethod: 'OMSET_BASED' | 'POINTS_BASED' | 'NON_SALES') => void;
    icon?: string;
}

const MethodRadio: React.FC<MethodRadioProps> = ({value, label, description, currentMethod, onChange, icon}) => {
    const active = currentMethod === value;
    return (
        <label htmlFor={`method-${value}`} className={`group flex cursor-pointer rounded-xl border p-4 transition-all ${active ? 'border-[#1877f2] bg-blue-50 dark:bg-slate-700/40' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
            <input
                type="radio"
                id={`method-${value}`}
                name="bonusMethod"
                value={value}
                checked={currentMethod === value}
                onChange={() => onChange(value as any)}
                className="h-4 w-4 text-[#1877f2] border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-[#1877f2] mt-1"
            />
            <div className="ml-3">
                <div className="flex items-center gap-2">
                    {icon && <i className={`bx ${icon} text-[#1877f2] text-xl`}></i>}
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                </div>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</span>
            </div>
        </label>
    );
};


const KpiManager: React.FC = () => {
    const { setAppData, currentDivision, currentDivisionData, addLog } = useContext(AppContext);
    const { kpiConfigs, bonusCalculationMethod } = currentDivisionData;
    const [isEditing, setIsEditing] = useState<KpiConfig | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, setFormState] = useState<KpiFormState>(initialFormState);
    const [searchTerm, setSearchTerm] = useState('');

     const filteredKpis = useMemo(() => {
        return kpiConfigs.filter(kpi =>
            kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            kpi.platform.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [kpiConfigs, searchTerm]);

    useEffect(() => {
        if (isEditing) {
            setFormState({
                ...isEditing,
                target: isEditing.isCurrency ? formatToRupiah(String(isEditing.target)) : String(isEditing.target),
                bobot: String(isEditing.bobot),
                minTarget: isEditing.minTarget != null ? String(isEditing.minTarget) : ''
            });
        } else {
            setFormState(initialFormState);
        }
    }, [isEditing]);
    
    const openModalForEdit = (kpi: KpiConfig) => {
        setIsEditing(kpi);
        setIsModalOpen(true);
    };

    const openModalForAdd = () => {
        setIsEditing(null);
        setIsModalOpen(true);
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setIsEditing(null);
    }, []);

    const handleMethodChange = useCallback((newMethod: 'OMSET_BASED' | 'POINTS_BASED' | 'NON_SALES') => {
        if (newMethod === bonusCalculationMethod) {
            return; // No change, do nothing
        }
    
        const messages = {
            toNonSales: 'Anda akan beralih ke mode "Non Sales". Skema bonus yang ada akan disimpan tetapi tidak akan digunakan untuk perhitungan. Lanjutkan?',
            fromNonSales: `Anda akan beralih ke mode perhitungan bonus. Pastikan untuk meninjau kembali "Skema Bonus (Multiplier)" di bawah setelah beralih. Lanjutkan?`,
            betweenSales: 'Mengubah antara metode "Berbasis Omset" dan "Berbasis Poin" akan MENGHAPUS skema bonus saat ini. Anda perlu membuatnya kembali. Lanjutkan?',
        };
    
        let confirmationMessage = '';
        let shouldResetBonusSchemes = false;
    
        if (newMethod === 'NON_SALES') {
            confirmationMessage = messages.toNonSales;
        } else if (bonusCalculationMethod === 'NON_SALES') {
            confirmationMessage = messages.fromNonSales;
        } else { // Switching between OMSET_BASED and POINTS_BASED
            confirmationMessage = messages.betweenSales;
            shouldResetBonusSchemes = true;
        }
    
        if (window.confirm(confirmationMessage)) {
            addLog(`Changed calculation method to "${newMethod}"`, currentDivision);
            setAppData(prev => {
                const newAppData = { ...prev };
                const divisionData = newAppData[currentDivision];
    
                if (divisionData) {
                    newAppData[currentDivision] = {
                        ...divisionData,
                        bonusCalculationMethod: newMethod,
                        // Only reset bonus schemes when switching between sales-based methods
                        bonusSchemes: shouldResetBonusSchemes ? [] : divisionData.bonusSchemes,
                    };
                }
                return newAppData;
            });
        }
    }, [bonusCalculationMethod, currentDivision, setAppData, addLog]);

    const handleInputChange = (field: keyof KpiFormState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleTargetTypeChange = (type: 'currency' | 'percentage' | 'number') => {
        setFormState(prev => ({
            ...prev,
            target: '', // Reset target when type changes
            isCurrency: type === 'currency',
            isPercentage: type === 'percentage'
        }));
    };

    const handleSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const kpiToSave: KpiConfig = {
            id: isEditing ? isEditing.id : Date.now(),
            name: formState.name || '',
            platform: formState.platform || '',
            bobot: Number(formState.bobot) || 0,
            target: Number(formState.isCurrency ? parseRupiah(String(formState.target || '')) : formState.target) || 0,
            type: formState.type || 'higher_is_better',
            isCurrency: formState.isCurrency || false,
            isPercentage: formState.isPercentage || false,
            minTarget: formState.name?.toLowerCase().includes('roas') ? Number(formState.minTarget) || null : null,
            specialCalc: formState.name?.toLowerCase().includes('roas') ? 'ROAS' : null,
            pointCapping: formState.pointCapping || 'uncapped'
        };
        
        const action = isEditing ? `Updated KPI: "${kpiToSave.name}"` : `Created KPI: "${kpiToSave.name}"`;
        let details: string | undefined;
        if (isEditing) {
            details = `Platform: ${isEditing.platform} -> ${kpiToSave.platform}, Bobot: ${isEditing.bobot}% -> ${kpiToSave.bobot}%, Target: ${isEditing.target} -> ${kpiToSave.target}`;
        } else {
            details = `Platform: ${kpiToSave.platform}, Bobot: ${kpiToSave.bobot}%, Target: ${kpiToSave.target}`;
        }
        addLog(action, currentDivision, details);

        setAppData(prev => {
            const currentKpis = prev[currentDivision]?.kpiConfigs || [];
            const updatedKpis = isEditing
                ? currentKpis.map(k => k.id === kpiToSave.id ? kpiToSave : k)
                : [...currentKpis, kpiToSave];
            
            return {
                ...prev,
                [currentDivision]: { ...prev[currentDivision], kpiConfigs: updatedKpis }
            }
        });

        closeModal();
    }, [currentDivision, setAppData, isEditing, formState, addLog, closeModal]);
    
    const handleDelete = useCallback((id: number) => {
        const kpiToDelete = kpiConfigs.find(k => k.id === id);
        if (!kpiToDelete) return;

        if (window.confirm(`Hapus KPI "${kpiToDelete.name}"?`)) {
            const details = `Platform: ${kpiToDelete.platform}, Bobot: ${kpiToDelete.bobot}%`;
            addLog(`Deleted KPI: "${kpiToDelete.name}"`, currentDivision, details);
            setAppData(prev => {
                const newAppData = {...prev};
                if(newAppData[currentDivision]) {
                     const updatedKpis = newAppData[currentDivision].kpiConfigs.filter(k => k.id !== id)
                     newAppData[currentDivision] = { ...newAppData[currentDivision], kpiConfigs: updatedKpis };
                }
                return newAppData;
            });
        }
    }, [currentDivision, setAppData, kpiConfigs, addLog]);
    
    const totalBobot = kpiConfigs.reduce((sum, kpi) => sum + (kpi.bobot || 0), 0);
    
    return (
        <>
            <div className="mb-6 p-5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <i className='bx bxs-cog text-[#1877f2]'></i>
                    Metode Kalkulasi KPI
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <MethodRadio value="OMSET_BASED" icon="bxs-coin" label="Berbasis Omset" description="Bonus dihitung dari total omset yang tercapai." currentMethod={bonusCalculationMethod} onChange={handleMethodChange} />
                    <MethodRadio value="POINTS_BASED" icon="bxs-bar-chart-alt-2" label="Berbasis Poin" description="Bonus dihitung dari total poin KPI yang tercapai." currentMethod={bonusCalculationMethod} onChange={handleMethodChange} />
                    <MethodRadio value="NON_SALES" icon="bxs-user" label="Non Sales" description="Melacak performa tanpa perhitungan bonus insentif." currentMethod={bonusCalculationMethod} onChange={handleMethodChange} />
                </div>
            </div>

            {totalBobot !== 100 && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700">
                    <i className='bx bxs-error-circle text-xl mt-0.5'></i>
                    <div className="text-sm">Total bobot saat ini <b>{totalBobot}%</b>. Pastikan total bobot seluruh KPI berjumlah <b>100%</b>.</div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="relative w-full sm:max-w-md">
                    <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'></i>
                    <input
                        type="text"
                        placeholder="Cari KPI berdasarkan nama atau platform..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                    />
                </div>
                <button onClick={openModalForAdd} className="inline-flex items-center gap-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium py-2 px-4 rounded-lg shadow-sm">
                    <i className='bx bx-plus text-lg'></i>
                    <span>Tambah KPI</span>
                </button>
            </div>

            <div className="overflow-x-auto mb-8">
                <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <thead className="bg-[#1877f2] text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Platform/Grup</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-1/3">Nama KPI</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Bobot (%)</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Target</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {filteredKpis.length > 0 ? (
                            filteredKpis.map(kpi => (
                                <tr key={kpi.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-[#1877f2] dark:bg-slate-700/40 dark:text-blue-300 px-2 py-1 text-xs font-semibold">
                                            <i className='bx bxs-layer'></i>
                                            {kpi.platform}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{kpi.name}</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-600 dark:text-slate-400">{kpi.bobot}%</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-600 dark:text-slate-400">
                                        { kpi.isCurrency ? formatCurrency(kpi.target) : kpi.isPercentage ? `${kpi.target}%` : kpi.target }
                                        { kpi.specialCalc === 'ROAS' && kpi.minTarget && (<span className="block text-xs text-slate-400">(Min: {kpi.minTarget})</span>)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right font-medium space-x-2 whitespace-nowrap">
                                        <button type="button" onClick={() => openModalForEdit(kpi)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition" title="Edit">
                                            <i className='bx bxs-edit-alt'></i>
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                        <button type="button" onClick={() => handleDelete(kpi.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Hapus">
                                            <i className='bx bxs-trash-alt'></i>
                                            <span className="hidden sm:inline">Hapus</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center py-8 text-slate-500">{searchTerm ? 'KPI tidak ditemukan.' : 'Belum ada KPI.'}</td></tr>
                        )}
                    </tbody>
                    <tfoot className="border-t border-slate-200 dark:border-slate-700">
                        <tr className="font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/40">
                            <td colSpan={2} className="px-4 py-3 text-right">Total Bobot</td>
                            <td className={`px-4 py-3 text-right text-lg ${totalBobot !== 100 ? 'text-red-500' : ''}`}>{totalBobot}%</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 animate-slide-up overflow-hidden">
                        <div className="flex justify-between items-center p-5 bg-[#1877f2] text-white">
                            <h3 className="text-xl font-bold">{isEditing ? 'Edit KPI' : 'Tambah KPI Baru'}</h3>
                            <button onClick={closeModal} className="p-1 rounded-full hover:bg-white/20" aria-label="Tutup">
                                <i className='bx bx-x text-2xl'></i>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                <div className="lg:col-span-2">
                                    <FormInput label="Nama KPI" type="text" value={formState.name || ''} onChange={(e:any) => handleInputChange('name', e.target.value)} required />
                                </div>
                                <FormInput label="Platform/Grup" type="text" value={formState.platform || ''} onChange={(e:any) => handleInputChange('platform', e.target.value)} placeholder="Contoh: Shopee" required />
                                <FormInput label="Bobot (%)" type="number" value={formState.bobot || ''} onChange={(e:any) => handleInputChange('bobot', e.target.value)} required />
                                <div className="flex items-end gap-2">
                                    <div className="flex-grow">
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                            Target
                                            <span className="relative group inline-flex">
                                                <button type="button" aria-label="Informasi Target" className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-yellow-400 text-yellow-500 bg-white dark:bg-slate-700 shadow hover:bg-yellow-50">
                                                    <i className='bx bx-info-circle text-[14px]'></i>
                                                </button>
                                                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-[110%] transition z-10 whitespace-nowrap">
                                                    Jika memilih Rp, KPI ini akan dijumlahkan sebagai Omset untuk divisi Berbasis Omset (kecuali KPI biaya).
                                                    <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 transform rotate-45"></span>
                                                </div>
                                            </span>
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formState.target || ''} 
                                            onChange={(e:any) => handleInputChange('target', formState.isCurrency ? formatToRupiah(e.target.value) : e.target.value)}
                                            required 
                                            className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={formState.isCurrency ? 'currency' : formState.isPercentage ? 'percentage' : 'number'}
                                                onChange={e => handleTargetTypeChange(e.target.value as any)}
                                                className="h-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877f2] px-2"
                                            >
                                                <option value="currency">Rp</option>
                                                <option value="percentage">%</option>
                                                <option value="number">Angka</option>
                                            </select>
                                            <span className="relative group inline-flex">
                                                <button type="button" aria-label="Informasi Tipe Target" className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-yellow-400 text-yellow-500 bg-white dark:bg-slate-700 shadow hover:bg-yellow-50">
                                                    <i className='bx bx-info-circle text-[14px]'></i>
                                                </button>
                                                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-[110%] transition z-10 whitespace-nowrap">
                                                    Tipe target: Rp, %, atau Angka. KPI Rp akan dihitung sebagai Omset (kecuali biaya).
                                                    <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 transform rotate-45"></span>
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {formState.name?.toLowerCase().includes('roas') && (
                                    <FormInput label="Target Min." type="text" value={formState.minTarget || ''} onChange={(e:any) => handleInputChange('minTarget', e.target.value)} />
                                )}
                                <FormSelect label="Tipe Kalkulasi" value={formState.type} onChange={(e:any) => handleInputChange('type', e.target.value)} required>
                                    <option value="higher_is_better">Makin Tinggi, Makin Baik</option>
                                    <option value="lower_is_better">Makin Rendah, Makin Baik</option>
                                </FormSelect>
                                <FormSelect label="Batas Poin" value={formState.pointCapping} onChange={(e:any) => handleInputChange('pointCapping', e.target.value)} required>
                                    <option value="uncapped">Tanpa Batas</option>
                                    <option value="capped">Poin Maksimal</option>
                                </FormSelect>
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={closeModal} className="bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-2 px-5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500">Batal</button>
                                <button type="submit" className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium py-2 px-6 rounded-lg">{isEditing ? 'Update' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}
        </>
    );
};

export default KpiManager;