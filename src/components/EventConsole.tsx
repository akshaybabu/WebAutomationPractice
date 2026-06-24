/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogEntry } from '../types';
import { Terminal, Trash2, Copy, Search, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface EventConsoleProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export default function EventConsole({ logs, onClearLogs }: EventConsoleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredLogs = logs.filter(
    (log) =>
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.elementId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = () => {
    const text = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id="automation-log-console-container"
      className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-300 z-50 transition-all duration-300 custom-shadow"
      style={{ height: isExpanded ? '280px' : '44px' }}
    >
      {/* Header bar */}
      <div 
        id="console-header"
        className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
            Live Automation Event Log ({logs.length})
          </span>
          <span className="hidden sm:inline bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-800">
            ID: #automation-log-console
          </span>
        </div>
        
        <div className="flex items-center gap-3 font-mono text-xs" onClick={(e) => e.stopPropagation()}>
          {isExpanded && (
            <>
              {/* Search Log Input */}
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  id="log-search-input"
                  type="text"
                  placeholder="Filter logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-md py-1 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-36 sm:w-48 transition-all"
                />
              </div>

              {/* Copy logs */}
              <button
                id="copy-logs-btn"
                onClick={copyToClipboard}
                title="Copy all logs to clipboard"
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden md:inline text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {/* Clear logs */}
              <button
                id="clear-logs-btn"
                onClick={onClearLogs}
                title="Clear all logs"
                className="p-1.5 hover:bg-red-950 hover:text-red-400 hover:border-red-900 rounded text-slate-400 flex items-center gap-1.5 transition-colors border border-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[10px]">Clear</span>
              </button>
            </>
          )}

          <button
            id="toggle-console-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal logs list */}
      {isExpanded && (
        <div 
          id="console-logs-list" 
          className="p-4 h-[236px] overflow-y-auto font-mono text-xs space-y-1.5 bg-slate-900/95 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950"
        >
          {filteredLogs.length === 0 ? (
            <div id="no-logs-msg" className="text-slate-500 italic text-center py-8">
              No automation logs captured yet. Click buttons, submit forms, or trigger interactions to record events.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={log.id}
                id={`log-entry-${log.id}`}
                className="flex flex-col sm:flex-row sm:items-start gap-1 py-1 px-2 hover:bg-slate-800/60 rounded border-l-2 border-slate-700 transition-colors"
                style={{
                  borderLeftColor: 
                    log.event === 'ON_LOAD' ? '#a7f3d0' : 
                    log.event.includes('ERROR') ? '#fca5a5' : 
                    log.event.includes('SUCCESS') ? '#34d399' : '#818cf8'
                }}
              >
                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                    log.event.includes('SUCCESS') ? 'bg-emerald-950/80 text-emerald-400' :
                    log.event.includes('ERROR') ? 'bg-red-950/80 text-red-400' :
                    'bg-indigo-950/80 text-indigo-400'
                  }`}>
                    {log.event}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="text-slate-400 font-semibold" id={`log-element-${log.id}`}>
                    [{log.elementId}]
                  </span>{' '}
                  <span className="text-slate-200" id={`log-details-${log.id}`}>
                    {log.details}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
