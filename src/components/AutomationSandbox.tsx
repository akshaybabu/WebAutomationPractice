/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GridItem } from '../types';
import { 
  Database, 
  HelpCircle, 
  Sliders, 
  Upload, 
  Layers, 
  Tv, 
  MousePointer, 
  AlertTriangle, 
  FileText, 
  PlusCircle, 
  ArrowUpDown,
  Search,
  X,
  Info,
  Keyboard,
  ShieldCheck,
  Lock,
  Unlock,
  ShieldAlert,
  RefreshCw,
  Terminal,
  Check,
  Globe,
  BookOpen
} from 'lucide-react';

interface AutomationSandboxProps {
  onAddLog: (event: string, elementId: string, details: string) => void;
}

const INITIAL_GRID_ITEMS: GridItem[] = [
  { id: '1', name: 'Albatross QA Micro-Controller', category: 'Hardware', sku: 'ALB-QA-882', price: 120.50, stock: 45, status: 'In Stock' },
  { id: '2', name: 'Spectre Shadow-DOM Locator Node', category: 'Hardware', sku: 'SPEC-SD-41', price: 89.99, stock: 4, status: 'Low Stock' },
  { id: '3', name: 'Playwright Browser Cluster License', category: 'Software', sku: 'PW-CL-2026', price: 2450.00, stock: 100, status: 'In Stock' },
  { id: '4', name: 'Selenium Retro WebDriver Connector', category: 'Software', sku: 'SEL-WD-3.1', price: 0.00, stock: 0, status: 'Out of Stock' },
  { id: '5', name: 'Cypress API Endpoints Interceptor', category: 'Software', sku: 'CYP-API-66', price: 320.00, stock: 12, status: 'In Stock' },
  { id: '6', name: 'Puppeteer Headless Rendering Unit', category: 'Hardware', sku: 'PUP-HR-99', price: 410.25, stock: 2, status: 'Low Stock' },
];

export default function AutomationSandbox({ onAddLog }: AutomationSandboxProps) {
  // --- Dropdowns & Radios State ---
  const [nativeSelect, setNativeSelect] = useState('');
  const [customSelectOpen, setCustomSelectOpen] = useState(false);
  const [customSelectValue, setCustomSelectValue] = useState('Select an option...');
  const [radioValue, setRadioValue] = useState('');
  const [checkboxState, setCheckboxState] = useState({
    optInLogs: true,
    optInWebhooks: false,
    strictMode: false
  });

  // --- Dynamic Slider ---
  const [sliderVal, setSliderVal] = useState(50);

  // --- Data Grid State ---
  const [gridItems, setGridItems] = useState<GridItem[]>(INITIAL_GRID_ITEMS);
  const [gridFilter, setGridFilter] = useState('All');
  const [gridSearch, setGridSearch] = useState('');
  const [sortField, setSortField] = useState<keyof GridItem | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // --- File Upload State ---
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Shadow DOM Ref ---
  const shadowHostRef = useRef<HTMLDivElement>(null);

  // --- Drag and Drop State ---
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropItems, setDropItems] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // --- Custom Modals & Dialogues ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [simulatedAlert, setSimulatedAlert] = useState<{
    visible: boolean;
    type: 'alert' | 'confirm' | 'prompt';
    message: string;
    promptValue?: string;
    result?: string;
  }>({ visible: false, type: 'alert', message: '' });

  // --- New states for added requirements ---
  // Double-clicks
  const [dblClickLocked, setDblClickLocked] = useState(true);
  const [dblClickWarning, setDblClickWarning] = useState('');

  // Keyboard action simulations
  const [kbdLastKey, setKbdLastKey] = useState('');
  const [kbdLastCode, setKbdLastCode] = useState('');
  const [kbdModifiers, setKbdModifiers] = useState({ ctrl: false, shift: false, alt: false, meta: false });
  const [shortcutMatched, setShortcutMatched] = useState(false);

  // Element enabled/disabled verifications
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [licenseCode, setLicenseCode] = useState('');
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [provisionedState, setProvisionedState] = useState<'idle' | 'success'>('idle');

  // Background validation
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditResults, setAuditResults] = useState<{
    duplicateIdsCount: number;
    emptyAriaLabels: number;
    inputsChecked: number;
    totalElements: number;
    errors: string[];
  } | null>(null);

  // --- Senior QA Training States ---
  // 1. Dynamic Loading Spinner
  const [qaFetchState, setQaFetchState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [qaFetchData, setQaFetchData] = useState<string[]>([]);
  
  // 2. Simulated HTTP Response Status Codes
  const [apiResponseCode, setApiResponseCode] = useState<string>('200');
  const [apiResponseResult, setApiResponseResult] = useState<{ status: number; message: string; data?: any } | null>(null);
  const [apiResponseLoading, setApiResponseLoading] = useState<boolean>(false);
  
  // 3. Multi-Select Tag Builder
  const [qaSelectedTools, setQaSelectedTools] = useState<string[]>(['Playwright']);
  
  // 4. Dynamic Hover Reveal hotspot
  const [isQaHovered, setIsQaHovered] = useState<boolean>(false);

  // --- Swagger Petstore Mock API Database & UI States ---
  const [swaggerPets, setSwaggerPets] = useState<any[]>([
    { id: 101, name: 'Buster', category: 'Canine', status: 'available' },
    { id: 102, name: 'Mittens', category: 'Feline', status: 'pending' },
    { id: 103, name: 'Bubbles', category: 'Fish', status: 'available' },
    { id: 104, name: 'Pip', category: 'Rodent', status: 'sold' }
  ]);
  const [swaggerExpanded, setSwaggerExpanded] = useState<Record<string, boolean>>({
    getPets: false,
    getPetById: false,
    addPet: false,
    updatePet: false,
    deletePet: false
  });
  
  // Route parameter inputs
  const [swagPetIdGet, setSwagPetIdGet] = useState<string>('101');
  const [swagPetIdDelete, setSwagPetIdDelete] = useState<string>('104');
  
  const [swagAddPetBody, setSwagAddPetBody] = useState<string>(
    JSON.stringify({ name: 'Rocky', category: 'Canine', status: 'available' }, null, 2)
  );
  const [swagUpdatePetBody, setSwagUpdatePetBody] = useState<string>(
    JSON.stringify({ id: 101, name: 'Buster Max', category: 'Canine', status: 'pending' }, null, 2)
  );

  // Active executing route responses
  const [swagResponse, setSwagResponse] = useState<Record<string, {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    durationMs: number;
  } | null>>({
    getPets: null,
    getPetById: null,
    addPet: null,
    updatePet: null,
    deletePet: null
  });

  const [swagActiveResponseTab, setSwagActiveResponseTab] = useState<Record<string, 'response' | 'code'>>({
    getPets: 'response',
    getPetById: 'response',
    addPet: 'response',
    updatePet: 'response',
    deletePet: 'response'
  });

  const [swagCodeLang, setSwagCodeLang] = useState<Record<string, 'playwright' | 'cypress' | 'fetch'>>({
    getPets: 'playwright',
    getPetById: 'playwright',
    addPet: 'playwright',
    updatePet: 'playwright',
    deletePet: 'playwright'
  });

  // --- Setup Shadow DOM ---
  useEffect(() => {
    if (shadowHostRef.current && !shadowHostRef.current.shadowRoot) {
      const shadowRoot = shadowHostRef.current.attachShadow({ mode: 'open' });
      
      // Shadow DOM Styles
      const style = document.createElement('style');
      style.textContent = `
        .shadow-container {
          padding: 14px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          font-family: ui-sans-serif, system-ui, sans-serif;
        }
        .shadow-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          display: block;
        }
        .shadow-input-field {
          width: 85%;
          padding: 6px 10px;
          font-size: 13px;
          border: 1px solid #94a3b8;
          border-radius: 6px;
          margin-bottom: 8px;
          box-sizing: border-box;
          outline: none;
        }
        .shadow-input-field:focus {
          border-color: #6366f1;
        }
        .shadow-action-btn {
          background-color: #4f46e5;
          color: white;
          border: none;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
        }
        .shadow-action-btn:hover {
          background-color: #4338ca;
        }
        .shadow-success-tag {
          margin-top: 8px;
          font-size: 11px;
          color: #16a34a;
          font-weight: 600;
          display: none;
        }
      `;
      shadowRoot.appendChild(style);

      // Shadow DOM Content
      const container = document.createElement('div');
      container.className = 'shadow-container';

      const title = document.createElement('span');
      title.className = 'shadow-title';
      title.textContent = 'Inside Shadow Boundary (Shadow DOM)';
      title.id = 'shadow-title-el';

      const input = document.createElement('input');
      input.className = 'shadow-input-field';
      input.placeholder = 'Type shadow key here...';
      input.id = 'shadow-input';

      const button = document.createElement('button');
      button.className = 'shadow-action-btn';
      button.textContent = 'Submit Key';
      button.id = 'shadow-btn';

      const success = document.createElement('div');
      success.className = 'shadow-success-tag';
      success.id = 'shadow-success-tag';
      success.textContent = '✓ Shadow Root Pierced Successfully!';

      // Attach event listeners inside Shadow Root
      button.addEventListener('click', () => {
        const value = input.value;
        success.style.display = 'block';
        success.textContent = `✓ Key Recorded: "${value}"`;
        // Post message to parent container context
        window.dispatchEvent(new CustomEvent('shadow-root-click', { detail: value }));
      });

      container.appendChild(title);
      container.appendChild(input);
      container.appendChild(button);
      container.appendChild(success);
      shadowRoot.appendChild(container);
    }

    // Listener for custom event dispatched from shadow DOM click
    const handleShadowClick = (e: Event) => {
      const value = (e as CustomEvent).detail;
      onAddLog('SHADOW_ROOT_SUBMIT', 'shadow-btn', `Shadow DOM button clicked. Input Key: "${value}"`);
    };

    window.addEventListener('shadow-root-click', handleShadowClick);
    return () => {
      window.removeEventListener('shadow-root-click', handleShadowClick);
    };
  }, [onAddLog]);

  // --- Listen to IFrame Events ---
  useEffect(() => {
    const handleIframeMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'IFRAME_CLICK') {
        onAddLog('IFRAME_EVENT', 'iframe-sandbox', `IFrame message received: "${e.data.details}" (Input text: "${e.data.inputVal}")`);
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [onAddLog]);

  // --- Sorting & Filtering for Grid ---
  const handleSort = (field: keyof GridItem) => {
    let asc = true;
    if (sortField === field) {
      asc = !sortAsc;
    }
    setSortField(field);
    setSortAsc(asc);

    const sorted = [...gridItems].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return asc ? aVal - bVal : bVal - aVal;
      }
      return asc 
        ? String(aVal).localeCompare(String(bVal)) 
        : String(bVal).localeCompare(String(aVal));
    });

    setGridItems(sorted);
    onAddLog('GRID_SORT', `grid-sort-${field}`, `Sorted Grid by: ${field} (${asc ? 'Ascending' : 'Descending'})`);
  };

  const filteredGridItems = gridItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(gridSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(gridSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(gridSearch.toLowerCase());
    
    const matchesStatus = gridFilter === 'All' || item.status === gridFilter;
    return matchesSearch && matchesStatus;
  });

  // --- File Upload simulation ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerFileUpload(file);
    }
  };

  const triggerFileUpload = (file: File) => {
    const sizeKB = (file.size / 1024).toFixed(1) + ' KB';
    onAddLog('FILE_UPLOAD_START', 'file-uploader-input', `Starting upload: "${file.name}" (${sizeKB})`);
    
    setUploadedFile({
      name: file.name,
      size: sizeKB,
      type: file.type || 'unknown/binary'
    });
    setUploadProgress(0);

    // Dynamic progress bar progression
    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 20;
      setUploadProgress(currentProg);
      if (currentProg >= 100) {
        clearInterval(interval);
        onAddLog('FILE_UPLOAD_SUCCESS', 'file-uploader-input', `Completed upload of: "${file.name}"`);
      }
    }, 150);
  };

  const handleDragOverFile = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      triggerFileUpload(file);
    }
  };

  // --- Drag and Drop Source & Target ---
  const handleDragStartItem = (e: React.DragEvent, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item);
    onAddLog('DRAG_START', `drag-item-${item.toLowerCase().replace(/\s+/g, '-')}`, `Dragging object: ${item}`);
  };

  const handleDragOverTarget = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeaveTarget = () => {
    setIsDragOver(false);
  };

  const handleDropItem = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const item = e.dataTransfer.getData('text/plain') || draggedItem;
    if (item && !dropItems.includes(item)) {
      const updated = [...dropItems, item];
      setDropItems(updated);
      onAddLog('DROP_SUCCESS', 'drag-target-zone', `Successfully deposited "${item}" into collection. Current Items: [${updated.join(', ')}]`);
    }
    setDraggedItem(null);
  };

  const clearDragSandbox = () => {
    setDropItems([]);
    onAddLog('DRAG_RESET', 'drag-reset-btn', 'Cleared drag and drop sandbox');
  };

  // --- Custom Dialog Trigger Actions ---
  const showCustomAlert = (type: 'alert' | 'confirm' | 'prompt', message: string) => {
    onAddLog('DIALOG_TRIGGER', `btn-trigger-${type}`, `Opened simulated browser ${type} dialogue`);
    setSimulatedAlert({
      visible: true,
      type,
      message,
      promptValue: type === 'prompt' ? 'QA Automation OK' : '',
      result: ''
    });
  };

  const handleDialogAction = (confirm: boolean) => {
    const dialogType = simulatedAlert.type;
    let desc = '';
    
    if (dialogType === 'alert') {
      desc = 'Alert dismissed';
    } else if (dialogType === 'confirm') {
      desc = `Confirm dialogue resolved: ${confirm ? 'ACCEPTED' : 'CANCELLED'}`;
    } else if (dialogType === 'prompt') {
      desc = `Prompt resolved. Action: ${confirm ? 'ACCEPTED' : 'CANCELLED'}. Returned Value: "${simulatedAlert.promptValue}"`;
    }

    onAddLog('DIALOG_RESOLVED', 'simulated-alert-modal', desc);
    
    setSimulatedAlert({
      ...simulatedAlert,
      visible: false,
      result: confirm ? (dialogType === 'prompt' ? simulatedAlert.promptValue || 'Accepted' : 'Accepted') : 'Cancelled'
    });
  };

  // Reset all elements
  const resetAllSandbox = () => {
    setNativeSelect('');
    setCustomSelectValue('Select an option...');
    setRadioValue('');
    setCheckboxState({ optInLogs: true, optInWebhooks: false, strictMode: false });
    setSliderVal(50);
    setGridItems(INITIAL_GRID_ITEMS);
    setGridFilter('All');
    setGridSearch('');
    setSortField(null);
    setUploadedFile(null);
    setUploadProgress(-1);
    setDropItems([]);
    setIsModalOpen(false);
    setModalInput('');
    // Reset newly added states
    setDblClickLocked(true);
    setDblClickWarning('');
    setKbdLastKey('');
    setKbdLastCode('');
    setKbdModifiers({ ctrl: false, shift: false, alt: false, meta: false });
    setShortcutMatched(false);
    setTermsAccepted(false);
    setLicenseCode('');
    setOverrideEnabled(false);
    setProvisionedState('idle');
    setAuditRunning(false);
    setAuditResults(null);
    
    // Reset Senior QA Training states
    setQaFetchState('idle');
    setQaFetchData([]);
    setApiResponseCode('200');
    setApiResponseResult(null);
    setApiResponseLoading(false);
    setQaSelectedTools(['Playwright']);
    setIsQaHovered(false);

    // Reset Swagger mock petstore states
    setSwaggerPets([
      { id: 101, name: 'Buster', category: 'Canine', status: 'available' },
      { id: 102, name: 'Mittens', category: 'Feline', status: 'pending' },
      { id: 103, name: 'Bubbles', category: 'Fish', status: 'available' },
      { id: 104, name: 'Pip', category: 'Rodent', status: 'sold' }
    ]);
    setSwaggerExpanded({
      getPets: false,
      getPetById: false,
      addPet: false,
      updatePet: false,
      deletePet: false
    });
    setSwagPetIdGet('101');
    setSwagPetIdDelete('104');
    setSwagAddPetBody(JSON.stringify({ name: 'Rocky', category: 'Canine', status: 'available' }, null, 2));
    setSwagUpdatePetBody(JSON.stringify({ id: 101, name: 'Buster Max', category: 'Canine', status: 'pending' }, null, 2));
    setSwagResponse({
      getPets: null,
      getPetById: null,
      addPet: null,
      updatePet: null,
      deletePet: null
    });
    setSwagActiveResponseTab({
      getPets: 'response',
      getPetById: 'response',
      addPet: 'response',
      updatePet: 'response',
      deletePet: 'response'
    });
    setSwagCodeLang({
      getPets: 'playwright',
      getPetById: 'playwright',
      addPet: 'playwright',
      updatePet: 'playwright',
      deletePet: 'playwright'
    });
    
    onAddLog('SANDBOX_RESET', 'btn-reset-entire-sandbox', 'Restored all sandbox variables to baseline configuration');
  };

  // --- Simulated Swagger Endpoint Request Executors ---
  const [copiedRoute, setCopiedRoute] = useState<string | null>(null);
  const handleCopyCode = (route: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRoute(route);
    onAddLog('API_CODE_COPY', `btn-copy-${route}`, `Copied automation test code snippet to clipboard for route: ${route}`);
    setTimeout(() => setCopiedRoute(null), 1800);
  };

  const executeSwagRoute = (
    route: 'getPets' | 'getPetById' | 'addPet' | 'updatePet' | 'deletePet',
    action: () => { status: number; statusText: string; body: any }
  ) => {
    onAddLog('API_SWAGGER_TRY', `btn-try-${route}`, `Triggered try-it-out simulation for swagger endpoint: ${route}`);
    const start = performance.now();
    setTimeout(() => {
      try {
        const result = action();
        const end = performance.now();
        const duration = Math.round(end - start) + 12; // Add minor offset for realistic network jitter
        setSwagResponse(prev => ({
          ...prev,
          [route]: {
            status: result.status,
            statusText: result.statusText,
            headers: {
              'content-type': 'application/json',
              'server': 'Kestrel/Mock-Petstore-v1',
              'date': new Date().toUTCString(),
              'cache-control': 'no-store, no-cache',
              'access-control-allow-origin': '*'
            },
            body: result.body,
            durationMs: duration
          }
        }));
        onAddLog('API_SWAGGER_RESPONSE', `btn-try-${route}`, `Swagger route ${route} returned status ${result.status} ${result.statusText} in ${duration}ms`);
      } catch (err: any) {
        setSwagResponse(prev => ({
          ...prev,
          [route]: {
            status: 500,
            statusText: 'Internal Error',
            headers: { 'content-type': 'application/json' },
            body: { error: 'Simulation failure', details: err.message },
            durationMs: 5
          }
        }));
      }
    }, 400);
  };

  const handleExecuteGetPets = () => {
    executeSwagRoute('getPets', () => {
      return {
        status: 200,
        statusText: 'OK',
        body: swaggerPets
      };
    });
  };

  const handleExecuteGetPetById = () => {
    executeSwagRoute('getPetById', () => {
      const id = parseInt(swagPetIdGet, 10);
      if (isNaN(id)) {
        return {
          status: 400,
          statusText: 'Bad Request',
          body: { error: 'Invalid ID format supplied. Expected number.' }
        };
      }
      const pet = swaggerPets.find(p => p.id === id);
      if (!pet) {
        return {
          status: 404,
          statusText: 'Not Found',
          body: { error: 'Pet not found', requestedId: id }
        };
      }
      return {
        status: 200,
        statusText: 'OK',
        body: pet
      };
    });
  };

  const handleExecuteAddPet = () => {
    executeSwagRoute('addPet', () => {
      let parsed: any;
      try {
        parsed = JSON.parse(swagAddPetBody);
      } catch (e) {
        return {
          status: 400,
          statusText: 'Bad Request',
          body: { error: 'Malformed JSON payload. Verification failed.' }
        };
      }
      if (!parsed.name) {
        return {
          status: 422,
          statusText: 'Unprocessable Entity',
          body: { error: 'Required validation property "name" is missing in post payload.' }
        };
      }
      const newId = swaggerPets.length > 0 ? Math.max(...swaggerPets.map(p => p.id)) + 1 : 101;
      const newPet = {
        id: newId,
        name: parsed.name,
        category: parsed.category || 'General',
        status: parsed.status || 'available'
      };
      setSwaggerPets(prev => [...prev, newPet]);
      return {
        status: 201,
        statusText: 'Created',
        body: newPet
      };
    });
  };

  const handleExecuteUpdatePet = () => {
    executeSwagRoute('updatePet', () => {
      let parsed: any;
      try {
        parsed = JSON.parse(swagUpdatePetBody);
      } catch (e) {
        return {
          status: 400,
          statusText: 'Bad Request',
          body: { error: 'Malformed JSON payload. Verification failed.' }
        };
      }
      const targetId = parseInt(parsed.id, 10);
      if (isNaN(targetId)) {
        return {
          status: 400,
          statusText: 'Bad Request',
          body: { error: 'Missing or invalid "id" parameter inside payload body.' }
        };
      }
      const exists = swaggerPets.some(p => p.id === targetId);
      if (!exists) {
        return {
          status: 404,
          statusText: 'Not Found',
          body: { error: 'Pet update rejected. ID not found in database.', targetId }
        };
      }
      const updatedPet = {
        id: targetId,
        name: parsed.name || 'Unnamed',
        category: parsed.category || 'General',
        status: parsed.status || 'available'
      };
      setSwaggerPets(prev => prev.map(p => p.id === targetId ? updatedPet : p));
      return {
        status: 200,
        statusText: 'OK',
        body: updatedPet
      };
    });
  };

  const handleExecuteDeletePet = () => {
    executeSwagRoute('deletePet', () => {
      const id = parseInt(swagPetIdDelete, 10);
      if (isNaN(id)) {
        return {
          status: 400,
          statusText: 'Bad Request',
          body: { error: 'Invalid ID format supplied.' }
        };
      }
      const exists = swaggerPets.some(p => p.id === id);
      if (!exists) {
        return {
          status: 404,
          statusText: 'Not Found',
          body: { error: 'Target pet not found. Deletion ignored.', targetId: id }
        };
      }
      setSwaggerPets(prev => prev.filter(p => p.id !== id));
      return {
        status: 200,
        statusText: 'OK',
        body: { message: 'Pet successfully deleted from the store database.', id }
      };
    });
  };

  const getSafePetName = (jsonStr: string, defaultName: string) => {
    try {
      const obj = JSON.parse(jsonStr);
      return obj.name || defaultName;
    } catch {
      return defaultName;
    }
  };

  const getSafePetId = (jsonStr: string, defaultId: number) => {
    try {
      const obj = JSON.parse(jsonStr);
      return obj.id || defaultId;
    } catch {
      return defaultId;
    }
  };

  const renderSwaggerResponse = (
    route: 'getPets' | 'getPetById' | 'addPet' | 'updatePet' | 'deletePet',
    pwCode: string,
    cyCode: string,
    fetchCode: string
  ) => {
    const resp = swagResponse[route];
    const activeTab = swagActiveResponseTab[route];
    const activeLang = swagCodeLang[route];

    const currentCode = activeLang === 'playwright' ? pwCode : activeLang === 'cypress' ? cyCode : fetchCode;

    return (
      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50/50" id={`swagger-response-panel-${route}`}>
        {/* Header with main toggle tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-1.5">
          <div className="flex gap-2">
            <button
              id={`tab-btn-response-${route}`}
              onClick={() => setSwagActiveResponseTab(prev => ({ ...prev, [route]: 'response' }))}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'response'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Response Console
            </button>
            <button
              id={`tab-btn-code-${route}`}
              onClick={() => setSwagActiveResponseTab(prev => ({ ...prev, [route]: 'code' }))}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Automation Test Code 🎓
            </button>
          </div>
          
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">
            {activeTab === 'response' ? 'SIMULATED NETWORK INTERCEPT' : 'SDET LEARNING TEMPLATE'}
          </span>
        </div>

        {/* Tab 1: Response Console */}
        {activeTab === 'response' && (
          <div className="p-3.5 space-y-3 min-h-[110px]" id={`console-view-${route}`}>
            {!resp ? (
              <div className="flex flex-col items-center justify-center min-h-[90px] text-center text-slate-400">
                <span className="text-lg">⚡</span>
                <p className="text-xs italic mt-1">No execution history. Click the "Try it out" button above to negotiate with mock server.</p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-100">
                {/* Header Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Response Status:</span>
                    <span
                      id={`lbl-status-${route}`}
                      className={`px-2 py-0.5 rounded font-bold border ${
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
                  <span className="text-slate-400" id={`lbl-time-${route}`}>
                    Latency: <strong className="text-slate-700 font-bold">{resp.durationMs} ms</strong>
                  </span>
                </div>

                {/* Response Headers */}
                <details className="group border border-slate-200/60 rounded-lg overflow-hidden bg-white">
                  <summary className="bg-slate-50 px-3 py-1.5 text-[10px] font-mono text-slate-500 font-bold cursor-pointer select-none hover:text-slate-700 flex justify-between items-center">
                    <span>Response Headers (JSON metadata)</span>
                    <span className="text-slate-400 font-normal group-open:hidden">▶ Show</span>
                    <span className="text-slate-400 font-normal hidden group-open:inline">▼ Hide</span>
                  </summary>
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 text-[10px] font-mono text-slate-600 space-y-0.5 leading-snug">
                    {Object.entries(resp.headers).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400 font-semibold">{k}:</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </details>

                {/* Response Body Raw JSON */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">Response Body (JSON Payload):</span>
                  <pre
                    id={`json-response-${route}`}
                    className="p-3 bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[10px] leading-relaxed rounded-lg overflow-x-auto max-h-[180px] shadow-inner"
                  >
                    {JSON.stringify(resp.body, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Automation Test Code */}
        {activeTab === 'code' && (
          <div className="p-3.5 space-y-3" id={`code-view-${route}`}>
            <p className="text-[11px] text-slate-500 leading-normal">
              Freshers can paste this script directly into their test suites to automate assertions. Click buttons to switch framework syntaxes.
            </p>

            {/* Sub-Header framework selector */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {(['playwright', 'cypress', 'fetch'] as const).map((lang) => (
                  <button
                    key={lang}
                    id={`btn-select-lang-${route}-${lang}`}
                    onClick={() => setSwagCodeLang(prev => ({ ...prev, [route]: lang }))}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-colors cursor-pointer capitalize ${
                      activeLang === lang
                        ? 'bg-slate-900 text-white shadow'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lang === 'playwright' ? 'Playwright API' : lang === 'cypress' ? 'Cypress cy.request' : 'Native Fetch'}
                  </button>
                ))}
              </div>

              <button
                id={`btn-copy-${route}`}
                onClick={() => handleCopyCode(route, currentCode)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-800 text-[10px] font-mono font-bold rounded shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {copiedRoute === route ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-sans">
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </span>
                ) : (
                  <span>Copy Code</span>
                )}
              </button>
            </div>

            {/* Code Highlight Box */}
            <pre
              id={`code-highlight-${route}`}
              className="p-3 bg-slate-950 border border-slate-800 text-indigo-200 font-mono text-[10px] leading-relaxed rounded-lg overflow-x-auto shadow-inner max-h-[220px]"
            >
              {currentCode}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="automation-sandbox-container" className="space-y-6">
      {/* Sandbox Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 custom-shadow">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-800" id="sandbox-hub-title">
            Automation Elements & Objects Sandbox
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Standard target controls to evaluate Locators, Selectors, Frame switches, Shadow Boundaries, and Upload simulations.
          </p>
        </div>
        <button
          id="btn-reset-entire-sandbox"
          onClick={resetAllSandbox}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all border border-slate-200 shrink-0 self-start md:self-auto"
        >
          Reset Sandbox Sandbox
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: BASIC CONTROLS & SPECIAL OBJECTS (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* LAB 1: INTERACTIVE DATA GRID (SORTING, SEARCH, FILTERS) */}
          <div id="grid-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-sm">Interactive Catalog Grid</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                GRID_ID: #catalog-grid
              </span>
            </div>

            {/* Grid Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4" id="grid-controls">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="grid-search-input"
                  type="text"
                  placeholder="Search catalog by name, sku..."
                  value={gridSearch}
                  onChange={(e) => {
                    setGridSearch(e.target.value);
                    onAddLog('ON_CHANGE', 'grid-search-input', `Grid search query: "${e.target.value}"`);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 shrink-0">Filter Status:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 w-full" id="grid-status-filters">
                  {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
                    <button
                      key={status}
                      id={`filter-btn-${status.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => {
                        setGridFilter(status);
                        onAddLog('GRID_FILTER', `filter-btn-${status.toLowerCase()}`, `Filtered products by status: "${status}"`);
                      }}
                      className={`flex-1 text-[10px] font-medium py-1 px-1.5 rounded transition-all ${
                        gridFilter === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catalog Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[300px] rounded-lg border border-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
              <table className="w-full text-left border-collapse" id="catalog-grid">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono tracking-wider border-b border-slate-100 select-none">
                    <th className="py-2.5 px-3">
                      <button 
                        id="sort-btn-name"
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 font-mono font-bold hover:text-indigo-600 transition-colors"
                      >
                        Item Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">
                      <button 
                        id="sort-btn-price"
                        onClick={() => handleSort('price')}
                        className="flex items-center gap-1 font-mono font-bold hover:text-indigo-600 transition-colors"
                      >
                        Price <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-2.5 px-3">
                      <button 
                        id="sort-btn-stock"
                        onClick={() => handleSort('stock')}
                        className="flex items-center gap-1 font-mono font-bold hover:text-indigo-600 transition-colors"
                      >
                        Stock <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-2.5 px-3">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredGridItems.length === 0 ? (
                    <tr id="grid-empty-row">
                      <td colSpan={5} className="text-center py-6 text-slate-400 italic">
                        No catalog items found.
                      </td>
                    </tr>
                  ) : (
                    filteredGridItems.map((item) => (
                      <tr 
                        key={item.id} 
                        id={`grid-row-id-${item.id}`} 
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-medium text-slate-800" id={`item-name-${item.id}`}>{item.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]" id={`item-sku-${item.id}`}>{item.sku}</td>
                        <td className="py-2.5 px-3 font-semibold font-mono text-slate-700" id={`item-price-${item.id}`}>${item.price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600" id={`item-stock-${item.id}`}>{item.stock} units</td>
                        <td className="py-2.5 px-3">
                          <span 
                            id={`item-status-pill-${item.id}`}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-red-50 text-red-700 border border-red-100'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* LAB 2: DROPDOWNS, SLIDERS, RADIO BUTTONS, AND VALUE SETTERS */}
          <div id="controls-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-sm">Dropdowns, Sliders & Radios</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                LAB_ID: #controls-lab
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Native & Custom Dropdowns */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="native-select-dropdown">
                    Standard Native Dropdown Selector
                  </label>
                  <select
                    id="native-select-dropdown"
                    value={nativeSelect}
                    onChange={(e) => {
                      setNativeSelect(e.target.value);
                      onAddLog('SELECT_NATIVE', 'native-select-dropdown', `Option selected: "${e.target.value}"`);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-700 shadow-sm"
                  >
                    <option value="">-- Choose Option --</option>
                    <option value="node-chromium">Playwright Chrome Node</option>
                    <option value="node-webkit">Playwright Webkit Node</option>
                    <option value="node-firefox">Playwright Firefox Node</option>
                    <option value="remote-selenium">Selenium Grid Hub</option>
                  </select>
                </div>

                {/* Custom Div-based Searchable Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Custom Div-Based Dropdown (Simulated Select)
                  </label>
                  <div
                    id="custom-select-trigger"
                    onClick={() => {
                      setCustomSelectOpen(!customSelectOpen);
                      onAddLog('DROPDOWN_TOGGLE', 'custom-select-trigger', `Custom listbox state toggled. Now open: ${!customSelectOpen}`);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 cursor-pointer flex justify-between items-center hover:border-slate-300 shadow-sm"
                  >
                    <span id="custom-select-current-value">{customSelectValue}</span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </div>

                  {customSelectOpen && (
                    <div id="custom-select-options-list" className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-50">
                      {['Local Run Pipeline', 'Parallel Cloud Run', 'GitHub Actions Hook', 'Manual Trigger'].map((opt) => (
                        <div
                          key={opt}
                          id={`custom-option-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => {
                            setCustomSelectValue(opt);
                            setCustomSelectOpen(false);
                            onAddLog('SELECT_CUSTOM', `custom-option-${opt.toLowerCase().replace(/\s+/g, '-')}`, `Custom listbox choice committed: "${opt}"`);
                          }}
                          className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Range Sliders / Dynamic Values */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-700" htmlFor="automation-slider">
                      Dynamic Set Values Range Slider
                    </label>
                    <span id="slider-value-display" className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {sliderVal}%
                    </span>
                  </div>
                  <input
                    id="automation-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSliderVal(val);
                      onAddLog('ON_INPUT', 'automation-slider', `Value adjusted to: ${val}`);
                    }}
                    className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-xl appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Checkboxes & Radio options */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {/* Radio Group */}
                <div>
                  <span className="block text-xs font-medium text-slate-700 mb-2">Select Execution Environment (Radio)</span>
                  <div className="space-y-2" id="radio-group-container">
                    {[
                      { id: 'env-prod', label: 'Production Node (US-West)' },
                      { id: 'env-staging', label: 'Staging Environment' },
                      { id: 'env-dev', label: 'Development Pipeline' },
                    ].map((rad) => (
                      <label key={rad.id} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          id={rad.id}
                          type="radio"
                          name="execution-env"
                          value={rad.id}
                          checked={radioValue === rad.id}
                          onChange={() => {
                            setRadioValue(rad.id);
                            onAddLog('RADIO_SELECT', rad.id, `Selected environment configuration: "${rad.label}"`);
                          }}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300"
                        />
                        <span className="text-xs text-slate-600" id={`label-${rad.id}`}>{rad.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Checkbox Group */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="block text-xs font-medium text-slate-700 mb-2">Sandbox Logging Flags</span>
                  <div className="space-y-2" id="checkbox-group-container">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        id="chk-opt-in-logs"
                        type="checkbox"
                        checked={checkboxState.optInLogs}
                        onChange={(e) => {
                          const state = e.target.checked;
                          setCheckboxState({ ...checkboxState, optInLogs: state });
                          onAddLog('CHECKBOX_TOGGLE', 'chk-opt-in-logs', `Opt-in live logs toggled: ${state}`);
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300"
                      />
                      <span className="text-xs text-slate-600">Mirror output telemetry stream</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        id="chk-opt-in-webhooks"
                        type="checkbox"
                        checked={checkboxState.optInWebhooks}
                        onChange={(e) => {
                          const state = e.target.checked;
                          setCheckboxState({ ...checkboxState, optInWebhooks: state });
                          onAddLog('CHECKBOX_TOGGLE', 'chk-opt-in-webhooks', `Opt-in external webhooks toggled: ${state}`);
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300"
                      />
                      <span className="text-xs text-slate-600">Simulate Slack webhook dispatches</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        id="chk-strict-mode"
                        type="checkbox"
                        checked={checkboxState.strictMode}
                        onChange={(e) => {
                          const state = e.target.checked;
                          setCheckboxState({ ...checkboxState, strictMode: state });
                          onAddLog('CHECKBOX_TOGGLE', 'chk-strict-mode', `Strict validation toggled: ${state}`);
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300"
                      />
                      <span className="text-xs text-slate-600">Enforce strict data constraints</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LAB 3: SHADOW DOM & IFRAME PRACTICE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shadow DOM Box */}
            <div id="shadow-dom-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-semibold text-slate-800 text-sm">Shadow Root Element Lab</h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                    #shadow-host
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  This component mounts an isolated shadow DOM boundary. Automated scripts cannot select internal fields using normal DOM lookup; they must drill using shadow-root selectors.
                </p>
                
                {/* Mount target for shadow DOM */}
                <div id="shadow-host" ref={shadowHostRef}></div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                {"💡 Playwright: locator('#shadow-host >> #shadow-input')"}
              </div>
            </div>

            {/* IFrame Box */}
            <div id="iframe-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-semibold text-slate-800 text-sm">Nested IFrame Container</h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                    #iframe-sandbox
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  A self-contained HTML frame that sits in another frame context. Your scripts must switch context to `#iframe-sandbox` before inputting values.
                </p>

                {/* Real self-contained iframe with srcdoc */}
                <iframe
                  id="iframe-sandbox"
                  title="QA Automation IFrame Target"
                  className="w-full h-[155px] border border-slate-200 rounded-xl bg-slate-50 shadow-inner"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <style>
                        body {
                          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
                          padding: 12px;
                          margin: 0;
                          background-color: #fafafa;
                          color: #334155;
                        }
                        .frame-title {
                          font-size: 13px;
                          font-weight: bold;
                          color: #0f172a;
                          margin-bottom: 6px;
                          display: block;
                        }
                        .input-box {
                          width: 80%;
                          padding: 6px;
                          font-size: 12px;
                          border: 1px solid #cbd5e1;
                          border-radius: 4px;
                          margin-bottom: 8px;
                          box-sizing: border-box;
                          outline: none;
                        }
                        .input-box:focus {
                          border-color: #6366f1;
                        }
                        .btn-send {
                          background-color: #0284c7;
                          color: white;
                          border: none;
                          padding: 6px 12px;
                          font-size: 11px;
                          font-weight: 500;
                          border-radius: 4px;
                          cursor: pointer;
                        }
                        .btn-send:hover {
                          background-color: #0369a1;
                        }
                        .badge {
                          display: inline-block;
                          background-color: #e0f2fe;
                          color: #0369a1;
                          font-size: 9px;
                          padding: 2px 6px;
                          border-radius: 4px;
                          margin-bottom: 8px;
                          font-family: monospace;
                        }
                      </style>
                    </head>
                    <body>
                      <span class="badge">IFRAME ENVIRONMENT</span>
                      <span class="frame-title">Isolated Context Sub-Form</span>
                      <input type="text" id="iframe-input" class="input-box" placeholder="Write inside frame..." />
                      <button id="iframe-btn" class="btn-send" onclick="sendToParent()">Signal Parent Frame</button>

                      <script>
                        function sendToParent() {
                          var val = document.getElementById('iframe-input').value;
                          window.parent.postMessage({
                            type: 'IFRAME_CLICK',
                            details: 'Button #iframe-btn inside iframe clicked',
                            inputVal: val
                          }, '*');
                          
                          var btn = document.getElementById('iframe-btn');
                          btn.textContent = '✓ Signalled!';
                          setTimeout(function() {
                            btn.textContent = 'Signal Parent Frame';
                          }, 1500);
                        }
                      </script>
                    </body>
                    </html>
                  `}
                ></iframe>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                💡 Playwright: `frame_locator('#iframe-sandbox')`
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REORDERING, FILE UPLOAD, ALERTS & POPUPS (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* LAB 4: ALERT & POPUP SIMULATOR */}
          <div id="alerts-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-sm">Simulated Alert Dialogues</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                LAB_ID: #alerts-lab
              </span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              Trigger simulated alerts, confirmation dialogs, and text prompts. Real browser popups block automation in frame sandboxes, so we simulate exact overlay structures to test modal logic.
            </p>

            <div className="space-y-2.5" id="alert-buttons-group">
              <button
                id="btn-trigger-alert"
                onClick={() => showCustomAlert('alert', 'System Alert: Secure API connection handshake established successfully.')}
                className="w-full text-left px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-between transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer"
              >
                <span>Trigger Simple Dialog Alert</span>
                <span className="text-[10px] font-mono text-indigo-400">#btn-trigger-alert</span>
              </button>

              <button
                id="btn-trigger-confirm"
                onClick={() => showCustomAlert('confirm', 'Confirm Action: Do you authorize destroying the temporary staging server configurations?')}
                className="w-full text-left px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-between transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer"
              >
                <span>Trigger Confirm Dialogue</span>
                <span className="text-[10px] font-mono text-indigo-400">#btn-trigger-confirm</span>
              </button>

              <button
                id="btn-trigger-prompt"
                onClick={() => showCustomAlert('prompt', 'System Prompt: Please enter the automation deployment branch name to continue:')}
                className="w-full text-left px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-between transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] duration-150 cursor-pointer"
              >
                <span>Trigger Text Prompt</span>
                <span className="text-[10px] font-mono text-indigo-400">#btn-trigger-prompt</span>
              </button>
            </div>

            {/* Displaying Dialogue Result */}
            {simulatedAlert.result && (
              <div id="dialogue-result-display" className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] font-mono">
                <span className="text-slate-400 uppercase text-[9px] block font-bold mb-0.5">Last Dialogue Result:</span>
                <span className="text-slate-700 font-semibold" id="dialogue-result-value">"{simulatedAlert.result}"</span>
              </div>
            )}
          </div>

          {/* LAB 5: DRAG & DROP CODES */}
          <div id="drag-drop-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">Drag & Drop Deposit Zone</h3>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                  #drag-target-zone
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Pick up a high-level configuration token block and drop it inside the target container zone.
              </p>

              {/* Draggable Sources */}
              <div className="space-y-2 mb-4" id="draggable-items-source">
                {['Security Token API', 'Cloud Config Node', 'Staging Database Auth Key'].map((item) => {
                  const itemSlug = item.toLowerCase().replace(/\s+/g, '-');
                  const isDeposited = dropItems.includes(item);
                  return (
                    <div
                      key={item}
                      id={`drag-item-${itemSlug}`}
                      draggable={!isDeposited}
                      onDragStart={(e) => handleDragStartItem(e, item)}
                      className={`px-3 py-2 border rounded-xl text-xs font-mono select-none flex items-center justify-between ${
                        isDeposited 
                          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through' 
                          : 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100 text-indigo-700 cursor-grab active:cursor-grabbing font-medium'
                      }`}
                    >
                      <span>{item}</span>
                      {!isDeposited && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.2 rounded font-bold">DRAG ME</span>}
                    </div>
                  );
                })}
              </div>

              {/* Droppable Target */}
              <div
                id="drag-target-zone"
                onDragOver={handleDragOverTarget}
                onDragLeave={handleDragLeaveTarget}
                onDrop={handleDropItem}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                  isDragOver 
                    ? 'border-indigo-500 bg-indigo-50/30 text-indigo-800' 
                    : dropItems.length > 0 
                      ? 'border-emerald-300 bg-emerald-50/10' 
                      : 'border-slate-300 bg-slate-50 text-slate-400'
                }`}
              >
                {dropItems.length === 0 ? (
                  <div className="py-4">
                    <span className="block text-xs font-semibold mb-1" id="drop-zone-instructions">Drop Sandbox Keys Here</span>
                    <p className="text-[10px] text-slate-400">Drag items from list above</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-left">
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1 font-mono">Deposited Sandbox Keys ({dropItems.length}):</span>
                    {dropItems.map((deposited) => (
                      <div 
                        key={deposited} 
                        id={`deposited-item-${deposited.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-xs bg-white py-1 px-2.5 rounded border border-emerald-100 text-emerald-800 font-mono shadow-sm flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {deposited}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {dropItems.length > 0 && (
              <button
                id="drag-reset-btn"
                onClick={clearDragSandbox}
                className="w-full mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold font-mono transition-all border border-slate-200 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                Clear Dropped Items
              </button>
            )}
          </div>

          {/* LAB 6: FILE UPLOAD SIMULATOR */}
          <div id="upload-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">File Upload Simulator</h3>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                  #file-uploader-input
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Choose a local file or drop it inside the target boundary. Useful for testing upload dialog automation routines.
              </p>

              {/* Upload Drop Zone */}
              <div
                id="upload-drop-zone"
                onDragOver={handleDragOverFile}
                onDrop={handleDropFile}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-5 text-center cursor-pointer transition-all"
              >
                <input
                  id="file-uploader-input"
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 block" id="upload-label-desc">Select or Drag File</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, JSON, CSV, PNG, etc.</p>
                </div>
              </div>

              {/* Upload File Details */}
              {uploadedFile && (
                <div id="upload-file-details-panel" className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="text-xs font-mono min-w-0 flex-1">
                      <span className="font-semibold text-slate-700 block truncate" id="uploaded-file-name">{uploadedFile.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5" id="uploaded-file-size">Size: {uploadedFile.size} | Format: {uploadedFile.type}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploadProgress >= 0 && (
                    <div className="space-y-1" id="upload-progress-container">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-indigo-600">
                        <span>Uploading File Progress:</span>
                        <span id="upload-progress-percentage">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          id="file-upload-progress-bar"
                          className="h-full bg-indigo-600 transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {uploadProgress === 100 && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono font-semibold" id="upload-complete-indicator">
                      ✓ Upload complete! Telemetry successfully recorded.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {uploadedFile && (
              <button
                id="upload-reset-btn"
                onClick={() => {
                  setUploadedFile(null);
                  setUploadProgress(-1);
                  onAddLog('UPLOAD_RESET', 'upload-reset-btn', 'Cleared uploaded files cache');
                }}
                className="w-full mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold font-mono transition-all border border-slate-200 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                Remove Uploaded File
              </button>
            )}
          </div>

          {/* LAB 7: OVERLAYS, MODALS, AND TOOLTIPS */}
          <div id="overlays-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-sm">Overlays, Modals & Tooltips</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                LAB_ID: #overlays-lab
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Practice opening overlay modals and hovering to reveal tooltips. Testers must locate dynamic dialog wrappers.
            </p>

            <div className="space-y-4">
              {/* Tooltip Hover Section */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-700">Tooltip Locator Target</span>
                  <p className="text-[10px] text-slate-400">Hover trigger element to reveal tooltip content</p>
                </div>

                {/* Styled Tooltip Element */}
                <div className="relative group inline-block">
                  <div
                    id="tooltip-trigger-el"
                    onMouseEnter={() => onAddLog('MOUSE_HOVER', 'tooltip-trigger-el', 'Mouse entered tooltip hotspot')}
                    onMouseLeave={() => onAddLog('MOUSE_LEAVE', 'tooltip-trigger-el', 'Mouse exited tooltip hotspot')}
                    className="p-1.5 bg-slate-800 text-slate-100 hover:bg-indigo-600 hover:text-white rounded-xl transition-all hover:scale-105 shadow-sm cursor-help"
                  >
                    <HelpCircle className="w-4.5 h-4.5" />
                  </div>
                  
                  {/* Floating Content */}
                  <div 
                    id="tooltip-content"
                    className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2.5 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl border border-slate-800 z-30 font-mono text-center leading-normal"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-400 inline mb-1" />
                    <span className="block font-sans font-bold text-slate-200">Locator verified!</span>
                    Selector ID: #tooltip-content is now visible.
                  </div>
                </div>
              </div>

              {/* Modal Trigger Section */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-700">Dynamic Modal Window</span>
                  <p className="text-[10px] text-slate-400">Requires waiting and dismissal</p>
                </div>
                
                <button
                  id="btn-open-modal"
                  onClick={() => {
                    setIsModalOpen(true);
                    onAddLog('MODAL_OPEN', 'btn-open-modal', 'Opened overlay modal dialogue');
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Open Modal
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ADVANCED AUTOMATION TESTING ZONE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Double Click + Keyboard Shortcuts + Background Audit (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Double Click Gate */}
            <div id="double-click-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-semibold text-slate-800 text-sm">Double Click Lock Switch</h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                    #btn-double-click-lock
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Requires a rapid native double-click event to unlock. Single clicks will trigger a warning, allowing automation scripts to verify state differences.
                </p>

                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    dblClickLocked ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {dblClickLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block">Lock Status:</span>
                    <span className={`text-xs font-bold font-mono ${dblClickLocked ? 'text-rose-600' : 'text-emerald-600'}`} id="lock-status-label">
                      {dblClickLocked ? 'SECURED_LOCKED' : 'SYSTEM_UNLOCKED'}
                    </span>
                  </div>

                  <button
                    id="btn-double-click-lock"
                    onClick={() => {
                      setDblClickWarning('Warning: Single click detected. Secure gate requires rapid DOUBLE CLICK to cycle state!');
                      onAddLog('CLICK_WARNING', 'btn-double-click-lock', 'Single click registered. Cycle request rejected: Double click required.');
                      setTimeout(() => setDblClickWarning(''), 3000);
                    }}
                    onDoubleClick={() => {
                      setDblClickLocked(!dblClickLocked);
                      setDblClickWarning('');
                      onAddLog('DBL_CLICK', 'btn-double-click-lock', `Double click event recognized successfully. Lock state transitioned to: ${!dblClickLocked ? 'UNLOCKED' : 'LOCKED'}`);
                    }}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-semibold font-mono transition-all duration-150 shadow-sm active:scale-95 cursor-pointer ${
                      dblClickLocked 
                        ? 'bg-rose-600 text-white hover:bg-rose-700' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {dblClickLocked ? 'Double Click to Open' : 'Double Click to Secure'}
                  </button>

                  {dblClickWarning && (
                    <p className="text-[10px] text-amber-600 font-medium text-center leading-snug animate-bounce mt-1" id="dblclick-warning-text">
                      ⚠️ {dblClickWarning}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                💡 Playwright: `locator('#btn-double-click-lock').dblclick()`
              </div>
            </div>

            {/* Keyboard Shortcut Simulator */}
            <div id="keyboard-shortcut-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-semibold text-slate-800 text-sm">Keyboard Shortcut Simulator</h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                    #keyboard-simulation-input
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Focus this input field and perform keystrokes. Try the hotkey combination <kbd className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600 font-mono text-[10px]">Ctrl + Shift + K</kbd> to unlock a secret.
                </p>

                <div className="space-y-3">
                  <div>
                    <input
                      id="keyboard-simulation-input"
                      type="text"
                      placeholder="Focus and type here to record..."
                      onKeyDown={(e) => {
                        e.preventDefault();
                        const key = e.key;
                        const code = e.code;
                        const ctrl = e.ctrlKey;
                        const shift = e.shiftKey;
                        const alt = e.altKey;
                        const meta = e.metaKey;

                        setKbdLastKey(key);
                        setKbdLastCode(code);
                        setKbdModifiers({ ctrl, shift, alt, meta });

                        let modDetails = [];
                        if (ctrl) modDetails.push('Ctrl');
                        if (shift) modDetails.push('Shift');
                        if (alt) modDetails.push('Alt');
                        if (meta) modDetails.push('Meta');
                        const modStr = modDetails.length > 0 ? ` [${modDetails.join('+')}]` : '';

                        onAddLog('KEY_DOWN', 'keyboard-simulation-input', `Key: "${key}" | Code: "${code}"${modStr}`);

                        // Shortcut validation
                        if (ctrl && shift && (key === 'K' || key === 'k' || key === 'л' || key === 'Л')) {
                          setShortcutMatched(true);
                          onAddLog('KEYBOARD_SHORTCUT', 'keyboard-simulation-input', 'Success: Shortcut combination [Ctrl+Shift+K] activated secret webhook simulation!');
                          setTimeout(() => setShortcutMatched(false), 4000);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-mono shadow-sm placeholder:text-slate-400 text-center"
                    />
                  </div>

                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">Recorded Key:</span>
                      <span className="text-emerald-400 font-bold" id="kbd-key-val">{kbdLastKey || 'None'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">DOM Code:</span>
                      <span className="text-amber-400" id="kbd-code-val">{kbdLastCode || 'None'}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Modifiers:</span>
                      <span className="text-indigo-400 text-[10px]" id="kbd-modifiers-val">
                        Ctrl: {kbdModifiers.ctrl ? 'Y' : 'N'} | 
                        Shift: {kbdModifiers.shift ? 'Y' : 'N'} | 
                        Alt: {kbdModifiers.alt ? 'Y' : 'N'} | 
                        Meta: {kbdModifiers.meta ? 'Y' : 'N'}
                      </span>
                    </div>
                  </div>

                  {shortcutMatched && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center text-emerald-800 text-[10px] font-mono leading-tight animate-bounce" id="kbd-shortcut-success-banner">
                      🎉 <strong>Combo Unlocked!</strong> Secret testing token has been broadcasted via dynamic simulation event console.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                💡 Playwright: `locator('#keyboard-simulation-input').press('Control+Shift+K')`
              </div>
            </div>

          </div>

          {/* Background Audit Hub */}
          <div id="background-validation-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-sm">Background System Validation Hub</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                LAB_ID: #bg-audit-hub
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Trigger background system audits to check page integrity. This validation runs checks on active elements, DOM ID sanitary values, duplicates, and accessibility markup attributes across the loaded viewport context.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scan Controller */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">Verify DOM Sanitary Rules</span>
                  <p className="text-[10px] text-slate-400">Launches a silent background analysis thread that audits compliance metrics across DOM element trees.</p>
                </div>

                <button
                  id="btn-run-background-validation"
                  disabled={auditRunning}
                  onClick={() => {
                    setAuditRunning(true);
                    setAuditResults(null);
                    onAddLog('AUDIT_START', 'btn-run-background-validation', 'Laid down background verification thread. Parsing active document attributes...');

                    setTimeout(() => {
                      // Perform an ACTUAL dynamic check on the active DOM!
                      const allElements = document.querySelectorAll('*');
                      const ids = Array.from(allElements)
                        .map(el => el.id)
                        .filter(id => id !== '');
                      
                      // Find duplicate IDs
                      const idCounts: Record<string, number> = {};
                      ids.forEach(id => {
                        idCounts[id] = (idCounts[id] || 0) + 1;
                      });
                      const duplicates = Object.keys(idCounts).filter(id => idCounts[id] > 1);

                      // Count form input fields and check if they have matching label configurations or aria tags
                      const inputs = document.querySelectorAll('input, select, textarea');
                      let missingAriaLabels = 0;
                      inputs.forEach(input => {
                        const hasId = input.id;
                        const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
                        const hasLabel = hasId ? document.querySelector(`label[for="${hasId}"]`) || input.closest('label') : input.closest('label');
                        if (!hasId && !hasAriaLabel && !hasLabel) {
                          missingAriaLabels++;
                        }
                      });

                      const results = {
                        duplicateIdsCount: duplicates.length,
                        emptyAriaLabels: missingAriaLabels,
                        inputsChecked: inputs.length,
                        totalElements: allElements.length,
                        errors: duplicates.map(id => `Warning: Duplicate DOM ID detected: "#${id}" is not unique in document.`)
                      };

                      setAuditRunning(false);
                      setAuditResults(results);
                      onAddLog('AUDIT_COMPLETE', 'btn-run-background-validation', `Analysis finished. Elements parsed: ${allElements.length}. Found ${duplicates.length} duplicate IDs and ${missingAriaLabels} accessibility alerts.`);
                    }, 1200);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 duration-150 cursor-pointer"
                >
                  {auditRunning ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running Audit Thread...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Run Background Validation Scan
                    </>
                  )}
                </button>
              </div>

              {/* Scan Results Panel */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 font-mono text-[11px] flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide border-b border-slate-800 pb-1 mb-2 block">
                  Validation Scan Report
                </span>
                
                {auditRunning ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-2 text-slate-400">
                    <div className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-indigo-500 animate-spin"></div>
                    <span className="text-[10px]">Processing document metadata...</span>
                  </div>
                ) : auditResults ? (
                  <div className="space-y-1.5 flex-1" id="bg-validation-results-log">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Elements Audited:</span>
                      <span className="text-white font-semibold" id="audit-total-elements">{auditResults.totalElements}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Forms Evaluated:</span>
                      <span className="text-slate-200" id="audit-total-inputs">{auditResults.inputsChecked} fields</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duplicate DOM IDs:</span>
                      <span className={`font-bold ${auditResults.duplicateIdsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} id="audit-duplicate-ids">
                        {auditResults.duplicateIdsCount} {auditResults.duplicateIdsCount > 0 ? '❌' : '✓'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Aria Label Compliance:</span>
                      <span className={`font-bold ${auditResults.emptyAriaLabels > 0 ? 'text-amber-400' : 'text-emerald-400'}`} id="audit-aria-labels">
                        {auditResults.emptyAriaLabels > 0 ? `${auditResults.emptyAriaLabels} missing labels ⚠️` : '100% Compliant ✓'}
                      </span>
                    </div>

                    {auditResults.duplicateIdsCount > 0 && (
                      <div className="mt-2 text-[10px] bg-rose-950/45 border border-rose-900/60 p-1.5 rounded text-rose-300 leading-tight">
                        {auditResults.errors[0]}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 italic py-4 text-center text-[10px]">
                    No background scan records currently in memory stream. Focus or click "Run Scan" to check system layout.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Enabled/Disabled verification state (4 cols) */}
        <div className="lg:col-span-4">
          <div id="element-states-lab-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">Interactive State Toggles</h3>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-mono">
                  LAB_ID: #state-verify-lab
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Verify element states. Field 2 becomes enabled only when Box 1 is checked. The Button is enabled only when Code length is exactly 8 characters. Or bypass restrictions completely.
              </p>

              <div className="space-y-4">
                {/* 1. Bypass Switch */}
                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/60 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-slate-700">Override Restrictions</span>
                    <p className="text-[9px] text-slate-400">Force-enables all fields</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      id="override-switch-verify"
                      type="checkbox"
                      checked={overrideEnabled}
                      onChange={(e) => {
                        const state = e.target.checked;
                        setOverrideEnabled(state);
                        onAddLog('STATE_CHANGE', 'override-switch-verify', `Global safety override: ${state ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* 2. Checkbox input */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none" id="label-terms-checkbox">
                    <input
                      id="terms-checkbox-verify"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        const state = e.target.checked;
                        setTermsAccepted(state);
                        onAddLog('CHECKBOX_TOGGLE', 'terms-checkbox-verify', `Security terms acceptance toggle: ${state}`);
                      }}
                      className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300 cursor-pointer"
                    />
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold block text-slate-700">1. Accept Legal Compliance (Checkbox)</span>
                      <span>Enables the License Code input field below</span>
                    </div>
                  </label>
                </div>

                {/* 3. Input element */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700" htmlFor="license-input-verify">
                    2. Security Authorization License Key
                  </label>
                  <input
                    id="license-input-verify"
                    type="text"
                    maxLength={8}
                    disabled={!termsAccepted && !overrideEnabled}
                    value={licenseCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setLicenseCode(val);
                      onAddLog('ON_CHANGE', 'license-input-verify', `License key keystroke: "${val}"`);
                    }}
                    placeholder={termsAccepted || overrideEnabled ? "8 CHARS CODE" : "Locked (Accept terms first)"}
                    className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono shadow-sm ${
                      !termsAccepted && !overrideEnabled ? 'bg-slate-50 cursor-not-allowed border-slate-100 text-slate-300' : 'border-slate-200 text-slate-700'
                    }`}
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>Target exact length: 8 characters</span>
                    <span>Current length: <span id="license-current-length">{licenseCode.length}</span>/8</span>
                  </div>
                </div>

                {/* 4. Validation Trigger button */}
                <div>
                  <button
                    id="provision-btn-verify"
                    disabled={(!overrideEnabled && (!termsAccepted || licenseCode.length !== 8)) || provisionedState === 'success'}
                    onClick={() => {
                      setProvisionedState('success');
                      onAddLog('PROVISION_SUCCESS', 'provision-btn-verify', `Provisioning successful! Staging instance initialized on port 3000 mapping with license ${licenseCode || 'OVERRIDDEN'}`);
                      setTimeout(() => {
                        setProvisionedState('idle');
                        setLicenseCode('');
                        onAddLog('PROVISION_RESET', 'provision-btn-verify', 'Staging deployment automatically tear-down complete.');
                      }, 4000);
                    }}
                    className={`w-full py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-150 shadow-md ${
                      provisionedState === 'success'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none text-white hover:bg-slate-800 cursor-pointer'
                    }`}
                  >
                    {provisionedState === 'success' ? '✓ Instance Fully Provisioned!' : '3. Provision Server Instance'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
              💡 Playwright: `expect(locator('#license-input-verify')).toBeDisabled()`
            </div>
          </div>
        </div>
      </div>

      {/* SENIOR QA TRAINING LABS */}
      <div id="senior-qa-training-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-100">🎓</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Senior QA Training - Core Automation Lessons</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Critical interactive challenges designed to teach dynamic wait states, custom selectors, mouse actions, and mock APIs.</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border border-indigo-100 mt-2 md:mt-0">
            LEVEL: ADVANCED FRESHER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LESSON A: ASYNCHRONOUS WAIT STATE CHALLENGE (DYNAMIC LOADER) */}
          <div id="async-wait-state-card" className="p-5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 block">Lesson 1: Handling Dynamic Loaders (Wait States)</span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">#btn-fetch-qa-data</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Real apps call APIs and render loading spinners. Automated tests must poll or wait dynamically instead of using brittle hardcoded wait timers.
              </p>

              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center min-h-[140px] text-center shadow-inner relative">
                {qaFetchState === 'idle' && (
                  <div className="space-y-3" id="async-idle-view">
                    <p className="text-xs text-slate-500 italic">No active query. Click below to begin fetching.</p>
                    <button
                      id="btn-fetch-qa-data"
                      onClick={() => {
                        setQaFetchState('loading');
                        setQaFetchData([]);
                        onAddLog('QA_FETCH_START', 'btn-fetch-qa-data', 'Initiated asynchronous database fetch pipeline simulation.');
                        setTimeout(() => {
                          setQaFetchState('success');
                          const data = ['Config: STAGING_SERVER_IP=172.24.52.1', 'Port: INGRESS_PORT=3000', 'Status: ACTIVE_HANDSHAKE=OK'];
                          setQaFetchData(data);
                          onAddLog('QA_FETCH_SUCCESS', 'btn-fetch-qa-data', 'Asynchronous pipeline fetch successfully completed after 2.0s.');
                        }, 2000);
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      Fetch Mock QA Pipeline Data
                    </button>
                  </div>
                )}

                {qaFetchState === 'loading' && (
                  <div className="space-y-3 flex flex-col items-center justify-center animate-pulse" id="qa-loading-container">
                    <div id="qa-loading-spinner" className="h-6 w-6 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                    <span id="qa-fetch-status" className="text-xs font-mono text-indigo-600 font-bold">Loading assets from server stream...</span>
                  </div>
                )}

                {qaFetchState === 'success' && (
                  <div className="w-full space-y-3" id="qa-success-container">
                    <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider block bg-emerald-50 border border-emerald-100 py-1 px-2.5 rounded-md inline-block">
                      ✓ Fetch Completed Successfully
                    </span>
                    <div id="fetched-users-list" className="space-y-1 bg-slate-50 p-2 border border-slate-200 rounded-lg text-left font-mono text-[10px] text-slate-600">
                      {qaFetchData.map((item, idx) => {
                        const [label, val] = item.split(': ');
                        const idPart = label.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        return (
                          <div key={idx} className="flex justify-between py-0.5 border-b border-slate-100/60 last:border-0">
                            <span className="text-slate-400 font-semibold">{label}:</span>
                            <span className="text-slate-800 font-bold" id={`env-val-${idPart}`}>{val}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      id="btn-fetch-reset"
                      onClick={() => {
                        setQaFetchState('idle');
                        setQaFetchData([]);
                      }}
                      className="text-[10px] font-mono text-indigo-500 hover:text-indigo-700 underline cursor-pointer"
                    >
                      Reset State
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>💡 Wait Assertion Practice</span>
              <span>`page.waitForSelector(\'#fetched-users-list\')`</span>
            </div>
          </div>

          {/* LESSON B: DYNAMIC API HTTP RESPONSE STATUS CODES */}
          <div id="api-status-codes-card" className="p-5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 block">Lesson 2: Asserting HTTP Status Codes & Elements</span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">#api-response-selector</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Pick a mock HTTP status code and invoke the endpoint. Automated tests must confirm both visually styled boxes, text values, and response states.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
                <div className="sm:col-span-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="api-response-selector">Select Code</label>
                  <select
                    id="api-response-selector"
                    value={apiResponseCode}
                    onChange={(e) => setApiResponseCode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 shadow-sm"
                  >
                    <option value="200">200 OK</option>
                    <option value="400">400 Bad Request</option>
                    <option value="401">401 Unauthorized</option>
                    <option value="409">409 Conflict</option>
                    <option value="500">500 Server Error</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    id="btn-invoke-endpoint"
                    onClick={() => {
                      setApiResponseLoading(true);
                      setApiResponseResult(null);
                      onAddLog('API_INVOKE', 'btn-invoke-endpoint', `Sent mock HTTP request to simulated status endpoint: ${apiResponseCode}`);
                      setTimeout(() => {
                        let res: any = { status: 200, message: 'Request was processed successfully.', data: { activeNodes: 4 } };
                        if (apiResponseCode === '400') {
                          res = { status: 400, message: 'Bad Request: Invalid license parameter format.', data: { errorCode: 'PARAM_MALFORMED' } };
                        } else if (apiResponseCode === '401') {
                          res = { status: 401, message: 'Unauthorized: Authentication session has expired.', data: { errorCode: 'SESSION_EXPIRED' } };
                        } else if (apiResponseCode === '409') {
                          res = { status: 409, message: 'Conflict: Sub-component port already allocated.', data: { errorCode: 'PORT_COLLISION' } };
                        } else if (apiResponseCode === '500') {
                          res = { status: 500, message: 'Internal Server Error: Database pool exhausted.', data: { errorCode: 'POOL_FAILED' } };
                        }
                        setApiResponseResult(res);
                        setApiResponseLoading(false);
                        onAddLog('API_RESPONSE', 'btn-invoke-endpoint', `Simulated API returned status code: ${res.status}`);
                      }, 600);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    Invoke Simulated Endpoint
                  </button>
                </div>
              </div>

              <div className="mt-3 min-h-[90px] flex items-center justify-center bg-white border border-slate-200 rounded-xl p-3 shadow-inner">
                {apiResponseLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin"></div>
                    <span className="font-mono">Negotiating server response...</span>
                  </div>
                ) : apiResponseResult ? (
                  <div
                    id="api-response-block"
                    className={`w-full p-2.5 rounded-lg border text-[11px] font-mono leading-tight space-y-1 ${
                      apiResponseResult.status === 200 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      apiResponseResult.status === 400 || apiResponseResult.status === 401 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      apiResponseResult.status === 409 ? 'bg-orange-50 text-orange-800 border-orange-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span>HTTP Status Code:</span>
                      <span id="api-status-code-lbl" className="px-1.5 py-0.2 rounded bg-white border border-current">{apiResponseResult.status}</span>
                    </div>
                    <p id="api-message-lbl"><span className="text-slate-400 font-semibold">Msg:</span> {apiResponseResult.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1"><span className="font-bold">JSON Payload:</span> {JSON.stringify(apiResponseResult.data)}</p>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Choose status and click Invoke to capture the feedback.</span>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>💡 Styled Box Validations</span>
              <span>`expect(locator(\'#api-response-block\')).toHaveClass(/bg-emerald/)`</span>
            </div>
          </div>

          {/* LESSON C: CUSTOM MULTI-SELECT TAG BUILDER */}
          <div id="multi-select-tag-card" className="p-5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 block">Lesson 3: Custom Dropdowns & Tag Elements (Multi-Select)</span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">#active-tags-list</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Automating tag pickers is tough because they do not use select options. Practice adding and removing tags, asserting element count, and detecting index patterns.
              </p>

              {/* Tag Selection Row */}
              <div className="mt-4" id="tool-tag-selection-hub">
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Click to Add Tool Tag:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Playwright', 'Cypress', 'Selenium', 'Appium', 'Docker', 'Jenkins'].map((tool) => {
                    const toolSlug = tool.toLowerCase();
                    const isSelected = qaSelectedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        id={`add-tag-${toolSlug}`}
                        disabled={isSelected}
                        onClick={() => {
                          setQaSelectedTools([...qaSelectedTools, tool]);
                          onAddLog('TAG_ADD', `add-tag-${toolSlug}`, `Custom multi-select appended tag: "${tool}"`);
                        }}
                        className={`text-[10px] font-semibold font-mono py-1 px-2 rounded-lg transition-all border ${
                          isSelected
                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                            : 'bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border-slate-200 hover:border-indigo-200 cursor-pointer shadow-sm active:scale-95'
                        }`}
                      >
                        + {tool}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Selected Tags display */}
              <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 min-h-[64px] flex flex-col justify-center">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1 block">Active Selected Tags:</span>
                
                {qaSelectedTools.length === 0 ? (
                  <p id="no-tags-warn" className="text-slate-400 italic text-[10px] py-1 text-center">No tags selected. Click elements above to populate list.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5" id="active-tags-list">
                    {qaSelectedTools.map((tool) => {
                      const toolSlug = tool.toLowerCase();
                      return (
                        <div
                          key={tool}
                          id={`active-tag-pill-${toolSlug}`}
                          className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-800 font-mono text-[10px] font-bold py-0.5 pl-2.5 pr-1 rounded-full shadow-sm animate-in zoom-in-90 duration-150"
                        >
                          <span>{tool}</span>
                          <button
                            id={`remove-tag-${toolSlug}`}
                            onClick={() => {
                              setQaSelectedTools(qaSelectedTools.filter(t => t !== tool));
                              onAddLog('TAG_REMOVE', `remove-tag-${toolSlug}`, `Custom multi-select discarded tag: "${tool}"`);
                            }}
                            title={`Discard ${tool} tag`}
                            className="h-4 w-4 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full border border-slate-150 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>💡 Count and List Testing</span>
              <span>{"`await expect(page.locator('#active-tags-list > div')).toHaveCount(1)`"}</span>
            </div>
          </div>

          {/* LESSON D: MOUSE ACTION HOVER CARD TO REVEAL DYNAMIC DATA */}
          <div id="hover-action-card" className="p-5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 block">Lesson 4: Mouse Move & Hover Actions (Target Reveal)</span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">#hover-reveal-hotspot</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Automated locators sometimes need to hover over complex cards to trigger dynamic displays. Practice hovering over the active trigger point to expose and assert hidden DOM elements.
              </p>

              <div className="mt-4 flex flex-col items-center justify-center p-3">
                <div
                  id="hover-reveal-hotspot"
                  onMouseEnter={() => {
                    setIsQaHovered(true);
                    onAddLog('MOUSE_HOVER', 'hover-reveal-hotspot', 'Mouse successfully hovered over training hotspot.');
                  }}
                  onMouseLeave={() => {
                    setIsQaHovered(false);
                    onAddLog('MOUSE_LEAVE', 'hover-reveal-hotspot', 'Mouse departed from training hotspot.');
                  }}
                  className={`w-full max-w-xs border-2 border-dashed py-4 px-5 text-center rounded-xl cursor-help select-none transition-all duration-300 ${
                    isQaHovered
                      ? 'bg-indigo-950 border-indigo-700 text-slate-100 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-300 hover:border-slate-400 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <span className="text-base">🎯</span>
                    <span className="text-xs font-semibold block" id="hover-instructions-text">
                      {isQaHovered ? 'Active Pointer Detected' : 'Hover Cursor Inside Box'}
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Exposes dynamic secret security token for validation routines
                    </p>
                  </div>
                </div>

                <div className="w-full mt-3 min-h-[50px] flex items-center justify-center bg-white border border-slate-100 rounded-xl p-2 text-center">
                  {isQaHovered ? (
                    <div className="text-center font-mono animate-in slide-in-from-bottom-2 duration-150" id="revealed-hover-data">
                      <span className="text-[9px] font-mono text-emerald-500 font-bold block uppercase tracking-wide">✓ Verified Token Exponent:</span>
                      <strong className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1 rounded-md mt-0.5 inline-block">
                        TOKEN-QA-FRESHER-PASS-2026
                      </strong>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[10px]" id="hover-revealed-placeholder">Revealed data is currently hidden from active DOM.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>💡 Pointer Actions</span>
              <span>`await page.locator(\'#hover-reveal-hotspot\').hover()`</span>
            </div>
          </div>

        </div>
      </div>

      {/* SWAGGER OPENAPI PETSTORE SIMULATOR & API TESTING LAB */}
      <div id="swagger-petstore-practice-card" className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow mt-6">
        {/* Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-100">⚙️</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Swagger OpenAPI Petstore Simulator (API Practice Arena)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Learn real API Automation and assertions. Understand endpoints, payloads, HTTP status codes, and test generation.</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border border-emerald-100 mt-2 md:mt-0">
            SYSTEM: REST FULL-STACK MOCK
          </span>
        </div>

        {/* Dynamic Mock Server Database State Viewer */}
        <div id="swagger-mock-db-panel" className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs text-slate-700">Simulated Server Database Storage (`STORED_PET_RECORDS`)</span>
            </div>
            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold" id="swagger-db-count-badge">
              {swaggerPets.length} Records
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            This represents the server-side state. Triggering <strong>POST</strong>, <strong>PUT</strong>, or <strong>DELETE</strong> endpoints below will modify these in-memory records in real time!
          </p>
          <div className="flex flex-wrap gap-2 pt-1" id="swagger-db-pills-container">
            {swaggerPets.length === 0 ? (
              <span className="text-xs italic text-rose-500 font-semibold" id="lbl-empty-swagger-db">⚠️ Database is empty! Use the POST endpoint below to add new pets.</span>
            ) : (
              swaggerPets.map((p) => (
                <div
                  key={p.id}
                  id={`swag-pet-pill-${p.id}`}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono shadow-sm hover:border-slate-300 transition-colors animate-in zoom-in-95 duration-150"
                >
                  <span className="text-[10px] font-bold text-slate-400">ID: {p.id}</span>
                  <span className="text-slate-800 font-semibold">{p.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-normal capitalize">{p.category}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      p.status === 'available' ? 'bg-emerald-500' :
                      p.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    title={`Status: ${p.status}`}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fresher QA Guidance Notes */}
        <div id="swagger-fresher-tips" className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl mb-6 space-y-1.5 text-indigo-950">
          <h4 className="text-xs font-bold flex items-center gap-1.5 text-indigo-900">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            Junior QA / SDET Fresher Key Learnings:
          </h4>
          <ul className="list-disc pl-4 text-[11px] space-y-1 text-slate-600 leading-relaxed">
            <li><strong>UI vs API Automation:</strong> UI automation clicks buttons and drives the browser, while API automation validates the backend data layer directly, running 10x faster and with 100% stability.</li>
            <li><strong>JSON Payloads:</strong> Modern APIs pass data in JSON format. Always validate property existence, array bounds, and value formats in your test scripts.</li>
            <li><strong>HTTP Status Codes:</strong> Assert that successful operations return <code>200 OK</code> or <code>201 Created</code>, while validation failures return <code>400 Bad Request</code> and missing entries return <code>404 Not Found</code>.</li>
          </ul>
        </div>

        {/* Swagger UI Endpoints Accordion List */}
        <div className="space-y-3" id="swagger-endpoints-list">

          {/* 1. GET /api/v1/pets (LIST ALL PETS) */}
          <div id="swag-endpoint-get-all" className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
            {/* Collapsible Trigger Head */}
            <button
              id="swag-btn-toggle-get-pets"
              onClick={() => setSwaggerExpanded(prev => ({ ...prev, getPets: !prev.getPets }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                swaggerExpanded.getPets ? 'bg-blue-100/70' : 'bg-blue-50/70 hover:bg-blue-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">GET</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Retrieves entire catalog records</span>
              </div>
              <span className="text-xs text-blue-700 font-mono font-bold">
                {swaggerExpanded.getPets ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {/* Accordion Content */}
            {swaggerExpanded.getPets && (
              <div className="p-4 bg-white border-t border-blue-100 space-y-4 animate-in slide-in-from-top-1 duration-150" id="swag-body-get-pets">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Fetches all active pet objects currently registered in the database. Returns an array. Great for testing list length assertions and array validation logic.
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-slate-400">Parameters: None</span>
                  <button
                    id="btn-exec-get-pets"
                    onClick={handleExecuteGetPets}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                  >
                    Try it out / Execute Request
                  </button>
                </div>

                {/* Response Visualizer Panel */}
                {renderSwaggerResponse('getPets', `import { test, expect } from '@playwright/test';

test('GET /api/v1/pets should return all pets', async ({ request }) => {
  const response = await request.get('/api/v1/pets');
  expect(response.status()).toBe(200);
  
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  
  // Validate first pet schema
  const pet = body[0];
  expect(pet).toHaveProperty('id');
  expect(pet).toHaveProperty('name');
  expect(pet).toHaveProperty('status');
});`, `describe('Petstore API', () => {
  it('should retrieve all pets', () => {
    cy.request('GET', '/api/v1/pets').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.gt(0);
    });
  });
});`, `fetch('/api/v1/pets')
  .then(res => res.json())
  .then(data => console.log('All Pets:', data));`)}
              </div>
            )}
          </div>

          {/* 2. GET /api/v1/pets/{petId} (GET BY ID) */}
          <div id="swag-endpoint-get-one" className="border border-blue-200 rounded-lg overflow-hidden shadow-sm">
            {/* Collapsible Trigger Head */}
            <button
              id="swag-btn-toggle-get-by-id"
              onClick={() => setSwaggerExpanded(prev => ({ ...prev, getPetById: !prev.getPetById }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                swaggerExpanded.getPetById ? 'bg-blue-100/70' : 'bg-blue-50/70 hover:bg-blue-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">GET</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets/{'{petId}'}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Retrieves individual record by parameter ID</span>
              </div>
              <span className="text-xs text-blue-700 font-mono font-bold">
                {swaggerExpanded.getPetById ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {/* Accordion Content */}
            {swaggerExpanded.getPetById && (
              <div className="p-4 bg-white border-t border-blue-100 space-y-4 animate-in slide-in-from-top-1 duration-150" id="swag-body-get-by-id">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Pass a pet ID to look up records. Try entering an existing ID like <code>101</code> or <code>102</code> to test success scenarios (returns <code>200 OK</code>), or enter an invalid ID to test error handling assertions (returns <code>404 Not Found</code>).
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="input-swag-pet-id-get">
                      Path Parameter: petId (integer)
                    </label>
                    <input
                      id="input-swag-pet-id-get"
                      type="text"
                      value={swagPetIdGet}
                      onChange={(e) => setSwagPetIdGet(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-sm"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      id="btn-exec-get-pet-by-id"
                      onClick={handleExecuteGetPetById}
                      className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Try it out / Execute Request
                    </button>
                  </div>
                </div>

                {/* Response Visualizer Panel */}
                {renderSwaggerResponse('getPetById', `import { test, expect } from '@playwright/test';

test('GET /api/v1/pets/${swagPetIdGet} should return correct pet data', async ({ request }) => {
  const response = await request.get('/api/v1/pets/${swagPetIdGet}');
  
  if (response.status() === 200) {
    const body = await response.json();
    expect(body.id).toBe(${parseInt(swagPetIdGet, 10) || 101});
    expect(body).toHaveProperty('name');
  } else {
    expect(response.status()).toBe(404);
  }
});`, `it('should request pet with ID ${swagPetIdGet}', () => {
  cy.request({
    method: 'GET',
    url: '/api/v1/pets/${swagPetIdGet}',
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      expect(response.body.id).to.eq(${parseInt(swagPetIdGet, 10) || 101});
    } else {
      expect(response.status).to.eq(404);
    }
  });
});`, `fetch('/api/v1/pets/${swagPetIdGet}')
  .then(res => res.json())
  .then(data => console.log('Pet Output:', data));`)}
              </div>
            )}
          </div>

          {/* 3. POST /api/v1/pets (CREATE A PET) */}
          <div id="swag-endpoint-post-pet" className="border border-emerald-200 rounded-lg overflow-hidden shadow-sm">
            {/* Collapsible Trigger Head */}
            <button
              id="swag-btn-toggle-add-pet"
              onClick={() => setSwaggerExpanded(prev => ({ ...prev, addPet: !prev.addPet }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                swaggerExpanded.addPet ? 'bg-emerald-100/70' : 'bg-emerald-50/70 hover:bg-emerald-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">POST</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Adds a new record to store database</span>
              </div>
              <span className="text-xs text-emerald-700 font-mono font-bold">
                {swaggerExpanded.addPet ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {/* Accordion Content */}
            {swaggerExpanded.addPet && (
              <div className="p-4 bg-white border-t border-emerald-100 space-y-4 animate-in slide-in-from-top-1 duration-150" id="swag-body-add-pet">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Submit a JSON payload body to construct and append a pet into memory. Tests must verify that HTTP Status <code>201 Created</code> is returned along with the fully assigned database identity ID.
                </div>

                <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="input-swag-add-body">
                      Request JSON Payload Body:
                    </label>
                    <textarea
                      id="input-swag-add-body"
                      rows={5}
                      value={swagAddPetBody}
                      onChange={(e) => setSwagAddPetBody(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono shadow-sm text-slate-700"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">💡 Type name inside the JSON block</span>
                    <button
                      id="btn-exec-add-pet"
                      onClick={handleExecuteAddPet}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Try it out / Execute Request
                    </button>
                  </div>
                </div>

                {/* Response Visualizer Panel */}
                {renderSwaggerResponse('addPet', `import { test, expect } from '@playwright/test';

test('POST /api/v1/pets should register a new pet record', async ({ request }) => {
  const response = await request.post('/api/v1/pets', {
    data: ${swagAddPetBody.trim()}
  });
  expect(response.status()).toBe(201);
  
  const body = await response.json();
  expect(body).toHaveProperty('id');
  expect(body.name).toBe('${getSafePetName(swagAddPetBody, 'Rocky')}');
  expect(body.status).toBe('available');
});`, `it('should successfully post and create a pet', () => {
  cy.request('POST', '/api/v1/pets', ${swagAddPetBody.trim()}).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body).to.have.property('id');
    expect(response.body.name).to.eq('${getSafePetName(swagAddPetBody, 'Rocky')}');
  });
});`, `fetch('/api/v1/pets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${swagAddPetBody.trim()})
})
.then(res => res.json())
.then(data => console.log('POST Output:', data));`)}
              </div>
            )}
          </div>

          {/* 4. PUT /api/v1/pets (UPDATE A PET) */}
          <div id="swag-endpoint-put-pet" className="border border-amber-200 rounded-lg overflow-hidden shadow-sm">
            {/* Collapsible Trigger Head */}
            <button
              id="swag-btn-toggle-update-pet"
              onClick={() => setSwaggerExpanded(prev => ({ ...prev, updatePet: !prev.updatePet }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                swaggerExpanded.updatePet ? 'bg-amber-100/70' : 'bg-amber-50/70 hover:bg-amber-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-amber-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">PUT</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Modifies an existing record inside storage</span>
              </div>
              <span className="text-xs text-amber-700 font-mono font-bold">
                {swaggerExpanded.updatePet ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {/* Accordion Content */}
            {swaggerExpanded.updatePet && (
              <div className="p-4 bg-white border-t border-amber-100 space-y-4 animate-in slide-in-from-top-1 duration-150" id="swag-body-update-pet">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Updates properties of an existing pet record. Pass the target pet <code>id</code> inside the body payload object. If the ID exists in the database, returns <code>200 OK</code>, otherwise returns <code>404 Not Found</code>.
                </div>

                <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="input-swag-update-body">
                      Request JSON Payload Body:
                    </label>
                    <textarea
                      id="input-swag-update-body"
                      rows={5}
                      value={swagUpdatePetBody}
                      onChange={(e) => setSwagUpdatePetBody(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono shadow-sm text-slate-700"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">💡 Make sure target ID matches an existing record pill</span>
                    <button
                      id="btn-exec-update-pet"
                      onClick={handleExecuteUpdatePet}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Try it out / Execute Request
                    </button>
                  </div>
                </div>

                {/* Response Visualizer Panel */}
                {renderSwaggerResponse('updatePet', `import { test, expect } from '@playwright/test';

test('PUT /api/v1/pets should update corresponding record', async ({ request }) => {
  const response = await request.put('/api/v1/pets', {
    data: ${swagUpdatePetBody.trim()}
  });
  
  if (response.status() === 200) {
    const body = await response.json();
    expect(body.id).toBe(${getSafePetId(swagUpdatePetBody, 101)});
    expect(body.name).toBe('${getSafePetName(swagUpdatePetBody, 'Buster Max')}');
  } else {
    expect(response.status()).toBe(404);
  }
});`, `it('should successfully update pet details', () => {
  cy.request({
    method: 'PUT',
    url: '/api/v1/pets',
    body: ${swagUpdatePetBody.trim()},
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      expect(response.body.name).to.eq('${getSafePetName(swagUpdatePetBody, 'Buster Max')}');
    } else {
      expect(response.status).to.eq(404);
    }
  });
});`, `fetch('/api/v1/pets', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${swagUpdatePetBody.trim()})
})
.then(res => res.json())
.then(data => console.log('PUT Output:', data));`)}
              </div>
            )}
          </div>

          {/* 5. DELETE /api/v1/pets/{petId} (DELETE RECORD) */}
          <div id="swag-endpoint-delete-pet" className="border border-rose-200 rounded-lg overflow-hidden shadow-sm">
            {/* Collapsible Trigger Head */}
            <button
              id="swag-btn-toggle-delete-pet"
              onClick={() => setSwaggerExpanded(prev => ({ ...prev, deletePet: !prev.deletePet }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                swaggerExpanded.deletePet ? 'bg-rose-100/70' : 'bg-rose-50/70 hover:bg-rose-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-rose-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">DELETE</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/pets/{'{petId}'}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Discards a specific record by parameter ID</span>
              </div>
              <span className="text-xs text-rose-700 font-mono font-bold">
                {swaggerExpanded.deletePet ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {/* Accordion Content */}
            {swaggerExpanded.deletePet && (
              <div className="p-4 bg-white border-t border-rose-100 space-y-4 animate-in slide-in-from-top-1 duration-150" id="swag-body-delete-pet">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Pass an ID inside the path parameter. If the pet exists, it is permanently wiped from the store memory bank. Yields a <code>200 OK</code> response with a deletion message. Excellent for verifying schema deletions.
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="input-swag-pet-id-delete">
                      Path Parameter: petId (integer)
                    </label>
                    <input
                      id="input-swag-pet-id-delete"
                      type="text"
                      value={swagPetIdDelete}
                      onChange={(e) => setSwagPetIdDelete(e.target.value)}
                      placeholder="e.g. 104"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono shadow-sm"
                    />
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      id="btn-exec-delete-pet"
                      onClick={handleExecuteDeletePet}
                      className="w-full sm:w-auto px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Try it out / Execute Request
                    </button>
                  </div>
                </div>

                {/* Response Visualizer Panel */}
                {renderSwaggerResponse('deletePet', `import { test, expect } from '@playwright/test';

test('DELETE /api/v1/pets/${swagPetIdDelete} should drop record', async ({ request }) => {
  const response = await request.delete('/api/v1/pets/${swagPetIdDelete}');
  
  if (response.status() === 200) {
    const body = await response.json();
    expect(body.message).toContain('successfully deleted');
    expect(body.id).toBe(${parseInt(swagPetIdDelete, 10) || 104});
  } else {
    expect(response.status()).toBe(404);
  }
});`, `it('should successfully delete target pet', () => {
  cy.request({
    method: 'DELETE',
    url: '/api/v1/pets/${swagPetIdDelete}',
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      expect(response.body.message).to.contain('successfully deleted');
    } else {
      expect(response.status).to.eq(404);
    }
  });
});`, `fetch('/api/v1/pets/${swagPetIdDelete}', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log('DELETE Output:', data));`)}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* OVERLAY DIALOGUES: SIMULATED ALERT / CONFIRM / PROMPT */}
      {simulatedAlert.visible && (
        <div id="simulated-alert-modal-overlay" className="fixed inset-0 bg-slate-950/65 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div 
            id="simulated-alert-modal" 
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 font-sans animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-2.5 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-slate-800 text-sm capitalize" id="simulated-dialogue-title">
                Simulated Browser {simulatedAlert.type}
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-100" id="simulated-dialogue-text">
              {simulatedAlert.message}
            </p>

            {simulatedAlert.type === 'prompt' && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block" htmlFor="dialogue-prompt-input">Input value:</label>
                <input
                  id="dialogue-prompt-input"
                  type="text"
                  value={simulatedAlert.promptValue}
                  onChange={(e) => setSimulatedAlert({ ...simulatedAlert, promptValue: e.target.value })}
                  placeholder="Type return string..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono shadow-sm"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2" id="dialogue-actions-container">
              {simulatedAlert.type !== 'alert' && (
                <button
                  id="btn-dialogue-cancel"
                  onClick={() => handleDialogAction(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                id="btn-dialogue-confirm"
                onClick={() => handleDialogAction(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Accept / OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL WINDOWS */}
      {isModalOpen && (
        <div id="qa-practice-modal-overlay" className="fixed inset-0 bg-slate-950/65 flex items-center justify-center z-[90] backdrop-blur-sm">
          <div 
            id="qa-practice-modal" 
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-slate-900 text-white px-5 py-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-xs uppercase tracking-wide" id="modal-header-title">Sandbox Dynamic Modal dialogue</span>
              </div>
              <button
                id="modal-close-icon-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  onAddLog('MODAL_CLOSE', 'modal-close-icon-btn', 'Closed modal via close icon button');
                }}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Dismiss modal dialogue"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4" id="modal-content-container">
              <p className="text-xs text-slate-500 leading-relaxed">
                You have successfully pierced the modal backdrop screen! To satisfy automation assertions, type a confirmation keyword in the box below and click the button.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1" htmlFor="modal-prompt-input">
                  Verification Keyword
                </label>
                <input
                  id="modal-prompt-input"
                  type="text"
                  value={modalInput}
                  onChange={(e) => {
                    setModalInput(e.target.value);
                    onAddLog('ON_CHANGE', 'modal-prompt-input', `Input in modal registered: "${e.target.value}"`);
                  }}
                  placeholder="e.g. COMPLETED"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono shadow-sm"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end gap-2" id="modal-footer-container">
              <button
                id="modal-cancel-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  onAddLog('MODAL_CLOSE', 'modal-cancel-btn', 'Closed modal via bottom Cancel button');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Close / Dismiss
              </button>
              
              <button
                id="modal-submit-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  onAddLog('MODAL_SUBMIT', 'modal-submit-btn', `Modal form submitted with value: "${modalInput}"`);
                  setModalInput('');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Save Action Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
