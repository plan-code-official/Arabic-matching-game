import React, { useState } from 'react';
import { Gamepad2, Heart, Sparkles } from 'lucide-react';
import { audio } from '../utils/audio';
import type { MatchMode } from '../data/cardData';

interface ModeSelectModalProps {
  onSelect: (config: {
    difficulty: 'easy' | 'medium' | 'hard';
    matchMode: MatchMode;
    opponent: 'ai' | 'local' | 'online';
    category: 'all' | 'food' | 'transport' | 'animals' | 'study';
  }) => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({ onSelect }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [matchMode, setMatchMode] = useState<MatchMode>('image-word');
  const [category, setCategory] = useState<'all' | 'food' | 'transport' | 'animals' | 'study'>('all');

  const handleSubmit = () => {
    audio.playClick();
    onSelect({ difficulty, opponent: 'ai', matchMode, category });
  };

  return (
    <div className="w-[95%] max-w-xl mx-auto bg-white/95 backdrop-blur-md rounded-[32px] border-8 border-amber-400 p-4 md:p-6 shadow-2xl relative z-20 animate-float-in text-right select-none">
      
      {/* Decorative dashed inner border */}
      <div className="absolute inset-1.5 border-4 border-amber-500 border-dashed rounded-[26px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-amber-100 rounded-2xl mb-2 animate-bounce-subtle">
          <Gamepad2 className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-amber-950">إعدادات المواجهة والتحدي</h2>
        <p className="text-sm font-bold text-amber-800/80">اختر مستواك وطريقة اللعب المفضلة لديك</p>
      </div>

      <div className="space-y-5">
        

        {/* 2. Difficulty Level */}
        <div>
          <h3 className="text-md font-black text-amber-900 mb-2 flex items-center gap-2 justify-end">
            <span>مستوى الصعوبة</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'easy', title: 'سهل', desc: '12 كارت - 30ث حفظ' },
              { key: 'medium', title: 'وسط', desc: '16 كارت - 15ث حفظ' },
              { key: 'hard', title: 'صعب', desc: '24 كارت - 8ث حفظ' }
            ].map((level) => (
              <button
                key={level.key}
                onClick={() => { audio.playClick(); setDifficulty(level.key as any); }}
                className={`p-3 rounded-2xl border-4 transition-all text-center cursor-pointer ${
                  difficulty === level.key
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-md scale-[1.02]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 font-bold hover:bg-slate-100'
                }`}
              >
                <div className="text-lg">{level.title}</div>
                <div className="text-[10px] text-slate-500 font-normal mt-1">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Card Matching Mode */}
        <div>
          <h3 className="text-md font-black text-amber-900 mb-2 flex items-center gap-2 justify-end">
            <span>نوع مطابقة الكروت</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => { audio.playClick(); setMatchMode('image-word'); }}
              className={`p-3 rounded-2xl border-4 text-right flex items-center justify-between transition-all cursor-pointer ${
                matchMode === 'image-word'
                  ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-md'
                  : 'border-slate-200 bg-slate-50 text-slate-600 font-bold hover:bg-slate-100'
              }`}
            >
              <Sparkles className={`w-6 h-6 ${matchMode === 'image-word' ? 'text-amber-500' : 'text-slate-400'}`} />
              <div className="text-right">
                <div>صورة مع كلمة عربية</div>
                <div className="text-[10px] text-slate-500 font-normal">تحدي تذكر الصورة والكلمة المقابلة 🍎</div>
              </div>
            </button>

            <button
              onClick={() => { audio.playClick(); setMatchMode('image-image'); }}
              className={`p-3 rounded-2xl border-4 text-right flex items-center justify-between transition-all cursor-pointer ${
                matchMode === 'image-image'
                  ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-md'
                  : 'border-slate-200 bg-slate-50 text-slate-600 font-bold hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-6 h-6 ${matchMode === 'image-image' ? 'text-amber-500' : 'text-slate-400'}`} />
              <div className="text-right">
                <div>صورة مع صورة مطابقة</div>
                <div className="text-[10px] text-slate-500 font-normal">مطابقة شكلين متطابقين تماماً 🍒</div>
              </div>
            </button>
          </div>
        </div>

        {/* 4. Category selection */}
        <div>
          <h3 className="text-md font-black text-amber-900 mb-2 flex items-center gap-2 justify-end">
            <span>موضوع الكروت (التصنيف)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { key: 'all', title: 'الكل' },
              { key: 'food', title: 'طعام 🍎' },
              { key: 'transport', title: 'نقل 🚗' },
              { key: 'animals', title: 'حيوانات 🐱' },
              { key: 'study', title: 'أدوات 📚' }
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => { audio.playClick(); setCategory(cat.key as any); }}
                className={`py-2 px-3 rounded-xl border-2 transition-all text-center cursor-pointer text-xs ${
                  category === cat.key
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-black'
                    : 'border-slate-200 bg-slate-50 text-slate-600 font-bold hover:bg-slate-100'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Start Button */}
      <button
        onClick={handleSubmit}
        className="w-full mt-6 py-3.5 btn-start text-white font-black text-lg md:text-xl rounded-2xl hover:scale-102 active:scale-98 transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer"
      >
        <span>ابدأ اللعبة والمنافسة الآن 🎮</span>
      </button>

    </div>
  );
};
