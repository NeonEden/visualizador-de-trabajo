import React from 'react';
import { Mic, MicOff, Sparkles, Volume2, CornerDownLeft, ChevronUp, Edit3 } from 'lucide-react';

interface InputZoneProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onClarify: () => void;
  isClarifying: boolean;
  pipelineRunning: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript?: () => void;
  interimTranscript: string;
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

export const InputZone: React.FC<InputZoneProps> = ({
  prompt,
  setPrompt,
  onClarify,
  isClarifying,
  pipelineRunning,
  isListening,
  startListening,
  stopListening,
  resetTranscript,
  interimTranscript,
  isCompact = false,
  onToggleCompact,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (prompt.trim() && !isClarifying && !pipelineRunning) {
        onClarify();
      }
    }
  };

  // Compact Mode: Sleek single-line bar to avoid screen clutter once clarified or running
  if (isCompact) {
    return (
      <div className="w-full rounded-xl border border-slate-800 bg-[#070b14]/90 p-3 shadow-lg flex items-center justify-between gap-3 text-xs animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <span className="text-slate-500 font-mono shrink-0">Requerimiento Activo:</span>
          <span className="text-slate-200 font-semibold truncate">"{prompt}"</span>
        </div>
        <button
          onClick={onToggleCompact}
          className="shrink-0 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Modificar Requerimiento</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-[#070b14] p-5 shadow-2xl relative overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      {/* Top Header Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Zona de Entrada Dual (Voz & Texto)
          </h2>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            · Dicta tu objetivo o redacta los requerimientos
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isListening && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono animate-pulse">
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Escuchando micrófono...</span>
            </div>
          )}
          {onToggleCompact && (
            <button
              onClick={onToggleCompact}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
              title="Minimizar panel de entrada"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Input Box */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950/80 focus-within:border-cyan-500/80 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={pipelineRunning || isClarifying}
          placeholder="Escribe o dicta tu objetivo (ej: 'Crear una pasarela de autenticación con JWT, control de roles de usuario y vista de perfil protegida')..."
          className="w-full bg-transparent p-4 pb-14 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
        />

        {/* Interim Speech Preview */}
        {isListening && interimTranscript && (
          <div className="px-4 pb-2 text-xs italic text-cyan-300 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Transcribiendo: "{interimTranscript}"</span>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pt-2 border-t border-slate-900">
          {/* Voice Input Button (Web Speech API) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  if (resetTranscript) resetTranscript();
                  startListening();
                }
              }}
              disabled={pipelineRunning || isClarifying}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isListening
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
              }`}
              title={isListening ? 'Detener grabación de voz' : 'Iniciar dictado por voz (Web Speech API)'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-white" />
                  <span>Detener Micrófono</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-cyan-400" />
                  <span>Dictar por Voz</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              Ctrl+Enter para clarificar
            </span>
          </div>

          {/* Action Trigger Button: Clarify Objective */}
          <button
            type="button"
            onClick={onClarify}
            disabled={!prompt.trim() || isClarifying || pipelineRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
          >
            {isClarifying ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Clarificando Intención...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Analizar & Clarificar Objetivo</span>
                <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
