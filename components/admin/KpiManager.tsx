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
        <input {...props} className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
);

const FormSelect: React.FC<any> = ({ label, children, ...props}) => (
     <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <select {...props} className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500">
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
}

const MethodRadio: React.FC<MethodRadioProps> = ({value, label, description, currentMethod, onChange}) => (
    <div className="flex items-start">
        <input
            type="radio"
            id={`method-${value}`}
            name="bonusMethod"
            value={value}
            checked={currentMethod === value}
            onChange={() => onChange(value as any)}
            className="h-4 w-4 text-blue-600 border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-blue-500 mt-1"
        />
        <label htmlFor={`method-${value}`} className="ml-3 cursor-pointer">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>
        </label>
    </div>
);


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
        const details = `Platform: ${kpiToSave.platform}, Bobot: ${kpiToSave.bobot}%`;
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
            addLog(`Deleted KPI: "${kpiToDelete.name}"`, currentDivision);
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
            <div className="mb-8 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
                <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Metode Kalkulasi KPI</h3>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    <MethodRadio value="OMSET_BASED" label="Berbasis Omset" description="Bonus dihitung dari total omset yang tercapai." currentMethod={bonusCalculationMethod} onChange={handleMethodChange} />
                    <MethodRadio value="POINTS_BASED" label="Berbasis Poin" description="Bonus dihitung dari total poin KPI yang tercapai." currentMethod={bonusCalculationMethod} onChange={handleMethodChange} />
                    <MethodRadio value="NON_SALES" label="Non Sales" description="Hanya melacak performa, tanpa perhitungan bonus insentif." currentMethod={bonusCalculationMethod} onChange={handleMethodChange} />
                </div>
            </div>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Cari KPI berdasarkan nama atau platform..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={openModalForAdd} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <i className='bx bx-plus'></i>
                    <span>Tambah KPI Baru</span>
                </button>
            </div>
            <div className="overflow-x-auto mb-8">
                <table className="min-w-full">
                    <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform/Grup</th>
                            <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">Nama KPI</th>
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bobot (%)</th>
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target</th>
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredKpis.length > 0 ? (
                            filteredKpis.map(kpi => (
                                <tr key={kpi.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{kpi.platform}</td>
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{kpi.name}</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-500 dark:text-slate-400">{kpi.bobot}%</td>
                                    <td className="px-4 py-4 text-sm text-right text-slate-500 dark:text-slate-400">
                                        { kpi.isCurrency ? formatCurrency(kpi.target) : kpi.isPercentage ? `${kpi.target}%` : kpi.target }
                                        { kpi.specialCalc === 'ROAS' && kpi.minTarget && (<span className="block text-xs text-slate-400">(Min: {kpi.minTarget})</span>)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right font-medium space-x-2">
                                        <button type="button" onClick={() => openModalForEdit(kpi)} className="p-1 rounded-full transition hover:bg-blue-100 dark:hover:bg-blue-500/20" title="Edit"><i className='bx bxs-edit-alt text-blue-600 dark:text-blue-400 text-xl pointer-events-none'></i></button>
                                        <button type="button" onClick={() => handleDelete(kpi.id)} className="p-1 rounded-full transition hover:bg-red-100 dark:hover:bg-red-500/20" title="Hapus"><i className='bx bxs-trash-alt text-red-600 text-xl pointer-events-none'></i></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center py-8 text-slate-500">{searchTerm ? 'KPI tidak ditemukan.' : 'Belum ada KPI.'}</td></tr>
                        )}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-200 dark:border-slate-700">
                        <tr className="font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50">
                            <td colSpan={2} className="px-4 py-3 text-right">Total Bobot</td>
                            <td className={`px-4 py-3 text-right text-lg ${totalBobot !== 100 ? 'text-red-500' : ''}`}>{totalBobot}%</td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 animate-slide-up">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {isEditing ? 'Edit KPI' : 'Tambah KPI Baru'}
                            </h3>
                            <button onClick={closeModal} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Tutup">
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
                                <div className="flex items-end space-x-2">
                                    <div className="flex-grow">
                                        <FormInput 
                                        label="Target"
                                        type="text" 
                                        value={formState.target || ''} 
                                        onChange={(e:any) => handleInputChange('target', formState.isCurrency ? formatToRupiah(e.target.value) : e.target.value)}
                                        required 
                                        />
                                    </div>
                                    <select
                                        value={formState.isCurrency ? 'currency' : formState.isPercentage ? 'percentage' : 'number'}
                                        onChange={e => handleTargetTypeChange(e.target.value as any)}
                                        className="h-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="currency">Rp</option>
                                        <option value="percentage">%</option>
                                        <option value="number">Angka</option>
                                    </select>
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
                            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={closeModal} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Batal</button>
                                <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}
        </>
    );
};

export default KpiManager;