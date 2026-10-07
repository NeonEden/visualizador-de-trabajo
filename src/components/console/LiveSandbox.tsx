import React, { useEffect, useRef, useState } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Maximize2,
  Minimize2,
  Sparkles,
  Terminal,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

interface ConsoleLog {
  id: string;
  type: 'log' | 'warn' | 'error';
  text: string;
  time: string;
}

interface LiveSandboxProps {
  codeSnippet: string;
  onRuntimeError?: (error: string) => void;
  onRequestRepair?: (error: string) => void;
}

export const LiveSandbox: React.FC<LiveSandboxProps> = ({
  codeSnippet,
  onRuntimeError,
  onRequestRepair,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sandboxStatus, setSandboxStatus] = useState<'compiling' | 'ready' | 'error'>('compiling');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Clean code and wrap into complete sandboxed document
  const generateSandboxedHtml = (code: string) => {
    // Escape string for embedded script safely
    const escapedCode = JSON.stringify(code);

    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agentic Sandbox Preview</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            cyan: { 400: '#22d3ee', 500: '#06b6d4', 950: '#083344' },
            indigo: { 400: '#818cf8', 500: '#6366f1', 950: '#1e1b4b' },
          }
        }
      }
    };
  </script>
  <!-- React 18 & ReactDOM 18 -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Babel Standalone for in-browser JSX/TS transpilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      background-color: #0b0f19;
      color: #f1f5f9;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 16px;
      min-height: 100vh;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #070b14; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
  </style>
</head>
<body>
  <div id="root">
    <div style="display:flex;align-items:center;justify-content:center;height:240px;color:#94a3b8;font-family:monospace;font-size:12px;">
      Compilando y montando componente en vivo...
    </div>
  </div>

  <script>
    const rawCode = ${escapedCode};

    // Notify parent window
    function notifyParent(type, payload) {
      try {
        window.parent.postMessage({ type: type, payload: payload }, '*');
      } catch(e) {}
    }

    // Intercept console messages and forward to parent
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    console.log = function(...args) {
      try {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        notifyParent('SANDBOX_CONSOLE', { type: 'log', text });
      } catch(e) {}
      origLog.apply(console, args);
    };
    console.warn = function(...args) {
      try {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        notifyParent('SANDBOX_CONSOLE', { type: 'warn', text });
      } catch(e) {}
      origWarn.apply(console, args);
    };
    console.error = function(...args) {
      try {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        notifyParent('SANDBOX_CONSOLE', { type: 'error', text });
      } catch(e) {}
      origError.apply(console, args);
    };

    // Global Error Handlers
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      const errStr = (error && error.message) ? error.message : msg;
      renderError("Error en ejecución: " + errStr + " (Línea " + lineNo + ")");
      notifyParent('SANDBOX_ERROR', errStr);
      return true;
    };

    window.addEventListener('unhandledrejection', function(event) {
      const errStr = event.reason ? (event.reason.message || event.reason) : 'Promesa rechazada';
      renderError("Error asíncrono no capturado: " + errStr);
      notifyParent('SANDBOX_ERROR', errStr);
    });

    function renderError(errMessage) {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = \`
          <div style="background-color:#450a0a;border:1px solid #dc2626;border-radius:12px;padding:20px;color:#fecaca;font-family:ui-monospace,monospace;font-size:13px;line-height:1.6;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div style="display:flex;align-items:center;gap:8px;font-weight:bold;color:#f87171;margin-bottom:8px;font-size:14px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Fallo de Ejecución en Sandbox
            </div>
            <div style="white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,0.4);padding:12px;border-radius:8px;border:1px solid rgba(239,68,68,0.3);">\${errMessage}</div>
            <div style="margin-top:12px;font-size:11px;color:#fca5a5;">
              Puedes activar el "Repair Loop" para que el Auditor envíe correcciones a El Worker.
            </div>
          </div>
        \`;
      }
    }

    // Comprehensive SVG icon library proxy for any lucide-react icon requested
    const iconSvgs = {
      Check: '<polyline points="20 6 9 17 4 12"/>',
      CheckCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
      X: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      XCircle: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
      Plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
      Minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
      Trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
      Trash2: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
      Search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      ArrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
      ArrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
      Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
      Sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
      RefreshCw: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
      User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
      Mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
      Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
      EyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
      Bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
      Settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      Play: '<polygon points="5 3 19 12 5 21 5 3"/>',
      Pause: '<rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/>',
      Calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
      Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      DollarSign: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
      Activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      Cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/>',
      Server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
      Sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
      Terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
      ExternalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
      AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
    };

    function createIconComponent(name) {
      return function Icon(props) {
        props = props || {};
        const inner = iconSvgs[name] || '<circle cx="12" cy="12" r="8"/>';
        const size = props.size || 18;
        return React.createElement('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          className: props.className || '',
          style: props.style,
          dangerouslySetInnerHTML: { __html: inner }
        });
      };
    }

    // Lucide icons proxy: returns a clean SVG component for ANY icon requested
    const LucideProxy = new Proxy({}, {
      get: function(target, prop) {
        return createIconComponent(prop);
      }
    });

    // Provide standard React bindings in sandbox global scope
    const {
      useState,
      useEffect,
      useMemo,
      useCallback,
      useRef,
      useContext,
      createContext,
      useReducer,
      useId,
      useLayoutEffect
    } = React;

    // React Error Boundary Component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
      }
      componentDidCatch(error, info) {
        notifyParent('SANDBOX_ERROR', error.message || String(error));
      }
      render() {
        if (this.state.hasError) {
          return React.createElement('div', {
            style: {
              background: '#450a0a',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '16px',
              color: '#fecaca',
              fontFamily: 'monospace',
              fontSize: '13px'
            }
          }, [
            React.createElement('div', { key: 'title', style: { fontWeight: 'bold', color: '#f87171', marginBottom: '8px' } }, 'Error de Renderizado React'),
            React.createElement('div', { key: 'msg' }, this.state.error ? this.state.error.message : 'Error desconocido')
          ]);
        }
        return this.props.children;
      }
    }

    try {
      // 1. Preprocess code: Strip markdown fences
      let processed = rawCode;
      processed = processed.replace(/^\\s*\`\`\`[a-z]*\\s*/i, '');
      processed = processed.replace(/\\s*\`\`\`\\s*$/i, '');

      // 2. Multi-line and single-line imports removal (using [\\s\\S] to handle newlines!)
      // Extract all imported symbols from 'lucide-react' first
      const lucideImports = [];
      const lucideMatches = rawCode.matchAll(/import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*['"]lucide-react['"]/g);
      for (const m of lucideMatches) {
        if (m[1]) {
          m[1].split(',').forEach(item => {
            const sym = item.trim().split(/\\s+as\\s+/)[0].trim();
            if (sym) lucideImports.push(sym);
          });
        }
      }

      // Also gather all JSX tags <CapitalizedTag that might be icons or components
      const jsxTags = new Set(lucideImports);
      const tagMatches = rawCode.matchAll(/<([A-Z][A-Za-z0-9_]*)/g);
      for (const tm of tagMatches) {
        const t = tm[1];
        if (t && t !== 'React' && t !== 'Fragment' && t !== 'ErrorBoundary') {
          jsxTags.add(t);
        }
      }

      // Strip all import statements cleanly
      processed = processed.replace(/import[\\s\\S]*?from\\s+['"][^'"]+['"];?/g, '');
      processed = processed.replace(/import\\s+['"][^'"]+['"];?/g, '');

      // 3. Handle export default variations
      let componentName = '__AppEntry__';

      if (/export\\s+default\\s+function\\s+([A-Za-z0-9_]+)/.test(processed)) {
        const match = processed.match(/export\\s+default\\s+function\\s+([A-Za-z0-9_]+)/);
        componentName = match[1];
        processed = processed.replace(/export\\s+default\\s+function\\s+([A-Za-z0-9_]+)/, 'function ' + componentName);
      } else if (/export\\s+default\\s+function\\s*\\(/.test(processed)) {
        processed = processed.replace(/export\\s+default\\s+function\\s*\\(/, 'function __AppEntry__(');
        componentName = '__AppEntry__';
      } else if (/export\\s+default\\s+(\\(|[a-zA-Z0-9_]+\\s*=>)/.test(processed)) {
        processed = processed.replace(/export\\s+default\\s+/, 'const __AppEntry__ = ');
        componentName = '__AppEntry__';
      } else if (/export\\s+default\\s+([A-Za-z0-9_]+);?/.test(processed)) {
        const match = processed.match(/export\\s+default\\s+([A-Za-z0-9_]+);?/);
        componentName = match[1];
        processed = processed.replace(/export\\s+default\\s+([A-Za-z0-9_]+);?/, '// export default ' + componentName);
      } else {
        const compMatch = processed.match(/(?:function|const)\\s+([A-Z][A-Za-z0-9_]*)/);
        if (compMatch) {
          componentName = compMatch[1];
        }
      }

      // Remove any remaining export keywords
      processed = processed.replace(/export\\s+(const|let|var|type|interface|function|class)/g, '$1');
      processed = processed.replace(/export\\s*\\{[\\s\\S]*?\\};?/g, '');

      // 4. Transpile with Babel Standalone
      const transformed = Babel.transform(processed, {
        presets: [
          ['react', { runtime: 'classic' }],
          ['typescript', { isTSX: true, allExtensions: true }]
        ],
        filename: 'artifact.tsx'
      }).code;

      // 5. Generate safe bindings for icons so no ReferenceError is ever thrown
      const iconDeclarations = Array.from(jsxTags)
        .filter(tag => tag !== componentName)
        .map(tag => 'var ' + tag + ' = (typeof ' + tag + ' !== "undefined") ? ' + tag + ' : LucideProxy["' + tag + '"];')
        .join('\\n');

      // 6. Safe execution wrapper
      const wrapperScript = \`
        (function() {
          \${iconDeclarations}
          \${transformed}
          return (typeof \${componentName} !== "undefined") ? \${componentName} : null;
        })()
      \`;

      const RootComponent = eval(wrapperScript);

      if (!RootComponent) {
        throw new Error("No se pudo resolver el componente exportado '" + componentName + "'. Asegúrate de que el código tenga un 'export default function'.");
      }

      // 7. Mount into DOM
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        React.createElement(ErrorBoundary, null, React.createElement(RootComponent, null))
      );

      notifyParent('SANDBOX_READY', { status: 'mounted' });
    } catch(err) {
      console.error("Transpilation/Mount Error:", err);
      renderError(err.message || String(err));
      notifyParent('SANDBOX_ERROR', err.message || String(err));
    }
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    setSandboxStatus('compiling');
    setErrorMessage(null);

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        if (event.data.type === 'SANDBOX_READY') {
          setSandboxStatus('ready');
          setErrorMessage(null);
        } else if (event.data.type === 'SANDBOX_ERROR') {
          setSandboxStatus('error');
          setErrorMessage(event.data.payload);
          if (onRuntimeError) {
            onRuntimeError(event.data.payload);
          }
        } else if (event.data.type === 'SANDBOX_CONSOLE') {
          const payload = event.data.payload || {};
          setConsoleLogs((prev) => [
            ...prev.slice(-49),
            {
              id: `${Date.now()}-${Math.random()}`,
              type: payload.type || 'log',
              text: payload.text || '',
              time: new Date().toLocaleTimeString(),
            },
          ]);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onRuntimeError]);

  return (
    <div
      className={`relative w-full rounded-2xl border border-slate-800 bg-[#070b14] overflow-hidden flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 shadow-2xl border-cyan-500/50'
          : 'min-h-[460px]'
      }`}
    >
      {/* Top Sandbox Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              sandboxStatus === 'ready'
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : sandboxStatus === 'compiling'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
            }`}
          />
          <span className="font-mono font-bold text-slate-200">
            LIVE SANDBOX PREVIEW
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            Babel In-Browser + Tailwind
          </span>
        </div>

        <div className="flex items-center gap-2">
          {sandboxStatus === 'ready' && (
            <span className="text-[11px] font-mono text-emerald-400 hidden sm:flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Montado con Éxito
            </span>
          )}

          {sandboxStatus === 'error' && onRequestRepair && (
            <button
              onClick={() => onRequestRepair(errorMessage || 'Error de sintaxis o renderizado')}
              className="px-2.5 py-1 rounded-md bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              Activar Auto-Reparación
            </button>
          )}

          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Recargar Sandbox"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Iframe Sandbox Area */}
      <div className="relative flex-1 w-full bg-[#0b0f19] min-h-[400px]">
        <iframe
          key={refreshKey}
          ref={iframeRef}
          title="Sandbox Preview"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={generateSandboxedHtml(codeSnippet)}
          className="w-full h-full min-h-[420px] border-none"
        />

        {/* Runtime / Transpile Error Overlay Banner */}
        {sandboxStatus === 'error' && errorMessage && (
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-200 text-xs font-mono backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 animate-[fadeIn_0.2s_ease-out] z-20">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300">Aviso del Sandbox: </span>
                <span className="text-rose-200">{errorMessage}</span>
              </div>
            </div>
            {onRequestRepair && (
              <button
                onClick={() => onRequestRepair(errorMessage)}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Reparar con IA</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* In-Sandbox Console Drawer */}
      <div className="border-t border-slate-800/80 bg-slate-950 text-xs">
        <div
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-slate-900/60 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-300 text-[11px] font-semibold">
              Consola del Artefacto ({consoleLogs.length} logs)
            </span>
            {consoleLogs.some(l => l.type === 'error') && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {consoleLogs.length > 0 && isConsoleOpen && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConsoleLogs([]);
                }}
                className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
                title="Limpiar consola del sandbox"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {isConsoleOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>
        </div>

        {isConsoleOpen && (
          <div className="p-3 bg-[#050811] border-t border-slate-900 max-h-40 overflow-y-auto font-mono text-[11px] space-y-1">
            {consoleLogs.length === 0 ? (
              <div className="text-slate-500 italic py-1">
                La consola está vacía. Cualquier console.log del componente ejecutándose aparecerá aquí.
              </div>
            ) : (
              consoleLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-0.5 ${
                    log.type === 'error'
                      ? 'text-rose-400'
                      : log.type === 'warn'
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 shrink-0 text-[10px]">{log.time}</span>
                  <span className="text-slate-500 font-bold shrink-0">[{log.type.toUpperCase()}]</span>
                  <span className="break-all whitespace-pre-wrap">{log.text}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
