
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import DivisionSelector from './DivisionSelector';
import UserSelector from './UserSelector';

const Header: React.FC = () => {
    const { divisions, currentDivision, setCurrentDivision, theme, toggleTheme } = useContext(AppContext);
    
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <i className='bx bxs-calculator text-3xl text-blue-600 dark:text-blue-400'></i>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
                            KPI MANAGEMENT SASTRO
                        </h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <UserSelector />
                        <div className="w-40 sm:w-60">
                             <DivisionSelector 
                                divisions={divisions} 
                                currentDivision={currentDivision} 
                                onChange={setCurrentDivision} 
                            />
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            <i className={`bx text-2xl ${theme === 'light' ? 'bxs-moon' : 'bxs-sun'}`}></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;