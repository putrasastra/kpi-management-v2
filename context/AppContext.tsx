
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { AppData, DivisionData, Theme, LogEntry } from '../types';

interface AppContextType {
    appData: AppData;
    setAppData: React.Dispatch<React.SetStateAction<AppData>>;
    currentDivision: string;
    setCurrentDivision: (division: string) => void;
    divisions: string[];
    currentDivisionData: DivisionData;
    theme: Theme;
    toggleTheme: () => void;
    addDivision: (divisionName: string) => void;
    deleteDivision: (divisionName: string) => void;
    currentUser: string;
    setCurrentUser: (user: string) => void;
    logs: LogEntry[];
    addLog: (action: string, division: string, details?: string) => void;
    clearLogs: () => void;
    renameDivision: (oldName: string, newName: string) => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const LOGS_STORAGE_KEY = 'incentiveAppLogs';
const USER_STORAGE_KEY = 'incentiveAppUser';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { appData, setAppData } = useAppData();
    const divisions = Object.keys(appData);
    const [currentDivision, setCurrentDivision] = useState<string>(divisions[0] || '');
    
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('appTheme') as Theme;
        return savedTheme || 'light';
    });

    const [currentUser, _setCurrentUser] = useState<string>(() => {
        return localStorage.getItem(USER_STORAGE_KEY) || 'Admin Sastro';
    });

    const [logs, setLogs] = useState<LogEntry[]>(() => {
        try {
            const savedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
            return savedLogs ? JSON.parse(savedLogs) : [];
        } catch (error) {
            console.error("Gagal memuat log dari localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        // Ensure currentDivision is always valid, especially after deletion.
        if (!divisions.includes(currentDivision) && divisions.length > 0) {
            setCurrentDivision(divisions[0]);
        }
    }, [divisions, currentDivision]);

    useEffect(() => {
        localStorage.setItem('appTheme', theme);
    }, [theme]);
    
    useEffect(() => {
        localStorage.setItem(USER_STORAGE_KEY, currentUser);
    }, [currentUser]);

    useEffect(() => {
        try {
            localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
        } catch (error) {
            console.error("Gagal menyimpan log ke localStorage", error);
        }
    }, [logs]);

    const setCurrentUser = (user: string) => {
        _setCurrentUser(user);
    };

    const addLog = (action: string, division: string, details?: string) => {
        const newLog: LogEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            user: currentUser,
            action,
            division,
            details,
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
    };

    const clearLogs = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua catatan log? Tindakan ini tidak dapat diurungkan.')) {
            setLogs([]);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const addDivision = (divisionName: string) => {
        if (appData[divisionName]) {
            alert(`Divisi dengan nama "${divisionName}" sudah ada.`);
            return;
        }

        addLog(`Created new division: "${divisionName}"`, divisionName);
        const newDivisionData: DivisionData = {
            employees: [],
            history: [],
            kpiConfigs: [],
            bonusSchemes: [],
            kpiIndicators: [
                { id: 1, name: 'Bad Perform', threshold: -25, color: 'bg-red-600' },
                { id: 2, name: 'Under Perform', threshold: 40, color: 'bg-pink-500' },
                { id: 3, name: 'Average', threshold: 60, color: 'bg-yellow-500' },
                { id: 4, name: 'Good', threshold: 80, color: 'bg-blue-500' },
                { id: 5, name: 'Excellent', threshold: 100, color: 'bg-green-500' }
            ],
            bonusCalculationMethod: 'OMSET_BASED',
        };

        setAppData(prevData => ({
            ...prevData,
            [divisionName]: newDivisionData,
        }));
        
        setCurrentDivision(divisionName);
    };

    const deleteDivision = (divisionName: string) => {
        const remainingDivisions = Object.keys(appData).filter(d => d !== divisionName);
        
        if (remainingDivisions.length === 0) {
            alert('Tidak bisa menghapus divisi terakhir.');
            return;
        }

        addLog(`Deleted division: "${divisionName}"`, divisionName, (() => {
            const data = appData[divisionName];
            if (!data) return undefined;
            return `Employees: ${data.employees.length}, KPIs: ${data.kpiConfigs.length}, Bonus Schemes: ${data.bonusSchemes.length}, Indicators: ${data.kpiIndicators.length}, History: ${data.history.length}`;
        })());
        const nextDivision = (currentDivision === divisionName) ? remainingDivisions[0] : currentDivision;

        setAppData(prevData => {
            const newData = { ...prevData };
            delete newData[divisionName];
            return newData;
        });

        setCurrentDivision(nextDivision);
    };

    const renameDivision = (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed) {
            alert('Nama divisi tidak boleh kosong.');
            return;
        }
        if (oldName === trimmed) return;
        if (appData[trimmed]) {
            alert(`Divisi dengan nama "${trimmed}" sudah ada.`);
            return;
        }

        setAppData(prev => {
            const copy = { ...prev } as AppData;
            const data = copy[oldName];
            if (!data) return prev;
            delete copy[oldName];
            copy[trimmed] = data;
            return copy;
        });

        addLog(`Renamed division: "${oldName}" → "${trimmed}"`, trimmed, `From: ${oldName} To: ${trimmed}`);

        if (currentDivision === oldName) {
            setCurrentDivision(trimmed);
        }
    };

    const currentDivisionData = appData[currentDivision] || {
        employees: [],
        history: [],
        kpiConfigs: [],
        bonusSchemes: [],
        kpiIndicators: [],
        bonusCalculationMethod: 'OMSET_BASED'
    };
    
    return (
        <AppContext.Provider value={{
            appData,
            setAppData,
            currentDivision,
            setCurrentDivision,
            divisions,
            currentDivisionData,
            theme,
            toggleTheme,
            addDivision,
            deleteDivision,
            currentUser,
            setCurrentUser,
            logs,
            addLog,
            clearLogs,
            renameDivision
        }}>
            {children}
        </AppContext.Provider>
    );
};