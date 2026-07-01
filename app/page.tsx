// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category?: { id: number; name: string; };
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PathlessHomePage() {
  const { data: session, status } = useSession();
  const userId = session?.user ? Number((session.user as any).id) : null;
  const isAuthenticated = status === 'authenticated';

  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  const categoryMap: Record<number, string> = { 1: 'Tops', 2: 'Outerwear', 3: 'Bottoms' };

  const fetchCatalog = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error("SYS_ERR: Catalog fetch failed", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!userId) {
      setRecommendations([]);
      setLoadingRecs(false);
      return;
    }
    try {
      setLoadingRecs(true);
      const res = await fetch(`/api/recommendations?userId=${userId}&k=3`);
      if (res.ok) setRecommendations(await res.json());
    } catch (err) {
      console.error("SYS_ERR: KNN fetch failed", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleRecordInteraction = async (product: Product, type: string) => {
    if (userId) {
      try {
        await fetch('/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: product.id, type }),
        });
        fetchRecommendations();
      } catch (err) {
        console.warn("Offline fallback for interaction");
      }
    }

    if (type === 'add_to_cart' || type === 'click_recommendation') {
      setCart(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
          return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { product, quantity: 1 }];
      });
      setIsCartOpen(true);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert("[ SYS ] UNAUTHORIZED. PLEASE AUTHENTICATE TO EXECUTE TRANSACTION.");
      return;
    }
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity }))
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`[ SYSTEM_MSG ] TRANSACTION_AUTHORIZED.\nID: ${data.transactionId}\nCONFIRMATION SENT.`);
        setCart([]);
        setIsCartOpen(false);
      } else {
        alert(`[ SYSTEM_ERR ] ${data.error}`);
      }
    } catch (err) {
      alert("[ SYSTEM_ERR ] CRITICAL FAILURE IN CHECKOUT PIPELINE.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-black font-sans uppercase selection:bg-black selection:text-white relative">
      
      <header className="border-b-4 border-black p-6 flex justify-between items-center sticky top-0 bg-white z-40">
        <h1 className="text-4xl font-black tracking-tighter">PATHLESS</h1>
        <nav className="hidden md:flex gap-6 font-bold text-sm tracking-widest items-center">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <span className="bg-black text-white px-2 py-1 font-mono text-xs border-2 border-black">
                ID: {(session.user?.name || "USER")}
              </span>
              <button onClick={() => signOut()} className="hover:underline decoration-2 underline-offset-4 text-red-600">DISCONNECT</button>
            </div>
          ) : (
            <Link href="/login" className="hover:underline decoration-4 underline-offset-4">AUTHENTICATE</Link>
          )}
          <a href="#catalog" className="hover:underline decoration-4 underline-offset-4">CATALOG</a>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="font-bold bg-black text-white px-4 py-1 border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors duration-0"
          >
            CART [{cartCount}]
          </button>
        </nav>
      </header>

      <section className="border-b-4 border-black p-8 md:p-16 bg-white">
        <div className="max-w-5xl">
          <h2 className="text-6xl md:text-9xl font-black leading-none tracking-tighter mb-6">OUT FROM <br /> THE HERD.</h2>
          <p className="text-xl md:text-2xl font-bold max-w-2xl border-l-8 border-black pl-4 mb-8 normal-case text-gray-900">
            Pathless memisahkan Anda dari standar massal. Setiap potong pakaian dirancang melalui presisi data relasional.
          </p>
          <a href="#catalog" className="inline-block bg-black text-white px-8 py-4 text-xl font-black hover:bg-white hover:text-black border-4 border-black transition-colors duration-0 brutal-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
            PENETRATE THE CATALOG
          </a>
        </div>
      </section>

      <section className="border-b-4 border-black bg-black text-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-3xl font-black tracking-tight">ALGORITHMIC MATCH (KNN ENGINE)</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">PROFILING BASED ON EUCLIDEAN DISTANCE</p>
          </div>
          <div className="bg-white text-black font-mono text-xs font-bold px-3 py-1 border-2 border-white">
            {isAuthenticated ? `TARGET_ID: ${userId}` : 'STATUS: UNIDENTIFIED_GUEST'}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="p-12 text-center font-bold border-4 border-dashed border-white tracking-widest text-xl">
            [ IDENTIFICATION REQUIRED TO ACTIVATE ALGORITHM ]<br/>
            <Link href="/login" className="inline-block mt-4 border-2 border-white px-6 py-2 hover:bg-white hover:text-black">LOGIN NOW</Link>
          </div>
        ) : loadingRecs ? (
          <div className="p-12 text-center font-bold border-4 border-dashed border-white tracking-widest">COMPUTING NEIGHBORS...</div>
        ) : recommendations.length === 0 ? (
           <div className="p-12 text-center font-bold border-4 border-dashed border-white tracking-widest">
            INSUFFICIENT INTERACTION DATA. EXPLORE CATALOG FIRST.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-white">
            {recommendations.map((item, index) => (
              <div key={`rec-${item.id}`} className={`p-6 flex flex-col justify-between bg-black text-white hover:bg-white hover:text-black group transition-colors duration-0 ${index !== recommendations.length - 1 ? 'border-b-4 md:border-b-0 md:border-r-4 border-white' : ''}`}>
                <div className="mb-12">
                  <span className="bg-white text-black group-hover:bg-black group-hover:text-white font-mono font-bold px-2 py-1 text-xs mb-4 inline-block border-2 border-white transition-colors duration-0">
                    {item.category?.name || categoryMap[item.category_id]}
                  </span>
                  <h4 className="text-3xl font-black tracking-tighter leading-none mt-2">{item.name}</h4>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black font-mono">{formatIDR(item.price)}</span>
                  <button onClick={() => handleRecordInteraction(item, 'click_recommendation')} className="border-2 border-white group-hover:border-black px-4 py-1 font-bold text-sm tracking-wider">ACQUIRE</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="catalog" className="p-8 bg-white">
        <h3 className="text-4xl font-black mb-8 border-b-4 border-black pb-2 inline-block tracking-tighter">CORE STOCK</h3>
        {loadingProducts ? (
          <div className="p-24 text-center text-xl font-bold tracking-widest border-4 border-black border-dashed">FETCHING INVENTORY...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={`prod-${product.id}`} className="border-4 border-black flex flex-col bg-white hover:bg-black hover:text-white transition-colors duration-0 brutal-shadow-sm group cursor-pointer" onClick={() => handleRecordInteraction(product, 'view')}>
                <div className="aspect-square border-b-4 border-black bg-gray-100 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-900 transition-colors duration-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:mix-blend-normal transition-all duration-0" />
                    ) : (
                      <span className="text-gray-500 font-mono text-sm tracking-widest opacity-60 group-hover:text-white transition-opacity">[ SYS_PRD_{product.id} ]</span>
                    )}
                  </div>
                <div className="p-4 flex-grow flex flex-col justify-between pointer-events-none">
                  <div>
                    <p className="text-xs font-mono font-bold text-gray-500 group-hover:text-gray-200 mb-1">LOC // {product.category?.name || categoryMap[product.category_id]}</p>
                    <h4 className="text-2xl font-black tracking-tighter leading-none">{product.name}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-6 pointer-events-auto">
                    <span className="text-xl font-mono font-black">{formatIDR(product.price)}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleRecordInteraction(product, 'add_to_cart'); }} className="border-4 border-black bg-black text-white group-hover:border-white group-hover:bg-white group-hover:text-black font-black px-3 py-1 text-lg transition-colors duration-0">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="w-full md:w-1/3 bg-white border-l-8 border-black h-full flex flex-col shadow-2xl">
            <div className="p-6 border-b-4 border-black flex justify-between items-center bg-black text-white">
              <h2 className="text-3xl font-black tracking-tighter">TERMINAL // CART</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-4xl font-black hover:text-red-500 leading-none">&times;</button>
            </div>
            <div className="flex-grow p-6 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 font-mono text-lg font-bold">[ NO ASSETS ACQUIRED ]</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="border-4 border-black p-4 flex justify-between items-center bg-white brutal-shadow-sm">
                      <div>
                        <h4 className="text-xl font-black">{item.product.name}</h4>
                        <p className="text-sm font-mono font-bold text-gray-500">QTY: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-black font-mono">{formatIDR(item.product.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t-4 border-black bg-gray-100">
              <div className="flex justify-between items-end mb-6">
                <span className="text-xl font-bold">TOTAL LIABILITY</span>
                <span className="text-4xl font-black tracking-tighter">{formatIDR(cartTotal)}</span>
              </div>
              <button onClick={handleCheckout} disabled={cart.length === 0 || isCheckingOut} className={`w-full py-4 text-2xl font-black border-4 border-black transition-colors duration-0 ${cart.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-white hover:text-black brutal-shadow'}`}>
                {!isAuthenticated ? 'AUTH REQUIRED' : isCheckingOut ? 'PROCESSING...' : 'EXECUTE PROTOCOL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}