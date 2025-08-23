
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

const SummaryCard: React.FC<{ icon: string; title: string; value: string | number; color: string; }> = ({ icon, title, value, color }) => {
    const valueStr = String(value);
    let fontSize = 'text-3xl';

    // Adjust font size for long currency values
    if (valueStr.startsWith('Rp')) {
        if (valueStr.length > 16) {
            fontSize = 'text-xl';
        } else if (valueStr.length > 12) {
            fontSize = 'text-2xl';
        }
    } 
    // Adjust font size for long point values
    else if (valueStr.includes('.') || valueStr.includes(',')) {
        if (valueStr.length > 10) {
            fontSize = 'text-2xl';
        }
    }

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 flex items-center gap-6">
            <div className={`flex items-center justify-center w-16 h-16 rounded-lg ${color} bg-opacity-10`}>
                <i className={`bx ${icon} text-4xl ${color}`}></i>
            </div>
            <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
                <p className={`${fontSize} font-bold mt-1 text-slate-800 dark:text-slate-200`}>{value}</p>
            </div>
        </div>
    );
};


interface SummaryCardsProps {
    selectedMonth?: string;
    selectedYear?: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ selectedMonth, selectedYear }) => {
    const { currentDivisionData } = useContext(AppContext);
    const isNonSales = currentDivisionData.bonusCalculationMethod === 'NON_SALES';
    
    // Filter history based on selected month and year
    const filteredHistory = currentDivisionData.history.filter(record => {
        const matchesMonth = !selectedMonth || record.periodMonth === selectedMonth;
        const matchesYear = !selectedYear || record.periodYear?.toString() === selectedYear;
        return matchesMonth && matchesYear;
    });
    
    const totalEmployees = currentDivisionData.employees.length;
    const highestPoints = filteredHistory.length > 0 ? Math.max(...filteredHistory.map(h => h.totalPoints)) : 0;
    const totalBonus = filteredHistory.reduce((acc, h) => acc + h.bonus, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard 
                icon="bxs-user-detail" 
                title="Total Staff" 
                value={totalEmployees}
                color="text-blue-500"
            />
            <SummaryCard 
                icon="bxs-star" 
                title="Poin Tertinggi Diraih" 
                value={highestPoints.toFixed(3)}
                color="text-amber-500"
            />
            {!isNonSales && (
                <SummaryCard 
                    icon="bxs-wallet" 
                    title="Total Bonus Dicatat" 
                    value={formatCurrency(totalBonus)}
                    color="text-green-500"
                />
            )}
        </div>
    );
};

export default SummaryCards;