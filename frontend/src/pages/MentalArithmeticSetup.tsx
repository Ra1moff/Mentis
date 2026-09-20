import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Play, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

export const MentalArithmeticSetup: React.FC = () => {
  const navigate = useNavigate();

  // Settings
  const [digits, setDigits] = useState<number>(2); // 1, 2, 3, 4 digits
  const [valuesCount, setValuesCount] = useState<number>(10); // 5, 10, 15, 20, 30 values
  const [speed, setSpeed] = useState<'Slow' | 'Normal' | 'Fast' | 'Expert'>('Normal');
  const [operation, setOperation] = useState<'Addition' | 'Mixed'>('Addition');

  const speeds = [
    { label: 'Slow', desc: '3.0 seconds delay' },
    { label: 'Normal', desc: '1.8 seconds delay' },
    { label: 'Fast', desc: '0.9 seconds delay' },
    { label: 'Expert', desc: '0.4 seconds delay' },
  ];

  const handleStartTraining = () => {
    navigate(
      `/mental/game?digits=${digits}&values=${valuesCount}&speed=${speed}&operation=${operation}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-game-light tracking-wide flex items-center justify-center gap-3">
          <Brain className="text-game-lightBlue w-10 h-10" /> Mental Arithmetic Trainer
        </h2>
        <p className="text-game-lightBlue text-sm sm:text-base mt-2">
          Train your working memory and calculations. Remember flashed numbers and type the sum.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6 border border-game-blue border-opacity-20">
          
          {/* Number of Digits */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-game-lightBlue">Number of Digits</label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setDigits(num)}
                  className={`p-4 rounded-xl font-bold border transition-all duration-200 text-center ${
                    digits === num
                      ? 'bg-game-blue bg-opacity-40 border-game-lightBlue text-game-light scale-102 shadow-lg shadow-game-lightBlue/10'
                      : 'border-game-blue border-opacity-25 bg-game-dark bg-opacity-25 text-game-lightBlue hover:bg-game-navy hover:text-game-light'
                  }`}
                >
                  <div className="text-lg">{num}</div>
                  <div className="text-[10px] text-game-lightBlue mt-0.5">
                    {num === 1 ? 'e.g. 5' : num === 2 ? 'e.g. 47' : num === 3 ? 'e.g. 352' : 'e.g. 1845'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Values */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-game-lightBlue">Sequence length (Number of values)</label>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  onClick={() => setValuesCount(num)}
                  className={`p-3 rounded-lg font-bold border transition-all duration-200 text-sm ${
                    valuesCount === num
                      ? 'bg-game-blue bg-opacity-40 border-game-lightBlue text-game-light shadow-md'
                      : 'border-game-blue border-opacity-25 bg-game-dark bg-opacity-25 text-game-lightBlue hover:bg-game-navy'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-game-lightBlue">Flashed speed interval</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {speeds.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSpeed(s.label as any)}
                  className={`p-3 rounded-lg font-bold border transition-all duration-200 text-center ${
                    speed === s.label
                      ? 'bg-game-blue bg-opacity-40 border-game-lightBlue text-game-light shadow-md'
                      : 'border-game-blue border-opacity-25 bg-game-dark bg-opacity-25 text-game-lightBlue hover:bg-game-navy'
                  }`}
                >
                  <div className="text-sm">{s.label}</div>
                  <div className="text-[9px] text-game-lightBlue font-medium mt-1">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action / Explanation */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-game-blue border-opacity-20">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg text-game-light border-b border-game-blue border-opacity-20 pb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-game-lightBlue" /> Rules
            </h4>
            <ul className="text-xs text-game-lightBlue leading-relaxed flex flex-col gap-3">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-game-lightBlue flex-shrink-0" />
                <span>Numbers flash one after another. Maintain focus.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-game-lightBlue flex-shrink-0" />
                <span>Accumulate the sum (running total) in your memory.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-game-lightBlue flex-shrink-0" />
                <span>At the end, submit the final correct mathematical answer.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-game-lightBlue flex-shrink-0" />
                <span>Unlock <strong>Mental Master</strong> by finishing 2-digit sets.</span>
              </li>
            </ul>

            {/* Operation mode selection */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-game-blue border-opacity-10">
              <label className="text-[10px] font-bold uppercase tracking-wider text-game-lightBlue">Arithmetic operation</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOperation('Addition')}
                  className={`flex-1 py-2 text-xs font-semibold rounded border transition-colors ${
                    operation === 'Addition' ? 'bg-game-blue border-game-lightBlue text-game-light' : 'border-game-blue border-opacity-30 text-game-lightBlue hover:bg-game-navy'
                  }`}
                >
                  Addition Only
                </button>
                <button
                  onClick={() => setOperation('Mixed')}
                  className={`flex-1 py-2 text-xs font-semibold rounded border transition-colors ${
                    operation === 'Mixed' ? 'bg-game-blue border-game-lightBlue text-game-light' : 'border-game-blue border-opacity-30 text-game-lightBlue hover:bg-game-navy'
                  }`}
                >
                  Mixed (+ and -)
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartTraining}
            className="game-btn-primary py-3.5 w-full font-bold flex items-center justify-center gap-2 mt-6"
          >
            Start Training <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
