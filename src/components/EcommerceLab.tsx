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
  MapPin,
  CreditCard,
  Lock,
  ShieldCheck,
  LogOut,
  Search,
  Sparkles,
  Phone,
  AlertCircle,
  Truck,
  Heart,
  ChevronLeft
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

export default function EcommerceLab({ onAddLog }: EcommerceLabProps) {
  // --- AUTHENTICATION STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  
  // Login Inputs
  const [loginEmail, setLoginEmail] = useState('buyer@practice.com');
  const [loginPassword, setLoginPassword] = useState('secure_password123');
  const [loginName, setLoginName] = useState('Jane Automation');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- LIVE CATALOG & CART STATES ---
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isFetchingCart, setIsFetchingCart] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  
  // Storefront Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Electronics' | 'Stationery' | 'Lifestyle'>('All');

  // --- 4-STEP CHECKOUT STATE ---
  // Steps: 'cart' | 'shipping' | 'payment' | 'receipt'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'receipt'>('cart');
  
  // Shipping details state
  const [shippingName, setShippingName] = useState('Jane Automation');
  const [shippingAddress, setShippingAddress] = useState('456 Playwright Boulevard, Headless City');
  const [shippingZip, setShippingZip] = useState('94103');
  const [shippingPhone, setShippingPhone] = useState('+1 (555) 019-2834');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Credit Card Gateway input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('JANE AUTOMATION');
  
  // Simulated gateway processing state
  // States: '' | 'contacting' | 'verifying' | 'securing' | 'saving' | 'success'
  const [gatewayStatus, setGatewayStatus] = useState<'IDLE' | 'CONTACTING' | 'VERIFYING' | 'SAVING' | 'SUCCESS'>('IDLE');
  const [successOrder, setSuccessOrder] = useState<OrderRecord | null>(null);

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



  // Restores all products, cart, and orders
  const handleResetData = async () => {
    onAddLog('ECOMM_RESET_REQUEST', 'btn-reset-ecomm-db', 'Dispatched E-commerce reset sequence.');
    try {
      const res = await fetch('/api/v1/reset', { method: 'POST' });
      if (res.ok) {
        onAddLog('ECOMM_RESET_SUCCESS', 'btn-reset-ecomm-db', 'E-commerce database reinitialized successfully.');
        setSuccessOrder(null);
        setCheckoutStep('cart');
        await fetchAllData();
      }
    } catch (err) {
      console.error('Failed to reset E-commerce database:', err);
    }
  };

  // --- Real Interactive Store Handlers ---

  const handleAddToCart = async (productId: number, productName: string, qtyNeeded: number = 1) => {
    onAddLog('ECOMM_GUI_ADD_TO_CART', `btn-gui-add-${productId}`, `Adding quantity ${qtyNeeded} of ${productName} to shopping basket.`);
    try {
      const res = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qtyNeeded })
      });
      const data = await res.json();
      if (res.ok) {
        onAddLog('ECOMM_GUI_ADD_SUCCESS', `btn-gui-add-${productId}`, `Successfully added ${productName} to database.`);
        await fetchAllData(true);
      } else {
        onAddLog('ECOMM_GUI_ADD_ERROR', `btn-gui-add-${productId}`, `Add to cart rejected: ${data.error}`);
        alert(data.error || 'Failed to update item count');
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

  // Adjust specific basket quantity (+ or -)
  const handleAdjustQuantity = async (productId: number, productName: string, currentQty: number, action: 'inc' | 'dec') => {
    if (action === 'dec' && currentQty === 1) {
      await handleRemoveFromCart(productId, productName);
    } else {
      const difference = action === 'inc' ? 1 : -1;
      await handleAddToCart(productId, productName, difference);
    }
  };

  // --- Professional Secure Checkout Submission with payment gateway simulation ---
  const handleProceedCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName.trim()) {
      alert('Please fill out Billing Name');
      return;
    }
    setGatewayStatus('CONTACTING');
    onAddLog('PAYMENT_GATEWAY_SUBMIT', 'gateway-processing', 'Connecting to Stripe Sandbox processor...');

    // Sequential simulation states for high professional realism
    setTimeout(() => {
      setGatewayStatus('VERIFYING');
      onAddLog('PAYMENT_GATEWAY_VERIFY', 'gateway-processing', 'Authorizing sufficient credit balance and merchant credentials...');
      
      setTimeout(() => {
        setGatewayStatus('SAVING');
        onAddLog('PAYMENT_GATEWAY_WRITE', 'gateway-processing', 'Finalizing tokenized receipt. Dispatched database order creation...');
        
        // Dispatch the actual POST request to create order
        const fullShippingAddress = `${shippingAddress}, Zip ${shippingZip}, Phone: ${shippingPhone} (${shippingMethod === 'express' ? 'EXPRESS SHIPPING' : 'STANDARD SPEED'})`;
        
        fetch('/api/v1/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            customerName: shippingName, 
            shippingAddress: fullShippingAddress 
          })
        })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setGatewayStatus('SUCCESS');
            onAddLog('PAYMENT_GATEWAY_SUCCESS', 'gateway-processing', `Order submitted successfully! Reference: ${data.orderSummary.orderId}`);
            setSuccessOrder(data.orderSummary);
            setCheckoutStep('receipt');
            
            // Clean visual credit card inputs
            setCardNumber('');
            setCardExpiry('');
            setCardCVV('');
            
            // Re-fetch all dynamic registers instantly
            await fetchAllData(true);
          } else {
            setGatewayStatus('IDLE');
            onAddLog('PAYMENT_GATEWAY_REJECT', 'gateway-processing', `Gateway failure: ${data.error}`);
            alert(data.error || 'Failed to submit order');
          }
        })
        .catch(err => {
          setGatewayStatus('IDLE');
          onAddLog('PAYMENT_GATEWAY_ERROR', 'gateway-processing', `Network transaction fault: ${err.message}`);
          alert('Network transaction fault: ' + err.message);
        });

      }, 1000);
    }, 1000);
  };

  // --- Professional Sign-In Handler ---
  const handleUserSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginName.trim()) {
      alert('Please input email and name.');
      return;
    }
    setIsLoggingIn(true);
    onAddLog('AUTH_SIGNIN_START', 'form-signin', `Authenticating user session for ${loginEmail}...`);

    setTimeout(() => {
      setCurrentUser({ email: loginEmail, name: loginName });
      setShippingName(loginName);
      setCardName(loginName.toUpperCase());
      setIsLoggedIn(true);
      setIsLoggingIn(false);
      onAddLog('AUTH_SIGNIN_SUCCESS', 'form-signin', `Session verified. Granted token access for account ${loginName}.`);
    }, 800);
  };

  const handleUserSignOut = () => {
    onAddLog('AUTH_SIGNOUT', 'btn-signout', `Revoked token access for account ${currentUser?.name}.`);
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCheckoutStep('cart');
    setSuccessOrder(null);
  };

  // Auto-format Credit Card fields
  const handleCardNumberChange = (val: string) => {
    // Only allow numbers
    const clean = val.replace(/\D/g, '').substring(0, 16);
    // Format in blocks of 4
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    const formatted = clean.length >= 3 ? `${clean.substring(0, 2)}/${clean.substring(2, 4)}` : clean;
    setCardExpiry(formatted);
  };

  const handleCardCVVChange = (val: string) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    setCardCVV(clean);
  };



  // Calculations
  const cartTotalAmount = parseFloat(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2));
  const shippingCharge = shippingMethod === 'express' ? 15.00 : 0.00;
  const grandTotalAmount = parseFloat((cartTotalAmount + shippingCharge).toFixed(2));

  // Catalog filtering logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                Test a professional E-commerce application flow: user authentication, products catalog searching, cart quantity steppers, shipping logistics, and a secure credit card payment simulation. Useful for Postman and automation scripts!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* RAW PRODUCTS LINK (NEW TAB) */}
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

      {/* --- RENDER LOGIN VIEW GATE IF NOT LOGGED IN --- */}
      {!isLoggedIn ? (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200 mt-4" id="ecomm-login-gate">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-center text-white relative">
            <div className="absolute top-4 right-4 bg-white/15 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase font-semibold">
              Secure Auth
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
              <Lock className="w-6 h-6 text-indigo-100" />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">Sandbox Mart Terminal Login</h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-sm mx-auto leading-relaxed">
              Authenticate your test session to initialize customer-specific API authorizations, checkout addresses, and order histories.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleUserSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    placeholder="Jane Automation"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Send className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    placeholder="buyer@practice.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Password (Any dummy value)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    placeholder="••••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{isLoggingIn ? 'Verifying Credentials...' : 'Sign In and Initialize Storefront ➔'}</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2 bg-slate-50 p-4 rounded-xl text-center">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Test Automation Tip 🎓</span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Perfect for automated scripts! You can bypass this modal in your testing assertions or pre-populate variables in input fields before triggering click states.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* --- RENDER PROFESSIONAL STOREFRONT WORKSPACE --- */
        <div className="space-y-6 animate-in fade-in duration-200" id="ecomm-main-storefront">
          
          {/* USER PROFILE STATUS STRIP */}
          <div className="bg-indigo-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-indigo-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-800 rounded-full flex items-center justify-center border border-indigo-700 shadow-inner font-bold text-sm text-white uppercase tracking-wider shrink-0 select-none">
                {currentUser?.name.substring(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">Active session: {currentUser?.name}</span>
                  <span className="bg-emerald-500 text-white text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full">
                    Authorized
                  </span>
                </div>
                <span className="text-[11px] text-indigo-200 block mt-0.5">{currentUser?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right hidden md:block">
                <span className="text-[10px] font-mono text-indigo-300 block uppercase font-semibold">Active Cart subtotal</span>
                <span className="text-sm font-bold text-white font-mono">${cartTotalAmount.toFixed(2)}</span>
              </div>
              <button
                onClick={handleUserSignOut}
                className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-700 border border-indigo-700 hover:border-indigo-600 text-indigo-200 hover:text-white rounded-lg text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* --- LEFT SIDE: LIVE PRODUCTS CATALOG STOREFRONT (7 cols) --- */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 custom-shadow flex flex-col justify-between">
              <div>
                
                {/* Search and Filter Panel */}
                <div className="border-b border-slate-100 pb-5 mb-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-600 animate-pulse" />
                      <h3 className="font-bold text-slate-800 text-sm">Interactive Products Catalog</h3>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 font-mono font-bold rounded">
                      Memory State synchronized
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Search Field */}
                    <div className="sm:col-span-6 relative">
                      <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl pl-8.5 pr-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
                      />
                    </div>

                    {/* Category pills */}
                    <div className="sm:col-span-6 flex gap-1 overflow-x-auto pr-1">
                      {(['All', 'Electronics', 'Stationery', 'Lifestyle'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap cursor-pointer transition-all ${
                            selectedCategory === cat
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="storefront-product-grid">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-400 italic text-xs">
                      No matching products found. Try adjusting filters or search.
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const inBasket = cart.find(item => item.productId === p.id);
                      return (
                        <div 
                          key={p.id} 
                          className="border border-slate-200/85 hover:border-indigo-300 rounded-xl p-4 bg-slate-50/20 hover:bg-white transition-all shadow-sm flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <span className="text-3xl filter drop-shadow-sm select-none" role="img" aria-label={p.name}>
                                {p.image}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize font-semibold">
                                {p.category}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-xs mt-3 group-hover:text-indigo-700 transition-colors">
                              {p.name}
                            </h4>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="font-mono font-extrabold text-slate-900 text-sm">${p.price.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400">/ unit</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="text-[10px] font-mono text-slate-500">
                              Stock: <strong className={p.inventory === 0 ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}>
                                {p.inventory === 0 ? 'Out of Stock' : `${p.inventory} units`}
                              </strong>
                            </div>

                            {/* DYNAMIC CART STEPPER INTERACTION FOR PROFESSIONAL SAAS FEEL */}
                            {inBasket ? (
                              <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200/60 p-0.5 rounded-lg">
                                <button
                                  onClick={() => handleAdjustQuantity(p.id, p.name, inBasket.quantity, 'dec')}
                                  className="w-6 h-6 bg-white border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded flex items-center justify-center cursor-pointer font-bold text-xs shadow-sm"
                                  title="Reduce Quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-mono font-extrabold text-indigo-900 min-w-[16px] text-center">
                                  {inBasket.quantity}
                                </span>
                                <button
                                  onClick={() => handleAdjustQuantity(p.id, p.name, inBasket.quantity, 'inc')}
                                  disabled={inBasket.quantity >= p.inventory}
                                  className="w-6 h-6 bg-white border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center cursor-pointer font-bold text-xs shadow-sm"
                                  title="Increase Quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
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
                                <span>Add to Cart</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
                <span>Selecting items immediately triggers the REST APIs inside memory.</span>
                <span>Active stock: <strong>{filteredProducts.length} items shown</strong></span>
              </div>
            </div>

            {/* --- RIGHT SIDE: STEPPER BUNDLE CHECKOUT PANELS (5 cols) --- */}
            <div className="lg:col-span-5">
              
              {/* STEPPER TRACKER HIGHLIGHT */}
              <div className="bg-white border border-slate-200 rounded-t-xl px-4 py-3 flex items-center justify-between border-b-0">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Secure Checkout Process
                </span>
                <div className="flex items-center gap-1">
                  {(['cart', 'shipping', 'payment', 'receipt'] as const).map((step, idx) => {
                    const stepNames = { cart: '1. Cart', shipping: '2. Shipping', payment: '3. Pay', receipt: '4. Invoice' };
                    const isActive = checkoutStep === step;
                    return (
                      <span 
                        key={step} 
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-extrabold uppercase ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {stepNames[step]}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* --- STEP 1: CART BASKET VIEW --- */}
              {checkoutStep === 'cart' && (
                <div className="bg-white rounded-b-xl border border-slate-200 p-6 custom-shadow space-y-4 animate-in fade-in duration-150" id="step-checkout-cart">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4.5 h-4.5 text-indigo-600 animate-bounce" />
                      <h3 className="font-bold text-slate-800 text-sm">Review Cart Contents</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-bold">
                      {cart.length} line items
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl">
                      <span className="text-xs italic text-slate-400 flex flex-col items-center gap-1.5">
                        <span className="text-3xl select-none">🛍️</span>
                        <span>Your basket database is currently empty</span>
                        <span className="text-[10px] font-normal text-slate-400">Click products in the catalog on the left!</span>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div 
                          key={item.productId} 
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-indigo-200 transition-all shadow-xs"
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

                          <div className="flex items-center gap-3">
                            {/* MINI STEPPER CONTROLS DIRECTLY INSIDE BASKET */}
                            <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5">
                              <button
                                onClick={() => handleAdjustQuantity(item.productId, item.name, item.quantity, 'dec')}
                                className="w-5 h-5 text-slate-500 hover:text-rose-600 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="px-1.5 text-[10px] font-mono font-bold text-slate-800 min-w-[12px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleAdjustQuantity(item.productId, item.name, item.quantity, 'inc')}
                                className="w-5 h-5 text-slate-500 hover:text-indigo-600 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-mono font-bold text-slate-800 text-xs">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleRemoveFromCart(item.productId, item.name)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subtotal Display */}
                  <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl font-mono text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wide">Basket Subtotal:</span>
                    <span className="text-indigo-700 font-extrabold text-sm" id="gui-cart-subtotal">
                      ${cartTotalAmount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onAddLog('STEP_NAV_SHIPPING', 'btn-proceed-shipping', 'Proceeding to step 2: Delivery Details');
                      setCheckoutStep('shipping');
                    }}
                    disabled={cart.length === 0}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
                      cart.length === 0 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <span>Proceed to Delivery details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* --- STEP 2: SHIPPING AND DELIVERY --- */}
              {checkoutStep === 'shipping' && (
                <div className="bg-white rounded-b-xl border border-slate-200 p-6 custom-shadow space-y-4 animate-in fade-in duration-150" id="step-checkout-shipping">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4.5 h-4.5 text-indigo-600" />
                      <h3 className="font-bold text-slate-800 text-sm">Delivery &amp; Courier logistics</h3>
                    </div>
                    <button
                      onClick={() => setCheckoutStep('cart')}
                      className="text-xs font-mono text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      ◀ Back to Cart
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-0.5">Recipient Full Name</label>
                      <div className="relative">
                        <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          value={shippingName} 
                          onChange={e => {
                            setShippingName(e.target.value);
                            setCardName(e.target.value.toUpperCase());
                          }}
                          placeholder="Recipient name"
                          className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-0.5">Shipping Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input 
                            type="text" 
                            value={shippingAddress} 
                            onChange={e => setShippingAddress(e.target.value)}
                            placeholder="Street Address"
                            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-0.5">Zip Code</label>
                        <input 
                          type="text" 
                          value={shippingZip} 
                          onChange={e => setShippingZip(e.target.value)}
                          placeholder="94103"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-0.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          value={shippingPhone} 
                          onChange={e => setShippingPhone(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm font-mono"
                        />
                      </div>
                    </div>

                    {/* Delivery Options */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">Carrier Speed Option</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShippingMethod('standard');
                            onAddLog('SELECT_CARRIER', 'carrier-standard', 'Selected standard delivery');
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            shippingMethod === 'standard'
                              ? 'bg-indigo-50/50 border-indigo-500 text-indigo-900 shadow-sm'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="font-extrabold text-[11px] block">Standard Delivery</div>
                          <span className="text-[10px] text-slate-400 font-mono">3-5 Days • FREE</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShippingMethod('express');
                            onAddLog('SELECT_CARRIER', 'carrier-express', 'Selected priority express courier');
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            shippingMethod === 'express'
                              ? 'bg-indigo-50/50 border-indigo-500 text-indigo-900 shadow-sm'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="font-extrabold text-[11px] block">Express Courier</div>
                          <span className="text-[10px] text-indigo-600 font-mono font-bold">1-2 Days • +$15.00</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic calculation list */}
                  <div className="bg-slate-50 p-3 rounded-lg text-[11px] space-y-1.5 font-mono text-slate-500 border border-slate-200/50">
                    <div className="flex justify-between">
                      <span>Cart Subtotal:</span>
                      <span className="text-slate-800">${cartTotalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Speedways:</span>
                      <span className="text-slate-800 font-semibold">{shippingCharge === 0 ? 'FREE' : `+$${shippingCharge.toFixed(2)}`}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between text-indigo-700 font-bold">
                      <span>Grand Total:</span>
                      <span>${grandTotalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddLog('STEP_NAV_PAYMENT', 'btn-proceed-payment', 'Proceeding to step 3: Secure Credit Card Gateway');
                      setCheckoutStep('payment');
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <span>Proceed to Secured Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* --- STEP 3: PAYMENT GATEWAY (CREDIT CARD) --- */}
              {checkoutStep === 'payment' && (
                <div className="bg-white rounded-b-xl border border-slate-200 p-6 custom-shadow space-y-4 animate-in fade-in duration-150" id="step-checkout-payment">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                      <h3 className="font-bold text-slate-800 text-sm">Secure Merchant Card Terminal</h3>
                    </div>
                    <button
                      onClick={() => setCheckoutStep('shipping')}
                      className="text-xs font-mono text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      ◀ Back to Shipping
                    </button>
                  </div>

                  {/* VISUAL REALISTIC CREDIT CARD */}
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white rounded-2xl p-5 shadow-lg border border-slate-800/80 aspect-[1.586/1] flex flex-col justify-between font-mono relative overflow-hidden select-none">
                    {/* Atmospheric glow overlays */}
                    <div className="absolute -right-10 -top-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl"></div>

                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[8px] tracking-widest text-indigo-300 uppercase font-semibold">Secure Practice Card</span>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-bold">Tokenized ID</span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-slate-300 tracking-wider">
                        {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MASTERCARD' : 'SANDBOX CARD'}
                      </span>
                    </div>

                    {/* Chip emulation */}
                    <div className="w-8 h-6 bg-gradient-to-r from-amber-300 to-yellow-500 rounded-sm shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10 flex flex-wrap gap-0.5 p-0.5">
                        <div className="border border-white/20 w-full h-full"></div>
                      </div>
                    </div>

                    {/* Card Number display */}
                    <div className="text-base sm:text-lg tracking-widest text-center text-slate-100 font-bold my-2 py-0.5 bg-black/15 rounded-md">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end text-[9px] text-slate-300 uppercase">
                      <div>
                        <span className="text-[7px] text-slate-400 block tracking-wide">Cardholder Name</span>
                        <span className="font-semibold text-white tracking-wider truncate max-w-[150px] block">
                          {cardName || 'JANE AUTOMATION'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7px] text-slate-400 block tracking-wide">Expires</span>
                        <span className="font-semibold text-white font-mono block">
                          {cardExpiry || 'MM/YY'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7px] text-slate-400 block tracking-wide">CVV</span>
                        <span className="font-semibold text-white font-mono block">
                          {cardCVV ? '•••' : '000'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT INPUTS FORM */}
                  <form onSubmit={handleProceedCheckoutSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-0.5">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4000 1234 5678 9010"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm font-mono"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-0.5">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          placeholder="JANE AUTOMATION"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm uppercase font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-0.5">CVV</label>
                        <input
                          type="password"
                          value={cardCVV}
                          onChange={(e) => handleCardCVVChange(e.target.value)}
                          placeholder="•••"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm text-center font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-0.5">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => handleCardExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm text-center font-mono"
                          required
                        />
                      </div>
                      <div className="col-span-2 flex flex-col justify-end">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 bg-slate-50 p-1 rounded border border-slate-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Strictly encrypted memory sandbox. No real assets are processed.</span>
                        </div>
                      </div>
                    </div>

                    {/* GATEWAY LOADING STATES OVERLAY AND BUTTONS */}
                    {gatewayStatus !== 'IDLE' ? (
                      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 flex flex-col items-center justify-center text-center animate-pulse" id="gateway-processing-bill">
                        <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                        <div className="space-y-1">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                            {gatewayStatus === 'CONTACTING' ? '1/3 Connecting Stripe Sandbox Gateway...' :
                             gatewayStatus === 'VERIFYING' ? '2/3 Resolving ledger authorizations...' :
                             gatewayStatus === 'SAVING' ? '3/3 Writing finalized database receipt...' : 
                             'Secure Transaction settled!'}
                          </span>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                            Please wait. Simulating high-fidelity end-to-end payment API latency sequences...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Authorize Secure Payment: ${grandTotalAmount.toFixed(2)}</span>
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* --- STEP 4: SUCCESS RECEIPT AND INVOICE TICKET --- */}
              {checkoutStep === 'receipt' && successOrder && (
                <div className="bg-white rounded-b-xl border border-slate-200 p-6 custom-shadow space-y-4 animate-in fade-in duration-200" id="step-checkout-receipt">
                  <div className="flex flex-col items-center justify-center text-center pb-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200 shadow-sm text-emerald-600 mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">Transactional Receipt Settled</h3>
                    <p className="text-[11px] text-slate-400">Merchant sandbox transaction completed with status code 201.</p>
                  </div>

                  {/* DETAILED DASHED TICKET */}
                  <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-4 font-mono text-[11px] text-slate-500 space-y-3 relative overflow-hidden shadow-xs">
                    
                    {/* Decorative side punch holes */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-white border border-slate-200 rounded-r-full -ml-1.5"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-white border border-slate-200 rounded-l-full -mr-1.5"></div>

                    <div className="flex justify-between border-b border-slate-200/50 pb-2 text-[10px]">
                      <span>TRANSACTION REF:</span>
                      <span className="text-slate-800 font-bold">{successOrder.orderId}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Billed To:</span>
                        <span className="text-slate-800 font-semibold">{successOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issued On:</span>
                        <span className="text-slate-800">{new Date(successOrder.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fulfill Mode:</span>
                        <span className="text-slate-800 truncate max-w-[150px]">{successOrder.shippingAddress}</span>
                      </div>
                    </div>

                    <div className="border-t border-b border-slate-200/50 py-2.5 my-1.5 space-y-2">
                      <span className="text-[9px] uppercase text-slate-400 block font-bold">Itemized billing subtotal</span>
                      {successOrder.items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-slate-600">
                          <span className="truncate max-w-[160px]">{item.image} {item.name} (x{item.quantity})</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-slate-800 font-bold text-xs pt-0.5">
                      <span>Grand Total Settled:</span>
                      <span className="text-indigo-700 font-black">${successOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddLog('START_NEW_STORE_SESSION', 'btn-restart-shopping', 'Clearing checkout invoice. Restoring main storefront catalog');
                      setSuccessOrder(null);
                      setCheckoutStep('cart');
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Start New Shopping Session</span>
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* --- BOTTOM SECTION: CONFIRMED ORDERS HISTORY LOG REGISTRY --- */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 custom-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Simulated Checkout Orders Log</h3>
                  <p className="text-[11px] text-slate-400">Confirmed transaction records currently present in active sandbox memory.</p>
                </div>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-mono font-bold px-2.5 py-1 rounded-lg self-start">
                {orders.length} Total orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 text-slate-450 italic text-xs border border-dashed border-slate-200 bg-slate-50/20 rounded-xl">
                No orders placed in sandbox registry yet. Proceed through a full secure card payment sequence above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="ecomm-orders-registry-grid">
                {orders.map((ord) => (
                  <div key={ord.orderId} className="border border-slate-200 rounded-xl bg-slate-50/30 hover:bg-white transition-all p-4 text-xs space-y-2 hover:shadow-xs hover:border-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-indigo-700">{ord.orderId}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-bold rounded uppercase">
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Billed Account:</span>
                        <strong className="text-slate-700 truncate max-w-[120px]">{ord.customerName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Grand Total:</span>
                        <strong className="text-slate-700 font-mono">${ord.totalAmount.toFixed(2)}</strong>
                      </div>
                    </div>

                    <details className="group border border-slate-200/50 rounded-lg overflow-hidden bg-white">
                      <summary className="bg-slate-50/50 px-2.5 py-1 text-[10px] text-slate-450 font-bold cursor-pointer select-none flex justify-between items-center hover:text-slate-600">
                        <span>Items List ({ord.items.length})</span>
                        <span className="group-open:hidden">▶</span>
                        <span className="hidden group-open:inline">▼</span>
                      </summary>
                      <div className="p-2 border-t border-slate-100 bg-slate-50/20 text-[10px] space-y-1 font-mono text-slate-500">
                        {ord.items.map((i) => (
                          <div key={i.productId} className="flex justify-between border-b border-slate-100/30 pb-0.5">
                            <span>{i.image} {i.name} (x{i.quantity})</span>
                            <span>${(i.price * i.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </details>

                    <div className="border-t border-slate-200/50 pt-2 flex justify-between items-center text-[9px] font-mono text-slate-400">
                      <span className="truncate max-w-[140px]" title={ord.shippingAddress}>Address: {ord.shippingAddress}</span>
                      <span>{new Date(ord.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}



    </div>
  );
}
