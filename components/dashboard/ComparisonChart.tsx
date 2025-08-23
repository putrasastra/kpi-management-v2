import React, { useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { DivisionData } from '../../types';

declare const Chart: any;

interface ComparisonChartProps {
    selectedMonth?: string;
    selectedYear?: string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ selectedMonth, selectedYear }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    const { currentDivisionData, theme } = useContext(AppContext);

    useEffect(() => {
        if (!chartRef.current) return;

        const data = currentDivisionData;

        // Filter history based on selected month and year
        const filteredHistory = data.history.filter(record => {
            const matchesMonth = !selectedMonth || record.periodMonth === selectedMonth;
            const matchesYear = !selectedYear || record.periodYear?.toString() === selectedYear;
            return matchesMonth && matchesYear;
        });

        const latestScores = data.employees.map(emp => {
            const empHistory = filteredHistory.filter(h => h.employeeId === emp.id);
            const latestEntry = empHistory.sort((a, b) => b.id - a.id)[0];
            return latestEntry ? latestEntry.totalPoints : 0;
        });

        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const tickColor = theme === 'dark' ? '#cbd5e1' : '#64748b';

        const chartData = {
            labels: data.employees.map(emp => emp.name),
            datasets: [{
                label: 'Total Poin Terakhir',
                data: latestScores,
                backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4,
            }]
        };

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: tickColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: tickColor }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: tickColor
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [currentDivisionData, theme, selectedMonth, selectedYear]);

    return <div style={{ height: '300px' }}><canvas ref={chartRef}></canvas></div>;
};

export default ComparisonChart;