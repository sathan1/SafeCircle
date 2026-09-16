import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { useSafetyState } from '../../contexts/SafetyStateContext';

const DiscreetCalculator = () => {
  const { toggleDiscreetMode, activeJourney, safetyState } = useSafetyState();
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [discreetAlertTriggered, setDiscreetAlertTriggered] = useState(false);

  const handleDigit = (digit) => {
    if (isNewNumber) {
      setDisplay(digit);
      setIsNewNumber(false);
    } else {
      setDisplay(prev => (prev === '0' ? digit : prev + digit));
    }
  };

  const handleOperator = (op) => {
    setEquation(`${display} ${op}`);
    setIsNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  };

  const handleCalculate = () => {
    // Check for discreet safety trigger simulation (e.g. 911 or 0000)
    if (display === '911' || display === '0000') {
      setDiscreetAlertTriggered(true);
      setTimeout(() => setDiscreetAlertTriggered(false), 4000);
      setDisplay('0');
      setEquation('');
      setIsNewNumber(true);
      return;
    }

    if (!equation) return;
    const parts = equation.trim().split(' ');
    const firstOperand = parseFloat(parts[0]);
    const operator = parts[1];
    const secondOperand = parseFloat(display);

    let result = 0;
    switch (operator) {
      case '+':
        result = firstOperand + secondOperand;
        break;
      case '-':
        result = firstOperand - secondOperand;
        break;
      case '×':
        result = firstOperand * secondOperand;
        break;
      case '÷':
        result = secondOperand !== 0 ? firstOperand / secondOperand : 'Error';
        break;
      default:
        result = secondOperand;
    }

    setDisplay(String(result));
    setEquation('');
    setIsNewNumber(true);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 selection:bg-stone-200">
      {/* Safe Return Banner: Obvious, user-controlled way to return to normal SafeCircle */}
      <div className="w-full max-w-sm mb-3">
        <button
          onClick={toggleDiscreetMode}
          className="w-full py-2 px-3 rounded-xl bg-white border border-stone-300 shadow-2xs hover:bg-stone-50 flex items-center justify-between text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4 text-stone-500" />
            <span>Return to SafeCircle (Standard Mode)</span>
          </span>
          <span className="text-[10px] text-stone-600 bg-stone-200/80 px-2 py-0.5 rounded-md font-mono">
            Exit Discreet View
          </span>
        </button>
      </div>

      {/* Calculator Body */}
      <div className="w-full max-w-sm bg-stone-900 rounded-3xl p-5 shadow-xl border border-stone-800 flex flex-col">
        {/* Top Header Label */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-800 text-[11px] text-stone-400 font-mono">
          <span>Calculator</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
            <span>Rad</span>
          </div>
        </div>

        {/* Discreet Trigger Feedback Notification (Simulation only) */}
        {discreetAlertTriggered && (
          <div className="mb-3 p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-stone-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-tight">
              <strong className="text-white block">Discreet Signal Simulated:</strong>
              Background safety escort notified without visual disclosure.
            </div>
          </div>
        )}

        {/* Display */}
        <div className="bg-stone-950 rounded-2xl p-4 mb-4 text-right flex flex-col justify-end min-h-[90px] border border-stone-800/60">
          <div className="text-xs font-mono text-stone-500 mb-1 h-4">
            {equation}
          </div>
          <div className="text-3xl font-mono text-white tracking-wider truncate">
            {display}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 font-semibold text-base">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="h-13 rounded-2xl bg-stone-700 hover:bg-stone-600 text-stone-200 active:scale-95 transition-all cursor-pointer"
          >
            C
          </button>
          <button
            onClick={() => setDisplay(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev))}
            className="h-13 rounded-2xl bg-stone-700 hover:bg-stone-600 text-stone-200 active:scale-95 transition-all cursor-pointer"
          >
            ±
          </button>
          <button
            onClick={() => setDisplay(prev => String(parseFloat(prev) / 100))}
            className="h-13 rounded-2xl bg-stone-700 hover:bg-stone-600 text-stone-200 active:scale-95 transition-all cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="h-13 rounded-2xl bg-stone-600 hover:bg-stone-500 text-white active:scale-95 transition-all cursor-pointer"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="h-13 rounded-2xl bg-stone-600 hover:bg-stone-500 text-white active:scale-95 transition-all cursor-pointer"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="h-13 rounded-2xl bg-stone-600 hover:bg-stone-500 text-white active:scale-95 transition-all cursor-pointer"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="h-13 rounded-2xl bg-stone-600 hover:bg-stone-500 text-white active:scale-95 transition-all cursor-pointer"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit('0')}
            className="col-span-2 h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer pl-6 text-left"
          >
            0
          </button>
          <button
            onClick={() => {
              if (!display.includes('.')) setDisplay(prev => prev + '.');
            }}
            className="h-13 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white active:scale-95 transition-all cursor-pointer"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="h-13 rounded-2xl bg-rose-700 hover:bg-rose-600 text-white active:scale-95 transition-all cursor-pointer"
          >
            =
          </button>
        </div>
      </div>

      {/* Realism Notice & Educational Clarification */}
      <div className="w-full max-w-sm mt-3 p-3 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-500 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-stone-700">
          <Info className="w-3.5 h-3.5 text-stone-500" />
          <span>Privacy & Discreet Interface Simulation</span>
        </div>
        <p className="leading-relaxed">
          Discreet Mode provides a neutral utility presentation for personal privacy in shared spaces. It does <strong>not</strong> claim to bypass mobile operating system task switchers, process monitors, or device security policies.
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-100 font-mono">
          <span>Escort Status: Active in background</span>
          <span>Safety: {safetyState}</span>
        </div>
      </div>
    </div>
  );
};

export default DiscreetCalculator;
