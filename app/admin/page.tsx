// app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category?: { name: string };
}

export default function AdminCmsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form States
  const [form, setForm] = useState({ id: 0, name: '', price: '', category_id: '' });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProducts, resCategories] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      if (resProducts.ok && resCategories.ok) {
        setProducts(await resProducts.json());
        setCategories(await resCategories.json());
      }
    } catch (err) {
      setErrorMessage('CRITICAL // PIPELINE_CONNECTION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearForm = () => {
    setForm({ id: 0, name: '', price: '', category_id: '' });
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleSelectEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      category_id: product.category_id.toString()
    });
    setIsEditing(true);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const payload = {
      name: form.name,
      price: Number(form.price),
      category_id: Number(form.category_id)
    };

    if (!payload.name || !payload.price || !payload.category_id) {
      setErrorMessage('VALIDATION_ERROR // FIELD_CANNOT_BE_EMPTY');
      return;
    }

    const url = isEditing ? `/api/products/${form.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        handleClearForm();
        fetchData();
        alert('[ CORE_SYS ] INVENTORY_RECALIBRATED_SUCCESSFULLY');
      } else {
        setErrorMessage(`API_REJECTION // ${data.error}`);
      }
    } catch (err) {
      setErrorMessage('SYS_CRASH // TRANSACTION_ABORTED_BY_SERVER');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`WARNING: ABSOLUTE REMOVAL OF ASSET ID ${id}.\nPROCEED?`)) return;
    setErrorMessage('');

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        fetchData();
        alert('[ CORE_SYS ] ASSET_PURGED_FROM_RECORDS');
      } else {
        setErrorMessage(`PURGE_REJECTED // ${data.error}`);
      }
    } catch (err) {
      setErrorMessage('SYS_CRASH // DELETION_PIPELINE_BLOCKED');
    }
  };

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono uppercase p-4 md:p-8 selection:bg-black selection:text-white">
      
      {/* CMS HEADER */}
      <header className="border-b-4 border-black pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-2">
            CMS_CONTROL_CENTER
          </h1>
          <p className="text-sm font-bold text-gray-500">
            INVENTORY MANAGER // RELATIONAL MODEL v1.0
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/terminal" className="border-2 border-black px-4 py-2 text-xs font-bold bg-black text-white hover:bg-white hover:text-black transition-colors duration-0">
            TX_TERMINAL
          </Link>
          <Link href="/" className="border-2 border-black px-4 py-2 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-0">
            &lt; VIEW_STOREFRONT
          </Link>
        </div>
      </header>

      {errorMessage && (
        <div className="bg-black text-white font-bold p-4 mb-6 border-4 border-black brutal-shadow-sm">
          [ ALERT ] {errorMessage}
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* COMPARTMENT 1: MANIPULATION FORM */}
        <div className="w-full lg:w-1/3 border-4 border-black p-6 bg-white brutal-shadow-sm sticky top-6">
          <h2 className="text-2xl font-black mb-6 border-b-4 border-black pb-2">
            {isEditing ? 'MODIFY_ASSET' : 'INJECT_NEW_ASSET'}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600">PRODUCT_NAME</label>
              <input 
                type="text"
                placeholder="E.G. BRUTALIST JACKET"
                className="border-2 border-black p-3 font-bold bg-white focus:bg-black focus:text-white outline-none transition-colors duration-0"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600">PRICE (IDR)</label>
              <input 
                type="number"
                placeholder="NUMERIC ONLY"
                className="border-2 border-black p-3 font-bold bg-white focus:bg-black focus:text-white outline-none transition-colors duration-0"
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600">RELATIONAL_CATEGORY</label>
              <select 
                className="border-2 border-black p-3 font-bold bg-white focus:bg-black focus:text-white outline-none transition-colors duration-0 appearance-none"
                value={form.category_id}
                onChange={e => setForm({...form, category_id: e.target.value})}
              >
                <option value="">SELECT NODE</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button 
                type="submit"
                className="w-full bg-black text-white font-black p-4 text-xl border-2 border-black hover:bg-white hover:text-black transition-colors duration-0"
              >
                {isEditing ? 'COMMIT_ALTERATION' : 'PUSH_TO_INVENTORY'}
              </button>
              
              {isEditing && (
                <button 
                  type="button"
                  onClick={handleClearForm}
                  className="w-full bg-gray-200 text-black font-bold p-2 text-xs border-2 border-black hover:bg-black hover:text-white transition-colors duration-0"
                >
                  ABORT_EDIT
                </button>
              )}
            </div>
          </form>
        </div>

        {/* COMPARTMENT 2: STOCK LEDGER DISPLAY */}
        <div className="w-full lg:w-2/3 border-4 border-black overflow-hidden bg-white brutal-shadow-sm">
          <div className="bg-black text-white p-4 font-bold flex justify-between items-center">
            <span>// CORE_STOCK_DATAGRID</span>
            <span>{products.length} OBJECTS REGISTERED</span>
          </div>

          {loading ? (
            <div className="p-24 text-center font-black text-xl tracking-widest animate-pulse">
              SYNCING WITH DATASOURCE...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-100 border-b-4 border-black text-sm">
                    <th className="p-3 font-bold">SYS_ID</th>
                    <th className="p-3 font-bold">IDENTIFIER</th>
                    <th className="p-3 font-bold">NODE_CAT</th>
                    <th className="p-3 font-bold text-right">VALUATION</th>
                    <th className="p-3 font-bold text-center">MUTATION_CONTROL</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b-2 border-black hover:bg-gray-50 transition-colors duration-0">
                      <td className="p-3 font-mono font-bold text-gray-500">
                        #{product.id.toString().padStart(4, '0')}
                      </td>
                      <td className="p-3 font-black tracking-tight">{product.name}</td>
                      <td className="p-3 text-sm font-bold">{product.category?.name || 'UNKNOWN'}</td>
                      <td className="p-3 text-right font-black font-mono">{formatIDR(product.price)}</td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => handleSelectEdit(product)}
                            className="border-2 border-black bg-white text-black px-3 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-0"
                          >
                            EDIT
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="border-2 border-red-600 bg-white text-red-600 px-3 py-1 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors duration-0"
                          >
                            PURGE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}