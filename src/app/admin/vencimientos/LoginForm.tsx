'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  adminSecret: string;
}

export default function LoginForm({ adminSecret }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminSecret) {
      // Set cookie for 7 days
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `admin_secret=${password}; expires=${expires}; path=/; SameSite=Strict; Secure`;
      setError('');
      router.refresh();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Clave Secreta</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          required
        />
        {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-[#1A7A52] hover:bg-[#156141] text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        Acceder al Panel
      </button>
    </form>
  );
}
