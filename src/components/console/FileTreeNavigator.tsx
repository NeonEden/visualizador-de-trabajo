import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  Copy,
  Check,
  Download,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Terminal,
} from 'lucide-react';

interface FileTreeNavigatorProps {
  files: Record<string, string>;
  componentName?: string;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
  content?: string;
}

export const FileTreeNavigator: React.FC<FileTreeNavigatorProps> = ({
  files,
  componentName = 'App',
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(() => {
    const fileKeys = Object.keys(files);
    // Prefer main tsx/ts component
    return (
      fileKeys.find((k) => k.includes(`${componentName}.tsx`)) ||
      fileKeys.find((k) => k.endsWith('.tsx')) ||
      fileKeys[0] ||
      ''
    );
  });

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    'src/components': true,
    'src/types': true,
  });
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Build hierarchical tree structure from flat file keys
  const fileTree = useMemo(() => {
    const root: TreeNode = { name: 'root', path: '', isDirectory: true, children: [] };

    Object.entries(files).forEach(([filePath, content]) => {
      const parts = filePath.split('/');
      let current = root;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');

        if (!current.children) current.children = [];

        let existing = current.children.find((c) => c.name === part);

        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            isDirectory: !isLast,
            children: isLast ? undefined : [],
            content: isLast ? content : undefined,
          };
          current.children.push(existing);
        }

        current = existing;
      });
    });

    // Sort folders first, then files alphabetically
    const sortNodes = (nodes?: TreeNode[]) => {
      if (!nodes) return;
      nodes.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach((n) => sortNodes(n.children));
    };

    sortNodes(root.children);
    return root.children || [];
  }, [files]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts') || fileName.endsWith('.jsx') || fileName.endsWith('.js')) {
      return <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
    if (fileName.endsWith('.json')) {
      return <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (fileName.endsWith('.md')) {
      return <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    }
    if (fileName.endsWith('.css') || fileName.endsWith('.html')) {
      return <File className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    return <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const selectedFileContent = files[selectedFilePath] || '// Selecciona un archivo del árbol para visualizar su código.';

  const handleCopy = () => {
    if (!selectedFileContent) return;
    navigator.clipboard.writeText(selectedFileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadCurrentFile = () => {
    if (!selectedFileContent) return;
    const blob = new Blob([selectedFileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = selectedFilePath.split('/').pop() || 'file.txt';
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return (
      <div className="space-y-0.5">
        {nodes.map((node) => {
          if (node.isDirectory) {
            const isExpanded = expandedFolders[node.path] ?? true;
            return (
              <div key={node.path} className="select-none">
                <button
                  onClick={() => toggleFolder(node.path)}
                  style={{ paddingLeft: `${depth * 12 + 6}px` }}
                  className="w-full flex items-center gap-1.5 py-1 px-1.5 text-left text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-md transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                  <span className="font-medium text-slate-300 truncate">{node.name}</span>
                </button>
                {isExpanded && node.children && renderTree(node.children, depth + 1)}
              </div>
            );
          }

          const isSelected = selectedFilePath === node.path;
          return (
            <button
              key={node.path}
              onClick={() => setSelectedFilePath(node.path)}
              style={{ paddingLeft: `${depth * 12 + 18}px` }}
              className={`w-full flex items-center gap-1.5 py-1 px-1.5 text-left text-xs font-mono rounded-md transition-colors ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              {getFileIcon(node.name)}
              <span className="truncate">{node.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const lines = selectedFileContent.split('\n');

  return (
    <div className="w-full h-[580px] flex flex-col md:flex-row rounded-xl border border-slate-800 bg-[#070b14] overflow-hidden">
      {/* Left Column: Explorer Tree */}
      <div className="w-full md:w-72 bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Explorer Header */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 uppercase">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Explorador de Archivos</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            {Object.keys(files).length} archivos
          </span>
        </div>

        {/* Filter Input */}
        <div className="p-2 border-b border-slate-900">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar archivo..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
          {renderTree(fileTree)}
        </div>
      </div>

      {/* Right Column: Code Viewer */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060913]">
        {/* Top File Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {getFileIcon(selectedFilePath)}
            <span className="text-xs font-mono text-slate-300 font-semibold truncate">
              {selectedFilePath || 'Sin archivo seleccionado'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              ({lines.length} líneas)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
              title="Copiar contenido"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={handleDownloadCurrentFile}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
              title="Descargar este archivo"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
          </div>
        </div>

        {/* Code Lines Display */}
        <div className="flex-1 overflow-auto p-3 font-mono text-xs text-slate-200 leading-relaxed select-text bg-[#060913]">
          <pre className="flex">
            {/* Line Numbers */}
            <span className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/80 shrink-0 font-mono">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </span>
            {/* Code */}
            <span className="pl-4 text-slate-300 whitespace-pre overflow-x-auto flex-1 font-mono">
              {selectedFileContent}
            </span>
          </pre>
        </div>
      </div>
    </div>
  );
};
