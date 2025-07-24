import React, { useState } from 'react';
import type { Participant } from '../App.tsx';
import { Users, FilePlus, Hash, Trash2 } from './Icons.tsx';

interface ParticipantPanelProps {
  onAddParticipants: (names: string[]) => void;
  participants: Participant[];
  onRemoveParticipant: (id: number) => void;
}

type AddMode = 'bulk' | 'manual' | 'generate';

const ParticipantPanel: React.FC<ParticipantPanelProps> = ({ onAddParticipants, participants, onRemoveParticipant }) => {
  const [mode, setMode] = useState<AddMode>('bulk');
  const [bulkText, setBulkText] = useState('');
  const [manualName, setManualName] = useState('');
  const [generateCount, setGenerateCount] = useState('10');
  const [generatePrefix, setGeneratePrefix] = useState('成員');

  const handleBulkAdd = () => {
    onAddParticipants(bulkText.split('\n'));
    setBulkText('');
  };

  const handleManualAdd = () => {
    if(manualName.trim()){
        onAddParticipants([manualName]);
        setManualName('');
    }
  };

  const handleGenerateAdd = () => {
    const count = parseInt(generateCount, 10);
    if (count > 0) {
      const names = Array.from({ length: count }, (_, i) => `${generatePrefix}${i + 1}`);
      onAddParticipants(names);
    }
  };

  const renderForm = () => {
    const commonInputClasses = "w-full bg-white/70 border border-slate-300 rounded-md p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none";
    switch (mode) {
      case 'bulk':
        return (
          <div className="space-y-3">
            <textarea
              className={`${commonInputClasses} h-32`}
              placeholder="每行一名成員，直接貼上名單"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            ></textarea>
            <button onClick={handleBulkAdd} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">批量新增</button>
          </div>
        );
      case 'manual':
        return (
          <form onSubmit={(e)=>{e.preventDefault(); handleManualAdd();}} className="space-y-3">
            <input
              type="text"
              className={commonInputClasses}
              placeholder="輸入成員名稱"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
            />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">單筆新增</button>
          </form>
        );
      case 'generate':
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                className={commonInputClasses}
                placeholder="前綴 (e.g. 成員)"
                value={generatePrefix}
                onChange={(e) => setGeneratePrefix(e.target.value)}
              />
              <input
                type="number"
                className={`${commonInputClasses} w-24`}
                placeholder="數量"
                value={generateCount}
                onChange={(e) => setGenerateCount(e.target.value)}
                min="1"
              />
            </div>
            <button onClick={handleGenerateAdd} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">自動產生</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel p-4 space-y-4 h-full flex flex-col">
      <div>
        <h2 className="text-xl font-semibold text-teal-700 mb-3 flex items-center"><Users className="mr-2" />抽獎池管理 ({participants.length})</h2>
        <div className="flex border-b border-slate-300 mb-3">
          <TabButton icon={<FilePlus />} label="批量新增" active={mode === 'bulk'} onClick={() => setMode('bulk')} />
          <TabButton icon={<Users />} label="單筆新增" active={mode === 'manual'} onClick={() => setMode('manual')} />
          <TabButton icon={<Hash />} label="連號產生" active={mode === 'generate'} onClick={() => setMode('generate')} />
        </div>
        {renderForm()}
      </div>

      <div className="flex-grow min-h-0">
        <h3 className="text-lg font-semibold text-slate-500 mb-2">待抽獎名單</h3>
        <div className="bg-black/5 rounded-lg p-2 max-h-96 h-full overflow-y-auto">
          {participants.length > 0 ? (
            <ul className="space-y-1">
              {participants.map(p => (
                <li key={p.id} className="text-slate-700 p-2 rounded-md flex justify-between items-center hover:bg-emerald-100/50 group">
                  <span>{p.name}</span>
                  <button onClick={() => onRemoveParticipant(p.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-center py-8">請新增抽獎成員</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex justify-center items-center gap-2 p-3 text-sm font-semibold transition-colors duration-200 ${active ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>
        {icon}
        {label}
    </button>
);


export default ParticipantPanel;