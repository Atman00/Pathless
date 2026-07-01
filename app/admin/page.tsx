// app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Category { id: number; name: string; }
interface Product { id: number; name: string; price: number; category_id: number; image_url?: string; category?: { name: string }; }

export default function AdminCmsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const [form, setForm] = useState({ id: 0, name: '', price: '', category_id: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProducts, resCategories] = await Promise.all([
        fetch('/api/products'), fetch('/api/categories')
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

  useEffect(() => { fetchData(); }, []);

  const handleClearForm = () => {
    setForm({ id: 0, name: '', price: '', category_id: '' });
    setImageFile(null);
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleSelectEdit = (product: Product) => {
    setForm({ id: product.id, name: product.name, price: product.price.toString(), category_id: product.category_id.toString() });
    setImageFile(null);
    setIsEditing(true);
    setErrorMessage('');
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('products').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!form.name || !form.price || !form.category_id) {
      setErrorMessage('VALIDATION_ERROR // FIELD_CANNOT_BE_EMPTY');
      return;
    }

    try {
      setIsUploading(true);
      let uploadedImageUrl = null;

      // Jalankan proses upload jika ada file yang dipilih
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
      }

      const payload = {
        name: form.name,
        price: Number(form.price),
        category_id: Number(form.category_id),
        ...(uploadedImageUrl && { image_url: uploadedImageUrl })
      };

      const url = isEditing ? `/api/products/${form.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

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
    } catch (err: any) {
      setErrorMessage(`SYS_CRASH // ${err.message || 'TRANSACTION_ABORTED'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`WARNING: ABSOLUTE REMOVAL OF ASSET ID ${id}.\nPROCEED?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { fetchData(); alert('[ CORE_SYS ] ASSET_PURGED_FROM_RECORDS'); }
    } catch (err) {
      setErrorMessage('SYS_CRASH // DELETION_PIPELINE_BLOCKED');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono uppercase p-4 md:p-8 selection:bg-black selection:text-white">
      <header className="border-b-4 border-black pb-6 mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-2">CMS_CONTROL_CENTER</h1>
          <p className="text-sm font-bold text-gray-500">INVENTORY MANAGER // VISUAL ASSET ENABLED</p>
        </div>
        <div className="flex gap-4">
          <Link href="/terminal" className="border-2 border-black px-4 py-2 text-xs font-bold bg-black text-white hover:bg-white hover:text-black">TX_TERMINAL</Link>
          <Link href="/" className="border-2 border-black px-4 py-2 text-xs font-bold hover:bg-black hover:text-white">&lt; VIEW_STOREFRONT</Link>
        </div>
      </header>

      {errorMessage && <div className="bg-black text-white font-bold p-4 mb-6 border-4 border-black brutal-shadow-sm">[ ALERT ] {errorMessage}</div>}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-1/3 border-4 border-black p-6 bg-white brutal-shadow-sm sticky top-6">
          <h2 className="text-2xl font-black mb-6 border-b-4 border-black pb-2">{isEditing ? 'MODIFY_ASSET' : 'INJECT_NEW_ASSET'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600">PRODUCT_NAME</label>
              <input type="text" className="border-2 border-black p-3 font-bold focus:bg-black focus:text-white outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600">PRICE (IDR)</label>
              <input type="number" className="border-2 border-black p-3 font-bold focus:bg-black focus:text-white outline-none" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600">RELATIONAL_CATEGORY</label>
              <select className="border-2 border-black p-3 font-bold focus:bg-black focus:text-white outline-none appearance-none" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                <option value="">SELECT NODE</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            
            {/* Input Gambar Baru */}
            <div className="flex flex-col gap-2 p-4 border-2 border-dashed border-black bg-gray-50">
              <label className="text-xs font-bold text-gray-600">VISUAL_ASSET (IMAGE)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="text-xs font-mono font-bold file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-black file:bg-black file:text-white hover:file:bg-gray-800"
              />
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button type="submit" disabled={isUploading} className="w-full bg-black text-white font-black p-4 text-xl border-2 border-black hover:bg-white hover:text-black transition-colors duration-0 disabled:opacity-50">
                {isUploading ? 'UPLOADING...' : (isEditing ? 'COMMIT_ALTERATION' : 'PUSH_TO_INVENTORY')}
              </button>
              {isEditing && <button type="button" onClick={handleClearForm} className="w-full bg-gray-200 text-black font-bold p-2 text-xs border-2 border-black hover:bg-black hover:text-white">ABORT_EDIT</button>}
            </div>
          </form>
        </div>

        <div className="w-full lg:w-2/3 border-4 border-black overflow-hidden bg-white brutal-shadow-sm">
          <div className="bg-black text-white p-4 font-bold flex justify-between items-center">
            <span>// CORE_STOCK_DATAGRID</span>
          </div>
          {loading ? (
            <div className="p-24 text-center font-black animate-pulse">SYNCING WITH DATASOURCE...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-100 border-b-4 border-black text-sm">
                    <th className="p-3 font-bold">ASSET</th>
                    <th className="p-3 font-bold">IDENTIFIER</th>
                    <th className="p-3 font-bold">NODE_CAT</th>
                    <th className="p-3 font-bold text-right">VALUATION</th>
                    <th className="p-3 font-bold text-center">CONTROL</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b-2 border-black hover:bg-gray-50">
                      <td className="p-3">
                        {product.image_url ? (
                           <img src={product.image_url} alt="asset" className="w-12 h-12 object-cover border-2 border-black" />
                        ) : (
                           <div className="w-12 h-12 bg-gray-200 border-2 border-dashed border-black flex items-center justify-center text-[8px] font-black">NULL</div>
                        )}
                      </td>
                      <td className="p-3 font-black tracking-tight">{product.name}</td>
                      <td className="p-3 text-sm font-bold">{product.category?.name || 'UNKNOWN'}</td>
                      <td className="p-3 text-right font-black font-mono">Rp {product.price}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDelete(product.id)} className="border-2 border-red-600 text-red-600 px-3 py-1 text-xs font-bold hover:bg-red-600 hover:text-white">PURGE</button>
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