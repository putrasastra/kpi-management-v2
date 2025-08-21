
import React, { useState, useContext, useEffect } from 'react';
import Header from './components/shared/Header';
import Tabs from './components/shared/Tabs';
import CalculatorView from './components/calculator/CalculatorView';
import DashboardView from './components/dashboard/DashboardView';
import AdminView from './components/admin/AdminView';
import ManagementView from './components/admin/ManagementView';
import LogsView from './components/logs/LogsView';
import { AppContext } from './context/AppContext';
import { View } from './types';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>(View.Calculator);
    const { theme, currentDivisionData } = useContext(AppContext);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);
    
    const renderView = () => {
        switch (activeView) {
            case View.Dashboard:
                return <DashboardView />;
            case View.Admin:
                return <AdminView />;
            case View.Management:
                return <ManagementView />;
            case View.Logs:
                return <LogsView />;
            case View.Calculator:
            default:
                return <CalculatorView />;
        }
    };

    return (
        <div className="min-h-screen">
            <Header />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                <Tabs 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    bonusCalculationMethod={currentDivisionData.bonusCalculationMethod}
                />
                <main className="mt-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default App;