// app/product/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded target user untuk simulasi
  const currentUserId = 1;

  useEffect(() => {
    const fetchProductAndRecordView = async () => {
      try {
        setLoading(true);
        // 1. Ambil data produk
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          throw new Error('ASSET_NOT_FOUND');
        }
        const data = await res.json();
        setProduct(data);

        // 2. Tembak interaksi 'view' ke mesin KNN secara diam-diam di background
        fetch('/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId, productId: data.id, type: 'view' }),
        }).catch(err => console.warn("Background log failed.", err));

      } catch (err: any) {
        setError(err.message || 'SYSTEM_MALFUNCTION');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRecordView();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, productId: product.id, type: 'add_to_cart' }),
      });
      alert(`[ SUCCESS ] ${product.name} ADDED TO TEMPORARY HOLDING.`);
    } catch (err) {
      alert('[ ERROR ] FAILED TO RECORD INTENT.');
    }
  };

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center uppercase font-black text-2xl tracking-widest animate-pulse">
        EXTRACTING ASSET DATA...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center uppercase p-8">
        <h1 className="text-6xl font-black mb-4">404 // VOID</h1>
        <p className="text-xl mb-8 border-b-2 border-white pb-2">{error}</p>
        <Link href="/" className="border-4 border-white px-8 py-4 font-bold hover:bg-white hover:text-black transition-colors duration-0">
          RETURN TO SAFE ZONE
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans uppercase selection:bg-black selection:text-white flex flex-col">
      {/* HEADER BAR */}
      <header className="border-b-4 border-black p-6 flex justify-between items-center bg-white z-40">
        <Link href="/" className="text-4xl font-black tracking-tighter hover:underline decoration-4 underline-offset-4">
          PATHLESS
        </Link>
        <div className="font-mono text-sm font-bold bg-black text-white px-3 py-1">
          SYS_ID: {product.id.toString().padStart(4, '0')}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col md:flex-row">
        
        {/* LEFT COMPARTMENT - IMAGE PLACEHOLDER */}
        <div className="w-full md:w-1/2 border-b-4 md:border-b-0 md:border-r-4 border-black bg-gray-100 flex items-center justify-center p-12 min-h-[50vh]">
          <div className="relative group w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-black opacity-10 m-8 pointer-events-none"></div>
            <span className="text-4xl md:text-6xl font-black text-gray-300 tracking-tighter mix-blend-difference">
              [ VISUAL_ASSET_{product.id} ]
            </span>
          </div>
        </div>

        {/* RIGHT COMPARTMENT - METADATA & ACTIONS */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          {/* Decorative grid lines */}
          <div className="absolute top-0 right-0 w-32 h-32 border-l-4 border-b-4 border-black opacity-10 pointer-events-none"></div>
          
          <div className="mb-8">
            <span className="inline-block bg-black text-white font-mono font-bold px-3 py-1 mb-6 text-sm">
              CAT // {product.category?.name || 'UNCLASSIFIED'}
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
              {product.name}
            </h1>
            <p className="text-4xl font-mono font-black border-l-8 border-black pl-4">
              {formatIDR(product.price)}
            </p>
          </div>

          <div className="mb-12">
            <p className="text-lg font-bold max-w-md text-gray-600 normal-case">
              Bukan sekadar penutup tubuh. Dirakit dari material terpilih untuk mereka yang berani keluar dari jalur aman. Bentuk penolakan yang dapat dikenakan.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={handleAddToCart}
              className="w-full py-6 text-2xl font-black bg-black text-white border-4 border-black hover:bg-white hover:text-black transition-colors duration-0 brutal-shadow"
            >
              ACQUIRE NOW
            </button>
            <Link 
              href="/#catalog"
              className="w-full py-4 text-xl font-bold text-center border-4 border-black hover:bg-gray-100 transition-colors duration-0"
            >
              BROWSE OTHER ASSETS
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}