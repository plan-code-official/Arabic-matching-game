import React from 'react';
import { Play, BookOpen } from 'lucide-react';
import { audio } from '../utils/audio';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    audio.playClick();
    onStart();
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-sky-gradient relative select-none">
      
      {/* Moving background clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] left-[5%] w-72 h-16 cloud-slow animate-cloud-move-slow" />
        <div className="absolute top-[50%] right-[10%] w-96 h-24 cloud-fast animate-cloud-move-fast" />
      </div>

      {/* Main card */}
      <div className="card-question rounded-[32px] border-8 shadow-lg p-4 max-w-xl w-full text-center relative z-10 animate-float-in">
        
        {/* Double Dashed Inner Border */}
        <div className="absolute inset-1.5 border-4 border-amber-500 border-dashed rounded-[26px] pointer-events-none" />

        {/* Title Icon - Cute Robot */}
        <div 
          className="mx-auto mb-3 animate-bounce-subtle flex items-center justify-center"
          style={{ width: '80px', height: '80px' }}
        >
          <img 
            src="/assets/cute_robot.png" 
            alt="الروبوت الذكي" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
          />
        </div>

        {/* Game Title */}
        <h1 className="text-2xl md:text-3xl font-black text-amber-950 mb-3 drop-shadow-sm">
          لعبة ذاكرة كروت الكلمات
        </h1>
        <p className="text-md font-bold text-amber-800/80 mb-6">
          تحدي تذكر ومطابقة الصور والكلمات 🍎🧠🚗
        </p>

        {/* Instruction details */}
        <div className="bg-amber-950/5 border border-amber-950/10 p-4 rounded-2xl text-right mb-6">
          <h3 className="text-sm font-black text-amber-dark mb-3 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-amber-600" />
            <span>كيف تلعب؟</span>
          </h3>
          <ul className="text-xs md:text-sm font-bold text-amber-900/80 list-disc list-inside">
            <li style={{ marginBottom: '6px' }}>ستظهر الكروت مكشوفة لمدة ثوانٍ في البداية لحفظ أماكنها.</li>
            <li style={{ marginBottom: '6px' }}>ستلتف الكروت وتصبح مقلوبة. اضغط على الكروت لمطابقتها!</li>
            <li style={{ marginBottom: '6px' }}>يمكنك مطابقة صورة مع كلمة (مثل صورة الموزة ↔ كلمة موزة) أو صورة مع صورة.</li>
            <li>العب ضد الروبوت الذكي حكيم 🤖، صديق بجانبك 👥، أو منافس أونلاين 🌐!</li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full md:w-auto px-12 py-3 btn-start text-white font-black text-xl rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-md flex items-center justify-center gap-3 cursor-pointer mx-auto"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>ابدأ التحدي الآن</span>
        </button>

      </div>

      {/* Footer copyright */}
      <div className="absolute bottom-4 text-xs font-bold text-sky-800/60 z-10">
        تم التطوير بحب لتعليم لغتنا الجميلة ❤️
      </div>
    </div>
  );
};
