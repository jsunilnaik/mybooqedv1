import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, X, ChevronRight, Share2, Smartphone } from 'lucide-react';
import { cn, formatPrice } from '../../lib/utils';

interface AIAnalysisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  salonName: string;
  onConfirm: () => void;
  isProcessing: boolean;
  result?: {
    count: number;
    forecastBoost: number;
    recommendations: any[];
  };
}

const STEPS = [
  "Initializing Aura Analysis Engine...",
  "Scanning schedule for high-yield gaps...",
  "Synthesizing salon metadata & review sentiment...",
  "Consulting Revenue Intelligence...",
  "Applying multi-strategy adjustments...",
  "Generating strategic marketing hooks..."
];

export const AIAnalysisOverlay: React.FC<AIAnalysisOverlayProps> = ({
  isOpen,
  onClose,
  salonName,
  isProcessing,
  result
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isProcessing) {
      setCurrentStep(0);
      setLogs([STEPS[0]]);
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  useEffect(() => {
    if (isProcessing && currentStep > 0) {
      setLogs(prev => [...prev, STEPS[currentStep]]);
    }
  }, [currentStep, isProcessing]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-white/20 backdrop-blur-md p-0 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white/60 backdrop-blur-2xl border-t sm:border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-t-[32px] sm:rounded-[40px] overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Scanning Line Animation */}
        {isProcessing && (
          <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-purple-500 to-transparent z-50 pointer-events-none opacity-60 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          />
        )}

        {/* Header - Fixed at top */}
        <div className="p-6 sm:p-8 border-b border-white/50 flex items-center justify-between bg-white/40 backdrop-blur-lg sticky top-0 z-20">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/30">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight truncate">Revenue Command</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">Analyzing {salonName}</p>
            </div>
          </div>
          {!isProcessing && (
            <button 
              onClick={onClose}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 border border-white/80 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition-all flex-shrink-0"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1 relative z-10">
          {isProcessing ? (
            <div className="space-y-8 sm:space-y-10">
              {/* Terminal View (Light Frosted) */}
              <div className="bg-white/50 rounded-2xl sm:rounded-3xl border border-white/80 p-5 sm:p-8 font-mono text-[12px] sm:text-[14px] h-48 sm:h-56 overflow-y-auto shadow-inner">
                <div className="space-y-2 sm:space-y-3">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3 text-purple-700/80">
                      <ChevronRight size={14} className="mt-1 flex-shrink-0 text-purple-500" />
                      <span className={i === logs.length - 1 ? "text-purple-900 font-bold" : "font-medium"}>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Visualizer */}
              <div className="flex justify-between items-center gap-2 sm:gap-4">
                {STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 sm:h-2 flex-1 rounded-full shadow-inner",
                      i <= currentStep ? "bg-gradient-to-r from-purple-500 to-indigo-500 border border-purple-400" : "bg-white/50 border border-white/60"
                    )}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-purple-700/70 text-[10px] sm:text-xs font-black animate-pulse tracking-widest uppercase shadow-sm">Aura AI Syncing...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-8 sm:space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/70 p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/80 shadow-md backdrop-blur-md">
                  <div className="text-gray-500 text-[9px] sm:text-[10px] uppercase font-black mb-1 sm:mb-2 tracking-widest">Slots Optimized</div>
                  <div className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter">{result.count}</div>
                </div>
                <div className="bg-green-50/80 p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-green-200/60 shadow-md backdrop-blur-md">
                  <div className="text-green-600/80 text-[9px] sm:text-[10px] uppercase font-black mb-1 sm:mb-2 tracking-widest">Yield Boost (Est.)</div>
                  <div className="text-3xl sm:text-5xl font-black text-green-600 tracking-tighter">+{formatPrice(result.forecastBoost)}</div>
                </div>
              </div>

              {/* Marketing Message */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Campaign Message</h3>
                <div className="bg-white/70 p-6 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-white/80 shadow-md backdrop-blur-md relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-[0.03]">
                    <Smartphone size={120} />
                  </div>
                  <p className="text-gray-800 italic text-lg sm:text-xl leading-relaxed font-serif relative z-10 font-medium">
                    "{result.recommendations[0]?.marketing_hook || 'Flash Sale! Get 20% off haircuts now.'}"
                  </p>
                  {result.recommendations[0]?.value_add && (
                    <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-50 text-purple-800 px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black border border-purple-200 shadow-sm relative z-10">
                      <Zap size={12} className="fill-purple-600 text-purple-600" /> BONUS: {result.recommendations[0].value_add.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions - Sticky at bottom of scroll area */}
              <div className="flex gap-3 pt-4 sm:pt-6">
                <button 
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 sm:py-5 rounded-2xl sm:rounded-3xl hover:shadow-[0_8px_25px_rgba(147,51,234,0.4)] transition-all active:scale-95 shadow-lg text-sm sm:text-base border border-purple-500/30"
                >
                  DEploy StrAtEgy
                </button>
                <button 
                  className="w-12 sm:w-16 bg-white/70 text-gray-700 border border-white/80 shadow-md rounded-2xl sm:rounded-3xl hover:bg-white hover:text-gray-900 transition-all flex items-center justify-center flex-shrink-0"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 sm:py-16 text-center space-y-4 sm:space-y-6">
              <div className="w-20 h-20 bg-white/60 backdrop-blur-sm border border-white/80 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Target size={36} className="text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">AI Ready: {salonName}</h3>
              <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">Start gap-fill analysis and yield optimization.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
