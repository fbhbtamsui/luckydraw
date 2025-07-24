import React from 'react';

interface HeaderProps {
    eventTitle: string;
    setEventTitle: (title: string) => void;
}

const Header: React.FC<HeaderProps> = ({ eventTitle, setEventTitle }) => {
    return (
        <header className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center glass-panel shadow-lg">
            <div className="flex items-center mb-4 md:mb-0">
                <img src="https://i.imgur.com/U11qN58.png" alt="住商淡水團隊 Logo" className="h-12" />
            </div>
            <input 
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="bg-transparent border-b-2 border-emerald-500/50 focus:border-emerald-500 text-lg md:text-xl text-center md:text-right text-slate-700 font-semibold outline-none transition-all w-full md:w-auto px-2 py-1"
              placeholder="輸入活動主題"
            />
        </header>
    );
};

export default Header;