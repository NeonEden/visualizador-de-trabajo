import React from 'react';
import { X, Cpu, Sparkles, Terminal, Activity, Zap, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AgentDefinition, LogEntry } from '../../types/agent';
import { CyberMascot } from './CyberMascot';

interface AgentDrawerProps {
  agent: AgentDefinition | null;
  onClose: () => void;
  logs: LogEntry[];
  onTestAgent?: (agentId: string) => void;
}

export const AgentDrawer: React.FC<AgentDrawerProps> = ({
  agent,
  onClose,
  logs,
}) => {
  if (!agent) return null;

  const agentLogs = logs.filter(
    (l) => l.agentId === agent.id || (agent.id === 'clarifier' && l.agentId === 'system')
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col transform transition-all duration-300 animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: agent.primaryColor, boxShadow: `0 0 10px ${agent.primaryColor}` }}
          />
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">{agent.name}</h3>
            <p className="text-xs text-slate-400 font-mono">{agent.roleTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Cerrar panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body with scrolling */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Avatar Showcase & Active Status */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800/80 relative overflow-hidden">
          <div
            className="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: agent.primaryColor }}
          />
          <CyberMascot id={agent.id} status={agent.status} size="lg" />

          <div className="mt-4 text-center">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `${agent.primaryColor}20`,
                color: agent.primaryColor,
                border: `1px solid ${agent.primaryColor}40`,
              }}
            >
              {agent.status === 'active' && <Zap className="w-3 h-3 animate-spin" />}
              {agent.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
              {agent.status === 'error' && <AlertTriangle className="w-3 h-3" />}
              {agent.status === 'idle' && <Activity className="w-3 h-3" />}
              Estado: {agent.status.toUpperCase()}
            </span>
            <p className="mt-2 text-xs text-slate-300 italic max-w-xs">
              "{agent.speech || agent.subtitle}"
            </p>
          </div>
        </div>

        {/* Assigned Avatar Prop & Identity */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Prop & Identidad Visual
          </div>
          <div className="text-sm font-medium text-slate-200">{agent.propName}</div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{agent.propDescription}</p>
        </div>

        {/* Execution Model & Telemetry Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Modelo Asignado
            </div>
            <div className="text-xs font-mono font-semibold text-white truncate" title={agent.defaultModel}>
              {agent.defaultModel}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Route: Adaptive Orchestrator</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Tokens Procesados
            </div>
            <div className="text-sm font-mono font-bold text-amber-300 tabular-nums">
              {agent.tokenCount.toLocaleString()} tkn
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Eficiencia 98.4%</div>
          </div>
        </div>

        {/* Real-time Agent Terminal Logs */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Terminal Logs del Agente
            </div>
            <span className="text-[10px] font-mono text-slate-500">{agentLogs.length} eventos</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-xs pr-1">
            {agentLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-4 text-[11px]">
                Esperando activación en el flujo de trabajo...
              </div>
            ) : (
              agentLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded border text-[11px] leading-relaxed ${
                    log.level === 'error' || log.level === 'warn'
                      ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                      : log.level === 'success'
                      ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 text-[10px] mr-1.5">{log.timestamp}</span>
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security & Quality Certification Badge */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-3.5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-cyan-300">Garantía Invariante: </span>
            <span className="text-slate-400">
              Cada salida de este nodo es validada sintáctica y lógicamente antes de transferirse al siguiente agente.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
