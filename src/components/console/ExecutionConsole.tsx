import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Copy, Check, Trash2, ArrowDownCircle, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { AgentDefinition, AgentId, LogEntry } from '../../types/agent';
import { CyberMascot } from '../visualizer/CyberMascot';

interface ExecutionConsoleProps {
  logs: LogEntry[];
  agents: AgentDefinition[];
  onClearLogs: () => void;
  pipelineRunning: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  logs,
  agents,
  onClearLogs,
  pipelineRunning,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current && !isCollapsed) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isCollapsed]);

  const filteredLogs = logs.filter((log) => {
    if (filterAgent === 'all') return true;
    return log.agentId === filterAgent;
  });

  const latestLog = logs[logs.length - 1];

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.agentId.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getAgentColor = (agentId: string) => {
    switch (agentId) {
      case 'clarifier':
        return 'text-cyan-400 border-cyan-800/60 bg-cyan-950/40';
      case 'architect':
        return 'text-indigo-400 border-indigo-800/60 bg-indigo-950/40';
      case 'worker':
        return 'text-amber-400 border-amber-800/60 bg-amber-950/40';
      case 'auditor':
        return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40';
      default:
        return 'text-slate-400 border-slate-800 bg-slate-900/60';
    }
  };

  const getAgentName = (agentId: string) => {
    const found = agents.find((a) => a.id === agentId);
    return found ? found.name : 'Sistema Orquestador';
  };

  // Collapsed Mode: Clean 1-line live ticker at the bottom
  if (isCollapsed) {
    return (
      <div className="w-full rounded-xl border border-slate-800 bg-[#060911]/90 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 min-w-0">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-500 shrink-0 font-bold">TERMINAL:</span>
          {latestLog ? (
            <span className="text-slate-300 truncate">
              [{latestLog.timestamp}] <strong className="text-cyan-400">{latestLog.agentId.toUpperCase()}</strong>: {latestLog.message}
            </span>
          ) : (
            <span className="text-slate-500">Sin eventos en la terminal</span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-sans flex items-center gap-1.5 transition-colors"
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>Expandir ({logs.length} logs)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-[#060911] shadow-2xl overflow-hidden flex flex-col min-h-[300px] max-h-[460px] animate-[fadeIn_0.2s_ease-out]">
      {/* Console Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            TERMINAL DE EJECUCIÓN EN VIVO
          </span>
          {pipelineRunning && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Streaming SSE
            </span>
          )}
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Agent Filter Selector */}
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
            <Filter className="w-3 h-3 text-slate-400 ml-1.5" />
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-transparent text-slate-300 text-[11px] px-1.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-950">Todos los Agentes</option>
              <option value="clarifier" className="bg-slate-950">El Clarificador</option>
              <option value="architect" className="bg-slate-950">El Arquitecto</option>
              <option value="worker" className="bg-slate-950">El Worker</option>
              <option value="auditor" className="bg-slate-950">El Auditor</option>
            </select>
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              autoScroll
                ? 'bg-cyan-950 border-cyan-800 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Auto-desplazamiento de terminal"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copiar registro de terminal"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Limpiar terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Minimizar terminal"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs selection:bg-cyan-500/30">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center space-y-2">
            <Terminal className="w-8 h-8 opacity-30" />
            <p>La terminal está a la espera de ejecución.</p>
            <p className="text-[11px] text-slate-600">
              Escribe o dicta tu requerimiento arriba y pulsa "Analizar & Clarificar Objetivo".
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isAgent = log.agentId !== 'system';
            const agentDef = agents.find((a) => a.id === log.agentId);

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 group hover:bg-slate-900/40 p-2 rounded-xl transition-colors"
              >
                {/* Character Mini Avatar Icon */}
                {isAgent && agentDef ? (
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                    <CyberMascot id={agentDef.id} status={agentDef.status} size="sm" />
                  </div>
                ) : (
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                )}

                {/* Speech Bubble / Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAgentColor(
                        log.agentId
                      )}`}
                    >
                      {getAgentName(log.agentId)}
                    </span>
                    <span className="text-[10px] text-slate-600">{log.timestamp}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 rounded ${
                        log.level === 'error'
                          ? 'bg-rose-950 text-rose-400'
                          : log.level === 'warn'
                          ? 'bg-amber-950 text-amber-400'
                          : log.level === 'success'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>

                  <p
                    className={`leading-relaxed text-xs break-words ${
                      log.level === 'error'
                        ? 'text-rose-300 font-semibold'
                        : log.level === 'warn'
                        ? 'text-amber-300'
                        : log.level === 'success'
                        ? 'text-emerald-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {log.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
