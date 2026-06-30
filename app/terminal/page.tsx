// app/terminal/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TransactionItem {
  id: number;
  quantity: number;
  price_at_time: number;
  product: {
    id: number;
    name: string;
    category: {
      name: string;
    }
  };
}

interface Transaction {
  id: number;
  total_amount: number;
  transaction_date: string;
  user: {
    name: string;
    email: string;
  };
  items: TransactionItem[];
}

export default function TerminalPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("SYS_ERR: Failed to fetch transaction logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono uppercase selection:bg-white selection:text-black p-4 md:p-8">
      
      {/* TERMINAL HEADER */}
      <header className="border-b-4 border-white pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-2 text-white">
            ROOT_TERMINAL
          </h1>
          <p className="text-sm font-bold text-gray-400">
            SYSTEM: PATHLESS_OS // MODULE: TX_LEDGER // STATUS: ONLINE
          </p>
        </div>
        <Link 
          href="/" 
          className="border-2 border-white px-4 py-2 font-bold hover:bg-white hover:text-black transition-colors duration-0"
        >
          &lt; RETURN TO FRONTEND
        </Link>
      </header>

      {/* DATA GRID */}
      <section>
        <div className="flex justify-between items-center bg-white text-black p-2 font-bold mb-4 border-2 border-white">
          <span>// TRANSACTION_LOGS</span>
          <span>{transactions.length} RECORDS FOUND</span>
        </div>

        {loading ? (
          <div className="border-4 border-dashed border-white p-24 text-center text-2xl font-black tracking-widest animate-pulse">
            EXTRACTING DATA FRAGMENTS...
          </div>
        ) : transactions.length === 0 ? (
          <div className="border-4 border-white p-12 text-center font-bold text-gray-500">
            [ NO TRANSACTIONS RECORDED IN SYSTEM DATABASE ]
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {transactions.map((tx) => (
              <div key={`tx-${tx.id}`} className="border-4 border-white bg-black">
                {/* TX HEADER */}
                <div className="bg-white text-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center font-bold gap-4 border-b-4 border-white">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter">TX_ID: {tx.id.toString().padStart(6, '0')}</span>
                    <span className="text-sm">{formatDate(tx.transaction_date)}</span>
                  </div>
                  <div className="flex flex-col md:text-right">
                    <span className="text-sm text-gray-600">CLIENT: {tx.user.name} ({tx.user.email})</span>
                    <span className="text-2xl font-black">{formatIDR(tx.total_amount)}</span>
                  </div>
                </div>

                {/* TX ITEMS TABLE */}
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-dashed border-gray-600 text-gray-400 text-sm">
                        <th className="py-2 px-4 font-bold">SYS_ID</th>
                        <th className="py-2 px-4 font-bold">ASSET_NAME</th>
                        <th className="py-2 px-4 font-bold">CATEGORY</th>
                        <th className="py-2 px-4 font-bold text-right">QTY</th>
                        <th className="py-2 px-4 font-bold text-right">UNIT_PRICE</th>
                        <th className="py-2 px-4 font-bold text-right">SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tx.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-800 hover:bg-gray-900 transition-colors duration-0">
                          <td className="py-3 px-4 font-bold text-gray-500">PRD_{item.product.id}</td>
                          <td className="py-3 px-4 font-black">{item.product.name}</td>
                          <td className="py-3 px-4 text-sm">{item.product.category.name}</td>
                          <td className="py-3 px-4 text-right font-bold">x{item.quantity}</td>
                          <td className="py-3 px-4 text-right">{formatIDR(item.price_at_time)}</td>
                          <td className="py-3 px-4 text-right font-black">{formatIDR(item.price_at_time * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}