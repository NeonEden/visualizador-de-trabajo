import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ListChecks,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  X,
  Plus,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  AgentDefinition,
  AgentId,
  ClarificationOption,
  ClarificationResult,
  FinalArtifact,
  LogEntry,
  ProviderSettings,
} from './types/agent';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { InputZone } from './components/InputZone';
import { ClarificationPanel } from './components/ClarificationPanel';
import { AgentCanvas } from './components/visualizer/AgentCanvas';
import { AgentDrawer } from './components/visualizer/AgentDrawer';
import { ExecutionConsole } from './components/console/ExecutionConsole';
import { OutputPreview } from './components/console/OutputPreview';
import { useVoiceInput } from './hooks/useVoiceInput';
import {
  checkHermesStatus,
  requestClarification,
  streamPipelineExecution,
} from './services/agentApi';

const INITIAL_AGENTS: AgentDefinition[] = [
  {
    id: 'clarifier',
    name: 'El Clarificador',
    codename: 'Interpreter',
    roleTitle: 'Deconstrucción Semántica & HITL',
    subtitle: 'Interpreta voz, detecta intenciones y consulta al humano.',
    propName: 'Lupa Holográfica & Monoóculo Táctico',
    propDescription:
      'Lente holográfico de alta frecuencia con retícula táctica que sintoniza con las ondas sonoras de la voz y deconstruye requerimientos ambiguos.',
    primaryColor: '#06b6d4',
    accentColor: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    bgGlow: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500',
    defaultModel: 'gemini-3.8-flash',
    tokenCount: 0,
    status: 'idle',
    speech: 'Listo para interpretar tu voz o texto con Gemini 3.8 Flash.',
    currentTask: 'A la espera de requerimiento',
  },
  {
    id: 'architect',
    name: 'El Arquitecto',
    codename: 'Blueprint Designer',
    roleTitle: 'Diseño Esquemático & Interfaces',
    subtitle: 'Modela dependencias, schemas y contratos de datos.',
    propName: 'Regla T Holográfica & Lápiz Capacitivo Laser',
    propDescription:
      'Plano azul flotante con reglas paramétricas y lápiz óptico capacitivo que proyecta la arquitectura modular en el espacio virtual.',
    primaryColor: '#6366f1',
    accentColor: '#818cf8',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    bgGlow: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500',
    defaultModel: 'gemini-3.8-flash',
    tokenCount: 0,
    status: 'idle',
    speech: 'Esperando especificaciones para trazar el plano formal.',
    currentTask: 'Standby en mesa de dibujo',
  },
  {
    id: 'worker',
    name: 'El Worker',
    codename: 'Code Builder',
    roleTitle: 'Compilación & Ensamblaje de Código',
    subtitle: 'Pica TypeScript estricto, componentes y reactividad.',
    propName: 'Casco Industrial + Llave Mecánica de Código',
    propDescription:
      'Casco industrial reflectivo con lámpara de minería digital y martillo/llave inglesa que forja componentes soltando chispas energéticas.',
    primaryColor: '#f59e0b',
    accentColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    bgGlow: 'bg-amber-500/20',
    borderColor: 'border-amber-500',
    defaultModel: 'gemini-3.8-flash',
    tokenCount: 0,
    status: 'idle',
    speech: 'Herramientas afiladas. Listo para compilar código funcional.',
    currentTask: 'Listo para ensamblar',
  },
  {
    id: 'auditor',
    name: 'El Verificador / Auditor',
    codename: 'Quality Control',
    roleTitle: 'Inspección de Seguridad & Auto-Reparación',
    subtitle: 'Escanea vulnerabilidades y dispara bucles de corrección.',
    propName: 'Escudo Táctico + Gafas Escáner Láser',
    propDescription:
      'Visor de escaneo horizontal multiespectral y escudo antibalas que certifica entregables o devuelve las piezas defectuosas en bucle de reparación.',
    primaryColor: '#10b981',
    accentColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    bgGlow: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500',
    defaultModel: 'gemini-3.8-flash',
    tokenCount: 0,
    status: 'idle',
    speech: 'Escáner en línea. Blindaje y quality gates preparados.',
    currentTask: 'Centinela en espera',
  },
];

const INITIAL_SETTINGS: ProviderSettings = {
  mode: 'hermes',
  hermesEndpoint: 'http://localhost:37371',
  hermesConnected: false,
  bridgeProviders: {
    gemini: { model: 'gemini-3.8-flash' },
    openRouter: { apiKey: '', model: 'anthropic/claude-3.5-sonnet' },
    azureOpenAI: { endpoint: '', apiKey: '', deployment: 'gpt-4o' },
    ollama: { endpoint: 'http://localhost:11434', model: 'deepseek-r1' },
  },
  selectedModelRoute: 'Gemini 3.8 Flash (Activo)',
  globalContext: 'Reglas del proyecto:\n- Tipado estricto en TypeScript sin `any`.\n- Componentes modulares limpios y accesibilidad WCAG AA.\n- Validación de esquemas y control de excepciones blindado.',
  agentModels: {
    clarifier: 'gemini-3.8-flash',
    architect: 'gemini-3.8-flash',
    worker: 'gemini-3.8-flash',
    auditor: 'gemini-3.8-flash',
  },
};

export default function App() {
  const [agents, setAgents] = useState<AgentDefinition[]>(INITIAL_AGENTS);
  const [inspectedAgent, setInspectedAgent] = useState<AgentDefinition | null>(null);
  const [settings, setSettings] = useState<ProviderSettings>(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCheckingHermes, setIsCheckingHermes] = useState(false);

  // Input & Clarification State
  const [prompt, setPrompt] = useState(
    'Crear una pasarela de autenticación con JWT, control de roles de usuario y vista de perfil protegida'
  );
  const [isClarifying, setIsClarifying] = useState(false);
  const [isRegeneratingOptions, setIsRegeneratingOptions] = useState(false);
  const [clarification, setClarification] = useState<ClarificationResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<ClarificationOption | null>(null);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
  const [simulateRepairLoop, setSimulateRepairLoop] = useState(false);

  // Layout View States (Auto-hiding unnecessary information once seen)
  const [isInputCompact, setIsInputCompact] = useState(false);
  const [isClarificationCollapsed, setIsClarificationCollapsed] = useState(false);
  const [isMascotCompact, setIsMascotCompact] = useState(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

  // Contract Completion & Incremental Refinement States
  const [isRefiningContract, setIsRefiningContract] = useState(false);
  const [missingModulesToBuild, setMissingModulesToBuild] = useState('');
  const [selectedPendingModules, setSelectedPendingModules] = useState<string[]>([]);

  // Pipeline Execution State
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [activeWire, setActiveWire] = useState<{ from: AgentId; to: AgentId; isRepairLoop?: boolean } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-0',
      timestamp: new Date().toLocaleTimeString(),
      agentId: 'system',
      level: 'info',
      message: 'Command Center inicializado. Motor IA: Gemini 3.8 Flash activo. 4 Cyber-Mascots en posición.',
    },
  ]);
  const [artifact, setArtifact] = useState<FinalArtifact | null>(null);

  // Voice Input Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput((finalText) => {
    setPrompt(finalText);
  });

  // Keep prompt in sync if voice provides transcript directly
  useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);

  // Initial Hermes Gateway check
  const handleCheckHermes = useCallback(async () => {
    setIsCheckingHermes(true);
    const result = await checkHermesStatus();
    setSettings((prev) => ({
      ...prev,
      hermesConnected: result.connected,
      selectedModelRoute: result.connected ? 'Hermes Gateway Local' : 'Gemini 3.8 Flash (Activo)',
    }));
    setIsCheckingHermes(false);
  }, []);

  useEffect(() => {
    handleCheckHermes();
  }, [handleCheckHermes]);

  const addLog = (agentId: AgentId | 'system', level: 'info' | 'warn' | 'error' | 'success', message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        agentId,
        level,
        message,
      },
    ]);
  };

  // 1. Clarification Trigger
  const handleClarify = async () => {
    if (!prompt.trim() || isClarifying || pipelineRunning) return;

    setIsClarifying(true);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === 'clarifier'
          ? { ...a, status: 'active', speech: 'Analizando requerimiento y deconstruyendo intenciones con Gemini 3.8 Flash...' }
          : { ...a, status: 'idle' }
      )
    );
    addLog('clarifier', 'info', `Deconstruyendo requerimiento con Gemini 3.8: "${prompt.slice(0, 70)}..."`);

    try {
      const result = await requestClarification(prompt, settings.globalContext, {
        customApiKey: settings.bridgeProviders.gemini?.apiKey || undefined,
      });
      setClarification(result);
      if (result.recommendedOptions && result.recommendedOptions.length > 0) {
        setSelectedOption(result.recommendedOptions[0]);
      }
      setAgents((prev) =>
        prev.map((a) =>
          a.id === 'clarifier'
            ? { ...a, status: 'success', speech: 'Intención clarificada. Aprobación HITL requerida.' }
            : a
        )
      );
      addLog(
        'clarifier',
        'success',
        `Intención identificada: "${result.intentSummary}". 3 Opciones arquitectónicas específicas generadas.`
      );
      // Auto-compact input box to avoid cluttering screen once clarified
      setIsInputCompact(true);
      setIsClarificationCollapsed(false);
    } catch (err: any) {
      console.error('Clarification error:', err);
      addLog('clarifier', 'error', 'Error al consultar orquestador. Usando plantilla estructurada.');
    } finally {
      setIsClarifying(false);
    }
  };

  // 1.1 Regenerate Options with Gemini 3.8
  const handleRegenerateOptions = async () => {
    if (!prompt.trim() || isRegeneratingOptions || pipelineRunning) return;
    setIsRegeneratingOptions(true);
    addLog('clarifier', 'info', 'Solicitando 3 opciones de arquitectura alternativas a Gemini 3.8 Flash...');

    try {
      const result = await requestClarification(prompt, settings.globalContext, {
        regenerateAlternative: true,
        customApiKey: settings.bridgeProviders.gemini?.apiKey || undefined,
      });
      setClarification(result);
      if (result.recommendedOptions && result.recommendedOptions.length > 0) {
        setSelectedOption(result.recommendedOptions[0]);
      }
      addLog(
        'clarifier',
        'success',
        `Nuevas alternativas generadas con Gemini 3.8: "${result.recommendedOptions.map((o) => o.title).join(' | ')}"`
      );
    } catch (err: any) {
      console.error('Error regenerating options:', err);
      addLog('clarifier', 'error', 'Error al regenerar alternativas con IA.');
    } finally {
      setIsRegeneratingOptions(false);
    }
  };

  // 2. Dispatch Full Multi-Agent Pipeline
  const handleDispatchPipeline = async () => {
    if (pipelineRunning) return;

    setPipelineRunning(true);
    setArtifact(null);

    // Reset all agents to idle first
    setAgents((prev) =>
      prev.map((a) => ({ ...a, status: 'idle', tokenCount: 0, speech: '' }))
    );

    addLog('system', 'info', 'Iniciando pipeline de ejecución agentica multi-etapa con Gemini 3.8 Flash...');

    await streamPipelineExecution(
      {
        prompt,
        selectedOption,
        answers: clarificationAnswers,
        globalContext: settings.globalContext,
        simulateRepairLoop,
        customApiKey: settings.bridgeProviders.gemini?.apiKey || undefined,
      },
      {
        onAgentState: (data) => {
          setAgents((prev) =>
            prev.map((a) => {
              if (a.id === data.agentId) {
                return {
                  ...a,
                  status: data.status,
                  speech: data.speech || a.speech,
                  tokenCount: data.tokenDelta ? a.tokenCount + data.tokenDelta : a.tokenCount,
                };
              }
              return a;
            })
          );
        },
        onAgentLog: (data) => {
          addLog(data.agentId as AgentId, data.level, data.message);
        },
        onWirePulse: (data) => {
          setActiveWire({
            from: data.from as AgentId,
            to: data.to as AgentId,
            isRepairLoop: Boolean(data.isRepairLoop),
          });
        },
        onComplete: (art) => {
          setArtifact(art);
          setPipelineRunning(false);
          setActiveWire(null);
          // Auto-collapse previous phases to focus user 100% on the running live artifact
          setIsInputCompact(true);
          setIsClarificationCollapsed(true);
          setIsMascotCompact(true);
          setIsConsoleCollapsed(true);

          addLog(
            'system',
            'success',
            `Pipeline completado exitosamente. Código React listo en el Sandbox. Consumo: ${art.totalTokens.toLocaleString()} tokens.`
          );

          // Confetti celebration!
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#06b6d4', '#6366f1', '#10b981', '#f59e0b'],
            });
          } catch (e) {}
        },
        onError: (err) => {
          setPipelineRunning(false);
          setActiveWire(null);
          addLog('system', 'error', `Fallo en el pipeline: ${err}`);
        },
      }
    );
  };

  // 3. Return to beginning to complete missing parts of the contract
  const handleStartContractCompletion = (specificModule?: string) => {
    setIsRefiningContract(true);
    if (specificModule) {
      setSelectedPendingModules([specificModule]);
      setMissingModulesToBuild(specificModule);
    } else if (artifact?.pendingModules && artifact.pendingModules.length > 0) {
      setSelectedPendingModules([...artifact.pendingModules]);
      setMissingModulesToBuild(artifact.pendingModules.join(', '));
    }
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // 4. Dispatch Incremental Refinement to fulfill complete contract
  const handleDispatchIncrementalRefinement = async () => {
    if (pipelineRunning || !artifact) return;

    const modulesToBuild = missingModulesToBuild.trim() || selectedPendingModules.join(', ');
    if (!modulesToBuild) return;

    setPipelineRunning(true);
    addLog('system', 'info', `Completando contrato: Despachando Worker para ensamblar "${modulesToBuild.slice(0, 70)}..."`);

    // Reset agents status
    setAgents((prev) =>
      prev.map((a) => ({ ...a, status: 'idle', tokenCount: 0, speech: '' }))
    );

    await streamPipelineExecution(
      {
        prompt,
        selectedOption,
        answers: clarificationAnswers,
        globalContext: settings.globalContext,
        simulateRepairLoop,
        isIncrementalRefinement: true,
        existingCode: artifact.codeSnippet,
        missingModulesToBuild: modulesToBuild,
        customApiKey: settings.bridgeProviders.gemini?.apiKey || undefined,
      },
      {
        onAgentState: (data) => {
          setAgents((prev) =>
            prev.map((a) => {
              if (a.id === data.agentId) {
                return {
                  ...a,
                  status: data.status,
                  speech: data.speech || a.speech,
                  tokenCount: data.tokenDelta ? a.tokenCount + data.tokenDelta : a.tokenCount,
                };
              }
              return a;
            })
          );
        },
        onAgentLog: (data) => {
          addLog(data.agentId as AgentId, data.level, data.message);
        },
        onWirePulse: (data) => {
          setActiveWire({
            from: data.from as AgentId,
            to: data.to as AgentId,
            isRepairLoop: Boolean(data.isRepairLoop),
          });
        },
        onComplete: (art) => {
          setArtifact(art);
          setPipelineRunning(false);
          setActiveWire(null);
          setIsRefiningContract(false);
          setMissingModulesToBuild('');
          setSelectedPendingModules([]);
          setIsMascotCompact(true);
          addLog(
            'system',
            'success',
            `¡Contrato 100% cumplido! Nuevos módulos fusionados e inspeccionados por el Auditor.`
          );

          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#10b981', '#06b6d4', '#818cf8', '#fbbf24'],
            });
          } catch (e) {}
        },
        onError: (err) => {
          setPipelineRunning(false);
          setActiveWire(null);
          addLog('system', 'error', `Fallo al completar contrato: ${err}`);
        },
      }
    );
  };

  // Reset project to start fresh
  const handleResetProject = () => {
    setPrompt('Crear una pasarela de autenticación con JWT, control de roles de usuario y vista de perfil protegida');
    setClarification(null);
    setSelectedOption(null);
    setClarificationAnswers({});
    setArtifact(null);
    setIsRefiningContract(false);
    setIsInputCompact(false);
    setIsClarificationCollapsed(false);
    setIsMascotCompact(false);
    setIsConsoleCollapsed(false);
    setAgents(INITIAL_AGENTS);
    addLog('system', 'info', 'Nuevo proyecto iniciado. Centro de comando restablecido.');
  };

  // Repair request from sandbox
  const handleRequestRepair = (errDescription: string) => {
    addLog('auditor', 'warn', `Auto-reparación solicitada desde Sandbox: "${errDescription.slice(0, 100)}"`);
    setSimulateRepairLoop(true);
    handleDispatchPipeline();
  };

  // Preset Selection Helper
  const handleSelectPreset = (type: string) => {
    setIsInputCompact(false);
    setIsClarificationCollapsed(false);
    setClarification(null);
    setArtifact(null);
    setIsRefiningContract(false);

    if (type === 'auth') {
      setPrompt('Crear un módulo completo de autenticación con JWT, control de roles de usuario (Admin/User) y vista de perfil protegida');
    } else if (type === 'dashboard') {
      setPrompt('Construir un panel de control con métricas en tiempo real, gráficos responsivos, filtros de estado y conexión WebSocket');
    } else if (type === 'pipeline') {
      setPrompt('Diseñar un visualizador de pipelines autónomos con nodos animados, control de reintentos y reporte de calidad');
    } else if (type === 'api') {
      setPrompt('Implementar un Gateway API con validación de esquemas Zod, rate limiting con Redis y logs estructurados');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 relative overflow-x-hidden">
      {/* Ambient background micro-grid & subtle aura */}
      <div className="fixed inset-0 cyber-grid opacity-25 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefreshHermes={handleCheckHermes}
        isCheckingHermes={isCheckingHermes}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Section 1: Animated Agent Characters Visualizer Canvas (Supports full canvas or compact HUD) */}
        <section aria-label="Visualizador de Agentes">
          <AgentCanvas
            agents={agents}
            activeAgentId={inspectedAgent?.id || null}
            onSelectAgent={(agent) => setInspectedAgent(agent)}
            activeWire={activeWire}
            pipelineRunning={pipelineRunning}
            isListeningVoice={isListening}
            isCompact={isMascotCompact}
            onToggleCompact={() => setIsMascotCompact(!isMascotCompact)}
          />
        </section>

        {/* Section 1.5: Contract Completion / Missing Parts Builder (When returning to complete contract) */}
        {isRefiningContract && artifact && (
          <section aria-label="Completar Partes Faltantes del Contrato" className="animate-[fadeIn_0.3s_ease-out]">
            <div className="w-full rounded-2xl border-2 border-emerald-500/50 bg-[#071317] p-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-900/60 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                        Completitud de Contrato con Gemini 3.8 Flash
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Modo Refinamiento Incremental
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Construir Partes Faltantes para Cumplir el Contrato Completo
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsRefiningContract(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
                  title="Cancelar y volver al artefacto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Already Completed Modules */}
              <div className="my-4">
                <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Módulos ya implementados y funcionando en el código:
                </div>
                <div className="flex flex-wrap gap-2">
                  {(artifact.completedModules && artifact.completedModules.length > 0
                    ? artifact.completedModules
                    : ['Estructura reactiva', 'Interfaz visual', 'Manejo de estado']
                  ).map((m, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 border border-emerald-800/60 text-xs flex items-center gap-1.5"
                    >
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{m}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested Pending Modules to Check */}
              <div className="my-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs font-mono uppercase text-amber-300 font-bold mb-3 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Selecciona qué módulos o partes faltantes deseas construir ahora:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {[
                    ...(artifact.pendingModules || []),
                    'Persistencia en almacenamiento local (LocalStorage)',
                    'Exportador de datos a formato JSON / CSV descargable',
                    'Filtros de búsqueda avanzada y ordenamiento en tiempo real',
                    'Historial de auditoría y acciones con Deshacer / Rehacer',
                    'Manejo de errores amigable con alertas visuales de validación',
                  ]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((item, idx) => {
                      const isChecked = selectedPendingModules.includes(item);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPendingModules([...selectedPendingModules, item]);
                                setMissingModulesToBuild((prev) =>
                                  prev ? `${prev}, ${item}` : item
                                );
                              } else {
                                setSelectedPendingModules(
                                  selectedPendingModules.filter((p) => p !== item)
                                );
                              }
                            }}
                            className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Specific Custom Input */}
              <div className="my-4 space-y-1.5">
                <label className="block text-xs font-mono font-semibold text-slate-300">
                  Instrucciones o módulos adicionales para completar el contrato:
                </label>
                <textarea
                  rows={2}
                  value={missingModulesToBuild}
                  onChange={(e) => setMissingModulesToBuild(e.target.value)}
                  placeholder="Ej: Añadir persistencia en LocalStorage, modal de confirmación al eliminar y exportar a CSV..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsRefiningContract(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Volver al artefacto sin modificar
                </button>

                <button
                  type="button"
                  onClick={handleDispatchIncrementalRefinement}
                  disabled={pipelineRunning || (!missingModulesToBuild.trim() && selectedPendingModules.length === 0)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:bg-right transition-all text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Despachar El Worker para Cumplir Contrato Completo</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Section 2: Dual Input Zone (Voice & Text) - Auto-collapsible to minimize vertical clutter */}
        <section aria-label="Zona de Entrada">
          <InputZone
            prompt={prompt}
            setPrompt={setPrompt}
            onClarify={handleClarify}
            isClarifying={isClarifying}
            pipelineRunning={pipelineRunning}
            isListening={isListening}
            startListening={startListening}
            stopListening={stopListening}
            resetTranscript={resetTranscript}
            interimTranscript={interimTranscript}
            isCompact={isInputCompact}
            onToggleCompact={() => setIsInputCompact(!isInputCompact)}
          />
        </section>

        {/* Section 3: Clarification Phase Component - Collapsible once running or completed */}
        {clarification && (
          <section aria-label="Fase de Clarificación">
            <ClarificationPanel
              clarification={clarification}
              selectedOption={selectedOption}
              onSelectOption={(opt) => setSelectedOption(opt)}
              answers={clarificationAnswers}
              onAnswerChange={(q, ans) =>
                setClarificationAnswers((prev) => ({ ...prev, [q]: ans }))
              }
              onConfirmDispatch={handleDispatchPipeline}
              pipelineRunning={pipelineRunning}
              simulateRepairLoop={simulateRepairLoop}
              setSimulateRepairLoop={setSimulateRepairLoop}
              isCollapsed={isClarificationCollapsed}
              onToggleCollapse={() => setIsClarificationCollapsed(!isClarificationCollapsed)}
              onRegenerateOptions={handleRegenerateOptions}
              isRegeneratingOptions={isRegeneratingOptions}
              hermesConnected={settings.hermesConnected}
            />
          </section>
        )}

        {/* Section 4: Output Preview Area (Artifact Sandbox, Code, Contract, Markdown, Audit) */}
        {(artifact || pipelineRunning) && (
          <section aria-label="Entregables del Pipeline">
            <OutputPreview
              artifact={artifact}
              pipelineRunning={pipelineRunning}
              onRequestRepair={handleRequestRepair}
              onStartContractCompletion={handleStartContractCompletion}
              onResetProject={handleResetProject}
            />
          </section>
        )}

        {/* Section 5: Execution Console Terminal */}
        <section aria-label="Terminal de Ejecución">
          <ExecutionConsole
            logs={logs}
            agents={agents}
            onClearLogs={() => setLogs([])}
            pipelineRunning={pipelineRunning}
            isCollapsed={isConsoleCollapsed}
            onToggleCollapse={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
          />
        </section>
      </main>

      {/* Character Inspect Side Drawer */}
      <AgentDrawer
        agent={inspectedAgent}
        onClose={() => setInspectedAgent(null)}
        logs={logs}
      />

      {/* Provider & Global Memory Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
        onTestHermes={handleCheckHermes}
        isTestingHermes={isCheckingHermes}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Agentic Command Center Dashboard · Gemini 3.8 Flash Neural Engine & Hermes Gateway</span>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>4 Cyber-Mascots Operativos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
