import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header.tsx';
import ParticipantPanel from './components/ParticipantPanel.tsx';
import DrawPanel from './components/DrawPanel.tsx';
import WinnerModal from './components/WinnerModal.tsx';
import { exportToCSV } from './lib/utils.ts';
import { Crown, Trash2, RotateCcw, Download, Volume2, VolumeX } from './components/Icons.tsx';

export type Participant = {
  id: number;
  name: string;
};

// Use reliable CDN links for audio assets.
const AUDIO_URLS = {
  BACKGROUND: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1811a2f64c.mp3', // Replaced GDrive link
  DRAWING: 'https://assets.mixkit.co/sfx/preview/mixkit-tick-tock-clock-timer-1043.mp3',
  WINNER: 'https://assets.mixkit.co/sfx/preview/mixkit-video-game-win-2016.mp3',
};

const App: React.FC = () => {
  const [eventTitle, setEventTitle] = useState("年度抽獎活動");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [currentWinners, setCurrentWinners] = useState<Participant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const drawAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    bgAudioRef.current = new Audio(AUDIO_URLS.BACKGROUND);
    bgAudioRef.current.loop = true;
    drawAudioRef.current = new Audio(AUDIO_URLS.DRAWING);
    winAudioRef.current = new Audio(AUDIO_URLS.WINNER);
  }, []);

  // Control mute state for all audio
  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.muted = isMuted;
    if (drawAudioRef.current) drawAudioRef.current.muted = isMuted;
    if (winAudioRef.current) winAudioRef.current.muted = isMuted;
  }, [isMuted]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedTitle = localStorage.getItem('eventTitle');
    const savedParticipants = localStorage.getItem('participants');
    const savedWinners = localStorage.getItem('winners');
    if (savedTitle) setEventTitle(JSON.parse(savedTitle));
    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedWinners) setWinners(JSON.parse(savedWinners));
  }, []);

  const saveState = useCallback((title: string, parts: Participant[], wins: Participant[]) => {
    localStorage.setItem('eventTitle', JSON.stringify(title));
    localStorage.setItem('participants', JSON.stringify(parts));
    localStorage.setItem('winners', JSON.stringify(wins));
  }, []);
  
  // Save state whenever it changes
  useEffect(() => {
    saveState(eventTitle, participants, winners);
  }, [eventTitle, participants, winners, saveState]);

  const playBgMusicIfNeeded = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      bgAudioRef.current?.play().catch(e => console.error("Background audio failed to play:", e));
    }
  }, [hasInteracted]);

  const handleAddParticipants = useCallback((newNames: string[]) => {
    playBgMusicIfNeeded();
    const newParticipants = newNames
      .filter(name => name.trim() !== "")
      .map(name => ({ id: Date.now() + Math.random(), name: name.trim() }));
      
    setParticipants(prev => {
        const existingNames = new Set(prev.map(p => p.name));
        const uniqueNewParticipants = newParticipants.filter(p => !existingNames.has(p.name));
        return [...prev, ...uniqueNewParticipants];
    });
  }, [playBgMusicIfNeeded]);

  const handleRemoveParticipant = useCallback((id: number) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleDraw = useCallback((count: number) => {
    if (participants.length === 0 || count <= 0 || isDrawing) return;
    
    playBgMusicIfNeeded();
    bgAudioRef.current?.pause();
    drawAudioRef.current?.play().catch(e => console.error("Drawing audio failed to play:", e));

    setIsDrawing(true);
    const drawCount = Math.min(count, participants.length);
    
    setTimeout(() => {
      drawAudioRef.current?.pause();
      if(drawAudioRef.current) drawAudioRef.current.currentTime = 0;
      winAudioRef.current?.play().catch(e => console.error("Winner audio failed to play:", e));

      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      const drawnWinners = shuffled.slice(0, drawCount);
      const remainingParticipants = participants.filter(p => !drawnWinners.find(w => w.id === p.id));
      
      setCurrentWinners(drawnWinners);
      setWinners(prev => [...drawnWinners, ...prev]);
      setParticipants(remainingParticipants);
      setIsDrawing(false);
      setIsModalOpen(true);
    }, 4000); // 4 seconds for animation
  }, [participants, isDrawing, playBgMusicIfNeeded]);

  const closeModal = () => {
    setIsModalOpen(false);
    winAudioRef.current?.pause();
    if(winAudioRef.current) winAudioRef.current.currentTime = 0;
    bgAudioRef.current?.play().catch(e => console.error("Background audio failed to resume:", e));
  };

  const handleReset = () => {
    playBgMusicIfNeeded();
    if(window.confirm('您確定要重置抽獎嗎？所有中獎者將會回到抽獎池，此操作無法復原。')) {
      const allPeople = [...participants, ...winners];
      setParticipants(allPeople.sort((a,b) => a.name.localeCompare(b.name, 'zh-Hant')));
      setWinners([]);
    }
  };

  const handleClearAll = () => {
    playBgMusicIfNeeded();
    if(window.confirm('您確定要清空所有資料嗎？包括活動標題、所有成員和中獎名單，此操作無法復原。')) {
      setEventTitle("年度抽獎活動");
      setParticipants([]);
      setWinners([]);
      localStorage.clear();
    }
  };
  
  const handleExport = () => {
    playBgMusicIfNeeded();
    exportToCSV(winners, eventTitle);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 text-slate-800">
      <div className="min-h-screen bg-white/20">
        <Header eventTitle={eventTitle} setEventTitle={setEventTitle} />
        <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
             <ParticipantPanel onAddParticipants={handleAddParticipants} participants={participants} onRemoveParticipant={handleRemoveParticipant} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <DrawPanel participants={participants} onDraw={handleDraw} isDrawing={isDrawing} />
            <div className="glass-panel p-4">
              <h2 className="text-xl font-semibold text-teal-700 mb-3 flex items-center"><Crown className="mr-2" />中獎紀錄 ({winners.length})</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={handleReset} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                  <RotateCcw size={18} /> 重置抽獎
                </button>
                 <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                  <Download size={18} /> 匯出CSV
                </button>
                <button onClick={handleClearAll} className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                  <Trash2 size={18} /> 清空所有資料
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto pr-2">
                {winners.length > 0 ? (
                  <ul className="space-y-2">
                    {winners.map((winner, index) => (
                      <li key={winner.id} className="winner-card p-3 rounded-lg flex justify-between items-center text-lg transition-all">
                        <span><span className="font-bold text-amber-500 mr-2">#{winners.length - index}</span> {winner.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-center py-8">目前尚無中獎者</p>
                )}
              </div>
            </div>
          </div>
        </main>
        {isModalOpen && (
          <WinnerModal winners={currentWinners} onClose={closeModal} />
        )}
        <button 
          onClick={() => setIsMuted(prev => !prev)}
          className="fixed bottom-4 right-4 z-50 bg-white/50 p-3 rounded-full shadow-lg backdrop-blur-sm hover:bg-white/80 transition-all"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={24} className="text-slate-700" /> : <Volume2 size={24} className="text-slate-700" />}
        </button>
      </div>
    </div>
  );
};

export default App;