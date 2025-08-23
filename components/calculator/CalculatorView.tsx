
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { calculateBonus } from '../../utils/calculations';
import { CalculationResult, RealisasiInput, HistoryEntry } from '../../types';
import KpiTable from './KpiTable';
import ResultsSection from './ResultsSection';
import { exportToExcel, exportToPDF, generatePdfDataUri } from '../../utils/export';
import { formatCurrency } from '../../utils/formatters';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:8080';

const CalculatorView: React.FC = () => {
    const { setAppData, currentDivision, currentDivisionData, addLog } = useContext(AppContext);
    const { kpiConfigs, bonusSchemes, kpiIndicators, employees, bonusCalculationMethod, history } = currentDivisionData;

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id.toString() || '');
    const [realisasiInputs, setRealisasiInputs] = useState<RealisasiInput>({});
    const [results, setResults] = useState<CalculationResult | null>(null);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const currentMonthName = new Date().toLocaleString('id-ID', { month: 'long' });
    const [selectedPeriod, setSelectedPeriod] = useState({
        month: currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1),
        year: new Date().getFullYear()
    });

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    useEffect(() => {
        setSelectedEmployeeId(employees[0]?.id.toString() || '');
        setRealisasiInputs({});
        setResults(null);
    }, [currentDivision, employees]);

    const handleCalculate = useCallback(async () => {
        const payload = {
            kpiConfigs,
            bonusSchemes,
            kpiIndicators,
            realisasiInputs,
            bonusCalculationMethod,
            customCostKeywords: currentDivisionData.costKeywords || []
        };
        const envBase: string | undefined = (import.meta as any).env?.VITE_API_BASE;
        const baseCandidates = [
            API_BASE,
            envBase,
            `${window.location.protocol}//${window.location.hostname}:8081`,
            `${window.location.protocol}//${window.location.hostname}:8080`,
        ].filter((v, i, arr) => typeof v === 'string' && v && arr.indexOf(v) === i) as string[];

        const tryRequest = async (base: string): Promise<CalculationResult | null> => {
            try {
                const res = await fetch(`${base}/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) return null;
                const data: CalculationResult = await res.json();
                return data;
            } catch {
                return null;
            }
        };

        for (const base of baseCandidates) {
            const data = await tryRequest(base);
            if (data) { setResults(data); return; }
        }

        // Fallback ke perhitungan lokal jika seluruh percobaan API gagal
        const calculatedResults = calculateBonus(
            kpiConfigs,
            bonusSchemes,
            kpiIndicators,
            realisasiInputs,
            bonusCalculationMethod,
            currentDivisionData.costKeywords
        );
        setResults(calculatedResults);
    }, [kpiConfigs, bonusSchemes, kpiIndicators, realisasiInputs, bonusCalculationMethod, currentDivisionData.costKeywords]);

    useEffect(() => {
        // Automatically calculate on input change if there are any inputs
        if (Object.keys(realisasiInputs).length > 0) {
            handleCalculate();
        }
    }, [realisasiInputs, handleCalculate]);
    
    const openSaveModal = () => {
        if (!selectedEmployeeId || !results) {
            alert('Silakan pilih staff dan hitung bonus terlebih dahulu.');
            return;
        }
        setIsSaveModalOpen(true);
    };
    
    const [isSaving, setIsSaving] = useState(false);
    
    const confirmSaveResult = async () => {
        if (isSaving) return; // Prevent double submission
        setIsSaving(true);
    
        try {
            if (!selectedEmployeeId || !results) return;
            if (!selectedPeriod.month) {
                alert('Silakan pilih periode bulan.');
                return;
            }
    
            const employee = employees.find(e => e.id.toString() === selectedEmployeeId);
            if (!employee) {
                alert('Staff tidak ditemukan.');
                return;
            }
    
            // --- VALIDATION: Check for existing entry with debounce ---
            const existingEntries = history.filter(entry =>
                entry.employeeId.toString() === selectedEmployeeId &&
                entry.periodMonth === selectedPeriod.month &&
                entry.periodYear === selectedPeriod.year
            );
    
            if (existingEntries.length > 0) {
                alert(`Laporan untuk ${employee.name} pada periode ${selectedPeriod.month} ${selectedPeriod.year} sudah ada. Tidak dapat menyimpan duplikat.`);
                return;
            }
    
            // Add delay before saving to prevent double submission
            await new Promise(resolve => setTimeout(resolve, 500));
    
            const pdfDataUri = await generatePdfDataUri(currentDivisionData, results, employee.name, currentDivision);
            
            const newHistoryEntry: HistoryEntry = {
                id: Date.now(),
                employeeId: employee.id,
                employeeName: employee.name,
                date: new Date().toISOString(),
                periodMonth: selectedPeriod.month,
                periodYear: selectedPeriod.year,
                totalPoints: results.grandTotalPoin,
                bonus: results.finalBonus,
                results: results,
                pdfDataUri: pdfDataUri
            };
    
            setAppData(prevData => {
                const newAppData = { ...prevData };
                // Double check for duplicates before saving
                const isDuplicate = newAppData[currentDivision].history.some(entry =>
                    entry.employeeId.toString() === selectedEmployeeId &&
                    entry.periodMonth === selectedPeriod.month &&
                    entry.periodYear === selectedPeriod.year
                );
    
                if (isDuplicate) {
                    alert(`Laporan untuk ${employee.name} pada periode ${selectedPeriod.month} ${selectedPeriod.year} sudah ada. Tidak dapat menyimpan duplikat.`);
                    return prevData;
                }
    
                newAppData[currentDivision].history.push(newHistoryEntry);
                return newAppData;
            });
    
            const logDetails = `Periode: ${selectedPeriod.month} ${selectedPeriod.year}, Poin: ${results.grandTotalPoin.toFixed(3)}, Bonus: ${formatCurrency(results.finalBonus)}`;
            addLog(`Saved calculation result for ${employee.name}`, currentDivision, logDetails);
    
            alert(`Hasil untuk ${employee.name} periode ${selectedPeriod.month} ${selectedPeriod.year} berhasil disimpan!`);
            setIsSaveModalOpen(false);
        } catch (error) {
            console.error('Error saving result:', error);
            alert('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = (format: 'excel' | 'pdf') => {
        const employee = employees.find(e => e.id.toString() === selectedEmployeeId);
        if (!employee) {
            alert('Pilih staff untuk export.');
            return;
        }
        if (format === 'excel') {
            exportToExcel(currentDivisionData, results, employee.name, currentDivision);
        } else {
            exportToPDF(currentDivisionData, results, employee.name, currentDivision);
        }
        const details = `Format: ${format.toUpperCase()}, Staff: ${employee.name}` + (results ? `, Poin: ${results.grandTotalPoin.toFixed(3)}, Bonus: ${formatCurrency(results.finalBonus)}` : '');
        addLog(`Exported KPI report`, currentDivision, details);
    };

    const platforms = [...new Set(kpiConfigs.map(k => k.platform))];

    return (
        <div id="calculator-view">
            <div className="mb-8 max-w-md bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                 <label htmlFor="employee-selector" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Pilih Staff untuk Dinilai:</label>
                 <select 
                    id="employee-selector" 
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 border-none text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                 >
                    <option value="" disabled>-- Pilih Staff --</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
            </div>
            <div id="calculator-tables-container" className="space-y-8">
                {platforms.map(platform => (
                    <KpiTable
                        key={platform}
                        platform={platform}
                        kpis={kpiConfigs.filter(k => k.platform === platform)}
                        realisasiInputs={realisasiInputs}
                        setRealisasiInputs={setRealisasiInputs}
                        results={results}
                    />
                ))}
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-md mt-8">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
                    <button onClick={handleCalculate} className="bg-blue-600 text-white font-semibold py-3 px-10 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:ring-offset-slate-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50">
                        Hitung Ulang
                    </button>
                    <button onClick={openSaveModal} className="bg-green-600 text-white font-semibold py-3 px-10 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:ring-offset-slate-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/50">
                         <i className='bx bx-save text-xl'></i> Simpan Hasil
                    </button>
                </div>
                {results && <ResultsSection results={results} onExport={handleExport} bonusCalculationMethod={bonusCalculationMethod} />}
            </div>

            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 scale-100">
                        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Terbitkan Laporan KPI</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Pilih periode bulan dan tahun untuk laporan ini.</p>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="period-month" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Bulan</label>
                                <select
                                    id="period-month"
                                    value={selectedPeriod.month}
                                    onChange={(e) => setSelectedPeriod(p => ({ ...p, month: e.target.value }))}
                                    className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="" disabled>-- Pilih Bulan --</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="period-year" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Tahun</label>
                                <input
                                    id="period-year"
                                    type="number"
                                    value={selectedPeriod.year}
                                    onChange={(e) => setSelectedPeriod(p => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                                    className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="YYYY"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button onClick={() => setIsSaveModalOpen(false)} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">
                                Batal
                            </button>
                            <button 
                                onClick={confirmSaveResult} 
                                className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Menyimpan...' : 'Konfirmasi & Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalculatorView;
