import React, { useState } from 'react';
import { CheckCircle2, Circle, Sparkles, Wrench, RotateCcw, ArrowRight, ShieldCheck, Layers, Plus } from 'lucide-react';
import { ContractItem } from '../../types/agent';

interface ContractCompleterProps {
  contractChecklist?: ContractItem[];
  componentName?: string;
  onCompleteMissing: (missingDescription: string) => void;
  onResetToStart: () => void;
  pipelineRunning: boolean;
}

export const ContractCompleter: React.FC<ContractCompleterProps> = ({
  contractChecklist = [],
  componentName = 'Componente',
  onCompleteMissing,
  onResetToStart,
  pipelineRunning,
}) => {
  const [missingInput, setMissingInput] = useState('');

  const completedCount = contractChecklist.filter((c) => c.status === 'completed').length;
  const totalCount = contractChecklist.length || 1;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const handleTriggerRefinement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingInput.trim() || pipelineRunning) return;
    onCompleteMissing(missingInput);
    setMissingInput('');
  };

  const quickSuggestions = [
    'Añadir persistencia con LocalStorage',
    'Agregar exportación de datos a JSON / CSV',
    'Incorporar filtros avanzados por categoría y fecha',
    'Añadir modal interactivo de detalles / edición',
    'Añadir gráfico de barras o líneas SVG',
  ];

  return (
    <div className="w-full rounded-2xl border border-indigo-500/30 bg-[#070d19] p-5 shadow-2xl space-y-5 animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Contrato Técnico & Módulos de {componentName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {completedCount}/{totalCount} Módulos Verificados ({percentage}%)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Verifica los módulos construidos y completa cualquier funcionalidad restante del contrato.
            </p>
          </div>
        </div>

        {/* Reset to Start Button */}
        <button
          onClick={onResetToStart}
          disabled={pipelineRunning}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title="Reiniciar y crear un nuevo requerimiento desde cero"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Nuevo Requerimiento (Reiniciar)
        </button>
      </div>

      {/* Contract Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {contractChecklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-slate-200">{item.name}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
              Cumplido
            </span>
          </div>
        ))}
      </div>

      {/* Multi-Turn Refinement & Incremental Module Builder */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
          <Wrench className="w-4 h-4 text-cyan-400" />
          ¿FALTAN PARTES POR CONSTRUIR O DESEAS AMPLIAR EL CONTRATO?
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Indica qué módulos, pantallas o interacciones adicionales deseas incorporar. El Arquitecto actualizará el blueprint y El Worker integrará el código manteniendo todo lo que ya funciona.
        </p>

        <form onSubmit={handleTriggerRefinement} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={missingInput}
            onChange={(e) => setMissingInput(e.target.value)}
            disabled={pipelineRunning}
            placeholder="Ej: 'Añadir la pantalla de resumen con exportación a PDF/CSV y botón de reiniciar'..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!missingInput.trim() || pipelineRunning}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Construir Módulos Faltantes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 font-mono mr-1">Sugerencias rápidas:</span>
          {quickSuggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              disabled={pipelineRunning}
              onClick={() => setMissingInput(sug)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-cyan-400" />
              <span>{sug}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
