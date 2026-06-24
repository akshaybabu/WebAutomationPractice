/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LogEntry } from './types';
import IdentityPortal from './components/IdentityPortal';
import ApexBank from './components/ApexBank';
import AutomationSandbox from './components/AutomationSandbox';
import EventConsole from './components/EventConsole';
import { 
  Sliders, 
  Lock, 
  Building2, 
  RotateCcw, 
  Terminal, 
  HelpCircle,
  PlayCircle,
  CheckCircle2,
  Calendar,
  Cpu
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'identity' | 'bank'>('sandbox');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [istTime, setIstTime] = useState('');

  // Live IST Clock update hook
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setIstTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Callback to append automation logs formatted in Indian Standard Time (IST)
  const addLog = useCallback((event: string, elementId: string, details: string) => {
    const now = new Date();
    const timestamp = `${now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false })}.${String(now.getMilliseconds()).padStart(3, '0')} IST`;
    const newLog: LogEntry = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp,
      event,
      elementId,
      details
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  // Initial handshakes on mount
  useEffect(() => {
    addLog('ON_LOAD', 'applet-root', 'Automation Practice Arena initialized. Host server listening on standard Port 3000 mapping proxy.');
    addLog('HANDSHAKE_OK', 'webdriver-agent', 'Interactive locators and telemetry handlers fully compiled. Waiting for automation actions.');
  }, [addLog]);

  const handleClearLogs = () => {
    setLogs([]);
    addLog('SYSTEM_ACTION', 'clear-logs-btn', 'Cleared event log buffer stream.');
  };

  const handleGlobalReset = () => {
    // We send a log stating a global reset has been triggered.
    // Sub-components can use local resets, or we can refresh state.
    addLog('GLOBAL_RESET', 'master-reset-btn', 'Triggering global state flush across Sandbox, Identity, and Banking modules.');
    // To cleanly reset everything, we trigger a brief reload or notify sub-elements.
    // We can also just refresh page state variables by altering a reset key.
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-[300px]">
      {/* Top Professional Header Navigation */}
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 custom-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo and App Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white glow-indigo shadow-md">
                <Cpu className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5" id="app-main-title">
                  Practice Arena
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono border border-slate-200 font-semibold uppercase">
                    v2.4.0
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 font-mono">Sandbox Target Framework: Port 3000</p>
              </div>
            </div>

            {/* Diagnostic system specs / Time status */}
            <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1.5" id="ist-timezone-indicator">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>IST Time: {istTime || 'Calculating...'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">ONLINE</span>
              </div>
            </div>

            {/* Global telemetry controls */}
            <div className="flex items-center gap-3">
              <button
                id="master-reset-btn"
                onClick={handleGlobalReset}
                title="Refresh page to default state values"
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hard Reset Page</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Lab Nav Tabs */}
      <nav id="module-tabs" className="bg-white border-b border-slate-200 py-3 sticky top-[65px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-2 p-1 bg-slate-100 rounded-xl max-w-xl border border-slate-200">
            
            {/* Sandbox Elements Tab */}
            <button
              id="tab-sandbox-elements"
              onClick={() => {
                setActiveTab('sandbox');
                addLog('TAB_SWITCH', 'tab-sandbox-elements', 'Navigated to Sandbox Elements Practice module');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1. Elements Lab</span>
            </button>

            {/* Identity Forms Tab */}
            <button
              id="tab-identity-portal"
              onClick={() => {
                setActiveTab('identity');
                addLog('TAB_SWITCH', 'tab-identity-portal', 'Navigated to Identity & Forms validation module');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'identity'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>2. Auth Forms</span>
            </button>

            {/* Banking Lab Tab */}
            <button
              id="tab-apex-bank"
              onClick={() => {
                setActiveTab('bank');
                addLog('TAB_SWITCH', 'tab-apex-bank', 'Navigated to Apex Bank transaction simulation module');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'bank'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3. Banking Portal</span>
            </button>

          </div>
        </div>
      </nav>

      {/* Main Content Stage */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1">
        
        {/* Dynamic Sandbox Selector Area */}
        <div id="active-lab-wrapper">
          {activeTab === 'sandbox' && (
            <AutomationSandbox onAddLog={addLog} />
          )}

          {activeTab === 'identity' && (
            <IdentityPortal onAddLog={addLog} />
          )}

          {activeTab === 'bank' && (
            <ApexBank onAddLog={addLog} />
          )}
        </div>

      </main>

      {/* Floating live console dashboard footer */}
      <EventConsole logs={logs} onClearLogs={handleClearLogs} />
    </div>
  );
}
