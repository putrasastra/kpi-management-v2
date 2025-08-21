
import React from 'react';
import { View, DivisionData } from '../../types';

interface TabsProps {
    activeView: View;
    setActiveView: (view: View) => void;
    bonusCalculationMethod: DivisionData['bonusCalculationMethod'];
}

const TabButton: React.FC<{
    view: View;
    activeView: View;
    onClick: (view: View) => void;
    children: React.ReactNode;
    icon: string;
}> = ({ view, activeView, onClick, children, icon }) => {
    const isActive = activeView === view;
    const classes = `flex items-center gap-2 py-2 px-4 text-sm sm:text-base font-semibold rounded-lg transition-colors duration-200 ${
        isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;
    return (
        <button onClick={() => onClick(view)} className={classes}>
            <i className={`bx ${icon} text-xl`}></i>
            <span className="hidden sm:inline">{children}</span>
        </button>
    );
};

const Tabs: React.FC<TabsProps> = ({ activeView, setActiveView, bonusCalculationMethod }) => {
    const calculatorLabel = bonusCalculationMethod === 'NON_SALES' ? 'Kalkulator KPI' : 'Kalkulator Bonus';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-2">
            <nav className="flex items-center justify-center space-x-1 sm:space-x-2" aria-label="Tabs">
                <TabButton view={View.Calculator} activeView={activeView} onClick={setActiveView} icon="bxs-calculator">
                    {calculatorLabel}
                </TabButton>
                <TabButton view={View.Dashboard} activeView={activeView} onClick={setActiveView} icon="bxs-dashboard">
                    Dasbor & Riwayat
                </TabButton>
                <TabButton view={View.Admin} activeView={activeView} onClick={setActiveView} icon="bxs-cog">
                    Konfigurasi KPI
                </TabButton>
                <TabButton view={View.Management} activeView={activeView} onClick={setActiveView} icon="bxs-data">
                    Manajemen
                </TabButton>
                 <TabButton view={View.Logs} activeView={activeView} onClick={setActiveView} icon="bxs-time-five">
                    Log Aktivitas
                </TabButton>
            </nav>
        </div>
    );
};


export default Tabs;