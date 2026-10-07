export type AgentId = 'clarifier' | 'architect' | 'worker' | 'auditor';

export type AgentStatus = 'idle' | 'active' | 'success' | 'error';

export type WorkflowStage = 'input' | 'clarifying' | 'clarified' | 'running' | 'completed';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  codename: string;
  roleTitle: string;
  subtitle: string;
  propName: string;
  propDescription: string;
  primaryColor: string; // hex
  accentColor: string;
  glowColor: string;
  bgGlow: string;
  borderColor: string;
  defaultModel: string;
  tokenCount: number;
  status: AgentStatus;
  speech: string;
  currentTask: string;
}

export interface ExecutionContract {
  target_goal: string;
  architecture_plan: string[];
  constraints: string[];
  agent_assignments: {
    clarifier: { role: string; model: string; focus: string };
    architect: { role: string; model: string; focus: string };
    worker: { role: string; model: string; focus: string };
    auditor: { role: string; model: string; focus: string };
  };
}

export interface ClarificationOption {
  id: string;
  title: string;
  description: string;
  tag: string;
  techStack?: string;
  pros?: string[];
}

export interface ClarificationQuestion {
  question: string;
  context: string;
}

export interface ClarificationResult {
  intentSummary: string;
  primaryGoal: string;
  scopeBreakdown: string[];
  recommendedOptions: ClarificationOption[];
  clarifyingQuestions: ClarificationQuestion[];
  confidenceScore: number;
  suggestedArchitecture: string;
  executionContract?: ExecutionContract;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentId: AgentId | 'system';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface ProviderSettings {
  mode: 'hermes' | 'bridge';
  hermesEndpoint: string;
  hermesConnected: boolean;
  bridgeProviders: {
    gemini: {
      model: string;
      apiKey?: string;
    };
    openRouter: {
      apiKey: string;
      model: string;
    };
    azureOpenAI: {
      endpoint: string;
      apiKey: string;
      deployment: string;
    };
    ollama: {
      endpoint: string;
      model: string;
    };
  };
  selectedModelRoute: string;
  globalContext: string;
  agentModels: Record<AgentId, string>;
}

export interface ContractItem {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'in-progress';
  details: string;
  category?: string;
}

export interface ArchitectSpec {
  componentName: string;
  architecturalPattern: string;
  description: string;
  componentBreakdown: string[];
  statePlan: string[];
  dataContracts: string[];
  stylingRequirements: string[];
  interactiveFeatures: string[];
}

export interface FinalArtifact {
  codeSnippet: string;
  markdownReport: string;
  auditScore: number;
  repairLoopTriggered: boolean;
  totalTokens: number;
  durationMs: number;
  architectSpec?: ArchitectSpec;
  contractChecklist?: ContractItem[];
  pendingModules?: string[];
  completedModules?: string[];
  projectFiles?: Record<string, string>;
  executionContract?: ExecutionContract;
  hermesDispatched?: boolean;
}
