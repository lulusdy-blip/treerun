import React, { useState, useEffect } from 'react';
import { Timer, HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { QuizQuestion } from '../types';
import { playQuizSuccessSound, playQuizFailSound } from '../utils/audio';

interface QuizModalProps {
  question: QuizQuestion;
  onFinish: (correct: boolean) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ question, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    playQuizFailSound();
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const correct = index === question.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      playQuizSuccessSound();
    } else {
      playQuizFailSound();
    }
  };

  const handleConfirm = () => {
    onFinish(isCorrect);
  };

  const timerPercentage = (timeLeft / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-4 border-amber-800 overflow-hidden text-neutral-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-emerald-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
            <h2 className="text-lg font-black tracking-wide">
              🌿 돌발 기후 퀴즈! (씨앗 3배 찬스)
            </h2>
          </div>

          {/* 30s Timer */}
          <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full font-mono font-bold text-sm">
            <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-yellow-300'}`} />
            <span className={timeLeft <= 5 ? 'text-rose-300' : 'text-white'}>{timeLeft}초</span>
          </div>
        </div>

        {/* Timer Progress Bar */}
        <div className="w-full bg-neutral-200 h-2">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        {/* Question Body */}
        <div className="p-6">
          <div className="mb-4">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              출처: {question.source}
            </span>
            <p className="text-base sm:text-lg font-bold text-neutral-900 mt-2 leading-snug">
              {question.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options.map((option, idx) => {
              let btnStyle = 'border-2 border-neutral-200 bg-neutral-50 hover:bg-emerald-50 hover:border-emerald-400';

              if (isAnswered) {
                if (idx === question.correctIndex) {
                  btnStyle = 'border-2 border-emerald-600 bg-emerald-100 text-emerald-950 font-bold';
                } else if (idx === selectedOption) {
                  btnStyle = 'border-2 border-rose-500 bg-rose-100 text-rose-950';
                } else {
                  btnStyle = 'opacity-50 border-neutral-200 bg-neutral-100';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 rounded-xl transition font-medium flex items-center justify-between text-sm sm:text-base ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && idx === question.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== question.correctIndex && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer result message */}
          {isAnswered && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-sm">
                {isCorrect ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> 정답입니다! 씨앗 3배(3개) 획득! 🎉
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> {timeLeft === 0 ? '시간 초과!' : '아쉽게 틀렸습니다!'} 씨앗을 얻지 못했습니다.
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                💡 {question.explanation}
              </p>

              <button
                onClick={handleConfirm}
                className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow transition"
              >
                계속 달리기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
