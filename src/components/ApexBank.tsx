/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, BankAccount } from '../types';
import { 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Send, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Wallet
} from 'lucide-react';

interface ApexBankProps {
  onAddLog: (event: string, elementId: string, details: string) => void;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-90812',
    date: '2026-06-23 14:32',
    reference: 'REF-889120',
    description: 'Cloud Infrastructure Provider Inc.',
    type: 'debit',
    amount: 512.40,
    balanceAfter: 12431.22,
    category: 'Utilities'
  },
  {
    id: 'TXN-90805',
    date: '2026-06-22 09:15',
    reference: 'REF-771239',
    description: 'Biweekly Corporate Salary Dep',
    type: 'credit',
    amount: 4200.00,
    balanceAfter: 12943.62,
    category: 'Salary'
  },
  {
    id: 'TXN-90799',
    date: '2026-06-20 20:11',
    reference: 'REF-112002',
    description: 'Le Bistrot Parisien Food Store',
    type: 'debit',
    amount: 145.80,
    balanceAfter: 8743.62,
    category: 'Dining'
  },
  {
    id: 'TXN-90741',
    date: '2026-06-18 11:05',
    reference: 'REF-334211',
    description: 'Supermarket Groceries Depot',
    type: 'debit',
    amount: 89.22,
    balanceAfter: 8889.42,
    category: 'Shopping'
  },
  {
    id: 'TXN-90710',
    date: '2026-06-15 17:44',
    reference: 'REF-909881',
    description: 'Apex Prime Growth Fund',
    type: 'debit',
    amount: 1000.00,
    balanceAfter: 8978.64,
    category: 'Investment'
  }
];

export default function ApexBank({ onAddLog }: ApexBankProps) {
  // Accounts Balance State
  const [checkingBalance, setCheckingBalance] = useState(12431.22);
  const [savingsBalance, setSavingsBalance] = useState(48210.55);
  const [creditUsed, setCreditUsed] = useState(1240.11);

  // Transfer State
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientRouting, setRecipientRouting] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCategory, setTransferCategory] = useState<'Salary' | 'Transfer' | 'Shopping' | 'Utilities' | 'Dining' | 'Investment'>('Transfer');
  const [transferMemo, setTransferMemo] = useState('');
  const [transferDelay, setTransferDelay] = useState<number>(2000); // delay in milliseconds
  
  const [transferStatus, setTransferStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [transferErrorMsg, setTransferErrorMsg] = useState('');
  const [successTxId, setSuccessTxId] = useState('');

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [txnSearch, setTxnSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Quick fill transfers
  const handleQuickFillTransfer = (valid: boolean) => {
    if (valid) {
      setRecipientName('John Q. Automation');
      setRecipientAccount('1234567890');
      setRecipientRouting('021000021'); // Valid routing structure (9 digits)
      setTransferAmount('250.00');
      setTransferMemo('Simulated QA Transfer');
      onAddLog('QUICK_FILL', 'btn-quick-fill-bank-valid', 'Filled valid wire transfer details');
    } else {
      setRecipientName('Jane Tester');
      setRecipientAccount('abc');
      setRecipientRouting('999'); // Invalid routing
      setTransferAmount('999999.00'); // Way over balance
      setTransferMemo('Insufficent funds & bad codes');
      onAddLog('QUICK_FILL', 'btn-quick-fill-bank-invalid', 'Filled invalid bank transfer values');
    }
    setTransferStatus('idle');
  };

  const handleWireTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog('TRANSFER_SUBMIT_START', 'bank-transfer-form', `Starting transfer evaluation. Recipient: ${recipientName}, Amt: ${transferAmount}`);

    // Frontend validations
    if (!recipientName.trim()) {
      setTransferStatus('error');
      setTransferErrorMsg('Recipient full name is required');
      onAddLog('TRANSFER_VALIDATION_FAILED', 'transfer-recipient-name', 'Missing recipient name');
      return;
    }

    if (!recipientAccount.trim() || !/^\d{8,17}$/.test(recipientAccount)) {
      setTransferStatus('error');
      setTransferErrorMsg('Account number must be between 8 and 17 numeric digits');
      onAddLog('TRANSFER_VALIDATION_FAILED', 'transfer-recipient-account', 'Invalid account format');
      return;
    }

    if (!recipientRouting.trim() || !/^\d{9}$/.test(recipientRouting)) {
      setTransferStatus('error');
      setTransferErrorMsg('Routing transit number must be exactly 9 numeric digits');
      onAddLog('TRANSFER_VALIDATION_FAILED', 'transfer-recipient-routing', 'Invalid routing format');
      return;
    }

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setTransferStatus('error');
      setTransferErrorMsg('Please specify a positive transfer amount');
      onAddLog('TRANSFER_VALIDATION_FAILED', 'transfer-amount', 'Invalid numeric transfer amount');
      return;
    }

    if (amt > checkingBalance) {
      setTransferStatus('error');
      setTransferErrorMsg(`Insufficient Funds: Attempted to transfer $${amt.toFixed(2)} but your checking balance is $${checkingBalance.toFixed(2)}`);
      onAddLog('TRANSFER_VALIDATION_FAILED', 'transfer-amount', 'Insufficient balance');
      return;
    }

    // Pass front validations, trigger loader simulation
    setTransferStatus('loading');
    setTransferErrorMsg('');
    onAddLog('TRANSFER_ASYNC_WAIT', 'wire-transfer-spinner', `Simulating wire routing transit delay of ${transferDelay / 1000}s`);

    setTimeout(() => {
      // Simulate real processing block
      const newTxnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
      const completedAmount = parseFloat(transferAmount);
      const newBalance = checkingBalance - completedAmount;

      const newTx: Transaction = {
        id: newTxnId,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        description: `Wire Out: ${recipientName}${transferMemo ? ' - ' + transferMemo : ''}`,
        type: 'debit',
        amount: completedAmount,
        balanceAfter: newBalance,
        category: transferCategory
      };

      setCheckingBalance(parseFloat(newBalance.toFixed(2)));
      setTransactions([newTx, ...transactions]);
      setSuccessTxId(newTxnId);
      setTransferStatus('success');

      // Reset form fields
      setRecipientName('');
      setRecipientAccount('');
      setRecipientRouting('');
      setTransferAmount('');
      setTransferMemo('');

      onAddLog('TRANSFER_SUCCESS', 'bank-transfer-form', `Wire transfer routed. ID: ${newTxnId}, Amt: $${completedAmount}. New balance: $${newBalance.toFixed(2)}`);
    }, transferDelay);
  };

  // Filter & Search Logic
  const filteredTxns = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(txnSearch.toLowerCase()) ||
      tx.id.toLowerCase().includes(txnSearch.toLowerCase()) ||
      tx.reference.toLowerCase().includes(txnSearch.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const resetAllBankData = () => {
    setCheckingBalance(12431.22);
    setSavingsBalance(48210.55);
    setCreditUsed(1240.11);
    setTransactions(INITIAL_TRANSACTIONS);
    setTransferStatus('idle');
    setTransferErrorMsg('');
    setTxnSearch('');
    setCategoryFilter('all');
    setTypeFilter('all');
    onAddLog('BANK_RESET', 'btn-reset-bank-dashboard', 'Reset bank summaries, ledgers, and fields');
  };

  return (
    <div id="apex-bank-container" className="space-y-6">
      {/* Banking Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 custom-shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold tracking-wider text-sm shadow">
            APEX
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-800" id="bank-hub-title">
              Apex National Bank Portal (Sandbox)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Simulate high-risk financial processes. Test complex loaders, transactional state updates, search-by-keywords, and filtered datagrid grids.
            </p>
          </div>
        </div>
        <button
          id="btn-reset-bank-dashboard"
          onClick={resetAllBankData}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all border border-slate-200 shrink-0 self-start md:self-auto"
        >
          Reset Bank Dashboard
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="bank-balances-grid">
        {/* Checking */}
        <div id="checking-card" className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 custom-shadow relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <span className="text-slate-400 text-xs font-mono tracking-wider block">ACCOUNT: CHECKING (*4412)</span>
          <h3 className="text-3xl font-bold tracking-tight mt-2" id="checking-balance-display">
            ${checkingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Apex Secured Active Deposit
          </div>
        </div>

        {/* Savings */}
        <div id="savings-card" className="bg-white text-slate-800 p-6 rounded-xl border border-slate-200 custom-shadow relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-5 text-indigo-600">
            <Building2 className="w-24 h-24" />
          </div>
          <span className="text-slate-400 text-xs font-mono tracking-wider block">ACCOUNT: HIGH-YIELD SAVINGS (*9902)</span>
          <h3 className="text-3xl font-bold tracking-tight mt-2 text-slate-900" id="savings-balance-display">
            ${savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-500 font-mono font-medium">
            +4.85% APY compounding daily
          </div>
        </div>

        {/* Credit Card */}
        <div id="credit-card" className="bg-white text-slate-800 p-6 rounded-xl border border-slate-200 custom-shadow relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-5 text-indigo-600">
            <CreditCard className="w-24 h-24" />
          </div>
          <span className="text-slate-400 text-xs font-mono tracking-wider block">CREDIT CARD BALANCE (*1029)</span>
          <h3 className="text-3xl font-bold tracking-tight mt-2 text-slate-900" id="credit-balance-display">
            ${creditUsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 font-mono">
            Statement limit: $10,000.00
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECURE TRANSFER SIMULATOR FORM */}
        <div id="bank-transfer-form-card" className="bg-white rounded-xl border border-slate-200 custom-shadow lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-slate-800 text-sm">Secure Wire Transfer</h3>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-mono font-semibold">
                SECURE_TRANSFER_API
              </span>
            </div>

            {/* Quick automation selectors */}
            <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                Transfer Helpers for Automation
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  id="bank-fill-valid-btn"
                  onClick={() => handleQuickFillTransfer(true)}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] transition-all font-medium"
                >
                  Fill Valid Transfer
                </button>
                <button
                  id="bank-fill-invalid-btn"
                  onClick={() => handleQuickFillTransfer(false)}
                  className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-[11px] transition-all font-medium"
                >
                  Fill Overdraft / Bad Form
                </button>
              </div>
            </div>

            {/* Status alerts */}
            {transferStatus === 'success' && (
              <div id="transfer-success-alert" className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold block">Wire Routing Complete!</span>
                  <p className="mt-0.5">Funds deposited successfully. Reference transaction recorded: <strong id="success-reference-txn" className="font-mono">{successTxId}</strong></p>
                </div>
              </div>
            )}

            {transferStatus === 'error' && (
              <div id="transfer-error-alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2">
                <XCircle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold block" id="transfer-error-header">Transfer Denied</span>
                  <p className="mt-0.5" id="transfer-error-message">{transferErrorMsg}</p>
                </div>
              </div>
            )}

            {/* Main Form */}
            <form id="bank-transfer-form" onSubmit={handleWireTransferSubmit} className="space-y-4">
              {/* Recipient Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="transfer-recipient-name">
                  Beneficiary / Recipient Full Name
                </label>
                <input
                  id="transfer-recipient-name"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
                  disabled={transferStatus === 'loading'}
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="transfer-recipient-account">
                  Recipient Account Number
                </label>
                <input
                  id="transfer-recipient-account"
                  type="text"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  placeholder="8 to 17 numeric digits"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono shadow-sm"
                  disabled={transferStatus === 'loading'}
                />
              </div>

              {/* Routing Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="transfer-recipient-routing">
                  Routing Transit Number (RTN)
                </label>
                <input
                  id="transfer-recipient-routing"
                  type="text"
                  value={recipientRouting}
                  onChange={(e) => setRecipientRouting(e.target.value)}
                  placeholder="Exactly 9 digits"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono shadow-sm"
                  disabled={transferStatus === 'loading'}
                />
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="transfer-amount">
                    Transfer Amount ($)
                  </label>
                  <input
                    id="transfer-amount"
                    type="text"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono font-semibold shadow-sm"
                    disabled={transferStatus === 'loading'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="transfer-category">
                    Transaction Category
                  </label>
                  <select
                    id="transfer-category"
                    value={transferCategory}
                    onChange={(e) => setTransferCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
                    disabled={transferStatus === 'loading'}
                  >
                    <option value="Transfer">Transfer</option>
                    <option value="Salary">Salary</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Dining">Dining</option>
                    <option value="Investment">Investment</option>
                  </select>
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="transfer-memo">
                  Transfer Memo / Description (Optional)
                </label>
                <input
                  id="transfer-memo"
                  type="text"
                  value={transferMemo}
                  onChange={(e) => setTransferMemo(e.target.value)}
                  placeholder="Purpose of wire..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
                  disabled={transferStatus === 'loading'}
                />
              </div>

              {/* Dynamic Delay Setting */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="transfer-delay-select">
                  Simulate Network Lag Delay (QA Wait Practicing)
                </label>
                <select
                  id="transfer-delay-select"
                  value={transferDelay}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTransferDelay(val);
                    onAddLog('DELAY_SETTING_CHANGED', 'transfer-delay-select', `Simulated transit delay adjusted to ${val}ms`);
                  }}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 focus:outline-none shadow-sm cursor-pointer"
                  disabled={transferStatus === 'loading'}
                >
                  <option value={0}>0s (Instant Processing)</option>
                  <option value={1000}>1s Latency</option>
                  <option value={2000}>2s Latency (Default)</option>
                  <option value={5000}>5s Latency (Long Asynchronous Wait)</option>
                </select>
              </div>

              {/* Submit / Spinner button */}
              <button
                id="transfer-submit-btn"
                type="submit"
                disabled={transferStatus === 'loading'}
                className="w-full bg-slate-900 hover:bg-slate-850 disabled:bg-slate-300 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer duration-150"
              >
                {transferStatus === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" id="wire-transfer-spinner" />
                    <span id="transfer-btn-text">Processing Wire...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span id="transfer-btn-text">Authorize Wire Outflow</span>
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            💡 Automation selectors like <span className="bg-slate-100 px-1 rounded text-indigo-600 font-bold">#wire-transfer-spinner</span> are dynamically added to DOM. Your tests should wait for this loader to disappear before checking results.
          </div>
        </div>

        {/* LEDGER & TRANSACTION HISTORY */}
        <div id="bank-ledger-card" className="bg-white rounded-xl border border-slate-200 custom-shadow lg:col-span-7 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-slate-800 text-sm">Interactive Transaction History</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono select-none">
                GRID_ID: #bank-ledger-grid
              </span>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4" id="ledger-controls">
              {/* Keyword Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="ledger-search-input"
                  type="text"
                  placeholder="Search description, reference..."
                  value={txnSearch}
                  onChange={(e) => {
                    setTxnSearch(e.target.value);
                    onAddLog('ON_CHANGE', 'ledger-search-input', `Searched ledger: "${e.target.value}"`);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-100 focus:border-indigo-500"
                />
              </div>

              {/* Category selector */}
              <div className="relative flex items-center">
                <Filter className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  id="ledger-category-filter"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    onAddLog('FILTER_LEDGER', 'ledger-category-filter', `Filtered ledger by category: "${e.target.value}"`);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Salary">Salary Only</option>
                  <option value="Transfer">Transfer Only</option>
                  <option value="Shopping">Shopping Only</option>
                  <option value="Utilities">Utilities Only</option>
                  <option value="Dining">Dining Only</option>
                  <option value="Investment">Investment Only</option>
                </select>
              </div>

              {/* Transaction type selector */}
              <div className="relative flex items-center">
                <RefreshCw className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  id="ledger-type-filter"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    onAddLog('FILTER_LEDGER', 'ledger-type-filter', `Filtered ledger by type: "${e.target.value}"`);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="all">All Movements</option>
                  <option value="credit">Credits (+) Only</option>
                  <option value="debit">Debits (-) Only</option>
                </select>
              </div>
            </div>

            {/* Grid display */}
            <div className="overflow-x-auto overflow-y-auto max-h-[300px] rounded-lg border border-slate-100 scrollbar-thin scrollbar-thumb-slate-200" id="bank-ledger-grid-wrapper">
              <table className="w-full text-left border-collapse" id="bank-ledger-grid">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono tracking-wider border-b border-slate-100">
                    <th className="py-2.5 px-3">Date / ID</th>
                    <th className="py-2.5 px-3">Description / Ref</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTxns.length === 0 ? (
                    <tr id="bank-ledger-empty-row">
                      <td colSpan={4} className="text-center py-8 text-slate-400 italic">
                        No transactions match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTxns.map((tx) => (
                      <tr 
                        key={tx.id} 
                        id={`bank-txn-row-${tx.id}`}
                        className="hover:bg-slate-50/50 transition-colors font-mono"
                      >
                        <td className="py-3 px-3">
                          <span className="text-slate-800 font-medium block text-[11px]" id={`bank-txn-date-${tx.id}`}>{tx.date}</span>
                          <span className="text-slate-400 text-[10px] block" id={`bank-txn-id-${tx.id}`}>{tx.id}</span>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className="text-slate-700 font-semibold block text-[11px] max-w-[200px] truncate" id={`bank-txn-desc-${tx.id}`}>{tx.description}</span>
                          <span className="text-slate-400 text-[10px] block font-mono" id={`bank-txn-ref-${tx.id}`}>{tx.reference}</span>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            tx.category === 'Salary' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            tx.category === 'Transfer' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            tx.category === 'Investment' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-slate-50 text-slate-600 border border-slate-100'
                          }`} id={`bank-txn-cat-${tx.id}`}>
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-bold font-mono text-[11px] flex items-center justify-end gap-1 ${
                            tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                          }`} id={`bank-txn-amt-${tx.id}`}>
                            {tx.type === 'credit' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5 inline text-emerald-500 shrink-0" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5 inline text-rose-500 shrink-0" />
                            )}
                            {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                          </span>
                          <span className="text-slate-400 text-[10px] block" id={`bank-txn-bal-${tx.id}`}>
                            Bal: ${tx.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-4 mt-6 text-[10px] text-slate-500 font-mono">
            QA AUDIT CHECKS: Automation framework should verify that wire debits are correctly prepended to ledger rows, decrementing checking balances in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}
