import { ClarificationResult, FinalArtifact, LogEntry } from '../types/agent';

export async function requestClarification(
  prompt: string,
  globalContext: string,
  options?: {
    regenerateAlternative?: boolean;
    customApiKey?: string;
  }
): Promise<ClarificationResult> {
  const response = await fetch('/api/agent/clarify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      globalContext,
      regenerateAlternative: options?.regenerateAlternative,
      customApiKey: options?.customApiKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to clarify prompt: ${response.statusText}`);
  }

  return response.json();
}

export async function checkHermesStatus(): Promise<{
  connected: boolean;
  endpoint: string;
  provider: string;
  latencyMs?: number;
  details?: any;
}> {
  try {
    const res = await fetch('/api/hermes/status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch (err) {
    return {
      connected: false,
      endpoint: 'http://localhost:37371',
      provider: 'Hermes Gateway (Local)',
    };
  }
}

export interface StreamCallbacks {
  onAgentState: (data: { agentId: string; status: any; speech?: string; tokenDelta?: number }) => void;
  onAgentLog: (data: { agentId: string; level: any; message: string }) => void;
  onWirePulse: (data: { from: string; to: string; isRepairLoop?: boolean }) => void;
  onComplete: (artifact: FinalArtifact) => void;
  onError: (err: string) => void;
}

export interface PipelinePayload {
  prompt: string;
  selectedOption: any;
  answers: Record<string, string>;
  globalContext: string;
  simulateRepairLoop: boolean;
  isIncrementalRefinement?: boolean;
  existingCode?: string;
  missingModulesToBuild?: string;
  customApiKey?: string;
}

export async function streamPipelineExecution(
  payload: PipelinePayload,
  callbacks: StreamCallbacks
): Promise<() => void> {
  const controller = new AbortController();

  fetch('/api/agent/stream-pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Pipeline failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          let eventName = 'message';
          const eventDataLines: string[] = [];

          const subLines = line.split('\n');
          for (const subLine of subLines) {
            if (subLine.startsWith('event: ')) {
              eventName = subLine.slice(7).trim();
            } else if (subLine.startsWith('data: ')) {
              eventDataLines.push(subLine.slice(6));
            }
          }

          const eventData = eventDataLines.join('\n').trim();

          if (eventData) {
            try {
              const parsed = JSON.parse(eventData);

              if (eventName === 'agent_state') {
                callbacks.onAgentState(parsed);
              } else if (eventName === 'agent_log') {
                callbacks.onAgentLog(parsed);
              } else if (eventName === 'wire_pulse') {
                callbacks.onWirePulse(parsed);
              } else if (eventName === 'pipeline_complete') {
                callbacks.onComplete({
                  codeSnippet: parsed.codeSnippet,
                  markdownReport: parsed.markdownReport,
                  auditScore: parsed.auditScore || 100,
                  repairLoopTriggered: Boolean(parsed.repairLoopTriggered),
                  totalTokens: parsed.totalTokens || 2400,
                  durationMs: 4200,
                  architectSpec: parsed.architectSpec,
                  contractChecklist: parsed.contractChecklist,
                  pendingModules: parsed.pendingModules,
                  completedModules: parsed.completedModules,
                });
              } else if (eventName === 'pipeline_error') {
                callbacks.onError(parsed.message || 'Error en ejecución de pipeline');
              }
            } catch (e) {
              console.warn('Failed to parse SSE data chunk:', eventData);
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        callbacks.onError(err.message || 'Error de conexión');
      }
    });

  return () => controller.abort();
}
