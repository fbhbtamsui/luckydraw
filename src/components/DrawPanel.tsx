import React, { useState, useEffect, useRef } from 'react';
import type { Participant } from '../App.tsx';
import { Award, QrCode } from './Icons.tsx';

interface DrawPanelProps {
  participants: Participant[];
  onDraw: (count: number) => void;
  isDrawing: boolean;
}

const DrawPanel: React.FC<DrawPanelProps> = ({ participants, onDraw, isDrawing }) => {
  const [numberOfWinners, setNumberOfWinners] = useState(1);
  const [displayName, setDisplayName] = useState("?");
  const animationFrameRef = useRef<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Effect for QR code generation (runs once on component mount)
  useEffect(() => {
    // Only generate QR for shareable http/https URLs, not local files.
    if (window.location.protocol.startsWith('http')) {
      const currentUrl = window.location.href;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`);
    }
  }, []);


  useEffect(() => {
    if (isDrawing) {
      const animate = () => {
        if (participants.length > 0) {
          const randomIndex = Math.floor(Math.random() * participants.length);
          setDisplayName(participants[randomIndex].name);
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      setDisplayName("?");
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDrawing, participants]);
  
  const handleDrawClick = () => {
    if(!isDrawing && participants.length > 0) {
      onDraw(numberOfWinners);
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col justify-between items-center h-[28rem] text-center">
      <h2 className="text-2xl font-bold text-amber-500 tracking-widest">LUCKY DRAW</h2>
      
      <div className="w-full h-48 bg-white/70 rounded-lg flex items-center justify-center overflow-hidden border-2 border-slate-300 shadow-inner">
        <div className={`transition-all duration-100 ${isDrawing ? 'text-4xl md:text-6xl font-black text-emerald-600' : 'text-6xl md:text-8xl font-black text-slate-400'}`}>
          {displayName}
        </div>
      </div>

      <div className="w-full space-y-4">
        <div className="flex items-center justify-center gap-4">
          <label htmlFor="winnersCount" className="text-lg font-semibold text-slate-600">抽出人數:</label>
          <input
            id="winnersCount"
            type="number"
            value={numberOfWinners}
            onChange={(e) => setNumberOfWinners(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 bg-white/70 border border-slate-300 rounded-md p-2 text-center text-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            min="1"
            max={participants.length}
            disabled={isDrawing}
          />
        </div>
        <button
          onClick={handleDrawClick}
          disabled={isDrawing || participants.length === 0}
          className={`w-full py-4 text-2xl font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-3
            ${
              isDrawing
                ? 'bg-slate-500 cursor-not-allowed'
                : participants.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white draw-btn-glow'
            }
          `}
        >
          {isDrawing ? '抽獎中...' : <> <Award /> 開始抽獎 </> }
        </button>
      </div>
       <div className="absolute bottom-4 right-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group">
         <QrCode size={40} className="text-slate-600" />
         <div className="absolute bottom-full mb-2 right-0 w-48 bg-white text-slate-700 text-xs rounded-lg py-2 px-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            手機掃描分享此頁面
            <div className="w-full p-1 bg-white mt-2 rounded-md">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code for this page" width="150" height="150" className="mx-auto" />
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-slate-500 text-center p-2">在網頁伺服器上運行以生成QR碼</div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default DrawPanel;