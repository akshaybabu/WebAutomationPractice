import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Receipt, 
  Database, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  Trash2, 
  Plus, 
  Minus, 
  FileJson, 
  ExternalLink,
  ChevronRight,
  Server,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Package,
  Clock,
  User,
  MapPin
} from 'lucide-react';

interface EcommerceLabProps {
  onAddLog: (event: string, elementId: string, details: string) => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  inventory: number;
}

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderRecord {
  orderId: string;
  customerName: string;
  shippingAddress: string;
  items: CartItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface ApiResponseState {
  status: number | null;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  durationMs: number | null;
  loading: boolean;
}

export default function EcommerceLab({ onAddLog }: EcommerceLabProps) {
  // Live State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isFetchingCart, setIsFetchingCart] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  
  // Checkout Input States
  const [customerName, setCustomerName] = useState('Jane Automation');
  const [shippingAddress, setShippingAddress] = useState('456 Playwright Boulevard, Headless City');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [successOrder, setSuccessOrder] = useState<OrderRecord | null>(null);

  // Active executing responses for the API Testbed accordion
  const [apiResponses, setApiResponses] = useState<Record<string, ApiResponseState>>({
    getProducts: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false },
    getCart: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false },
    addCart: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false },
    checkout: { status: null, statusText: '', headers: {}, body: null, durationMs: null, loading: false }
  });

  // Tab selections
  const [activeTabs, setActiveTabs] = useState<Record<string, 'console' | 'code'>>({
    getProducts: 'console',
    getCart: 'console',
    addCart: 'console',
    checkout: 'console'
  });

  const [codeLangs, setCodeLangs] = useState<Record<string, 'playwright' | 'cypress' | 'fetch'>>({
    getProducts: 'playwright',
    getCart: 'playwright',
    addCart: 'playwright',
    checkout: 'playwright'
  });

  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({
    getProducts: true,
    getCart: false,
    addCart: false,
    checkout: false
  });

  // Cart quantity payload helper for manual API test
  const [payloadAddProductId, setPayloadAddProductId] = useState('1');
  const [payloadAddQuantity, setPayloadAddQuantity] = useState('1');

  // Order Placement Manual API Test inputs
  const [payloadCustomerName, setPayloadCustomerName] = useState('Tester McAssert');
  const [payloadShippingAddress, setPayloadShippingAddress] = useState('Suite 200, Assertions Highway');

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const serverOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // --- Live API Fetch functions ---

  const fetchProducts = async (silent = false) => {
    if (!silent) setIsFetchingProducts(true);
    try {
      const res = await fetch('/api/v1/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching live products:', err);
    } finally {
      if (!silent) setIsFetchingProducts(false);
    }
  };

  const fetchCart = async (silent = false) => {
    if (!silent) setIsFetchingCart(true);
    try {
      const res = await fetch('/api/v1/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (err) {
      console.error('Error fetching live cart:', err);
    } finally {
      if (!silent) setIsFetchingCart(false);
    }
  };

  const fetchOrders = async (silent = false) => {
    if (!silent) setIsFetchingOrders(true);
    try {
      const res = await fetch('/api/v1/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching live orders:', err);
    } finally {
      if (!silent) setIsFetchingOrders(false);
    }
  };

  const fetchAllData = async (silent = false) => {
    await Promise.all([
      fetchProducts(silent),
      fetchCart(silent),
      fetchOrders(silent)
    ]);
  };

  // Poll database to maintain perfect sync with any external Postman manipulations
  useEffect(() => {
    fetchAllData();
    const timer = setInterval(() => {
      fetchAllData(true);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyText = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    onAddLog('ECOMM_COPY_TEXT', `btn-copy-${label}`, `Copied ${label} to clipboard`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Restores all products, cart, and orders
  const handleResetData = async () => {
    onAddLog('ECOMM_RESET_REQUEST', 'btn-reset-ecomm-db', 'Dispatched E-commerce reset sequence.');
    try {
      const res = await fetch('/api/v1/reset', { method: 'POST' });
      if (res.ok) {
        onAddLog('ECOMM_RESET_SUCCESS', 'btn-reset-ecomm-db', 'E-commerce database reinitialized successfully.');
        setSuccessOrder(null);
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to reset E-commerce database:', err);
    }
  };

  // --- Real Interactive Store Handlers ---

  const handleAddToCart = async (productId: number, productName: string) => {
    onAddLog('ECOMM_GUI_ADD_TO_CART', `btn-gui-add-${productId}`, `Adding ${productName} to active shopping basket.`);
    try {
      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      const data = await res.json();
      if (res.ok) {
        onAddLog('ECOMM_GUI_ADD_SUCCESS', `btn-gui-add-${productId}`, `Added ${productName} to cart successfully.`);
        await fetchAllData(true);
      } else {
        onAddLog('ECOMM_GUI_ADD_ERROR', `btn-gui-add-${productId}`, `Add to cart rejected: ${data.error}`);
        alert(data.error || 'Failed to add item');
      }
    } catch (err: any) {
      console.error('Add cart network error', err);
    }
  };

  const handleRemoveFromCart = async (productId: number, productName: string) => {
    onAddLog('ECOMM_GUI_REMOVE_FROM_CART', `btn-gui-remove-${productId}`, `Wiping ${productName} completely from active shopping cart.`);
    try {
      const res = await fetch(`/api/v1/cart/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onAddLog('ECOMM_GUI_REMOVE_SUCCESS', `btn-gui-remove-${productId}`, `Cleared ${productName} from cart.`);
        await fetchAllData(true);
      }
    } catch (err) {
      console.error('Delete cart item error', err);
    }
  };

  const handlePlaceOrderGUI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please fill out Customer Name');
      return;
    }
    setIsCheckingOut(true);
    setSuccessOrder(null);
    onAddLog('ECOMM_GUI_CHECKOUT_START', 'form-checkout', `Starting shopping cart checkout process for customer ${customerName}`);

    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, shippingAddress })
      });
      const data = await res.json();
      if (res.ok) {
        onAddLog('ECOMM_GUI_CHECKOUT_SUCCESS', 'form-checkout', `Checkout successful! Created Order ${data.orderSummary.orderId}. Total: $${data.orderSummary.totalAmount}`);
        setSuccessOrder(data.orderSummary);
        // Sync database state instantly
        await fetchAllData(true);
      } else {
        onAddLog('ECOMM_GUI_CHECKOUT_FAILURE', 'form-checkout', `Checkout transaction failed: ${data.error}`);
        alert(data.error || 'Failed to submit order');
      }
    } catch (err: any) {
      onAddLog('ECOMM_GUI_CHECKOUT_ERROR', 'form-checkout', `Network exception during checkout: ${err.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // --- Real Network Testbed Runner ---

  const executeRealApiRoute = async (
    route: 'getProducts' | 'getCart' | 'addCart' | 'checkout',
    requestConfig: { path: string; method: string; body?: any }
  ) => {
    setApiResponses(prev => ({
      ...prev,
      [route]: { ...prev[route], loading: true }
    }));
    onAddLog('ECOMM_API_EXEC_START', `btn-exec-${route}`, `Dispatched live HTTP: ${requestConfig.method} ${requestConfig.path}`);

    const start = performance.now();
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

      const res = await fetch(requestConfig.path, options);
      const end = performance.now();
      const latency = Math.round(end - start);

      const headersMap: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headersMap[key] = value;
      });

      let jsonBody: any;
      try {
        jsonBody = await res.json();
      } catch {
        jsonBody = { message: "Empty response body or non-JSON returned" };
      }

      setApiResponses(prev => ({
        ...prev,
        [route]: {
          status: res.status,
          statusText: res.statusText,
          headers: headersMap,
          body: jsonBody,
          durationMs: latency,
          loading: false
        }
      }));

      // Immediately sync state
      await fetchAllData(true);
      onAddLog('ECOMM_API_EXEC_RESPONSE', `btn-exec-${route}`, `Response received: Status ${res.status} in ${latency}ms`);
    } catch (err: any) {
      const end = performance.now();
      setApiResponses(prev => ({
        ...prev,
        [route]: {
          status: 500,
          statusText: 'Network Connection Exception',
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Network fetch exception', details: err.message },
          durationMs: Math.round(end - start),
          loading: false
        }
      }));
      onAddLog('ECOMM_API_EXEC_ERROR', `btn-exec-${route}`, `API invocation failed: ${err.message}`);
    }
  };

  const handleExecuteGetProducts = () => {
    executeRealApiRoute('getProducts', { path: '/api/v1/products', method: 'GET' });
  };

  const handleExecuteGetCart = () => {
    executeRealApiRoute('getCart', { path: '/api/v1/cart', method: 'GET' });
  };

  const handleExecuteAddCart = () => {
    const productId = parseInt(payloadAddProductId, 10);
    const quantity = parseInt(payloadAddQuantity, 10) || 1;
    executeRealApiRoute('addCart', {
      path: '/api/v1/cart',
      method: 'POST',
      body: { productId, quantity }
    });
  };

  const handleExecuteCheckout = () => {
    executeRealApiRoute('checkout', {
      path: '/api/v1/orders',
      method: 'POST',
      body: {
        customerName: payloadCustomerName,
        shippingAddress: payloadShippingAddress
      }
    });
  };

  // Render Response panel identical to Swagger Petstore Lab
  const renderApiResponsePanel = (
    route: 'getProducts' | 'getCart' | 'addCart' | 'checkout',
    codeTemplates: { playwright: string; cypress: string; fetch: string }
  ) => {
    const resp = apiResponses[route];
    const activeTab = activeTabs[route];
    const activeLang = codeLangs[route];
    const currentCode = activeLang === 'playwright' ? codeTemplates.playwright : activeLang === 'cypress' ? codeTemplates.cypress : codeTemplates.fetch;

    return (
      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50/50" id={`ecomm-response-panel-${route}`}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2">
          <div className="flex gap-2">
            <button
              id={`btn-ecomm-tab-console-${route}`}
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
              id={`btn-ecomm-tab-code-${route}`}
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

        {activeTab === 'console' && (
          <div className="p-4 space-y-3 min-h-[110px]">
            {resp.loading ? (
              <div className="flex flex-col items-center justify-center min-h-[100px]">
                <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400 mt-2 font-mono">Querying Live E-commerce Database...</span>
              </div>
            ) : resp.status === null ? (
              <div className="flex flex-col items-center justify-center min-h-[100px] text-center text-slate-400">
                <Send className="w-5 h-5 text-slate-300" />
                <p className="text-xs italic mt-2">No active request. Hit the "Execute Network Request" button above.</p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Response Status:</span>
                    <span
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
                  <span className="text-slate-400">
                    Latency: <strong className="text-slate-700 font-bold">{resp.durationMs} ms</strong>
                  </span>
                </div>

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

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">Response Body (JSON Payload):</span>
                  <pre className="p-3 bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[10px] leading-relaxed rounded-lg overflow-x-auto max-h-[220px] shadow-inner">
                    {JSON.stringify(resp.body, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="p-4 space-y-3">
            <p className="text-[11px] text-slate-500 leading-normal">
              Copy this automation recipe to assert dynamic price matrices, inventory depletion counters, and subtotal summations.
            </p>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {(['playwright', 'cypress', 'fetch'] as const).map((lang) => (
                  <button
                    key={lang}
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
                onClick={() => handleCopyText(`ecomm-code-${route}-${activeLang}`, currentCode)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-800 text-[10px] font-mono font-bold rounded shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {copiedText === `ecomm-code-${route}-${activeLang}` ? (
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

  const cartTotalAmount = parseFloat(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2));

  return (
    <div id="ecommerce-lab-root-container" className="space-y-6">
      
      {/* 1. STATUS HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 custom-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm shrink-0">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">Live E-commerce Automation Practice Arena</h2>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                  Active Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Test a complete E-commerce system with REST API interfaces! Add products to the cart, monitor inventory changes in real-time, and trigger orders. Use the API testing sandbox below or invoke these routes straight from your favorite external clients!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* NEW BUTTON INTERACTION OPENING IN A NEW TAB AS REQUESTED */}
            <a
              id="btn-open-products-raw-json"
              href={`${serverOrigin}/api/v1/products`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Products JSON (New Tab)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              id="btn-reseed-ecomm-database"
              onClick={handleResetData}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl cursor-pointer transition-all shadow-sm"
              title="Reset Catalog and States"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN STOREFRONT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Products Catalog Storefront (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 custom-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Package className="w-4.5 h-4.5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Interactive Catalog Storefront</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 font-mono font-bold rounded">
                Live Memory State
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="storefront-product-grid">
              {products.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-slate-400 italic">
                  No products found. Re-seed database using the reset button above.
                </div>
              ) : (
                products.map((p) => {
                  const inBasket = cart.find(item => item.productId === p.id);
                  return (
                    <div 
                      key={p.id} 
                      className="border border-slate-200/80 hover:border-indigo-200 rounded-xl p-4 bg-slate-50/30 hover:bg-white transition-all shadow-sm flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-3xl filter drop-shadow-sm select-none" role="img" aria-label={p.name}>
                            {p.image}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                            {p.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mt-3 group-hover:text-indigo-700 transition-colors">
                          {p.name}
                        </h4>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="font-mono font-bold text-slate-900 text-sm">${p.price.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400">/ unit</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="text-[10px] font-mono text-slate-500">
                          Stock: <strong className={p.inventory === 0 ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}>
                            {p.inventory === 0 ? 'Out of Stock' : `${p.inventory} units`}
                          </strong>
                        </div>

                        <button
                          onClick={() => handleAddToCart(p.id, p.name)}
                          disabled={p.inventory === 0}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                            p.inventory === 0
                              ? 'bg-slate-100 text-slate-400 border border-slate-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          }`}
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>{inBasket ? `Add More (${inBasket.quantity})` : 'Add to Cart'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Clicking products immediately calls the live Express REST APIs in the background.</span>
            <span>Items: <strong>{products.length}</strong></span>
          </div>
        </div>

        {/* Right Column: Checkout Basket & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Shopping Basket */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 custom-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4.5 h-4.5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Active Shopping Basket</h3>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono font-bold px-2 py-0.5 rounded border border-indigo-100">
                  {cart.length} unique lines
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl mb-4">
                  <span className="text-xs italic text-slate-400 flex flex-col items-center gap-1">
                    <span>🛒 Your shopping cart is empty</span>
                    <span className="text-[10px] font-normal text-slate-400">Click products in the catalog to add items.</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto mb-4 pr-1">
                  {cart.map((item) => (
                    <div 
                      key={item.productId} 
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs shadow-sm hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0 select-none">{item.image}</span>
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-800 truncate text-[11px]">{item.name}</h5>
                          <span className="text-[10px] font-mono text-slate-400">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId, item.name)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtotal Display */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/70 rounded-xl mb-4 font-mono text-xs">
                <span className="text-slate-500 font-semibold uppercase">Total Basket Subtotal:</span>
                <span className="text-indigo-700 font-bold text-sm" id="gui-cart-subtotal">
                  ${cartTotalAmount.toFixed(2)}
                </span>
              </div>

              {/* Quick Checkout Form */}
              <form onSubmit={handlePlaceOrderGUI} className="space-y-3 pt-2 border-t border-slate-150">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Checkout Billing Information</h4>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Customer Name (Playwright Assert Name)</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={customerName} 
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Shipping Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={shippingAddress} 
                      onChange={e => setShippingAddress(e.target.value)}
                      placeholder="123 Automation Way"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0 || isCheckingOut}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition-all active:scale-[0.98] cursor-pointer ${
                    cart.length === 0 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isCheckingOut ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isCheckingOut ? 'Processing Checkout...' : 'Place Practice Checkout Order'}</span>
                </button>
              </form>

              {successOrder && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5 animate-in slide-in-from-top duration-200" id="gui-success-order-bill">
                  <span className="font-bold text-emerald-800 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Order Placed! ID: {successOrder.orderId}</span>
                  </span>
                  <p className="text-[11px] text-slate-600">
                    A total billing receipt of <strong>${successOrder.totalAmount.toFixed(2)}</strong> was settled inside memory. Shopping cart has been flushed!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Orders Logs Registry */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 custom-shadow">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Simulated Checkout Orders Log</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 font-semibold">{orders.length} orders</span>
            </div>

            <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-xs">
                  No orders placed yet. Perform a checkout above.
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.orderId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-700">{ord.orderId}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded uppercase">
                        {ord.status}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>By: <strong className="text-slate-600">{ord.customerName}</strong></span>
                      <span>Total: <strong className="text-slate-700">${ord.totalAmount.toFixed(2)}</strong></span>
                    </div>
                    <div className="border-t border-slate-200/50 pt-1.5 flex justify-between items-center text-[9px] font-mono text-slate-400">
                      <span className="truncate max-w-[150px]">To: {ord.shippingAddress}</span>
                      <span>{new Date(ord.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 3. INTERACTIVE ENDPOINT TESTBED (SWAGGER ACCORDION STYLE) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 custom-shadow" id="ecommerce-swagger-card">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-100">🔌</span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Interactive E-commerce API Try-It-Out Testbed</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Simulate actual endpoint requests to verify latency, payloads, and code compilation logic.</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border border-indigo-100 mt-2 md:mt-0">
            INTEGRATED ENDPOINTS
          </span>
        </div>

        <div className="space-y-3">
          
          {/* 1. GET /api/v1/products */}
          <div className="border border-blue-250 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setExpandedRoutes(prev => ({ ...prev, getProducts: !prev.getProducts }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.getProducts ? 'bg-blue-100/70' : 'bg-blue-50/70 hover:bg-blue-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">GET</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/products</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Fetches product definitions</span>
              </div>
              <span className="text-xs text-blue-700 font-mono font-bold">
                {expandedRoutes.getProducts ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.getProducts && (
              <div className="p-4 bg-white border-t border-blue-150 space-y-4">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Fetches the dynamic database catalog. Returns product prices, emojis, titles, and quantities.
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-slate-400">Parameters: None</span>
                  <button
                    onClick={handleExecuteGetProducts}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                  >
                    Execute Network Request
                  </button>
                </div>

                {renderApiResponsePanel('getProducts', {
                  playwright: `import { test, expect } from '@playwright/test';

test('GET /api/v1/products dynamic lookup', async ({ request }) => {
  const response = await request.get('${serverOrigin}/api/v1/products');
  expect(response.status()).toBe(200);
  
  const products = await response.json();
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
  
  // Validate fields
  const first = products[0];
  expect(first).toHaveProperty('id');
  expect(first).toHaveProperty('price');
  expect(first).toHaveProperty('inventory');
});`,
                  cypress: `describe('E-commerce Catalog tests', () => {
  it('should fetch the available products array with status 200', () => {
    cy.request('GET', '${serverOrigin}/api/v1/products').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body[0]).to.have.property('price');
    });
  });
});`,
                  fetch: `fetch('${serverOrigin}/api/v1/products')
  .then(res => res.json())
  .then(data => console.log('Products:', data))
  .catch(err => console.error('Fetch error:', err));`
                })}
              </div>
            )}
          </div>

          {/* 2. GET /api/v1/cart */}
          <div className="border border-blue-250 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setExpandedRoutes(prev => ({ ...prev, getCart: !prev.getCart }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.getCart ? 'bg-blue-100/70' : 'bg-blue-50/70 hover:bg-blue-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">GET</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/cart</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Fetches active cart basket lines</span>
              </div>
              <span className="text-xs text-blue-700 font-mono font-bold">
                {expandedRoutes.getCart ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.getCart && (
              <div className="p-4 bg-white border-t border-blue-150 space-y-4">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Queries active shopping lines currently cached in memory. Useful for calculating sum ratios and comparing to static catalog subtotals.
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-slate-400">Parameters: None</span>
                  <button
                    onClick={handleExecuteGetCart}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow transition-all active:scale-95 cursor-pointer"
                  >
                    Execute Network Request
                  </button>
                </div>

                {renderApiResponsePanel('getCart', {
                  playwright: `import { test, expect } from '@playwright/test';

test('GET /api/v1/cart retrieves dynamic items', async ({ request }) => {
  const response = await request.get('${serverOrigin}/api/v1/cart');
  expect(response.status()).toBe(200);
  
  const items = await response.json();
  expect(Array.isArray(items)).toBe(true);
});`,
                  cypress: `describe('Basket Inspection', () => {
  it('should fetch checkout cart array', () => {
    cy.request('GET', '${serverOrigin}/api/v1/cart').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });
});`,
                  fetch: `fetch('${serverOrigin}/api/v1/cart')
  .then(res => res.json())
  .then(data => console.log('Active Cart:', data));`
                })}
              </div>
            )}
          </div>

          {/* 3. POST /api/v1/cart */}
          <div className="border border-emerald-250 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setExpandedRoutes(prev => ({ ...prev, addCart: !prev.addCart }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.addCart ? 'bg-emerald-100/70' : 'bg-emerald-50/70 hover:bg-emerald-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">POST</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/cart</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Inserts product items into cart database</span>
              </div>
              <span className="text-xs text-emerald-700 font-mono font-bold">
                {expandedRoutes.addCart ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.addCart && (
              <div className="p-4 bg-white border-t border-emerald-150 space-y-4">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Simulate appending a product by passing the <code>productId</code> and <code>quantity</code> in the JSON payload body. On success, returns the newly calculated basket array.
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">productId (integer)</label>
                      <input
                        type="text"
                        value={payloadAddProductId}
                        onChange={(e) => setPayloadAddProductId(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">quantity (integer)</label>
                      <input
                        type="text"
                        value={payloadAddQuantity}
                        onChange={(e) => setPayloadAddQuantity(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      onClick={handleExecuteAddCart}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Execute Network Request
                    </button>
                  </div>
                </div>

                {renderApiResponsePanel('addCart', {
                  playwright: `import { test, expect } from '@playwright/test';

test('POST /api/v1/cart should insert item successfully', async ({ request }) => {
  const payload = {
    productId: ${parseInt(payloadAddProductId, 10) || 1},
    quantity: ${parseInt(payloadAddQuantity, 10) || 1}
  };

  const response = await request.post('${serverOrigin}/api/v1/cart', {
    data: payload
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.message).toContain('successfully added');
  expect(body.currentCart).toBeDefined();
});`,
                  cypress: `describe('POST Cart Addition', () => {
  it('should append item via REST call', () => {
    cy.request('POST', '${serverOrigin}/api/v1/cart', {
      productId: ${parseInt(payloadAddProductId, 10) || 1},
      quantity: ${parseInt(payloadAddQuantity, 10) || 1}
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.message).to.contain('successfully added');
    });
  });
});`,
                  fetch: `fetch('${serverOrigin}/api/v1/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: ${parseInt(payloadAddProductId, 10) || 1},
    quantity: ${parseInt(payloadAddQuantity, 10) || 1}
  })
})
  .then(res => res.json())
  .then(data => console.log('Updated basket:', data));`
                })}
              </div>
            )}
          </div>

          {/* 4. POST /api/v1/orders */}
          <div className="border border-emerald-250 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setExpandedRoutes(prev => ({ ...prev, checkout: !prev.checkout }))}
              className={`w-full flex items-center justify-between p-3 transition-colors text-left font-mono cursor-pointer ${
                expandedRoutes.checkout ? 'bg-emerald-100/70' : 'bg-emerald-50/70 hover:bg-emerald-100/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded uppercase tracking-wider text-center min-w-[70px]">POST</span>
                <span className="text-xs font-bold text-slate-800">/api/v1/orders</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">- Submits shopping cart and creates simulated billing order</span>
              </div>
              <span className="text-xs text-emerald-700 font-mono font-bold">
                {expandedRoutes.checkout ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>

            {expandedRoutes.checkout && (
              <div className="p-4 bg-white border-t border-emerald-150 space-y-4">
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Converts active cart contents into an order record log. Requires non-empty cart, subtracts stock inventory limits, and flushes cart contents.
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">customerName (string)</label>
                      <input
                        type="text"
                        value={payloadCustomerName}
                        onChange={(e) => setPayloadCustomerName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">shippingAddress (string)</label>
                      <input
                        type="text"
                        value={payloadShippingAddress}
                        onChange={(e) => setPayloadShippingAddress(e.target.value)}
                        placeholder="e.g. 123 Automation Rd"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      onClick={handleExecuteCheckout}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 cursor-pointer"
                    >
                      Execute Network Request
                    </button>
                  </div>
                </div>

                {renderApiResponsePanel('checkout', {
                  playwright: `import { test, expect } from '@playwright/test';

test('POST /api/v1/orders executes successful checkout', async ({ request }) => {
  // 1. Ensure cart has something first
  await request.post('${serverOrigin}/api/v1/cart', {
    data: { productId: 3, quantity: 1 }
  });

  // 2. Submit Order checkout
  const response = await request.post('${serverOrigin}/api/v1/orders', {
    data: {
      customerName: '${payloadCustomerName}',
      shippingAddress: '${payloadShippingAddress}'
    }
  });

  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.orderSummary).toBeDefined();
  expect(data.orderSummary.customerName).toBe('${payloadCustomerName}');
  expect(data.orderSummary.totalAmount).toBeGreaterThan(0);
});`,
                  cypress: `describe('Simulated Order checkout API', () => {
  it('should process order and deduct stock', () => {
    // 1. Setup cart state
    cy.request('POST', '${serverOrigin}/api/v1/cart', { productId: 4, quantity: 2 });

    // 2. Checkout
    cy.request('POST', '${serverOrigin}/api/v1/orders', {
      customerName: '${payloadCustomerName}',
      shippingAddress: '${payloadShippingAddress}'
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.orderSummary.customerName).to.eq('${payloadCustomerName}');
    });
  });
});`,
                  fetch: `fetch('${serverOrigin}/api/v1/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerName: '${payloadCustomerName}',
    shippingAddress: '${payloadShippingAddress}'
  })
})
  .then(res => res.json())
  .then(data => console.log('Receipt summary:', data))
  .catch(err => console.error('Checkout error:', err));`
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
