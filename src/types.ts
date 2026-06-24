/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  event: string;
  elementId: string;
  details: string;
}

export interface GridItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Transaction {
  id: string;
  date: string;
  reference: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  category: 'Salary' | 'Transfer' | 'Shopping' | 'Utilities' | 'Dining' | 'Investment';
}

export interface BankAccount {
  accountNumber: string;
  routingNumber: string;
  holderName: string;
  balance: number;
  currency: string;
}
