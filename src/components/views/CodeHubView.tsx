import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  FolderTree,
  ExternalLink,
  Shield,
  Layers,
  Terminal
} from 'lucide-react';
import { REPOSITORY_FILES, CodeFile } from '../../data/repositoryCode';

export const CodeHubView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(REPOSITORY_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'server' | 'agent' | 'scripts' | 'infra'>('all');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'script.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFiles = REPOSITORY_FILES.filter((f) => {
    if (categoryFilter === 'all') return true;
    return f.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Code & Scripts Repository Hub</h1>
          <p className="text-xs text-slate-400">
            Production-ready backend, local agent, and Autox.js JavaScript automation script suite
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#111113] border border-white/5 rounded-xl text-xs">
          {(['all', 'server', 'agent', 'scripts', 'infra'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Code Browser Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Tree (Left 4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-[#111113] border border-white/5 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Project Files ({filteredFiles.length})
          </div>

          <div className="space-y-1.5">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500 text-white'
                      : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <FileCode
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isSelected ? 'text-indigo-400' : 'text-slate-500'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-mono font-medium truncate">{file.path}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {file.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer (Right 8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#111113] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
          {/* File Header Bar */}
          <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-[11px] font-mono text-indigo-400 border border-indigo-500/20">
                {selectedFile.language.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-slate-200 font-semibold">{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 border border-white/10 transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs flex items-center gap-1.5 font-medium shadow-[0_0_10px_rgba(99,102,241,0.25)] transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-white/[0.01] border-b border-white/5 text-xs text-slate-400">
            {selectedFile.description}
          </div>

          {/* Code Text Area */}
          <div className="p-4 bg-[#0a0a0b] font-mono text-xs text-slate-200 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
