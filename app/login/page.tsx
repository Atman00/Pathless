// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthTerminal() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (res?.error) {
        setError('ACCESS_DENIED // INVALID_CREDENTIALS');
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setIsLogin(true);
        setForm({ ...form, password: '' });
        alert("[ SYS ] IDENTITY_CREATED. PLEASE LOGIN.");
      } else {
        setError(`ERR // ${data.error}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono uppercase">
      <div className="w-full max-w-md border-4 border-white bg-black p-8 brutal-shadow">
        <div className="border-b-4 border-white pb-4 mb-8">
          <Link href="/" className="text-sm font-bold hover:underline mb-2 block">&lt; ABORT TO MAIN</Link>
          <h1 className="text-4xl font-black tracking-tighter">
            {isLogin ? 'AUTH_GATEWAY' : 'NEW_IDENTITY'}
          </h1>
        </div>

        {error && (
          <div className="bg-white text-black font-bold p-3 mb-6 border-2 border-white">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">IDENTIFIER (NAME)</label>
              <input 
                type="text" 
                required 
                className="bg-black text-white border-2 border-white p-3 font-bold focus:bg-white focus:text-black transition-colors duration-0 outline-none"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">NETWORK_ADDRESS (EMAIL)</label>
            <input 
              type="email" 
              required 
              className="bg-black text-white border-2 border-white p-3 font-bold focus:bg-white focus:text-black transition-colors duration-0 outline-none"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">SECURITY_KEY (PASSWORD)</label>
            <input 
              type="password" 
              required 
              className="bg-black text-white border-2 border-white p-3 font-bold focus:bg-white focus:text-black transition-colors duration-0 outline-none"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-black text-2xl py-4 mt-4 hover:bg-black hover:text-white border-4 border-white transition-colors duration-0 disabled:opacity-50"
          >
            {loading ? 'EXECUTING...' : isLogin ? 'BYPASS_SECURITY' : 'INJECT_RECORD'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t-2 border-dashed border-gray-600 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm font-bold text-gray-400 hover:text-white underline underline-offset-4"
          >
            {isLogin ? 'CREATE NEW IDENTITY INSTEAD' : 'I ALREADY HAVE CLEARANCE'}
          </button>
        </div>
      </div>
    </div>
  );
}