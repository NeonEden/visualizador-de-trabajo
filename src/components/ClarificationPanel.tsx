import React, { useState } from 'react';
import {
  CheckCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  FileCode2,
  Server,
} from 'lucide-react';
import { ClarificationOption, ClarificationResult, ExecutionContract } from '../types/agent';

interface ClarificationPanelProps {
  clarification: ClarificationResult | null;
  selectedOption: ClarificationOption | null;
  onSelectOption: (option: ClarificationOption) => void;
  answers: Record<string, string>;
  onAnswerChange: (question: string, answer: string) => void;
  onConfirmDispatch: () => void;
  pipelineRunning: boolean;
  simulateRepairLoop: boolean;
  setSimulateRepairLoop: (val: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRegenerateOptions?: () => void;
  isRegeneratingOptions?: boolean;
  hermesConnected?: boolean;
}

export const ClarificationPanel: React.FC<ClarificationPanelProps> = ({
  clarification,
  selectedOption,
  onSelectOption,
  answers,
  onAnswerChange,
  onConfirmDispatch,
  pipelineRunning,
  simulateRepairLoop,
  setSimulateRepairLoop,
  isCollapsed = false,
  onToggleCollapse,
  onRegenerateOptions,
  isRegeneratingOptions = false,
  hermesConnected = false,
}) => {
  const [showContractJson, setShowContractJson] = useState(false);

  if (!clarification) return null;

  // Build the live Execution Contract object
  const liveExecutionContract: ExecutionContract = clarification.executionContract || {
    target_goal: clarification.primaryGoal || clarification.intentSummary,
    architecture_plan: [
      `Opción: ${selectedOption?.title || 'Estándar'}`,
      `Arquitectura: ${clarification.suggestedArchitecture || 'React 19 + Tailwind CSS'}`,
      ...(clarification.scopeBreakdown || []).slice(0, 3),
    ],
    constraints: [
      'Single-file or modular clean TSX',
      'No external build breaking deps',
      'TypeScript strict typing',
      ...(Object.entries(answers).map(([q, a]) => `${q}: ${a}`)),
    ],
    agent_assignments: {
      clarifier: { role: 'Intention Interpreter', model: 'gemini-3.8-flash', focus: 'Clarify goals & HITL refinement' },
      architect: { role: 'Blueprint Engine', model: 'hermes-core / gemini', focus: 'Structure specs & state plan' },
      worker: { role: 'Local Worker / Coder', model: 'ollama / openrouter / gemini', focus: 'Write clean TSX & styles' },
      auditor: { role: 'Quality Control', model: 'static-checker / gemini', focus: 'Syntax & contract validation' },
    },
  };

  // Collapsed Mode: Sleek badge once pipeline has run to avoid vertical screen clutter
  if (isCollapsed) {
    return (
      <div className="w-full rounded-xl border border-cyan-500/30 bg-[#070e1b] p-3 shadow-lg flex items-center justify-between gap-3 text-xs animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <span className="text-slate-400 font-mono shrink-0">Estrategia Aprobada (HITL):</span>
          <span className="text-cyan-300 font-bold truncate">
            {selectedOption?.title || clarification.intentSummary}
          </span>
          {selectedOption?.tag && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0 hidden sm:inline">
              {selectedOption.tag}
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="shrink-0 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ver Opciones HITL</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-cyan-500/30 bg-[#070e1b] p-6 shadow-2xl relative overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      {/* Top Banner: Identified Intent & Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Fase de Clarificación de Objetivo (HITL)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Confianza: {clarification.confidenceScore}%
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {clarification.intentSummary}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <span className="text-slate-500 font-mono">Meta Principal: </span>
              {clarification.primaryGoal}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">Arquitectura: </span>
            <span className="text-indigo-300 font-semibold">{clarification.suggestedArchitecture}</span>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Colapsar panel de clarificación"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scope Breakdown */}
      {clarification.scopeBreakdown && clarification.scopeBreakdown.length > 0 && (
        <div className="my-5 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Desglose de Alcance & Restricciones Identificadas:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {clarification.scopeBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-cyan-400 font-mono font-bold">0{idx + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Recommended Options (Human-in-the-Loop approval) */}
      <div className="my-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Selecciona la Opción Arquitectónica Recomendada (HITL):
          </div>
          <div className="flex items-center gap-2">
            {onRegenerateOptions && (
              <button
                type="button"
                onClick={onRegenerateOptions}
                disabled={isRegeneratingOptions || pipelineRunning}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 hover:text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                title="Generar 3 alternativas arquitectónicas completamente distintas con Gemini 3.8 Flash"
              >
                <RefreshCw className={`w-3 h-3 text-indigo-400 ${isRegeneratingOptions ? 'animate-spin' : ''}`} />
                <span>{isRegeneratingOptions ? 'Generando con Gemini...' : 'Regenerar Opciones con IA'}</span>
              </button>
            )}
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
              {selectedOption ? `✓ ${selectedOption.title}` : 'Haz clic en una opción'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {clarification.recommendedOptions.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onSelectOption(opt)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {opt.tag}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{opt.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>

                  {/* Tech stack badge */}
                  {opt.techStack && (
                    <div className="mt-2.5 text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/60">
                      Stack: {opt.techStack}
                    </div>
                  )}

                  {/* Pros checklist */}
                  {opt.pros && opt.pros.length > 0 && (
                    <div className="mt-2.5 space-y-1">
                      {opt.pros.map((pro, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">Ruta Específica</span>
                  <span className={isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-500'}>
                    {isSelected ? '✓ Aprobado' : 'Elegir'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON Execution Contract Preview Accordion */}
      <div className="my-5 rounded-xl border border-indigo-900/60 bg-slate-950/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowContractJson(!showContractJson)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-indigo-300">
              Contrato de Ejecución Estructurado (JSON Execution Contract)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
              {hermesConnected ? 'Despacho a Hermes Core' : 'Listo para Despacho'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
            <span>{showContractJson ? 'Ocultar JSON' : 'Inspeccionar JSON'}</span>
            {showContractJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showContractJson && (
          <div className="p-4 border-t border-indigo-950/80 bg-[#060813]">
            <pre className="text-[11px] font-mono text-cyan-300/90 overflow-x-auto p-3 rounded-lg bg-slate-950 border border-slate-800 leading-relaxed max-h-60">
              {JSON.stringify(liveExecutionContract, null, 2)}
            </pre>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Server className="w-3 h-3 text-indigo-400" />
              <span>Contrato de ejecución que coordina el Agente Clarificador con el orquestador y los workers.</span>
            </div>
          </div>
        )}
      </div>

      {/* Clarifying Questions & User Answers (HITL refinement) */}
      {clarification.clarifyingQuestions && clarification.clarifyingQuestions.length > 0 && (
        <div className="my-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            Preguntas de Clarificación (Opcional para afinar el flujo):
          </div>

          <div className="space-y-3">
            {clarification.clarifyingQuestions.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-xs text-slate-300 font-medium">
                  {q.question}
                </label>
                {q.context && (
                  <p className="text-[11px] text-slate-500 italic mb-1">{q.context}</p>
                )}
                <input
                  type="text"
                  value={answers[q.question] || ''}
                  onChange={(e) => onAnswerChange(q.question, e.target.value)}
                  placeholder="Escribe tu preferencia o déjalo vacío para usar el valor por defecto..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Dispatch Controls */}
      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Repair Loop Simulator Toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={simulateRepairLoop}
              onChange={(e) => setSimulateRepairLoop(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${simulateRepairLoop ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
              Simular Bucle de Auto-Reparación (Repair Loop)
            </div>
            <div className="text-[10px] text-slate-400">
              Demuestra al Auditor detectando un fallo y reenviando la pieza al Worker para parcharla.
            </div>
          </div>
        </label>

        {/* The Big Confirm & Dispatch Button */}
        <button
          type="button"
          onClick={onConfirmDispatch}
          disabled={pipelineRunning}
          className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 bg-[length:200%_auto] hover:bg-right transition-all duration-300 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] disabled:opacity-50"
        >
          {pipelineRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Ejecutando Pipeline Agentico...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-slate-950" />
              <span>
                {hermesConnected
                  ? 'Confirmar & Despachar a Hermes Gateway'
                  : 'Confirmar & Despachar Workflow'}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
