import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Copy, 
  Check, 
  RefreshCw, 
  Play, 
  Terminal, 
  ExternalLink, 
  Code, 
  FileJson, 
  BookOpen, 
  Trash2, 
  Plus, 
  Edit3, 
  RotateCcw,
  Send,
  HelpCircle
} from 'lucide-react';

interface ApiLabProps {
  onAddLog: (event: string, elementId: string, details: string) => void;
}

interface PetRecord {
  id: number;
  name: string;
  category: string;
  status: string;
}

interface ApiResponseState {
  status: number | null;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  durationMs: number | null;
  loading: boolean;
}

export default function ApiLab({ onAddLog }: ApiLabProps) {
  // Database State (fetched live from actual Express server)
  const [livePets, setLivePets] = useState<PetRecord[]>([]);
  const [isFetchingDb, setIsFetchingDb] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Swagger Accordion Open States
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({
    getPets: true,
    getPetById: false,
    addPet: false,
    updatePet: false,
    deletePet: false
  });

  // Parameter Inputs
  const [paramPetIdGet, setParamPetIdGet] = useState<string>('101');
  const [paramPetIdDelete, setParamPetIdDelete] = useState<string>('104');
  
  const [payloadAddBody, setPayloadAddBody] = useState<string>(
    JSON.stringify({ name: 'Rocky', category: 'Canine', status: 'available' }, null, 2)
  );
  const [payloadUpdateBody, setPayloadUpdateBody] = useState<string>(
    JSON.stringify({ id: 101, name: 'Buster Max', category: 'Canine', status: 'pending' }, null, 2)
  );

  // Active executing responses
  const [apiResponses, setApiResponses] = useState<Record<string, ApiResponseState>>({
    getPets: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false },
    getPetById: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false },
    addPet: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false },
    updatePet: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false },
    deletePet: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false }
  });

  // Tabs for response console vs code template
  const [activeTabs, setActiveTabs] = useState<Record<string, 'console' | 'code'>>({
    getPets: 'console',
    getPetById: 'console',
    addPet: 'console',
    updatePet: 'console',
    deletePet: 'console'
  });

  // Framework code languages
  const [codeLangs, setCodeLangs] = useState<Record<string, 'playwright' | 'cypress' | 'fetch'>>({
    getPets: 'playwright',
    getPetById: 'playwright',
    addPet: 'playwright',
    updatePet: 'playwright',
    deletePet: 'playwright'
  });

  // Get dynamic origin URL
  const serverOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Fetch the actual server database state
  const fetchServerDb = async (silent = false) => {
    if (!silent) setIsFetchingDb(true);
    const start = performance.now();
    try {
      const response = await fetch('/api/v1/pets');
      if (response.ok) {
        const data = await response.json();
        setLivePets(data);
        if (!silent) {
          const duration = Math.round(performance.now() - start);
          onAddLog('API_DB_FETCH', 'db-inspector-grid', `Successfully synchronized live database state in ${duration}ms`);
        }
      } else {
        console.error('Failed to retrieve pets database');
      }
    } catch (err) {
      console.error('Error fetching pets database:', err);
    } finally {
      if (!silent) setIsFetchingDb(false);
    }
  };

  // Poll database on load and every 5 seconds to keep dashboard in perfect synchrony
  useEffect(() => {
    fetchServerDb();
    const interval = setInterval(() => {
      fetchServerDb(true);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleCopyText = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    onAddLog('API_COPY_TEXT', `btn-copy-${label}`, `Copied ${label} details to clipboard`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleResetServerDb = async () => {
    onAddLog('API_DB_RESET_REQUEST', 'btn-reset-server-db', 'Dispatched server-side database reload sequence to baseline values.');
    try {
      const response = await fetch('/api/v1/reset', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setLivePets(result.body || []);
        fetchServerDb();
        onAddLog('API_DB_RESET_SUCCESS', 'btn-reset-server-db', 'Server database reset sequence completed successfully. Baseline restored.');
      }
    } catch (error) {
      console.error('Failed to reset db', error);
    }
  };

  // Execute actual API calls through the network!
  const executeRealApiRoute = async (
    route: 'getPets' | 'getPetById' | 'addPet' | 'updatePet' | 'deletePet',
    requestConfig: { path: string; method: string; body?: any }
  ) => {
    setApiResponses(prev => ({
      ...prev,
      [route]: { ...prev[route], loading: true }
    }));
    onAddLog('API_EXEC_START', `btn-execute-${route}`, `Initiating real HTTP network request: ${requestConfig.method} ${requestConfig.path}`);
    
    const startTime = performance.now();
    try {
      const options: RequestInit = {
        method: requestConfig.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      if (requestConfig.body) {
        options.body = typeof requestConfig.body === 'string' ? requestConfig.body : JSON.stringify(requestConfig.body);
      }

      const response = await fetch(requestConfig.path, options);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      // Extract response headers
      const headersMap: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersMap[key] = value;
      });

      let jsonBody: any;
      try {
        jsonBody = await response.json();
      } catch {
        jsonBody = { message: "Empty response body or non-JSON returned" };
      }

      setApiResponses(prev => ({
        ...prev,
        [route]: {
          status: response.status,
          statusText: response.statusText,
          headers: headersMap,
          body: jsonBody,
          durationMs: latency,
          loading: false
        }
      }));

      // Immediately sync local DB display so the user instantly sees modifications
      fetchServerDb(true);
      onAddLog('API_EXEC_RESPONSE', `btn-execute-${route}`, `Received response for ${requestConfig.method} ${requestConfig.path} with status ${response.status} in ${latency}ms`);
    } catch (err: any) {
      const endTime = performance.now();
      setApiResponses(prev => ({
        ...prev,
        [route]: {
          status: 500,
          statusText: 'Network Error / Fetch Fail',
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Network fetch exception', details: err.message },
          durationMs: Math.round(endTime - startTime),
          loading: false
        }
      }));
      onAddLog('API_EXEC_ERROR', `btn-execute-${route}`, `Network request failed: ${err.message}`);
    }
  };

  const handleExecuteGetPets = () => {
    executeRealApiRoute('getPets', {
      path: '/api/v1/pets',
      method: 'GET'
    });
  };

  const handleExecuteGetPetById = () => {
    const id = parseInt(paramPetIdGet, 10);
    executeRealApiRoute('getPetById', {
      path: `/api/v1/pets/${isNaN(id) ? paramPetIdGet : id}`,
      method: 'GET'
    });
  };

  const handleExecuteAddPet = () => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(payloadAddBody);
    } catch {
      // Let server return 400 Bad Request or pass raw malformed payload
      parsedBody = payloadAddBody;
    }
    executeRealApiRoute('addPet', {
      path: '/api/v1/pets',
      method: 'POST',
      body: parsedBody
    });
  };

  const handleExecuteUpdatePet = () => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(payloadUpdateBody);
    } catch {
      parsedBody = payloadUpdateBody;
    }
    executeRealApiRoute('updatePet', {
      path: '/api/v1/pets',
      method: 'PUT',
      body: parsedBody
    });
  };

  const handleExecuteDeletePet = () => {
    const id = parseInt(paramPetIdDelete, 10);
    executeRealApiRoute('deletePet', {
      path: `/api/v1/pets/${isNaN(id) ? paramPetIdDelete : id}`,
      method: 'DELETE'
    });
  };

  // Safe helper to extract properties from JSON payloads for Code templates
  const getPropFromPayload = (jsonStr: string, prop: string, defaultVal: any) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed[prop] !== undefined ? parsed[prop] : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  // Postman JSON configuration copy generator
  const getPostmanCollectionJson = () => {
    return JSON.stringify({
      info: {
        name: "Practice Arena Petstore REST API",
        description: "Fully interactive REST API collection running live on the Practice Arena. Perfect for learning requests, payloads, status code assertions, and response delays in Postman.",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "1. Retrieve All Pets",
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: `${serverOrigin}/api/v1/pets`,
              origin: serverOrigin,
              path: ["api", "v1", "pets"]
            },
            description: "Fetches all registered pet objects from the server storage."
          }
        },
        {
          name: "2. Fetch Pet by ID",
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: `${serverOrigin}/api/v1/pets/101`,
              origin: serverOrigin,
              path: ["api", "v1", "pets", "101"]
            },
            description: "Looks up a specific pet record in the database using its parameter ID."
          }
        },
        {
          name: "3. Create a Pet",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ name: "Rocky", category: "Canine", status: "available" }, null, 2)
            },
            url: {
              raw: `${serverOrigin}/api/v1/pets`,
              origin: serverOrigin,
              path: ["api", "v1", "pets"]
            },
            description: "Registers a brand-new pet. Returns 201 Created."
          }
        },
        {
          name: "4. Update a Pet",
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({ id: 101, name: "Buster Max", category: "Canine", status: "pending" }, null, 2)
            },
            url: {
              raw: `${serverOrigin}/api/v1/pets`,
              origin: serverOrigin,
              path: ["api", "v1", "pets"]
            },
            description: "Overwrites properties of an existing record using the payload ID."
          }
        },
        {
          name: "5. Delete a Pet",
          request: {
            method: "DELETE",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: `${serverOrigin}/api/v1/pets/104`,
              origin: serverOrigin,
              path: ["api", "v1", "pets", "104"]
            },
            description: "Permanently wipes a pet record from the server storage database."
          }
        }
      ]
    }, null, 2);
  };

  const renderApiResponsePanel = (
    route: 'getPets' | 'getPetById' | 'addPet' | 'updatePet' | 'deletePet',
    codeTemplates: { playwright: string; cypress: string; fetch: string }
  ) => {
    const resp = apiResponses[route];
    const activeTab = activeTabs[route];
    const activeLang = codeLangs[route];
    const currentCode = activeLang === 'playwright' ? codeTemplates.playwright : activeLang === 'cypress' ? codeTemplates.cypress : codeTemplates.fetch;

    return (
      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50/50" id={`api-response-${route}`}>
        {/* Header Toggle tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2">
          <div className="flex gap-2">
            <button
              id={`btn-resp-tab-console-${route}`}
              onClick={() => setActiveTabs(prev => ({ ...prev, [route]: 'console' }))}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'console'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Response Payload
            </button>
            <button
              id={`btn-resp-tab-code-${route}`}
              onClick={() => setActiveTabs(prev => ({ ...prev, [route]: 'code' }))}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Automation Script 🎓
            </button>
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">
            {activeTab === 'console' ? 'LIVE NETWORK INSPECT' : 'TESTING RECIPE'}
          </span>
        </div>

        {/* Tab 1: Live response metadata / body */}
        {activeTab === 'console' && (
          <div className="p-4 space-y-3 min-h-[110px]" id={`console-body-${route}`}>
            {resp.loading ? (
              <div className="flex flex-col items-center justify-center min-h-[100px]" id={`loader-${route}`}>
                <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400 mt-2 font-mono">Negotiating with Live API Server...</span>
              </div>
            ) : resp.status === null ? (
              <div className="flex flex-col items-center justify-center min-h-[100px] text-center text-slate-400">
                <Send className="w-5 h-5 text-slate-300" />
                <p className="text-xs italic mt-2">No request dispatched. Hit the "Execute Network Request" button above.</p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-100">
                {/* Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Response Status:</span>
                    <span
                      id={`status-badge-${route}`}
                      className={`px-2.5 py-0.5 rounded font-bold border ${
                        resp.status >= 200 && resp.status < 300
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : resp.status >= 400 && resp.status < 500
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {resp.status} {resp.statusText}
                    </span>
                  </div>
                  <span className="text-slate-400" id={`latency-badge-${route}`}>
                    Latency: <strong className="text-slate-700 font-bold">{resp.durationMs} ms</strong>
                  </span>
                </div>

                {/* Response Headers Details */}
                <details className="group border border-slate-200/60 rounded-lg overflow-hidden bg-white">
                  <summary className="bg-slate-50 px-3 py-1.5 text-[10px] font-mono text-slate-500 font-bold cursor-pointer select-none hover:text-slate-700 flex justify-between items-center">
                    <span>Response Headers ({Object.keys(resp.headers).length} keys)</span>
                    <span className="text-slate-400 font-normal group-open:hidden">▶ Show Headers</span>
                    <span className="text-slate-400 font-normal hidden group-open:inline">▼ Hide Headers</span>
                  </summary>
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-600 space-y-1.5 max-h-[130px] overflow-y-auto">
                    {Object.entries(resp.headers).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-100/40 pb-0.5">
                        <span className="text-slate-400 font-semibold uppercase text-[9px]">{k}</span>
                        <span className="text-slate-700 text-right max-w-xs truncate" title={v}>{v}</span>
                      </div>
                    ))}
                  </div>
                </details>

                {/* Raw Body Print */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">Response Body (JSON Payload):</span>
                  <pre
                    id={`response-pre-${route}`}
                    className="p-3 bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[10px] leading-relaxed rounded-lg overflow-x-auto max-h-[220px] shadow-inner"
                  >
                    {JSON.stringify(resp.body, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Code Automation Recipes */}
        {activeTab === 'code' && (
          <div className="p-4 space-y-3" id={`code-body-${route}`}>
            <p className="text-[11px] text-slate-500 leading-normal">
              Copy this production-grade testing code directly into your automated test pipeline to perform schema and functional verification on the live endpoint.
            </p>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {(['playwright', 'cypress', 'fetch'] as const).map((lang) => (
                  <button
                    key={lang}
                    id={`btn-lang-${route}-${lang}`}
                    onClick={() => setCodeLangs(prev => ({ ...prev, [route]: lang }))}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-colors cursor-pointer capitalize ${
                      activeLang === lang
                        ? 'bg-slate-900 text-white shadow'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lang === 'playwright' ? 'Playwright API' : lang === 'cypress' ? 'Cypress' : 'Fetch'}
                  </button>
                ))}
              </div>

              <button
                id={`btn-copy-code-${route}`}
                onClick={() => handleCopyText(`snippet-${route}-${activeLang}`, currentCode)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-800 text-[10px] font-mono font-bold rounded shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {copiedText === `snippet-${route}-${activeLang}` ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-sans">
                    <Check className="w-3 h-3" /> Copied!
                  </span>
                ) : (
                  <span>Copy Snippet</span>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 text-indigo-200 font-mono text-[10px] leading-relaxed rounded-lg overflow-x-auto shadow-inner max-h-[220px]">
              {currentCode}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="api-lab-root-container" className="space-y-6">
      
      {/* 1. SECTION: Top Professional Status Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 custom-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm shrink-0">
              <Server className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">Live End-to-End REST API Server</h2>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                  Active Connection
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Unlike simulated tools, the Practice Arena features a live Express backend running at <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-700 text-[11px]">{serverOrigin}</code>. 
                Any client—including <strong>Postman</strong>, <strong>Playwright</strong>, <strong>Cypress</strong>, or <strong>Curl</strong>—can interact with these real routes!
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide font-semibold">API Root Base Address:</span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 pl-2.5 pr-1.5 py-1 rounded-lg shadow-sm">
              <code className="text-xs font-mono font-bold text-indigo-700">{serverOrigin}/api/v1</code>
              <button
                id="btn-copy-base-url"
                onClick={() => handleCopyText('baseURL', `${serverOrigin}/api/v1`)}
                className="p-1 hover:bg-slate-200/80 rounded transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Copy Base URL"
              >
                {copiedText === 'baseURL' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION: Postman & OpenAPI End-to-End Integration Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid: Integration Guide */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <FileJson className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-800 text-sm">Postman & External Tools Quick Import</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              You can instantly load all these endpoints, headers, descriptions, and mock bodies straight into your local Postman workspace in under 10 seconds! Choose one of the options below:
            </p>

            <div className="space-y-3.5 pt-1 text-xs">
              
              {/* Option A: OpenAPI JSON URL */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Option A: Import via OpenAPI 3.0 Link (Recommended)</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">EASIEST</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  1. In Postman, click <strong>Import</strong> in the top-left sidebar.<br />
                  2. Paste this OpenAPI JSON Specification URL and click <strong>Next</strong>:
                </p>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
                  <code className="text-[10px] font-mono text-indigo-700 truncate block flex-1 pl-1">
                    {serverOrigin}/api/v1/openapi.json
                  </code>
                  <button
                    id="btn-copy-openapi-link"
                    onClick={() => handleCopyText('openapiLink', `${serverOrigin}/api/v1/openapi.json`)}
                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedText === 'openapiLink' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'openapiLink' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <div className="pt-1 flex justify-end">
                  <a
                    id="btn-open-openapi-new-tab"
                    href={`${serverOrigin}/api/v1/openapi.json`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Open API Spec in New Tab ↗</span>
                  </a>
                </div>
              </div>

              {/* Option B: Direct Collection JSON Copy */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Option B: Import via Raw Postman Collection JSON</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Copy the full Postman collection payload, create a text file or paste it in Postman's raw text importer to instantiate the environment instantly:
                </p>
                <button
                  id="btn-copy-postman-json"
                  onClick={() => handleCopyText('postmanJson', getPostmanCollectionJson())}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                >
                  {copiedText === 'postmanJson' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied Collection JSON to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <FileJson className="w-4 h-4" />
                      <span>Copy Complete Postman Collection JSON</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 mt-4">
            <a 
              href="https://web.postman.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
            >
              <span>Launch Postman Web Client</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right Grid: Live Server Database State Inspector */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between" id="server-db-inspector-card">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 shadow-sm shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Server Database Inspector</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Real-time memory storage variables in Express</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-sync-db-view"
                  onClick={() => fetchServerDb()}
                  disabled={isFetchingDb}
                  className="p-1.5 bg-slate-50 hover:bg-slate-150 border border-slate-200 text-slate-600 rounded-lg cursor-pointer transition-all shadow-sm"
                  title="Synchronize database view"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingDb ? 'animate-spin' : ''}`} />
                </button>
                <button
                  id="btn-hard-reset-server-db"
                  onClick={handleResetServerDb}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg cursor-pointer transition-all shadow-sm"
                  title="Reset Server Database to Baseline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal mb-4">
              Whenever you invoke requests from <strong>Postman</strong> or your <strong>Automation Scripts</strong>, 
              the records below will dynamically alter! Feel free to hit refresh to pull the latest state instantly.
            </p>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1" id="server-db-pills-area">
              {livePets.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-rose-200 bg-rose-50/50 rounded-xl" id="empty-db-notification">
                  <span className="text-xs italic text-rose-600 font-semibold flex flex-col items-center gap-1">
                    <span>⚠️ Server Database is Empty!</span>
                    <span className="text-[10px] font-normal text-slate-500 mt-0.5">Execute POST requests from Postman or Swagger to add items.</span>
                  </span>
                </div>
              ) : (
                livePets.map((pet) => (
                  <div
                    key={pet.id}
                    id={`db-pet-item-${pet.id}`}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono shadow-sm hover:border-slate-300 transition-all hover:translate-x-0.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">ID: {pet.id}</span>
                      <strong className="text-slate-800 font-bold text-xs">{pet.name}</strong>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 capitalize">{pet.category}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider border ${
                          pet.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                          pet.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-150' :
                          'bg-rose-50 text-rose-700 border-rose-150'
                        }`}
                      >
                        {pet.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Total records: <strong>{livePets.length}</strong></span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Dynamic polling sync
            </span>
          </div>
        </div>

      </div>

      {/* 3. SECTION: Swagger OpenAPI Interactive Arena */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow" id="real-swagger-practice-card">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-100">🚀</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Interactive Swagger Testbed (Try-It-Out Lab)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Dispatches live network HTTP requests directly to the backend. View true logs, headers, and code snippets.</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border border-indigo-100 mt-2 md:mt-0">
            MAPPED ENDPOINTS
          </span>
        </div>

        {/* Dynamic Mock Server Database State Viewer in this tab too */}
        <div id="real-swagger-endpoints-list" className="space-y-3">

          {/* 1. GET /api/v1/pets (LIST ALL PETS) */}
          <div id="real-swag-endpoint-get-all" className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
            <button
              id="real-btn-toggle-get-pets"
              onClick={() => setExpandedRoutes(prev => ({ ...prev, getPets: !prev.getPets }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.getPets ? 'bg-blue-100/70' : 'bg-blue-50/70 hover:bg-blue-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">GET</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Fetches entire live catalog records</span>
              </div>
              <span className="text-xs text-blue-700 font-mono font-bold">
                {expandedRoutes.getPets ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.getPets && (
              <div className="p-4 bg-white border-t border-blue-100 space-y-4" id="real-swag-body-get-pets">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Triggers an HTTP <code>GET</code> request to return the complete array of pets currently cached on the server. Excellent for validating response array sizes and JSON schema structures.
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-slate-400">Parameters: None</span>
                  <button
                    id="real-btn-exec-get-pets"
                    onClick={handleExecuteGetPets}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                  >
                    Execute Network Request
                  </button>
                </div>

                {renderApiResponsePanel('getPets', {
                  playwright: `import { test, expect } from '@playwright/test';

test('GET /api/v1/pets should return successful records array', async ({ request }) => {
  const response = await request.get('${serverOrigin}/api/v1/pets');
  expect(response.status()).toBe(200);
  
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  
  // Assert schema properties exist
  const firstPet = body[0];
  expect(firstPet).toHaveProperty('id');
  expect(firstPet).toHaveProperty('name');
  expect(firstPet).toHaveProperty('category');
  expect(firstPet).toHaveProperty('status');
});`,
                  cypress: `describe('Petstore API Verification', () => {
  it('should retrieve all server pets successfully', () => {
    cy.request('GET', '${serverOrigin}/api/v1/pets').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.gt(0);
      
      const first = response.body[0];
      expect(first).to.have.property('id');
      expect(first).to.have.property('name');
    });
  });
});`,
                  fetch: `// Standard JavaScript Fetch Request
fetch('${serverOrigin}/api/v1/pets', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
})
  .then(response => {
    console.log('HTTP Status Code:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Retrieved DB Records:', data);
  })
  .catch(error => console.error('Error fetching pets:', error));`
                })}
              </div>
            )}
          </div>

          {/* 2. GET /api/v1/pets/{petId} (GET BY ID) */}
          <div id="real-swag-endpoint-get-one" className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
            <button
              id="real-btn-toggle-get-by-id"
              onClick={() => setExpandedRoutes(prev => ({ ...prev, getPetById: !prev.getPetById }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.getPetById ? 'bg-blue-100/70' : 'bg-blue-50/70 hover:bg-blue-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">GET</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets/{'{petId}'}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Fetches individual record by query path parameter</span>
              </div>
              <span className="text-xs text-blue-700 font-mono font-bold">
                {expandedRoutes.getPetById ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.getPetById && (
              <div className="p-4 bg-white border-t border-blue-100 space-y-4" id="real-swag-body-get-by-id">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Search the server database for a single registered item. Enter a valid ID (like <code>101</code> or <code>102</code>) to receive a <code>200 OK</code> response, or input a non-existent index to audit <code>404 Not Found</code> error handler specs.
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="input-real-pet-id-get">
                      Path Parameter: petId (integer)
                    </label>
                    <input
                      id="input-real-pet-id-get"
                      type="text"
                      value={paramPetIdGet}
                      onChange={(e) => setParamPetIdGet(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-sm"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      id="real-btn-exec-get-pet-by-id"
                      onClick={handleExecuteGetPetById}
                      className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer animate-in duration-100"
                    >
                      Execute Network Request
                    </button>
                  </div>
                </div>

                {renderApiResponsePanel('getPetById', {
                  playwright: `import { test, expect } from '@playwright/test';

test('GET /api/v1/pets/${paramPetIdGet} individual validation', async ({ request }) => {
  const response = await request.get('${serverOrigin}/api/v1/pets/${paramPetIdGet}');
  
  if (response.status() === 200) {
    const pet = await response.json();
    expect(pet.id).toBe(${parseInt(paramPetIdGet, 10) || 101});
    expect(pet).toHaveProperty('name');
    expect(pet).toHaveProperty('status');
  } else {
    expect(response.status()).toBe(404);
  }
});`,
                  cypress: `describe('API ID Lookup', () => {
  it('should find or throw for pet ID ${paramPetIdGet}', () => {
    cy.request({
      method: 'GET',
      url: '${serverOrigin}/api/v1/pets/${paramPetIdGet}',
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        expect(response.body.id).to.eq(${parseInt(paramPetIdGet, 10) || 101});
      } else {
        expect(response.status).to.eq(404);
      }
    });
  });
});`,
                  fetch: `fetch('${serverOrigin}/api/v1/pets/${paramPetIdGet}')
  .then(async (response) => {
    console.log('Status:', response.status);
    const body = await response.json();
    console.log('Body Payload:', body);
  })
  .catch(err => console.error('Fetch exception:', err));`
                })}
              </div>
            )}
          </div>

          {/* 3. POST /api/v1/pets (CREATE A PET) */}
          <div id="real-swag-endpoint-post-pet" className="border border-emerald-200 rounded-lg overflow-hidden shadow-sm">
            <button
              id="real-btn-toggle-add-pet"
              onClick={() => setExpandedRoutes(prev => ({ ...prev, addPet: !prev.addPet }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.addPet ? 'bg-emerald-100/70' : 'bg-emerald-50/70 hover:bg-emerald-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">POST</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Appends a brand-new object record inside real storage</span>
              </div>
              <span className="text-xs text-emerald-700 font-mono font-bold">
                {expandedRoutes.addPet ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.addPet && (
              <div className="p-4 bg-white border-t border-emerald-100 space-y-4" id="real-swag-body-add-pet">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Post a new JSON record representation to server database. On successful creation, the server appends the record, dynamically assigns a unique auto-incremented primary <code>id</code>, and returns a <code>210/201 Created</code> status code.
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-150">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="input-real-add-body">
                      Request JSON Payload Body:
                    </label>
                    <textarea
                      id="input-real-add-body"
                      rows={5}
                      value={payloadAddBody}
                      onChange={(e) => setPayloadAddBody(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono shadow-sm text-slate-700"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">💡 Make sure 'name' property is present. Avoid duplicate payloads.</span>
                    <button
                      id="real-btn-exec-add-pet"
                      onClick={handleExecuteAddPet}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Execute Network Request
                    </button>
                  </div>
                </div>

                {renderApiResponsePanel('addPet', {
                  playwright: `import { test, expect } from '@playwright/test';

test('POST /api/v1/pets should create a new record', async ({ request }) => {
  const payload = ${payloadAddBody.trim()};
  
  const response = await request.post('${serverOrigin}/api/v1/pets', {
    data: payload
  });
  
  expect(response.status()).toBe(201);
  const data = await response.json();
  
  expect(data).toHaveProperty('id');
  expect(data.name).toBe('${getPropFromPayload(payloadAddBody, 'name', 'Rocky')}');
  expect(data.category).toBe('${getPropFromPayload(payloadAddBody, 'category', 'Canine')}');
  expect(data.status).toBe('${getPropFromPayload(payloadAddBody, 'status', 'available')}');
});`,
                  cypress: `describe('POST Creation Suite', () => {
    it('should create new pet object via REST', () => {
      const payload = ${payloadAddBody.trim()};
      
      cy.request('POST', '${serverOrigin}/api/v1/pets', payload).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq('${getPropFromPayload(payloadAddBody, 'name', 'Rocky')}');
      });
    });
});`,
                  fetch: `fetch('${serverOrigin}/api/v1/pets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(${payloadAddBody.trim()})
})
  .then(res => res.json())
  .then(data => console.log('Created Record Output:', data))
  .catch(err => console.error('POST Error:', err));`
                })}
              </div>
            )}
          </div>

          {/* 4. PUT /api/v1/pets (UPDATE A PET) */}
          <div id="real-swag-endpoint-put-pet" className="border border-amber-200 rounded-lg overflow-hidden shadow-sm">
            <button
              id="real-btn-toggle-update-pet"
              onClick={() => setExpandedRoutes(prev => ({ ...prev, updatePet: !prev.updatePet }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.updatePet ? 'bg-amber-100/70' : 'bg-amber-50/70 hover:bg-amber-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-amber-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">PUT</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Modifies properties of a matching record inside memory storage</span>
              </div>
              <span className="text-xs text-amber-700 font-mono font-bold">
                {expandedRoutes.updatePet ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.updatePet && (
              <div className="p-4 bg-white border-t border-amber-100 space-y-4" id="real-swag-body-update-pet">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Triggers a PUT request to update properties of an existing pet record. Ensure the target <code>id</code> exists inside the database. If it does, returns <code>200 OK</code> with updated properties, otherwise responds with <code>404 Not Found</code>.
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-150">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="input-real-update-body">
                      Request JSON Payload Body:
                    </label>
                    <textarea
                      id="input-real-update-body"
                      rows={5}
                      value={payloadUpdateBody}
                      onChange={(e) => setPayloadUpdateBody(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono shadow-sm text-slate-700"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">💡 Make sure target ID matches an active record from the Server Inspector.</span>
                    <button
                      id="real-btn-exec-update-pet"
                      onClick={handleExecuteUpdatePet}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Execute Network Request
                    </button>
                  </div>
                </div>

                {renderApiResponsePanel('updatePet', {
                  playwright: `import { test, expect } from '@playwright/test';

test('PUT /api/v1/pets should update record properties', async ({ request }) => {
  const payload = ${payloadUpdateBody.trim()};
  
  const response = await request.put('${serverOrigin}/api/v1/pets', {
    data: payload
  });
  
  if (response.status() === 200) {
    const data = await response.json();
    expect(data.id).toBe(${getPropFromPayload(payloadUpdateBody, 'id', 101)});
    expect(data.name).toBe('${getPropFromPayload(payloadUpdateBody, 'name', 'Buster Max')}');
  } else {
    expect(response.status()).toBe(404);
  }
});`,
                  cypress: `it('should put and verify updated pet', () => {
  const payload = ${payloadUpdateBody.trim()};
  
  cy.request({
    method: 'PUT',
    url: '${serverOrigin}/api/v1/pets',
    body: payload,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      expect(response.body.name).to.eq('${getPropFromPayload(payloadUpdateBody, 'name', 'Buster Max')}');
    } else {
      expect(response.status).to.eq(404);
    }
  });
});`,
                  fetch: `fetch('${serverOrigin}/api/v1/pets', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(${payloadUpdateBody.trim()})
})
  .then(res => res.json())
  .then(data => console.log('Update Complete:', data));`
                })}
              </div>
            )}
          </div>

          {/* 5. DELETE /api/v1/pets/{petId} (DELETE RECORD) */}
          <div id="real-swag-endpoint-delete-pet" className="border border-rose-200 rounded-lg overflow-hidden shadow-sm">
            <button
              id="real-btn-toggle-delete-pet"
              onClick={() => setExpandedRoutes(prev => ({ ...prev, deletePet: !prev.deletePet }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.deletePet ? 'bg-rose-100/70' : 'bg-rose-50/70 hover:bg-rose-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-rose-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">DELETE</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets/{'{petId}'}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Wipes record entirely out of the database structure</span>
              </div>
              <span className="text-xs text-rose-700 font-mono font-bold">
                {expandedRoutes.deletePet ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.deletePet && (
              <div className="p-4 bg-white border-t border-rose-100 space-y-4" id="real-swag-body-delete-pet">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Pass an ID inside path variables. If the database maps the identity, it discards the record entirely and outputs a successful JSON notification message body. Returns a <code>404 Not Found</code> for duplicate attempts.
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="input-real-pet-id-delete">
                      Path Parameter: petId (integer)
                    </label>
                    <input
                      id="input-real-pet-id-delete"
                      type="text"
                      value={paramPetIdDelete}
                      onChange={(e) => setParamPetIdDelete(e.target.value)}
                      placeholder="e.g. 104"
                      className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono shadow-sm"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      id="real-btn-exec-delete-pet"
                      onClick={handleExecuteDeletePet}
                      className="w-full sm:w-auto px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Execute Network Request
                    </button>
                  </div>
                </div>

                {renderApiResponsePanel('deletePet', {
                  playwright: `import { test, expect } from '@playwright/test';

test('DELETE /api/v1/pets/${paramPetIdDelete} record purge', async ({ request }) => {
  const response = await request.delete('${serverOrigin}/api/v1/pets/${paramPetIdDelete}');
  
  if (response.status() === 200) {
    const data = await response.json();
    expect(data.message).toContain('successfully deleted');
    expect(data.id).toBe(${parseInt(paramPetIdDelete, 10) || 104});
  } else {
    expect(response.status()).toBe(404);
  }
});`,
                  cypress: `it('should delete specified pet from database', () => {
  cy.request({
    method: 'DELETE',
    url: '${serverOrigin}/api/v1/pets/${paramPetIdDelete}',
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      expect(response.body.message).to.contain('successfully deleted');
    } else {
      expect(response.status).to.eq(404);
    }
  });
});`,
                  fetch: `fetch('${serverOrigin}/api/v1/pets/${paramPetIdDelete}', {
  method: 'DELETE'
})
  .then(res => {
    console.log('HTTP Deletion status:', res.status);
    return res.json();
  })
  .then(data => console.log('Response msg:', data));`
                })}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
