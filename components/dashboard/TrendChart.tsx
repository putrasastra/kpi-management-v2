
import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

declare const Chart: any;

const TrendChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    const { currentDivisionData, theme } = useContext(AppContext);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(currentDivisionData.employees[0]?.id.toString() || '');

     useEffect(() => {
        if(currentDivisionData.employees.length > 0 && !currentDivisionData.employees.find(e => e.id.toString() === selectedEmployeeId)) {
            setSelectedEmployeeId(currentDivisionData.employees[0].id.toString());
        }
     }, [currentDivisionData.employees, selectedEmployeeId]);

    useEffect(() => {
        if (!chartRef.current || !selectedEmployeeId) {
            // Clear chart if no employee is selected
            if(chartInstance.current) chartInstance.current.destroy();
            return;
        }

        const data = currentDivisionData;
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        const employeeHistory = data.history
            .filter(h => h.employeeId.toString() === selectedEmployeeId && h.periodMonth && h.periodYear)
            .sort((a, b) => {
                const dateA = new Date(a.periodYear, months.indexOf(a.periodMonth));
                const dateB = new Date(b.periodYear, months.indexOf(b.periodMonth));
                return dateA.getTime() - dateB.getTime();
            });

        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const tickColor = theme === 'dark' ? '#cbd5e1' : '#64748b';

        const chartData = {
            labels: employeeHistory.map(h => `${h.periodMonth.slice(0, 3)} ${h.periodYear}`),
            datasets: [{
                label: 'Tren Poin',
                data: employeeHistory.map(h => h.totalPoints),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
            type: 'line',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                           display: true,
                           text: 'Total Poin',
                           color: tickColor
                        },
                        grid: { color: gridColor },
                        ticks: { color: tickColor }
                    },
                    x: {
                        title: {
                           display: true,
                           text: 'Periode',
                           color: tickColor
                        },
                        grid: { color: gridColor },
                        ticks: { color: tickColor }
                    }
                },
                 plugins: {
                    legend: {
                        labels: {
                            color: tickColor
                        }
                    },
                    tooltip: {
                         callbacks: {
                            title: function(context: any) {
                                return context[0].label;
                            },
                            label: function(context: any) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(3) + ' poin';
                                }
                                return label;
                            }
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
    }, [currentDivisionData, selectedEmployeeId, theme]);

    return (
        <div>
            <div className="mb-4 max-w-xs">
                <label htmlFor="trend-employee-selector" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Pilih Staff:</label>
                <select 
                    id="trend-employee-selector" 
                    className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    disabled={currentDivisionData.employees.length === 0}
                >
                    {currentDivisionData.employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
            </div>
            <div style={{ height: '300px' }}><canvas ref={chartRef}></canvas></div>
        </div>
    );
};

export default TrendChart;