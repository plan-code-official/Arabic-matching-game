import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Home, RotateCcw } from 'lucide-react';
import { audio } from '../utils/audio';

interface ResultModalProps {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  accuracy: number; // percentage
  onRestart: () => void;
  onExit: () => void;
  apiRewards?: {
    score: number;
    stars: number;
    coins: number;
    experience: number;
  } | null;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  accuracy,
  onRestart,
  onExit,
  apiRewards
}) => {
  const isP1Winner = player1Score > player2Score;
  const isTie = player1Score === player2Score;

  useEffect(() => {
    if (isP1Winner) {
      // Fire confetti celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      // Play win sound
      audio.playWinFanfare();
    } else {
      // Play lose or tie sound
      audio.playFailure();
    }
  }, [isP1Winner]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
      <div 
        className="card-result rounded-[32px] shadow-2xl p-5 md:p-6 max-w-md w-full text-center relative animate-float-in border-8 border-amber-400 bg-white"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Dashed Border Decoration */}
        <div className="absolute inset-1 border-4 border-amber-500 border-dashed rounded-[24px] pointer-events-none" />

        {/* Decorative Stars / Trophy */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-500 text-white w-18 h-18 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <Trophy className="w-8 h-8 stroke-[2.5] fill-amber-300" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-amber-950 mb-4 drop-shadow-sm" style={{ marginTop: '56px' }}>
          {isTie 
            ? 'تعادل رائع ولعب مميز!' 
            : isP1Winner 
              ? `فوز مذهل لـ ${player1Name}! 🎉` 
              : `فوز مستحق لـ ${player2Name}! 🏆`}
        </h2>

        {/* Scores Comparison */}
        <div className="grid grid-cols-2 gap-4 my-4 bg-amber-950/5 p-3 rounded-xl border border-amber-950/10">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-800">{player1Name}</span>
            <span className="text-3xl font-black text-amber-600 mt-1">{player1Score}</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1.5 ${
              isP1Winner ? 'bg-emerald-100 text-emerald-800' : isTie ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
            }`}>
              {isP1Winner ? 'الفائز 👑' : isTie ? 'تعادل' : 'خسارة'}
            </span>
          </div>

          <div className="flex flex-col items-center border-r border-amber-950/10">
            <span className="text-xs font-bold text-amber-800">{player2Name}</span>
            <span className="text-3xl font-black text-slate-700 mt-1">{player2Score}</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1.5 ${
              !isP1Winner && !isTie ? 'bg-emerald-100 text-emerald-800' : isTie ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
            }`}>
              {!isP1Winner && !isTie ? 'الفائز 👑' : isTie ? 'تعادل' : 'خسارة'}
            </span>
          </div>
        </div>

        {/* Accuracy and detailed stats */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs font-bold text-slate-700">
          <span>دقة تذكرك ومطابقتك:</span>
          <span className="text-emerald-600 font-black text-sm">{accuracy}%</span>
        </div>

        {/* API Rewards */}
        {apiRewards && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4">
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-xl font-bold flex flex-col items-center flex-1 min-w-[70px]">
              <span className="text-[10px]">النجوم</span>
              <span className="text-lg">⭐ {apiRewards.stars}</span>
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl font-bold flex flex-col items-center flex-1 min-w-[70px]">
              <span className="text-[10px]">العملات</span>
              <span className="text-lg">🪙 {apiRewards.coins}</span>
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-xl font-bold flex flex-col items-center flex-1 min-w-[70px]">
              <span className="text-[10px]">الخبرة</span>
              <span className="text-lg">⚡ {apiRewards.experience}</span>
            </div>
          </div>
        )}

        <p className="text-amber-900 font-bold text-xs leading-relaxed mb-6 px-4">
          {isP1Winner 
            ? 'لقد كانت ذاكرتك قوية جداً وسرعتك مبهرة! استمر في هذا الأداء الرائع!' 
            : 'لعب ممتاز! الذاكرة كالعضلات تحتاج إلى تمرين دائم، حاول مجدداً وستتفوق بالتأكيد!'}
        </p>

        {/* Control Buttons */}
        <div className="flex flex-col gap-3 z-10 relative">
          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="w-full py-3 btn-restart text-white font-black text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md flex items-center justify-center gap-2 cursor-pointer border-b-4 border-emerald-700"
          >
            <RotateCcw className="w-5 h-5 stroke-[3]" />
            <span>العب مجدداً</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onExit();
            }}
            className="w-full py-2.5 btn-menu text-white font-bold text-md rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md flex items-center justify-center gap-2 cursor-pointer border-b-4 border-amber-700"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>الخروج للقائمة الرئيسية</span>
          </button>
        </div>
        
        <div style={{ height: '4px' }}></div>

      </div>
    </div>
  );
};

