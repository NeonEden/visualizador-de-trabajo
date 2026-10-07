import React from 'react';
import {
  Sliders,
  Radio,
  Zap,
  Cpu,
  Sparkles,
  RefreshCw,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ProviderSettings } from '../types/agent';

interface HeaderProps {
  settings: ProviderSettings;
  onOpenSettings: () => void;
  onRefreshHermes: () => void;
  isCheckingHermes: boolean;
  onSelectPreset: (presetName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onRefreshHermes,
  isCheckingHermes,
  onSelectPreset,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Wordmark Zone */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-amber-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-['Chakra_Petch',sans-serif]">
                <span>AGENTIC COMMAND CENTER</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                v2.4 ORCHESTRATOR
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Animated Multi-Agent Pipeline & Autonomous Mascots
            </p>
          </div>
        </div>

        {/* Center / Right: System Status & Provider Routing */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Hermes Gateway Status Indicator */}
          <div
            onClick={onRefreshHermes}
            className={`group cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors shadow-sm ${
              settings.hermesConnected
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-amber-950/30 border-amber-800/80 text-amber-300 hover:bg-amber-900/30'
            }`}
            title="Haz clic para comprobar conexión con Hermes Gateway (localhost:37371)"
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                settings.hermesConnected
                  ? 'text-emerald-400 animate-pulse'
                  : 'text-amber-400'
              }`}
            />
            <span
              className={`font-mono text-[11px] font-bold ${
                settings.hermesConnected ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {settings.hermesConnected
                ? 'Hermes Gateway: ACTIVE (localhost:37371)'
                : 'FALLBACK MODE (Nube Directa)'}
            </span>
            <RefreshCw
              className={`w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-transform ${
                isCheckingHermes ? 'animate-spin' : ''
              }`}
            />
          </div>

          {/* Gemini 3.8 Flash Neural Engine Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/40 border border-cyan-500/40 text-xs text-slate-200 font-mono shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400 hidden sm:inline">Motor IA:</span>
            <span className="text-cyan-300 font-bold">Gemini 3.8 Flash</span>
          </div>

          {/* Preset Prompts Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Plantillas</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 p-2 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 z-50">
              <div className="text-[10px] font-mono text-slate-500 px-2 py-1 uppercase">
                Cargar Requerimiento Rápido
              </div>
              <button
                onClick={() => onSelectPreset('auth')}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors"
              >
                🔐 Sistema de Auth JWT + Roles RBAC
              </button>
              <button
                onClick={() => onSelectPreset('dashboard')}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors"
              >
                📊 Dashboard IoT con WebSockets en Vivo
              </button>
              <button
                onClick={() => onSelectPreset('pipeline')}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors"
              >
                ⚡ Visualizador React con Bucle de Reparación
              </button>
              <button
                onClick={() => onSelectPreset('api')}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors"
              >
                🛡️ Gateway API con Rate Limiter en Redis
              </button>
            </div>
          </div>

          {/* Provider Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-700 transition-colors text-xs font-medium"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configuración</span>
          </button>
        </div>
      </div>
    </header>
  );
};
