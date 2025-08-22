import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { Employee } from '../../types';

const EmployeeManager: React.FC = () => {
    const { setAppData, currentDivision, currentDivisionData, addLog } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState<Employee | null>(null);
    const [employeeName, setEmployeeName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = useMemo(() => {
        return currentDivisionData.employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [currentDivisionData.employees, searchTerm]);

    useEffect(() => {
        if (isEditing) {
            setEmployeeName(isEditing.name);
        } else {
            setEmployeeName('');
        }
    }, [isEditing]);

    const handleSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeName.trim()) return;

        const action = isEditing
            ? `Updated employee name to "${employeeName.trim()}"`
            : `Created new employee: "${employeeName.trim()}"`;
        const details = isEditing ? `Previous name: "${isEditing.name}"` : undefined;
        addLog(action, currentDivision, details);

        setAppData(prev => {
            const currentEmployees = prev[currentDivision]?.employees || [];
            
            const updatedEmployees = isEditing
                ? currentEmployees.map(emp => emp.id === isEditing.id ? { ...emp, name: employeeName.trim() } : emp)
                : [...currentEmployees, { id: Date.now(), name: employeeName.trim() }];

            return {
                ...prev,
                [currentDivision]: { ...prev[currentDivision], employees: updatedEmployees }
            }
        });
        
        setIsEditing(null);
        setEmployeeName('');
    }, [currentDivision, setAppData, isEditing, employeeName, addLog]);

    const handleDelete = useCallback((id: number) => {
        const employeeToDelete = currentDivisionData.employees.find(emp => emp.id === id);
        if (!employeeToDelete) return;

        if (window.confirm(`Hapus staff "${employeeToDelete.name}"?`)) {
            addLog(`Deleted employee: "${employeeToDelete.name}"`, currentDivision, `ID: ${employeeToDelete.id}`);
            setAppData(prev => {
                const newAppData = {...prev};
                if(newAppData[currentDivision]) {
                    const updatedEmployees = newAppData[currentDivision].employees.filter(emp => emp.id !== id);
                    newAppData[currentDivision] = { ...newAppData[currentDivision], employees: updatedEmployees };
                }
                return newAppData;
            });
        }
    }, [currentDivision, setAppData, addLog, currentDivisionData.employees]);
    
    return (
        <>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cari staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="overflow-x-auto mb-8">
                <table className="min-w-full">
                    <thead className="border-b-2 border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 pb-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Staff</th>
                            <th className="px-4 pb-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">{emp.name}</td>
                                    <td className="px-4 py-4 text-sm text-right font-medium space-x-2">
                                        <button type="button" onClick={() => setIsEditing(emp)} className="p-1 rounded-full transition hover:bg-blue-100 dark:hover:bg-blue-500/20" title="Edit"><i className='bx bxs-edit-alt text-blue-600 dark:text-blue-400 text-xl pointer-events-none'></i></button>
                                        <button type="button" onClick={() => handleDelete(emp.id)} className="p-1 rounded-full transition hover:bg-red-100 dark:hover:bg-red-500/20" title="Hapus"><i className='bx bxs-trash-alt text-red-600 text-xl pointer-events-none'></i></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={2} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    {searchTerm ? 'Staff tidak ditemukan.' : 'Belum ada staff.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">{isEditing ? 'Edit Staff' : 'Tambah Staff Baru'}</h3>
                <form onSubmit={handleSave} className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label htmlFor="employee-name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nama Staff</label>
                        <input 
                            type="text" 
                            id="employee-name" 
                            className="mt-1 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={employeeName}
                            onChange={e => setEmployeeName(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="flex items-end space-x-2">
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">{isEditing ? 'Update' : 'Simpan'}</button>
                        {isEditing && (
                            <button type="button" onClick={() => setIsEditing(null)} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Batal</button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

export default EmployeeManager;