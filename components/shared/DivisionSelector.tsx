import React from 'react';

interface DivisionSelectorProps {
    divisions: string[];
    currentDivision: string;
    onChange: (division: string) => void;
}

const DivisionSelector: React.FC<DivisionSelectorProps> = ({ divisions, currentDivision, onChange }) => (
    <div className="relative">
        <select 
            id="division-selector" 
            className="w-full appearance-none bg-slate-100 dark:bg-slate-700 border-none text-slate-700 dark:text-slate-200 rounded-lg py-2 pl-3 pr-10 text-base leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currentDivision}
            onChange={(e) => onChange(e.target.value)}
        >
            {divisions.map(division => (
                <option key={division} value={division}>{division}</option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
             <i className='bx bx-chevron-down text-xl'></i>
        </div>
    </div>
);

export default DivisionSelector;