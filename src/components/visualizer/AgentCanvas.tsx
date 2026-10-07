import React from 'react';
import { AgentDefinition, AgentId } from '../../types/agent';
import { CyberMascot } from './CyberMascot';
import { FlowWires } from './FlowWires';
import { Sparkles, Terminal, Activity, ArrowRight, Zap, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

interface AgentCanvasProps {
  agents: AgentDefinition[];
  activeAgentId: AgentId | null;
  onSelectAgent: (agent: AgentDefinition) => void;
  activeWire: { from: AgentId; to: AgentId; isRepairLoop?: boolean } | null;
  pipelineRunning: boolean;
  isListeningVoice?: boolean;
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

export const AgentCanvas: React.FC<AgentCanvasProps> = ({
  agents,
  activeAgentId,
  onSelectAgent,
  activeWire,
  pipelineRunning,
  isListeningVoice = false,
  isCompact = false,
  onToggleCompact,
}) => {
  const agentStatesRecord = agents.reduce((acc, curr) => {
    acc[curr.id] = curr.status;
    return acc;
  }, {} as Record<AgentId, string>);

  // Compact HUD Mode: High-density horizontal dock to avoid cluttering screen when testing artifacts
  if (isCompact) {
    return (
      <div className="w-full rounded-xl border border-slate-800 bg-[#070b14] p-3 shadow-lg flex items-center justify-between gap-3 text-xs animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center gap-3 min-w-0 overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 shrink-0">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>HUD Agentes:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className={`cursor-pointer flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                  agent.status === 'active'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse'
                    : agent.status === 'success'
                    ? 'border-emerald-800 bg-emerald-950/20 text-emerald-300'
                    : agent.status === 'error'
                    ? 'border-rose-800 bg-rose-950/30 text-rose-300'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-4 h-4 shrink-0">
                  <CyberMascot
                    id={agent.id}
                    status={agent.status}
                    size="sm"
                    isListening={agent.id === 'clarifier' && isListeningVoice}
                  />
                </div>
                <span className="font-semibold">{agent.name.replace('El ', '')}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    agent.status === 'active'
                      ? 'bg-cyan-400 animate-ping'
                      : agent.status === 'success'
                      ? 'bg-emerald-400'
                      : agent.status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-slate-600'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Active wire / repair indicator */}
          {activeWire?.isRepairLoop && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 shrink-0 animate-pulse">
              Repair Loop Activo
            </span>
          )}
        </div>

        {onToggleCompact && (
          <button
            onClick={onToggleCompact}
            className="shrink-0 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1.5"
            title="Expandir a Canvas interactivo completo"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Expandir Canvas</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl overflow-hidden min-h-[360px] flex flex-col justify-between">
      {/* Background Cyber Grid Lines & Ambient Lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Top Canvas Bar: Live Node Pipeline Info */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">Pipeline Canvas</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">4 Nodos Autónomos</span>
          </div>
          {pipelineRunning && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 animate-pulse">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Orquestando en vivo</span>
            </div>
          )}
          {activeWire?.isRepairLoop && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-800 text-rose-300 animate-pulse">
              <RefreshCw className="w-3 h-3 text-rose-400 animate-spin" />
              <span>Bucle de Auto-Reparación Activo</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Haz clic en un personaje para inspeccionar
          </div>
          {onToggleCompact && (
            <button
              onClick={onToggleCompact}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Minimizar a barra HUD compacta"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Visualizer Area with Animated Wires and Mascots */}
      <div className="relative z-10 my-4 flex-1 flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-6">
        {/* Dynamic Glowing Energy Flow Wires & Repair Wire */}
        <FlowWires
          activeWire={activeWire}
          pipelineRunning={pipelineRunning}
          agentStates={agentStatesRecord}
        />

        {/* 4 Agent Mascots */}
        {agents.map((agent, index) => {
          const isSelected = activeAgentId === agent.id;
          const isRepairTarget =
            agent.id === 'worker' &&
            activeWire?.isRepairLoop &&
            (agent.status === 'active' || agentStatesRecord.auditor === 'error');

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`relative group cursor-pointer z-10 flex flex-col items-center transition-all duration-300 p-2 sm:p-3 rounded-2xl border ${
                isSelected
                  ? 'border-cyan-400 bg-slate-900/90 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-105'
                  : agent.status === 'active'
                  ? 'border-slate-700 bg-slate-900/80 shadow-lg scale-105'
                  : isRepairTarget
                  ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-105'
                  : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60 hover:scale-102'
              }`}
              style={{ width: '23%' }}
            >
              {/* Step indicator tag */}
              <div className="flex items-center justify-between w-full mb-1 text-[10px] font-mono text-slate-400">
                <span className="font-bold text-slate-300">0{index + 1}</span>
                <span
                  className="px-1.5 py-0.2 rounded text-[9px] uppercase font-semibold"
                  style={{
                    backgroundColor: `${agent.primaryColor}20`,
                    color: agent.primaryColor,
                  }}
                >
                  {agent.status}
                </span>
              </div>

              {/* Cyber Mascot Graphic */}
              <div className="my-1">
                <CyberMascot
                  id={agent.id}
                  status={agent.status}
                  isListening={agent.id === 'clarifier' && isListeningVoice}
                  isRepairing={isRepairTarget}
                  size="md"
                />
              </div>

              {/* Character Identity */}
              <div className="text-center w-full mt-2">
                <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {agent.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {agent.roleTitle}
                </div>
              </div>

              {/* Prop Highlight Chip */}
              <div className="mt-2 w-full pt-1.5 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[10px] text-slate-300">
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{agent.propName.split(' ')[0]} {agent.propName.split(' ')[1] || ''}</span>
              </div>

              {/* Live Speech Bubble / Status snippet */}
              {agent.speech && (
                <div className="mt-2 text-[10px] text-slate-400 italic line-clamp-1 text-center bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800/60 w-full">
                  "{agent.speech}"
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Canvas Footer: Process Pipeline Sequence Status */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono">Secuencia:</span>
          <div className="flex items-center gap-1 text-[11px] text-slate-300">
            <span className={agentStatesRecord.clarifier === 'active' ? 'text-cyan-400 font-bold' : ''}>Clarificador</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={agentStatesRecord.architect === 'active' ? 'text-indigo-400 font-bold' : ''}>Arquitecto</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={agentStatesRecord.worker === 'active' ? 'text-amber-400 font-bold' : ''}>Worker</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className={agentStatesRecord.auditor === 'active' ? 'text-emerald-400 font-bold' : ''}>Auditor</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-slate-500">Tokens consumidos:</span>
          <span className="text-amber-400 font-bold tabular-nums">
            {agents.reduce((acc, a) => acc + a.tokenCount, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
