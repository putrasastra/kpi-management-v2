
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';

const UserSelector: React.FC = () => {
    const { currentUser, setCurrentUser } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentUser);

    useEffect(() => {
        setName(currentUser);
    }, [currentUser]);

    const handleSave = () => {
        if (name.trim()) {
            setCurrentUser(name.trim());
        } else {
            setName(currentUser);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setName(currentUser);
            setIsEditing(false);
        }
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <i className='bx bxs-user-circle text-2xl text-slate-500 dark:text-slate-400'></i>
            {isEditing ? (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="w-32 bg-slate-100 dark:bg-slate-700 border-none rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="font-semibold text-slate-700 dark:text-slate-200 hover:underline"
                    title="Klik untuk ganti user"
                >
                    {currentUser}
                </button>
            )}
        </div>
    );
};

export default UserSelector;
