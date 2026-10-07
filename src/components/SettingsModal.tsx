import React, { useState } from 'react';
import {
  X,
  Server,
  Key,
  Database,
  Sliders,
  Check,
  Radio,
  Cpu,
  RefreshCw,
  Info,
} from 'lucide-react';
import { ProviderSettings } from '../types/agent';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProviderSettings;
  onSave: (newSettings: ProviderSettings) => void;
  onTestHermes: () => void;
  isTestingHermes: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onTestHermes,
  isTestingHermes,
}) => {
  const [form, setForm] = useState<ProviderSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'mode' | 'memory' | 'routing'>('mode');
  const [showSavedToast, setShowSavedToast] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setForm({ ...settings });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(form);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0a0f1d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Configuración del Orquestador & Proveedores
              </h2>
              <p className="text-xs text-slate-400">
                Hermes Gateway, Puente Multi-Proveedor y Memoria de Proyecto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('mode')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'mode'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Modo de Orquestación
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Memoria Global / Reglas
          </button>
          <button
            onClick={() => setActiveTab('routing')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'routing'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Rutas de Modelos por Agente
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ORCHESTRATION MODE */}
          {activeTab === 'mode' && (
            <div className="space-y-6">
              {/* Option A: Hermes Gateway */}
              <div
                onClick={() => setForm({ ...form, mode: 'hermes' })}
                className={`cursor-pointer rounded-xl border p-4.5 transition-all ${
                  form.mode === 'hermes'
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="orchestrationMode"
                      checked={form.mode === 'hermes'}
                      onChange={() => setForm({ ...form, mode: 'hermes' })}
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Hermes Gateway (Local WebSocket / HTTP)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                          Ultra Baja Latencia
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Canaliza las órdenes directamente a tu runtime local de Hermes en el puerto 37371.
                      </p>
                    </div>
                  </div>
                </div>

                {form.mode === 'hermes' && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Endpoint del Gateway Hermes:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.hermesEndpoint}
                          onChange={(e) =>
                            setForm({ ...form, hermesEndpoint: e.target.value })
                          }
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                          placeholder="http://localhost:37371"
                        />
                        <button
                          type="button"
                          onClick={onTestHermes}
                          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              isTestingHermes ? 'animate-spin' : ''
                            }`}
                          />
                          Ping Test
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <Radio
                        className={`w-4 h-4 shrink-0 ${
                          form.hermesConnected ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      />
                      <span>
                        {form.hermesConnected
                          ? 'Gateway detectado y respondiendo en localhost:37371.'
                          : 'Nota: Si Hermes no está corriendo localmente, el sistema activa automáticamente fallback inteligente con Gemini 3.8 Flash para que no se interrumpa tu flujo.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Option B: Direct Multi-Provider Bridge */}
              <div
                onClick={() => setForm({ ...form, mode: 'bridge' })}
                className={`cursor-pointer rounded-xl border p-4.5 transition-all ${
                  form.mode === 'bridge'
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="orchestrationMode"
                    checked={form.mode === 'bridge'}
                    onChange={() => setForm({ ...form, mode: 'bridge' })}
                    className="text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Direct Multi-Provider Bridge (OpenRouter / Azure / Ollama)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                        Multi-Cloud
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Conexión directa a proveedores en la nube y servidores locales de Ollama.
                    </p>
                  </div>
                </div>

                {form.mode === 'bridge' && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-4">
                    {/* OpenRouter Config */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-cyan-400" />
                          OpenRouter API Key:
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Claude 3.5 / Llama 3</span>
                      </div>
                      <input
                        type="password"
                        value={form.bridgeProviders.openRouter.apiKey}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bridgeProviders: {
                              ...form.bridgeProviders,
                              openRouter: {
                                ...form.bridgeProviders.openRouter,
                                apiKey: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                        placeholder="sk-or-v1-xxxxxxxx"
                      />
                    </div>

                    {/* Azure OpenAI Config */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-mono text-slate-300 mb-1 block">
                          Azure OpenAI Endpoint:
                        </label>
                        <input
                          type="text"
                          value={form.bridgeProviders.azureOpenAI.endpoint}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              bridgeProviders: {
                                ...form.bridgeProviders,
                                azureOpenAI: {
                                  ...form.bridgeProviders.azureOpenAI,
                                  endpoint: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                          placeholder="https://my-instance.openai.azure.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-300 mb-1 block">
                          Deployment Name:
                        </label>
                        <input
                          type="text"
                          value={form.bridgeProviders.azureOpenAI.deployment}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              bridgeProviders: {
                                ...form.bridgeProviders,
                                azureOpenAI: {
                                  ...form.bridgeProviders.azureOpenAI,
                                  deployment: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                          placeholder="gpt-4o-mini-prod"
                        />
                      </div>
                    </div>

                    {/* Ollama Local Endpoint */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-amber-400" />
                          Ollama Local Endpoint:
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">DeepSeek-R1 / Qwen</span>
                      </div>
                      <input
                        type="text"
                        value={form.bridgeProviders.ollama.endpoint}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bridgeProviders: {
                              ...form.bridgeProviders,
                              ollama: {
                                ...form.bridgeProviders.ollama,
                                endpoint: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                        placeholder="http://localhost:11434"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GLOBAL CONTEXT & MEMORY */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  El contexto global se inyecta en el sistema cognitivo de cada uno de los 4 agentes
                  (Clarificador, Arquitecto, Worker y Auditor) para mantener consistencia transversal.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                  Project Memory & Directrices de Código:
                </label>
                <textarea
                  rows={6}
                  value={form.globalContext}
                  onChange={(e) => setForm({ ...form, globalContext: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed"
                  placeholder="Ej: Usar TypeScript estricto sin tipos `any`. Priorizar arquitectura modular, Tailwind v4, validación de esquemas Zod y comentarios técnicos claros."
                />
              </div>

              {/* Quick Context Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] text-slate-500 font-mono self-center">Añadir regla rápida:</span>
                {[
                  'TypeScript Estricto',
                  'Tailwind CSS v4',
                  'Principios Clean Code',
                  'Seguridad OWASP Top 10',
                  'Accesibilidad WCAG AA',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        globalContext: prev.globalContext
                          ? `${prev.globalContext}\n- Regla: ${tag}`
                          : `- Regla: ${tag}`,
                      }))
                    }
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AGENT MODEL ROUTING */}
          {activeTab === 'routing' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Asigna el modelo de inferencia óptimo para la especialidad de cada cyber-mascot:
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'clarifier',
                    name: 'Agente 1: El Clarificador',
                    color: 'text-cyan-400',
                    desc: 'Deconstrucción semántica & HITL',
                  },
                  {
                    id: 'architect',
                    name: 'Agente 2: El Arquitecto',
                    color: 'text-indigo-400',
                    desc: 'Diseño estructural & contratos de datos',
                  },
                  {
                    id: 'worker',
                    name: 'Agente 3: El Worker',
                    color: 'text-amber-400',
                    desc: 'Generación y ensamblaje de código',
                  },
                  {
                    id: 'auditor',
                    name: 'Agente 4: El Auditor',
                    color: 'text-emerald-400',
                    desc: 'Verificación estática & bucle de reparación',
                  },
                ].map((agent) => (
                  <div
                    key={agent.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 gap-2"
                  >
                    <div>
                      <div className={`text-xs font-bold ${agent.color}`}>{agent.name}</div>
                      <div className="text-[11px] text-slate-500">{agent.desc}</div>
                    </div>

                    <select
                      value={form.agentModels[agent.id as keyof typeof form.agentModels] || 'gemini-3.8-flash'}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          agentModels: {
                            ...form.agentModels,
                            [agent.id]: e.target.value,
                          },
                        })
                      }
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recomendado)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Razonamiento Complejo)</option>
                      <option value="hermes-llama-3-8b">Hermes Gateway Local (Llama-3-8B)</option>
                      <option value="openrouter-claude-3.5">OpenRouter (Claude 3.5 Sonnet)</option>
                      <option value="azure-gpt-4o">Azure OpenAI (GPT-4o)</option>
                      <option value="ollama-deepseek-r1">Ollama (DeepSeek-R1 Local)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <div className="text-xs text-slate-400">
            {showSavedToast && (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" /> Cambios guardados correctamente
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Check className="w-4 h-4" />
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
